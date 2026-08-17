"""Reinstatement pass for source elements the pipeline EXCLUDED (issue #103's
disposition-judging layer in evaluate.py, `judge_dispositions`): elements an
independent judge found were dropped with a boilerplate or otherwise
unjustified rationale, despite being well-defined and operationally
comparable to elements the domain DID keep.

Standing design principle, symmetric to repair.py's for wrongly-INCLUDED
content: an exclusion a judge calls unjustified should not just stay
excluded by default -- the compiler may simply have taken the cheap way out
on a source element it didn't feel like translating. This module gives the
pipeline the same kind of second look repair.py gives rejected elements, but
in the opposite direction: given each flagged exclusion's real source
definition and the domain's existing sibling classes for comparison, decide
per item to either `reinstate` (add it as real, provenance-backed domain
content -- a new class plus any relationships that connect it into the
existing domain) or `reground` (the exclusion was right, but the note was
weak -- replace it with one that actually engages with the specific
element, not a generic template). See prompts/reinstate-prompt.md for the
exact instructions given.

Deliberately a separate module from repair.py: repair.py mutates an
existing target_path already present in domain_data; this module adds
genuinely new content that never existed there, addressed by source_iri (a
domain has no target_path for something it never included in the first
place).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import time
from dataclasses import dataclass
from pathlib import Path

import yaml

from compile import RunLogger, _extract_json_object, approx_tokens, estimate_cost
from env import load_azure_config
from validate_domain import validate_domain

TOOLS_DIR = Path(__file__).resolve().parent
PROMPT_PATH = TOOLS_DIR / "prompts" / "reinstate-prompt.md"

VALID_ACTIONS = {"reinstate", "reground"}


def prompt_sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


@dataclass
class FlaggedDisposition:
    source_iri: str
    disposition: str
    note: str
    source_definition: dict
    included_siblings: list
    judge_rationale: str


def build_reinstate_user_prompt(
    flagged: list[FlaggedDisposition],
    domain_classes: list[str],
    domain_relationships: list[dict] | None = None,
) -> str:
    parts = [
        "Classes already in this domain (new relationships must connect to one of "
        "these, or to a class you are adding in this same response):",
        json.dumps(sorted(domain_classes)),
    ]
    if domain_relationships:
        # Without seeing the domain's *actual* relationship conventions, a
        # reinstated class tends to come back as an unconnected orphan --
        # found for real: a first pass with only class names in this prompt
        # (no relationship examples) added 10 well-grounded classes with
        # zero relationships each, even for equipment (CondensingUnit,
        # Pump, CoolingTower) whose real physical connections to classes
        # already in the domain are exactly the kind of thing this
        # domain's existing hasPart/feeds relationships already model for
        # comparable equipment. Showing the real relationship list lets the
        # model reuse the same names/patterns instead of guessing whether
        # inventing one is allowed.
        parts.append(
            "Existing relationships in this domain, for naming/pattern precedent -- reuse "
            "these same relationship names and conventions (e.g. hasPart for physical "
            "composition, feeds for a flow/supply path, serves for service provision, "
            "hasPoint for a sensor/setpoint association, hasLocation for spatial placement) "
            "rather than inventing new ones where an existing pattern already fits:"
        )
        parts.append(json.dumps(domain_relationships, indent=2))
    parts += [
        "Flagged exclusions to reconsider, each with its real source definition, the "
        "compiler's own disposition/note, sibling classes that WERE kept for "
        "comparison (including that sibling's own properties, as precedent for whether "
        "a comparable property is standard practice for the element you're deciding on), "
        "and the independent judge's rationale for flagging it:",
        json.dumps(
            [
                {
                    "source_iri": it.source_iri,
                    "disposition": it.disposition,
                    "note": it.note,
                    "source_definition": it.source_definition,
                    "included_siblings": it.included_siblings,
                    "judge_rationale": it.judge_rationale,
                }
                for it in flagged
            ],
            indent=2,
        ),
    ]
    return "\n\n".join(parts)


def call_reinstate(client, deployment: str, system_prompt: str, user_prompt: str, logger: RunLogger, label: str) -> tuple[dict, dict]:
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

    content = response.choices[0].message.content
    parsed = _extract_json_object(content)
    reinstatements = parsed.get("reinstatements")
    if not isinstance(reinstatements, list):
        raise ValueError("reinstate response missing a 'reinstatements' list")

    cost = estimate_cost(prompt_tokens, completion_tokens, cached_tokens)
    logger.event(
        "api_call_end", call=label, seconds=round(elapsed, 1),
        prompt_tokens=prompt_tokens, completion_tokens=completion_tokens, cached_tokens=cached_tokens, cost_usd=round(cost, 4),
    )
    return reinstatements, {"prompt_tokens": prompt_tokens, "completion_tokens": completion_tokens, "cached_tokens": cached_tokens}


def _validate_evidence_block(evidence, label: str, errors: list[str]) -> None:
    if not isinstance(evidence, dict):
        errors.append(f"{label}: missing evidence block (source_evidence/confidence/rationale)")
        return
    for key in ("source_evidence", "confidence", "rationale"):
        if not evidence.get(key):
            errors.append(f"{label}: evidence missing '{key}'")


def validate_reinstatements(reinstatements: list[dict], flagged: list[FlaggedDisposition], domain_classes: set[str]) -> list[str]:
    """Structural sanity checks on the model's decisions, mechanical, no LLM
    calls -- mirrors repair.py's validate_repairs role. Requires *separate*
    evidence per class/property/relationship (not one blurb covering the
    whole item) -- a class's own definition doesn't by itself justify a
    specific property or a specific connection to another class, and an
    earlier version of this schema let exactly that slide, which judges
    then correctly rejected across the board (see reinstate-prompt.md)."""
    errors = []
    expected_iris = {it.source_iri for it in flagged}
    seen_iris = set()

    # A class_name introduced by one "reinstate" item in this same batch is
    # a valid relationship endpoint for another -- e.g. CondensingUnit
    # hasPart Compressor, both reinstated together.
    batch_class_names = {
        r.get("class_name") for r in reinstatements
        if r.get("action") == "reinstate" and isinstance(r.get("class_name"), str)
    }
    all_class_names = domain_classes | batch_class_names

    for r in reinstatements:
        source_iri = r.get("source_iri")
        if source_iri not in expected_iris:
            errors.append(f"reinstatement for unknown source_iri {source_iri!r}")
            continue
        seen_iris.add(source_iri)
        action = r.get("action")
        if action not in VALID_ACTIONS:
            errors.append(f"{source_iri}: invalid action {action!r}, expected one of {sorted(VALID_ACTIONS)}")
            continue

        if action == "reground":
            if not (r.get("new_note") or "").strip():
                errors.append(f"{source_iri}: reground needs a non-empty new_note")
            continue

        # reinstate
        class_name = r.get("class_name")
        if not isinstance(class_name, str) or not class_name:
            errors.append(f"{source_iri}: reinstate missing 'class_name'")
            continue
        if class_name in domain_classes:
            errors.append(f"{source_iri}: reinstate class_name {class_name!r} already exists in the domain")
        class_content = r.get("class_content")
        if not isinstance(class_content, dict) or not (class_content.get("meaning") or "").strip():
            errors.append(f"{source_iri}: reinstate missing a real 'class_content.meaning'")
        _validate_evidence_block(r.get("class_evidence"), f"{source_iri}: class_evidence", errors)

        property_names = set((class_content or {}).get("properties") or {})
        property_evidence = r.get("property_evidence") or {}
        if property_names:
            missing_evidence = property_names - set(property_evidence)
            for prop_name in sorted(missing_evidence):
                errors.append(f"{source_iri}: property_evidence missing entry for '{prop_name}'")
            for prop_name in property_names & set(property_evidence):
                _validate_evidence_block(property_evidence[prop_name], f"{source_iri}: property_evidence.{prop_name}", errors)

        for idx, rel in enumerate(r.get("new_relationships") or []):
            if not isinstance(rel, dict):
                errors.append(f"{source_iri}: new_relationships entries must be mappings")
                continue
            for field in ("name", "from", "to", "meaning"):
                if not rel.get(field):
                    errors.append(f"{source_iri}: new_relationships entry missing '{field}'")
            for endpoint_key in ("from", "to"):
                endpoint = rel.get(endpoint_key)
                if endpoint and endpoint not in all_class_names:
                    errors.append(f"{source_iri}: new_relationships entry.{endpoint_key} {endpoint!r} is not an existing or newly-reinstated class")
            _validate_evidence_block(rel, f"{source_iri}: new_relationships[{idx}]", errors)

    missing = expected_iris - seen_iris
    for source_iri in sorted(missing):
        errors.append(f"no reinstatement decision returned for {source_iri}")
    return errors


def apply_reinstatements(domain_data: dict, translation_data: dict, reinstatements: list[dict]) -> dict:
    """Applies each reinstatement decision, mutating domain_data and
    translation_data in place. Returns a summary dict for logging."""
    summary = {"reinstated": [], "reground": []}
    dispositions = translation_data.setdefault("dispositions", [])
    disposition_index = {d.get("source_iri"): d for d in dispositions}
    mappings = translation_data.setdefault("mappings", [])
    relationships = domain_data.setdefault("relationships", [])
    classes = domain_data.setdefault("classes", {})
    # Kept current as we append below, so a new relationship's *other*
    # endpoint (the pre-existing class, or one reinstated earlier in this
    # same batch) always has its own known source_iris available to cite
    # alongside the reinstated class's -- see the mappings.append() below.
    mapping_by_path = {m.get("target_path"): m for m in mappings}

    for r in reinstatements:
        source_iri = r["source_iri"]
        action = r["action"]
        disposition = disposition_index.get(source_iri)

        if action == "reground":
            if disposition is not None:
                disposition["note"] = r["new_note"]
            summary["reground"].append({"source_iri": source_iri, "new_note": r["new_note"]})
            continue

        class_name = r["class_name"]
        classes[class_name] = r["class_content"]
        class_mapping = {"target_path": f"classes.{class_name}", "source_iris": [source_iri], **r["class_evidence"]}
        mappings.append(class_mapping)
        mapping_by_path[class_mapping["target_path"]] = class_mapping
        # Every property is its own generated element for the provenance
        # hard gate (_iter_generated_elements in evaluate.py), same as a
        # normal compile -- found for real twice: first, reinstating 9
        # classes with real properties but only ever mapping the class
        # itself dropped provenance coverage to 93.6%; then, once mappings
        # existed but all reused the class's own bare-definition evidence,
        # judges correctly rejected almost every one (a class's definition
        # doesn't itself justify a specific property). property_evidence
        # is now required per property precisely so each one has its own
        # real grounding, not a borrowed one.
        property_evidence = r.get("property_evidence") or {}
        for prop_name in (r["class_content"].get("properties") or {}).keys():
            mappings.append(
                {"target_path": f"classes.{class_name}.properties.{prop_name}", "source_iris": [source_iri], **property_evidence[prop_name]}
            )

        new_relationship_paths = []
        for rel in r.get("new_relationships") or []:
            rel_evidence = {"source_evidence": rel["source_evidence"], "confidence": rel["confidence"], "rationale": rel["rationale"]}
            rel_content = {k: v for k, v in rel.items() if k not in ("source_evidence", "confidence", "rationale")}
            rel_content.setdefault("aliases", [])
            relationships.append(rel_content)
            rel_path = f"relationships[{len(relationships) - 1}]"
            # Cite the reinstated class's own IRI *and* the other endpoint's
            # already-known IRI(s) -- a relationship mapping that cites only
            # one side is exactly the defect class evaluate.py's
            # endpoint_citation_gate now catches (found for real: every
            # relationship reinstate.py ever created cited only the newly
            # reinstated class, never the pre-existing endpoint it connects
            # to, even when that endpoint's own citation was sitting right
            # there in translation.json already).
            other_endpoint = rel["to"] if rel["from"] == class_name else rel["from"]
            other_iris = mapping_by_path.get(f"classes.{other_endpoint}", {}).get("source_iris") or []
            rel_source_iris = list(dict.fromkeys([source_iri, *other_iris]))
            rel_mapping = {"target_path": rel_path, "source_iris": rel_source_iris, **rel_evidence}
            mappings.append(rel_mapping)
            mapping_by_path[rel_path] = rel_mapping
            new_relationship_paths.append(rel_path)

        if disposition is not None:
            disposition["disposition"] = "mapped"
            disposition["note"] = f"mapped to classes.{class_name}"

        summary["reinstated"].append(
            {"source_iri": source_iri, "class_name": class_name, "target_path": f"classes.{class_name}", "new_relationships": new_relationship_paths}
        )

    return summary


def run_reinstate(
    domain_yaml_path: Path,
    translation_path: Path,
    flagged_path: Path,
    out_dir: Path,
    dry_run: bool,
) -> int:
    domain_data = yaml.safe_load(domain_yaml_path.read_text(encoding="utf-8")) or {}
    translation_data = json.loads(translation_path.read_text(encoding="utf-8"))
    raw_flagged = json.loads(flagged_path.read_text(encoding="utf-8"))
    flagged = [FlaggedDisposition(**it) for it in raw_flagged]
    domain_classes = set((domain_data.get("classes") or {}).keys())

    system_prompt = PROMPT_PATH.read_text(encoding="utf-8")
    user_prompt = build_reinstate_user_prompt(flagged, sorted(domain_classes), domain_data.get("relationships") or [])

    if dry_run:
        est_tokens = approx_tokens(system_prompt) + approx_tokens(user_prompt)
        est_cost = estimate_cost(est_tokens, 3_000)
        print(f"[reinstate] DRY RUN -- {len(flagged)} item(s), ~{est_tokens} prompt tokens, approx cost ~${est_cost:.4f}")
        print("[reinstate] DRY RUN -- no API call made, nothing written")
        return 0

    azure_config = load_azure_config()
    missing = [k for k in ("endpoint", "api_key") if not azure_config[k]]
    if missing:
        print(f"[reinstate] ERROR: missing Azure config: {missing}. Set AZURE_OPENAI_ENDPOINT / AZURE_OPENAI_API_KEY.", file=sys.stderr)
        return 1

    from openai import AzureOpenAI

    client = AzureOpenAI(api_version=azure_config["api_version"], azure_endpoint=azure_config["endpoint"], api_key=azure_config["api_key"])

    out_dir.mkdir(parents=True, exist_ok=True)
    logger = RunLogger(out_dir / "reinstate.log.jsonl")
    logger.event("reinstate_start", items=len(flagged), prompt_sha256=prompt_sha256(system_prompt))

    try:
        reinstatements, usage = call_reinstate(client, azure_config["deployment"], system_prompt, user_prompt, logger, "reinstate")
    finally:
        logger.event("reinstate_end")
        logger.close()

    errors = validate_reinstatements(reinstatements, flagged, domain_classes)
    if errors:
        print("[reinstate] ERROR: reinstate response failed validation:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        (out_dir / "reinstate-response-invalid.json").write_text(json.dumps(reinstatements, indent=2), encoding="utf-8")
        return 1

    summary = apply_reinstatements(domain_data, translation_data, reinstatements)

    new_domain_yaml_path = out_dir / "reinstated.domain.yaml"
    new_translation_path = out_dir / "reinstated.translation.json"
    new_domain_yaml_path.write_text(yaml.safe_dump(domain_data, sort_keys=False, allow_unicode=True), encoding="utf-8")
    new_translation_path.write_text(json.dumps(translation_data, indent=2), encoding="utf-8")

    report = validate_domain(domain_data)
    cost = estimate_cost(usage["prompt_tokens"], usage["completion_tokens"], usage["cached_tokens"])
    summary_path = out_dir / "reinstate-summary.json"
    summary_path.write_text(
        json.dumps(
            {
                "reinstated_count": len(summary["reinstated"]),
                "reground_count": len(summary["reground"]),
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
        f"[reinstate] done: {len(summary['reinstated'])} reinstated, {len(summary['reground'])} reground, "
        f"structural_ok={report.ok}, cost=${cost:.4f} -> {summary_path}"
    )
    return 0 if report.ok else 1


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--domain-yaml", type=Path, required=True)
    parser.add_argument("--translation", type=Path, required=True)
    parser.add_argument("--flagged", type=Path, required=True, help="JSON list of FlaggedDisposition dicts")
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)

    return run_reinstate(args.domain_yaml, args.translation, args.flagged, args.out_dir, args.dry_run)


if __name__ == "__main__":
    sys.exit(main())
