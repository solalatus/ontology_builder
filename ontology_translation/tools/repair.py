"""Targeted repair pass for elements the QA suite's semantic judging
(evaluate.py, issue #103) rejected as majority-unsupported.

Standing design principle (not specific to any one domain): a rejected
element should not just be silently dropped. Dropping throws away
everything a formulation might have gotten right along with the one part
that didn't hold up. This module gives the pipeline a real "try to fix it
first" step -- a small, cheap, targeted call over just the rejected items
plus the specific source class definitions involved, asking the model to
either `reground` (same element, stronger evidence), `replace` (the claim
was attached to the wrong class -- fix the target), or `drop` (genuinely
no honest grounding, last resort) each one. See prompts/repair-prompt.md
for the exact instructions given.

This is deliberately a separate, narrower prompt from compiler-prompt.md
(the full-domain compile), not a variant of it -- a repair call only ever
sees a handful of already-rejected items and their specific context, never
re-derives a whole domain.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path

import yaml

from compile import RunLogger, _extract_json_object, approx_tokens, estimate_cost
from env import load_azure_config
from validate_domain import validate_domain

TOOLS_DIR = Path(__file__).resolve().parent
PROMPT_PATH = TOOLS_DIR / "prompts" / "repair-prompt.md"

VALID_ACTIONS = {"reground", "replace", "drop"}


def prompt_sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


@dataclass
class RejectedItem:
    target_path: str
    current_shape: dict
    rejection_rationale: str


def build_repair_user_prompt(rejected_items: list[RejectedItem], source_context: dict, domain_classes: list[str]) -> str:
    parts = [
        "Classes already in this domain's scope (repaired relationships must use only these as endpoints):",
        json.dumps(sorted(domain_classes)),
        "Rejected elements to repair, each with its current shape and the semantic judges' own rejection rationale:",
        json.dumps([{"target_path": it.target_path, "current_shape": it.current_shape, "rejection_rationale": it.rejection_rationale} for it in rejected_items], indent=2),
        "Relevant source class definitions (from the original source IR, only the classes involved in the items above):",
        json.dumps(source_context, indent=2),
    ]
    return "\n\n".join(parts)


def _extract_repairs(text: str) -> list[dict]:
    parsed = _extract_json_object(text)
    repairs = parsed.get("repairs")
    if not isinstance(repairs, list):
        raise ValueError("repair response missing a 'repairs' list")
    return repairs


def call_repair(client, deployment: str, system_prompt: str, user_prompt: str, logger: RunLogger, label: str) -> tuple[list[dict], dict]:
    logger.event("api_call_start", call=label, prompt_chars=len(system_prompt) + len(user_prompt))
    start = time.monotonic()
    try:
        response = client.chat.completions.create(
            model=deployment,
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            response_format={"type": "json_object"},
        )
    except TypeError:
        response = client.chat.completions.create(
            model=deployment,
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
        )
    elapsed = time.monotonic() - start

    usage = getattr(response, "usage", None)
    prompt_tokens = getattr(usage, "prompt_tokens", 0) or 0
    completion_tokens = getattr(usage, "completion_tokens", 0) or 0
    cached_tokens = 0
    details = getattr(usage, "prompt_tokens_details", None)
    if details is not None:
        cached_tokens = getattr(details, "cached_tokens", 0) or 0

    repairs = _extract_repairs(response.choices[0].message.content)
    cost = estimate_cost(prompt_tokens, completion_tokens, cached_tokens)
    logger.event(
        "api_call_end",
        call=label,
        seconds=round(elapsed, 1),
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        cached_tokens=cached_tokens,
        cost_usd=round(cost, 4),
    )
    return repairs, {"prompt_tokens": prompt_tokens, "completion_tokens": completion_tokens, "cached_tokens": cached_tokens}


_REL_INDEX_RE = re.compile(r"^relationships\[(\d+)\]$")
_PATH_TOKEN_RE = re.compile(r"[^.\[\]]+|\[\d+\]")

# Which top-level collection a target_path's first token addresses, and
# whether that collection is a list (index-addressed) or a mapping
# (name-addressed) -- drives both in-place resolution and the
# retroactive-append fallback below.
_COLLECTION_BY_PREFIX = {"classes": ("classes", False), "relationships": ("relationships", True), "rules": ("rules", False), "actions": ("actions", False)}


def _target_kind(target_path: str) -> str | None:
    """classes.X -> "class", classes.X.properties.Y -> "property",
    relationships[i] -> "relationship", rules.X -> "rule", actions.X ->
    "action". None if the path doesn't start with a recognized collection."""
    tokens = _PATH_TOKEN_RE.findall(target_path)
    if not tokens:
        return None
    if tokens[0] == "classes":
        return "property" if len(tokens) >= 4 and tokens[2] == "properties" else "class"
    if tokens[0] == "relationships":
        return "relationship"
    if tokens[0] == "rules":
        return "rule"
    if tokens[0] == "actions":
        return "action"
    return None


def _resolve_container_and_key(domain_data: dict, target_path: str):
    """(container, key) such that container[key] is the addressed element
    -- key is an int index for relationships[i], a string key otherwise.
    None if target_path doesn't resolve against domain_data at all: either
    a malformed path, or (the real, expected case) a *synthetic* label for
    an element that was already removed before this repair pass ever ran --
    e.g. Brick HVAC's original "relationships[dropped-1]"-style labels from
    before repair.py existed. Callers use that distinction to choose
    in-place mutation (the normal case: the element is still there right
    now) vs. append (the retroactive case: there's nothing to mutate)."""
    tokens = _PATH_TOKEN_RE.findall(target_path)
    if not tokens:
        return None
    node = domain_data
    for token in tokens[:-1]:
        if token.startswith("[") and token.endswith("]"):
            idx = int(token[1:-1])
            if not isinstance(node, list) or not (0 <= idx < len(node)):
                return None
            node = node[idx]
        elif isinstance(node, dict):
            node = node.get(token)
            if node is None:
                return None
        else:
            return None
    last = tokens[-1]
    if last.startswith("[") and last.endswith("]"):
        idx = int(last[1:-1])
        if not isinstance(node, list) or not (0 <= idx < len(node)):
            return None
        return node, idx
    if not isinstance(node, dict) or last not in node:
        return None
    return node, last


def _reindex_relationship_mappings(translation_data: dict, removed_index: int) -> None:
    """After removing relationships[removed_index] in place, every
    relationships[j] target_path for j > removed_index must shift down by
    one to stay correct -- both the mapping being removed itself and every
    later one still need addressing that matches the list's real new
    shape."""
    for m in translation_data.get("mappings", []):
        match = _REL_INDEX_RE.match(m.get("target_path", ""))
        if match:
            idx = int(match.group(1))
            if idx > removed_index:
                m["target_path"] = f"relationships[{idx - 1}]"


def validate_repairs(repairs: list[dict], rejected_items: list[RejectedItem], domain_classes: set[str]) -> list[str]:
    """Structural sanity checks on the model's repair decisions -- mirrors
    validate_domain.py's role for a full compile: mechanical, no LLM calls,
    catches a malformed response before it's applied to real files."""
    errors = []
    expected_paths = {it.target_path for it in rejected_items}
    seen_paths = set()
    for r in repairs:
        target_path = r.get("target_path")
        if target_path not in expected_paths:
            errors.append(f"repair for unknown target_path {target_path!r}")
            continue
        seen_paths.add(target_path)
        action = r.get("action")
        if action not in VALID_ACTIONS:
            errors.append(f"{target_path}: invalid action {action!r}, expected one of {sorted(VALID_ACTIONS)}")
            continue
        if action == "drop":
            if not r.get("rationale"):
                errors.append(f"{target_path}: drop needs a rationale")
            continue
        # reground / replace both need real provenance, same bar as a compile.
        for key in ("source_evidence", "confidence", "rationale"):
            if not r.get(key):
                errors.append(f"{target_path}: {action} missing '{key}'")
        if action == "replace":
            new_content = r.get("new_content")
            if not isinstance(new_content, dict):
                errors.append(f"{target_path}: replace missing 'new_content'")
                continue
            # Only a relationship's shape has a checkable structural
            # invariant here (endpoints must be real classes) -- a
            # property/rule/action/class's new_content shape is whatever
            # validate_domain.py already checks once applied, no need to
            # duplicate that here.
            if _target_kind(target_path) == "relationship":
                for key in ("name", "from", "to", "meaning"):
                    if not new_content.get(key):
                        errors.append(f"{target_path}: new_content missing '{key}'")
                for endpoint_key in ("from", "to"):
                    endpoint = new_content.get(endpoint_key)
                    if endpoint and endpoint not in domain_classes:
                        errors.append(f"{target_path}: new_content.{endpoint_key} '{endpoint}' is not an existing domain class")
    missing = expected_paths - seen_paths
    for target_path in sorted(missing):
        errors.append(f"no repair decision returned for {target_path}")
    return errors


def _cascade_rename(domain_data: dict, kind: str, old_name: str, new_name: str) -> list[str]:
    """When a repair renames a class or rule (`replace` with a
    `new_target_path` whose leaf key differs from the original), anything
    else that addresses it by exact name goes dangling unless updated too.

    Found for real: repairing `rules.canUseEconomizer` into
    `rules.economizerReducesMechanicalConditioning` left
    `actions.enableEconomizer`'s precondition still pointing at the old
    name, failing validate_domain.py's `action_precondition_unresolved`
    hard-gate check -- repair.py's own structural re-validation caught it,
    but nothing had *fixed* it. Only classes and rules are name-addressed
    top-level collections that anything else references by exact string
    (relationship endpoints/action inputs point at class names, action
    preconditions point at rule names); properties and relationships
    (index-addressed) have no such downstream references to cascade.

    Returns the target_paths actually touched, for logging/transparency --
    a silent cascade would be just as bad as a silent drop.
    """
    if old_name == new_name:
        return []
    touched = []
    if kind == "class":
        for idx, rel in enumerate(domain_data.get("relationships") or []):
            if not isinstance(rel, dict):
                continue
            changed = False
            for key in ("from", "to"):
                if rel.get(key) == old_name:
                    rel[key] = new_name
                    changed = True
            if changed:
                touched.append(f"relationships[{idx}]")
        for action_name, action_def in (domain_data.get("actions") or {}).items():
            if isinstance(action_def, dict) and action_def.get("input") == old_name:
                action_def["input"] = new_name
                touched.append(f"actions.{action_name}")
    elif kind == "rule":
        for action_name, action_def in (domain_data.get("actions") or {}).items():
            if not isinstance(action_def, dict):
                continue
            preconditions = action_def.get("preconditions")
            if isinstance(preconditions, list) and old_name in preconditions:
                action_def["preconditions"] = [new_name if p == old_name else p for p in preconditions]
                touched.append(f"actions.{action_name}")
    return touched


def apply_repairs(domain_data: dict, translation_data: dict, repairs: list[dict], rejected_items: list[RejectedItem]) -> dict:
    """Applies each repair decision at its target_path:

    - If the path resolves against domain_data (the normal case -- the
      element is still there right now, this is a repair pass over a
      currently-live translation): mutates in place. `reground` only ever
      touches translation.json's mapping (the element's own content is
      already fine, just under-evidenced); `replace` overwrites the
      element's content at that same path (renaming a property is
      supported via an optional `new_target_path` in the repair decision);
      `drop` removes the element itself, its mapping entry, and -- for a
      relationships[i] removal specifically -- renumbers every later
      relationship's target_path so nothing drifts out of sync.
    - If the path does *not* resolve (the retroactive case: a synthetic
      label for something already removed before this repair pass ever
      ran, e.g. Brick HVAC's original three relationships, repaired before
      this in-place support existed) -- appends fresh content to the
      matching top-level collection instead, since there's nothing at that
      path to mutate.

    Returns a summary dict for logging/reporting; mutates domain_data and
    translation_data in place.
    """
    by_path = {it.target_path: it for it in rejected_items}
    summary = {"reground": [], "replace": [], "drop": [], "cascaded_renames": []}
    mappings = translation_data.setdefault("mappings", [])
    mapping_index = {m.get("target_path"): m for m in mappings}

    for r in repairs:
        target_path = r["target_path"]
        item = by_path[target_path]
        action = r["action"]
        resolved = _resolve_container_and_key(domain_data, target_path)

        if action == "drop":
            if resolved is not None:
                container, key = resolved
                del container[key]
                mappings[:] = [m for m in mappings if m.get("target_path") != target_path]
                if isinstance(key, int):
                    _reindex_relationship_mappings(translation_data, key)
            summary["drop"].append({"target_path": target_path, "rationale": r.get("rationale")})
            continue

        new_content = dict(item.current_shape) if action == "reground" else dict(r["new_content"])
        if _target_kind(target_path) == "relationship":
            new_content.setdefault("aliases", [])
        provenance = {"source_evidence": r["source_evidence"], "confidence": r["confidence"], "rationale": r["rationale"]}

        if resolved is not None:
            container, key = resolved
            new_target_path = r.get("new_target_path") or target_path
            if action == "replace" and new_target_path != target_path:
                # A rename (e.g. a property key change) -- remove the old
                # entry, insert the new one, retarget the mapping.
                del container[key]
                new_key = _PATH_TOKEN_RE.findall(new_target_path)[-1]
                container[new_key] = new_content
                kind = _target_kind(target_path)
                if kind in ("class", "rule") and isinstance(key, str):
                    touched = _cascade_rename(domain_data, kind, key, new_key)
                    if touched:
                        summary["cascaded_renames"].append(
                            {"kind": kind, "old_name": key, "new_name": new_key, "touched": touched}
                        )
            elif action == "replace":
                container[key] = new_content
            # reground: domain_data is untouched, content was already fine.
            mapping = mapping_index.get(target_path)
            if mapping is not None:
                mapping["target_path"] = new_target_path
                mapping.update(provenance)
            else:
                mappings.append({"target_path": new_target_path, "source_iris": [], **provenance})
            summary[action].append({"original_target_path": target_path, "new_target_path": new_target_path, "content": new_content})
            continue

        # Retroactive fallback: nothing to mutate, append instead. Only
        # relationships are supported here, matching the one historical
        # case this path exists for -- a class/property/rule/action being
        # "removed before repair.py existed and needing retroactive
        # re-addition" has never actually happened and would need a real
        # target_path to append at (a bare class/rule/action name is
        # already unambiguous, but a property needs its owning class,
        # which the rejected item's target_path already encodes -- add
        # support here if that case ever arises for real).
        relationships = domain_data.setdefault("relationships", [])
        new_index = len(relationships)
        relationships.append(new_content)
        new_path = f"relationships[{new_index}]"
        mappings.append({"target_path": new_path, "source_iris": [], **provenance})
        summary[action].append({"original_target_path": target_path, "new_target_path": new_path, "content": new_content})

    return summary


def run_repair(
    domain_yaml_path: Path,
    translation_path: Path,
    rejected_path: Path,
    source_context_path: Path,
    out_dir: Path,
    dry_run: bool,
) -> int:
    domain_data = yaml.safe_load(domain_yaml_path.read_text(encoding="utf-8")) or {}
    translation_data = json.loads(translation_path.read_text(encoding="utf-8"))
    raw_rejected = json.loads(rejected_path.read_text(encoding="utf-8"))
    rejected_items = [RejectedItem(**it) for it in raw_rejected]
    source_context = json.loads(source_context_path.read_text(encoding="utf-8"))
    domain_classes = list((domain_data.get("classes") or {}).keys())

    system_prompt = PROMPT_PATH.read_text(encoding="utf-8")
    user_prompt = build_repair_user_prompt(rejected_items, source_context, domain_classes)

    if dry_run:
        est_tokens = approx_tokens(system_prompt) + approx_tokens(user_prompt)
        est_cost = estimate_cost(est_tokens, 2_000)
        print(f"[repair] DRY RUN -- {len(rejected_items)} item(s), ~{est_tokens} prompt tokens, approx cost ~${est_cost:.4f}")
        print("[repair] DRY RUN -- no API call made, nothing written")
        return 0

    azure_config = load_azure_config()
    missing = [k for k in ("endpoint", "api_key") if not azure_config[k]]
    if missing:
        print(f"[repair] ERROR: missing Azure config: {missing}. Set AZURE_OPENAI_ENDPOINT / AZURE_OPENAI_API_KEY.", file=sys.stderr)
        return 1

    from openai import AzureOpenAI

    client = AzureOpenAI(
        api_version=azure_config["api_version"],
        azure_endpoint=azure_config["endpoint"],
        api_key=azure_config["api_key"],
    )

    out_dir.mkdir(parents=True, exist_ok=True)
    logger = RunLogger(out_dir / "repair.log.jsonl")
    logger.event("repair_start", items=len(rejected_items), prompt_sha256=prompt_sha256(system_prompt))

    try:
        repairs, usage = call_repair(client, azure_config["deployment"], system_prompt, user_prompt, logger, "repair")
    finally:
        logger.event("repair_end")
        logger.close()

    errors = validate_repairs(repairs, rejected_items, set(domain_classes))
    if errors:
        print("[repair] ERROR: repair response failed validation:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        (out_dir / "repair-response-invalid.json").write_text(json.dumps(repairs, indent=2), encoding="utf-8")
        return 1

    summary = apply_repairs(domain_data, translation_data, repairs, rejected_items)

    new_domain_yaml_path = out_dir / "repaired.domain.yaml"
    new_translation_path = out_dir / "repaired.translation.json"
    new_domain_yaml_path.write_text(yaml.safe_dump(domain_data, sort_keys=False, allow_unicode=True), encoding="utf-8")
    new_translation_path.write_text(json.dumps(translation_data, indent=2), encoding="utf-8")

    report = validate_domain(domain_data)
    cost = estimate_cost(usage["prompt_tokens"], usage["completion_tokens"], usage["cached_tokens"])
    summary_path = out_dir / "repair-summary.json"
    summary_path.write_text(
        json.dumps(
            {
                "reground_count": len(summary["reground"]),
                "replace_count": len(summary["replace"]),
                "drop_count": len(summary["drop"]),
                "cascaded_rename_count": len(summary["cascaded_renames"]),
                "summary": summary,
                "structural_validation_ok": report.ok,
                "structural_validation_errors": len(report.errors),
                "cost_usd": round(cost, 4),
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(
        f"[repair] done: {len(summary['reground'])} reground, {len(summary['replace'])} replaced, "
        f"{len(summary['drop'])} dropped, {len(summary['cascaded_renames'])} cascaded rename(s), "
        f"structural_ok={report.ok}, cost=${cost:.4f} -> {summary_path}"
    )
    return 0 if report.ok else 1


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--domain-yaml", type=Path, required=True)
    parser.add_argument("--translation", type=Path, required=True)
    parser.add_argument("--rejected", type=Path, required=True, help="JSON list of {target_path, current_shape, rejection_rationale}")
    parser.add_argument("--source-context", type=Path, required=True, help="JSON: relevant source class definitions")
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)

    return run_repair(args.domain_yaml, args.translation, args.rejected, args.source_context, args.out_dir, args.dry_run)


if __name__ == "__main__":
    sys.exit(main())
