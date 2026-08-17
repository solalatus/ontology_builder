"""Automatic translation-quality evaluation (issue #103): makes translation
errors observable, measurable and rejectable without requiring manual
approval of every converted ontology. Layers 1-2 are deterministic hard
gates (free, always run); layers 3/6/7 call the LLM as an independent
judge; layer 4 is a deterministic heuristic comparison across a domain's N
independent compiler runs; layer 5 is deterministic disposition bookkeeping.

Reuses validate_domain.py as-is for layer 1, and compile.py's cost/JSON-
parsing primitives rather than duplicating them.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from collections import Counter
from pathlib import Path

import yaml

from compile import RunLogger, _extract_json_object, estimate_cost, approx_tokens
from env import load_azure_config
from source_manifest import load_manifest
from validate_domain import validate_domain

# ---------------------------------------------------------------------------
# Layer 1: structural validity (hard gate) -- just validate_domain.py.
# ---------------------------------------------------------------------------


def structural_gate(domain_data: dict) -> dict:
    report = validate_domain(domain_data)
    return {
        "ok": report.ok,
        "error_count": len(report.errors),
        "warning_count": len(report.issues) - len(report.errors),
        "issues": [i.__dict__ for i in report.issues],
    }


# ---------------------------------------------------------------------------
# Layer 2: provenance completeness (hard gate).
# ---------------------------------------------------------------------------


def _iter_generated_elements(domain_data: dict) -> list[dict]:
    """Flattens classes/properties/relationships/rules/actions into
    {"target_path", "kind"} records -- the unit provenance/judging operate
    on. Deliberately excludes competency_questions: CQs are requirements on
    the ontology, not generated elements needing source provenance."""
    elements = []
    for class_name, class_def in (domain_data.get("classes") or {}).items():
        if not isinstance(class_def, dict):
            continue
        elements.append({"target_path": f"classes.{class_name}", "kind": "class"})
        for prop_name in (class_def.get("properties") or {}).keys():
            elements.append({"target_path": f"classes.{class_name}.properties.{prop_name}", "kind": "property"})
    for idx, rel in enumerate(domain_data.get("relationships") or []):
        if not isinstance(rel, dict):
            continue
        # Indexed, not `relationships.<name>` -- the same relationship name
        # legitimately repeats across different from/to pairs (see
        # validate_domain.py), so a name alone can't address one specific
        # instance for provenance. Matches the addressing scheme
        # compile.py's prompt now instructs the compiler to use.
        elements.append({"target_path": f"relationships[{idx}]", "kind": "relationship"})
    for rule_name in (domain_data.get("rules") or {}).keys():
        elements.append({"target_path": f"rules.{rule_name}", "kind": "rule"})
    for action_name in (domain_data.get("actions") or {}).keys():
        elements.append({"target_path": f"actions.{action_name}", "kind": "action"})
    return elements


def _all_source_iris(source_ir: dict) -> set[str]:
    iris = set()
    for key in ("classes", "object_properties", "datatype_properties", "enumerations", "restrictions", "imports"):
        for record in source_ir.get(key, []):
            iris.add(record["iri"])
    return iris


def provenance_gate(domain_data: dict, translation: dict, source_ir: dict) -> dict:
    elements = _iter_generated_elements(domain_data)
    mapped_paths = {m.get("target_path") for m in translation.get("mappings", [])}
    missing_evidence = [e["target_path"] for e in elements if e["target_path"] not in mapped_paths]
    element_coverage = 1.0 if not elements else (len(elements) - len(missing_evidence)) / len(elements)

    all_iris = _all_source_iris(source_ir)
    dispositioned_iris = {d.get("source_iri") for d in translation.get("dispositions", [])}
    missing_dispositions = sorted(all_iris - dispositioned_iris)
    unknown_dispositions = sorted(dispositioned_iris - all_iris)
    disposition_coverage = 1.0 if not all_iris else (len(all_iris) - len(missing_dispositions)) / len(all_iris)

    return {
        "ok": not missing_evidence and not missing_dispositions,
        "element_provenance_coverage": element_coverage,
        "source_disposition_coverage": disposition_coverage,
        "missing_evidence": missing_evidence,
        "missing_dispositions": missing_dispositions,
        "unknown_dispositions": unknown_dispositions,
    }


# ---------------------------------------------------------------------------
# Layer 5: reverse coverage (deterministic -- silent information loss check).
# ---------------------------------------------------------------------------


def reverse_coverage(source_ir: dict, translation: dict) -> dict:
    """Every source candidate must be either mapped, or carry a disposition
    with a non-empty justification note. Distinct from provenance_gate's
    disposition-coverage check: that one only asks "does a disposition
    entry exist at all", this one also asks "is it actually justified"."""
    all_iris = _all_source_iris(source_ir)
    disposition_by_iri = {d.get("source_iri"): d for d in translation.get("dispositions", [])}
    silent = []
    justified = 0
    for iri in all_iris:
        disposition = disposition_by_iri.get(iri)
        if disposition is None:
            silent.append(iri)
            continue
        if disposition.get("disposition") == "mapped" or (disposition.get("note") or "").strip():
            justified += 1
        else:
            silent.append(iri)
    coverage = 1.0 if not all_iris else justified / len(all_iris)
    return {"coverage": coverage, "silently_dropped": sorted(silent)}


# ---------------------------------------------------------------------------
# Layer 4: translation stability -- heuristic, report-only, no LLM.
# ---------------------------------------------------------------------------


def _normalize_name(name) -> str:
    return " ".join(str(name).strip().lower().split())


def _collect_named_sets(domain_data: dict) -> dict:
    classes = domain_data.get("classes") or {}
    return {
        "classes": set(classes.keys()),
        "relationships": {r.get("name") for r in (domain_data.get("relationships") or []) if r.get("name")},
        "properties": {
            f"{c}.{p}" for c, cdef in classes.items() if isinstance(cdef, dict) for p in (cdef.get("properties") or {}).keys()
        },
        "allowed_values": {
            f"{c}.{p}={v}"
            for c, cdef in classes.items()
            if isinstance(cdef, dict)
            for p, pdef in (cdef.get("properties") or {}).items()
            for v in (pdef.get("allowed") or [])
        },
    }


def _prf1(a: set, b: set) -> dict:
    a_norm = {_normalize_name(x) for x in a}
    b_norm = {_normalize_name(x) for x in b}
    true_positive = len(a_norm & b_norm)
    precision = true_positive / len(a_norm) if a_norm else 1.0
    recall = true_positive / len(b_norm) if b_norm else 1.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0
    return {"precision": precision, "recall": recall, "f1": f1}


def translation_stability(domain_datas: list[dict]) -> dict:
    """Pairwise heuristic (normalized-name overlap) agreement across
    independent compiler runs of the same domain. Report-only per issue
    #103 -- not a hard gate. This is a heuristic first pass; a semantic
    (LLM-judged) upgrade, matching the JS eval harness's two-tier pattern,
    is a reasonable follow-up once real run data exists to tune it against."""
    if len(domain_datas) < 2:
        return {"note": "fewer than 2 runs supplied -- stability requires at least 2", "pairs": [], "average_f1": None}
    kinds = ["classes", "relationships", "properties", "allowed_values"]
    sets_per_run = [_collect_named_sets(d) for d in domain_datas]
    pairs = []
    for i in range(len(sets_per_run)):
        for j in range(i + 1, len(sets_per_run)):
            pair_result = {kind: _prf1(sets_per_run[i][kind], sets_per_run[j][kind]) for kind in kinds}
            pairs.append({"run_a": i + 1, "run_b": j + 1, **pair_result})
    average_f1 = {kind: sum(p[kind]["f1"] for p in pairs) / len(pairs) for kind in kinds}
    return {"pairs": pairs, "average_f1": average_f1}


# ---------------------------------------------------------------------------
# Shared LLM-call helper for the judging/generation layers (3, 6, 7).
# ---------------------------------------------------------------------------


def chat_json_call(client, deployment: str, system_prompt: str, user_prompt: str, logger: RunLogger, label: str) -> tuple[dict, dict]:
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

    parsed = _extract_json_object(response.choices[0].message.content)
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
    return parsed, {"prompt_tokens": prompt_tokens, "completion_tokens": completion_tokens, "cached_tokens": cached_tokens}


def _call_cost(usage: dict) -> float:
    return estimate_cost(usage["prompt_tokens"], usage["completion_tokens"], usage["cached_tokens"])


# ---------------------------------------------------------------------------
# Layer 3: independent semantic judging.
# ---------------------------------------------------------------------------

# A judge that only ever sees the compiler's own self-reported
# source_evidence/rationale is judging the compiler's *description* of the
# evidence, not the evidence itself -- a confidently-worded fabrication and a
# genuinely-grounded claim read identically from that vantage point. Found
# for real on Brick HVAC: `Chiller hasPart CondensingUnit` passed judging
# with a plausible-sounding "standard practice" rationale, but Brick's own
# source has zero property/restriction linking those two classes at all --
# nothing a judge could have caught without the real source text in front of
# it. The functions below resolve the actual source_ir class definitions for
# whatever classes a target_path involves (when structurally resolvable) so
# judge_mappings can hand judges real ground truth to check claims against,
# not just the claim's own retelling of itself. Fully domain-agnostic: keys
# off source_ir's generic extract.py shape and target_path's generic
# addressing scheme, nothing here is Brick-specific.


def _class_names_involved(domain_data: dict, target_path: str) -> list[str]:
    """Which class name(s) a target_path structurally references, when
    resolvable at all: the class itself for classes.<Name>[.properties.<P>],
    both endpoints for relationships[<idx>], the input class for
    actions.<Name>. Rules have no structural class reference (conditions are
    free text) -- returns [] rather than guessing by parsing prose."""
    tokens = _PATH_TOKEN_RE.findall(target_path)
    if not tokens:
        return []
    if tokens[0] == "classes" and len(tokens) >= 2:
        return [tokens[1]]
    if tokens[0] == "relationships":
        element = _describe_target_element(domain_data, target_path)
        if isinstance(element, dict):
            return [n for n in (element.get("from"), element.get("to")) if n]
    if tokens[0] == "actions":
        element = _describe_target_element(domain_data, target_path)
        if isinstance(element, dict) and element.get("input"):
            return [element["input"]]
    return []


def _index_source_classes_by_label(source_ir: dict) -> dict[str, list[dict]]:
    """Normalized label/altLabel -> matching source_ir class record(s).
    Multiple records can share a label (e.g. two source classes the compiler
    merged into one target class), so this returns a list, not a single
    record."""
    index: dict[str, list[dict]] = {}
    for record in source_ir.get("classes", []):
        for label in (record.get("labels") or []) + (record.get("altLabels") or []):
            index.setdefault(_normalize_name(label), []).append(record)
    return index


def _ground_truth_for_target(domain_data: dict, source_index: dict, target_path: str) -> dict | None:
    """The real source_ir definitions for the class(es) a target_path
    involves, when resolvable -- None (not an empty dict) when nothing could
    be resolved, so callers can tell "checked, nothing relevant" from
    "class name doesn't match any source label" apart if they need to."""
    class_names = _class_names_involved(domain_data, target_path)
    if not class_names:
        return None
    found = {}
    for name in class_names:
        records = source_index.get(_normalize_name(name))
        if records:
            found[name] = [
                {"iri": r.get("iri"), "labels": r.get("labels"), "altLabels": r.get("altLabels"), "definitions": r.get("definitions")}
                for r in records
            ]
    return found or None


JUDGE_SYSTEM_PROMPT = """You are an independent judge evaluating whether a translated Agent Ontology
element is adequately grounded by its cited evidence. You do not see any other judge's answer.

The evidence you are given is one of two legitimate kinds for this pipeline -- judge each on its own
terms, do not require a literal source quote for everything:

1. A literal or paraphrased snippet from the source ontology (an RDF label, comment, or definition).
2. A citation of standard, well-established domain practice tied to the *specific* named concepts the
   target element actually involves (e.g. "standard practice for a temperature sensor and a temperature
   setpoint on the same controlled unit", or, in an unrelated domain, "standard practice requiring an
   approved purchase order before an invoice is paid"). This is a deliberately sanctioned evidence
   category for this pipeline's compiler, valid in *any* domain it's applied to -- do not classify an
   element "unsupported" merely because its evidence is a standard-practice citation rather than a
   literal source quote.

When present, you will also be given `actual_source_class_definitions` -- the real, independently
looked-up source text for the class(es) the target element involves (resolved from the source ontology
itself, not supplied by whoever produced the mapping). Treat this as ground truth, not as more
self-reporting: it exists specifically so you can check the cited evidence and rationale *against* what
the source material actually says, rather than judging only whether the rationale reads plausibly in
isolation. A confident, well-written rationale is not itself evidence -- if the ground truth definitions
given to you don't actually contain or reasonably imply what's being claimed (no relevant text, or the
claim doesn't follow from what's genuinely there), that is real grounds for "unsupported" even when the
prose sounds authoritative. When `actual_source_class_definitions` is absent for a target (its class(es)
couldn't be structurally resolved, e.g. a rule), judge the cited evidence on its own terms as before.

Classify the mapping as exactly one of:
- "supported" -- the evidence (of either kind) genuinely and specifically justifies the target element,
  at the level of detail the target element actually states, and is consistent with the ground truth
  definitions when given.
- "partially_supported" -- the evidence is directionally right but the target element states more
  specific detail (a numeric threshold, a precise mechanism) than the evidence actually supports.
- "unsupported" -- the evidence is absent, contradicts the target element, is so generic it could
  apply to almost any domain (not tied to the specific named concepts involved), is not a plausible/
  standard interpretation of what's cited, or -- when ground truth definitions were given -- has no real
  connection to what those definitions actually say.

Respond with exactly one JSON object, no prose, no markdown fences:
{"verdict": "supported" | "partially_supported" | "unsupported", "rationale": "one sentence"}"""


def _majority_verdict(raw_judgments: list[dict]) -> str | None:
    """A verdict wins only with a strict majority (> half the votes) --
    `Counter.most_common(1)` alone silently picks whichever verdict was
    voted *first* when judges are evenly split (e.g. one each of
    supported/partially_supported/unsupported), which is not a majority at
    all and must not be treated as one: issue #103 says "reject ... when a
    majority considers it unsupported", not "when no two judges agree.\""""
    verdicts = [j["verdict"] for j in raw_judgments]
    if not verdicts:
        return None
    top_verdict, top_count = Counter(verdicts).most_common(1)[0]
    return top_verdict if top_count > len(verdicts) / 2 else None


def judge_mappings(
    client,
    deployment: str,
    translation: dict,
    logger: RunLogger,
    judges: int = 3,
    domain_data: dict | None = None,
    source_ir: dict | None = None,
) -> dict:
    """`domain_data`/`source_ir` are optional so existing callers (and
    mocked tests) that only have `translation` keep working unchanged --
    but pass both whenever they're available, since without them judges
    only ever see the mapping's own self-reported evidence/rationale and
    cannot catch a confidently-worded claim with no real backing (see the
    module-level comment above `_class_names_involved`)."""
    source_index = _index_source_classes_by_label(source_ir) if source_ir is not None else None
    results = []
    total_cost = 0.0
    for mapping in translation.get("mappings", []):
        target_path = mapping.get("target_path")
        payload = {
            "target_path": target_path,
            "source_evidence": mapping.get("source_evidence"),
            "rationale": mapping.get("rationale"),
        }
        if domain_data is not None and source_index is not None:
            ground_truth = _ground_truth_for_target(domain_data, source_index, target_path)
            if ground_truth is not None:
                payload["actual_source_class_definitions"] = ground_truth
        user_prompt = json.dumps(payload, indent=2)
        raw_judgments = []
        for judge_index in range(1, judges + 1):
            parsed, usage = chat_json_call(
                client, deployment, JUDGE_SYSTEM_PROMPT, user_prompt, logger, f"judge-{judge_index}:{target_path}"
            )
            raw_judgments.append({"verdict": parsed.get("verdict"), "rationale": parsed.get("rationale")})
            total_cost += _call_cost(usage)
        contested = len({j["verdict"] for j in raw_judgments}) > 1
        results.append(
            {"target_path": target_path, "raw_judgments": raw_judgments, "majority_verdict": _majority_verdict(raw_judgments), "contested": contested}
        )

    unsupported = [r for r in results if r["majority_verdict"] == "unsupported"]
    # Report-only, not a hard gate: an element where judges *agree* to
    # majority-unsupported is already caught above, but one where they
    # split (e.g. 2 supported + 1 partially_supported) still passes that
    # gate while genuine disagreement about it exists -- found for real on
    # Brick HVAC's Chiller-hasPart-CondensingUnit, which a 2/3 majority
    # still called "supported" even with real source ground truth in front
    # of it, but the third judge explicitly flagged it as only indirectly
    # justified. Rejecting on anything less than a real majority would
    # over-reject; surfacing it instead gives manual spot-checks (or a
    # repair pass) a prioritized list of exactly the borderline calls worth
    # a second look, rather than only a random sample.
    contested = [r for r in results if r["contested"]]
    return {
        "results": results,
        "unsupported_count": len(unsupported),
        "unsupported_paths": [r["target_path"] for r in unsupported],
        "contested_count": len(contested),
        "contested_paths": [r["target_path"] for r in contested],
        "total_cost_usd": round(total_cost, 4),
    }


# ---------------------------------------------------------------------------
# Layer 6: round-trip semantic test (diagnostic, report-only).
# ---------------------------------------------------------------------------

ROUND_TRIP_RECONSTRUCT_PROMPT = """Given only this Agent Ontology element -- no source ontology
information -- describe in one or two sentences what real-world concept or relationship it most
likely represents. Respond with exactly one JSON object: {"reconstruction": "..."}"""

ROUND_TRIP_COMPARE_PROMPT = """Compare a blind reconstruction against the real source definition it
should match. Score how well they agree from 0.0 (unrelated) to 1.0 (same meaning).
Respond with exactly one JSON object: {"score": <float 0-1>, "rationale": "one sentence"}"""


_PATH_TOKEN_RE = re.compile(r"[^.\[\]]+|\[\d+\]")


def _describe_target_element(domain_data: dict, target_path: str):
    """Resolves a target_path like "classes.Fan.properties.status" (dict
    keys) or "relationships[3]" (list index -- relationship names aren't
    addressable alone, see _iter_generated_elements) against domain_data."""
    node = domain_data
    for token in _PATH_TOKEN_RE.findall(target_path):
        if token.startswith("[") and token.endswith("]"):
            index = int(token[1:-1])
            node = node[index] if isinstance(node, list) and 0 <= index < len(node) else None
        elif isinstance(node, dict):
            node = node.get(token)
        else:
            return None
        if node is None:
            return None
    return node


_LEAF_LABEL_SKIP = {"classes", "properties", "rules", "actions"}


def _leaf_label(target_path: str) -> str:
    """A short human-readable label for a target_path, e.g. "Building.yearBuilt"
    for classes.Building.properties.yearBuilt. A property's own dict value
    (e.g. {"type": "number"}) carries no name or owning-class context by
    itself -- without this, round_trip_sample was handing the reconstruction
    prompt something as uninformative as {"type": "number"} and then
    penalizing it for guessing "some generic numeric value" instead of
    "year a building was built", which the property's raw content alone
    could never have revealed."""
    tokens = [t for t in _PATH_TOKEN_RE.findall(target_path) if t not in _LEAF_LABEL_SKIP]
    return ".".join(tokens) if tokens else target_path


def round_trip_sample(client, deployment: str, domain_data: dict, translation: dict, logger: RunLogger, sample_size: int = 5) -> dict:
    # First-N, not random -- a fixed, reproducible sample for a given translation.json.
    sample = translation.get("mappings", [])[:sample_size]
    results = []
    total_cost = 0.0
    for mapping in sample:
        target_path = mapping.get("target_path")
        element = _describe_target_element(domain_data, target_path)
        if element is None:
            continue
        element_payload = {"name": _leaf_label(target_path), "content": element}
        reconstruction, usage_a = chat_json_call(
            client, deployment, ROUND_TRIP_RECONSTRUCT_PROMPT, json.dumps({"element": element_payload}), logger, f"roundtrip-reconstruct:{target_path}"
        )
        compare_input = json.dumps(
            {"reconstruction": reconstruction.get("reconstruction"), "source_definition": mapping.get("source_evidence")}
        )
        comparison, usage_b = chat_json_call(
            client, deployment, ROUND_TRIP_COMPARE_PROMPT, compare_input, logger, f"roundtrip-compare:{target_path}"
        )
        total_cost += _call_cost(usage_a) + _call_cost(usage_b)
        results.append(
            {
                "target_path": target_path,
                "reconstruction": reconstruction.get("reconstruction"),
                "score": comparison.get("score"),
                "rationale": comparison.get("rationale"),
            }
        )
    scores = [r["score"] for r in results if isinstance(r["score"], (int, float))]
    average_score = sum(scores) / len(scores) if scores else None
    return {"sampled": len(results), "results": results, "average_score": average_score, "total_cost_usd": round(total_cost, 4)}


# ---------------------------------------------------------------------------
# Layer 7: competency-question support (report-only).
# ---------------------------------------------------------------------------

CQ_GENERATION_PROMPT = """Given this source ontology material, generate source-grounded competency
questions -- real operational questions a domain agent should be able to orient around, never
"what classes exist?" style questions. Respond with exactly one JSON object:
{"questions": ["...", "..."]}"""

CQ_SUPPORT_PROMPT = """Given a competency question and an Agent Ontology (.domain.yaml content), judge
whether the ontology contains enough orientation -- relevant classes, relationships, rules, actions --
to reason toward an answer. This is not asking whether the ontology contains the answer itself.
Respond with exactly one JSON object: {"supported": true|false, "rationale": "one sentence"}"""


def _summarize_source_ir(source_ir: dict) -> dict:
    return {
        "classes": [{"label": c["labels"][0], "definitions": c.get("definitions", [])} for c in source_ir.get("classes", [])],
        "object_properties": [{"label": p["labels"][0]} for p in source_ir.get("object_properties", [])],
    }


def generate_cqs(client, deployment: str, source_ir: dict, logger: RunLogger, n: int = 10) -> tuple[list[str], float]:
    user_prompt = json.dumps({"requested_count": n, "source_material": _summarize_source_ir(source_ir)})
    parsed, usage = chat_json_call(client, deployment, CQ_GENERATION_PROMPT, user_prompt, logger, "cq-generate")
    return parsed.get("questions", []), _call_cost(usage)


def judge_cq_support(client, deployment: str, domain_yaml_text: str, cqs: list[str], logger: RunLogger) -> dict:
    results = []
    total_cost = 0.0
    for index, cq in enumerate(cqs, start=1):
        user_prompt = json.dumps({"competency_question": cq, "domain_yaml": domain_yaml_text})
        parsed, usage = chat_json_call(client, deployment, CQ_SUPPORT_PROMPT, user_prompt, logger, f"cq-support:{index}")
        results.append({"question": cq, "supported": parsed.get("supported"), "rationale": parsed.get("rationale")})
        total_cost += _call_cost(usage)
    supported_count = sum(1 for r in results if r["supported"])
    support_score = supported_count / len(results) if results else None
    return {"results": results, "support_score": support_score, "total_cost_usd": round(total_cost, 4)}


# ---------------------------------------------------------------------------
# Report writing.
# ---------------------------------------------------------------------------


def _pct(value) -> str:
    return f"{value:.1%}" if isinstance(value, (int, float)) else "n/a"


def _render_markdown(domain_id: str, report: dict) -> str:
    lines = [f"# Translation quality report: {domain_id}", "", f"**Hard gates: {'PASS' if report['hard_gates_ok'] else 'FAIL'}**", ""]

    lines += ["## Structural validity (hard gate)", f"- ok: {report['structural_validity']['ok']}",
              f"- errors: {report['structural_validity']['error_count']}, warnings: {report['structural_validity']['warning_count']}", ""]

    prov = report["provenance_completeness"]
    lines += ["## Provenance completeness (hard gate)", f"- ok: {prov['ok']}",
              f"- element provenance coverage: {_pct(prov['element_provenance_coverage'])}",
              f"- source disposition coverage: {_pct(prov['source_disposition_coverage'])}", ""]

    rc = report["reverse_coverage"]
    lines += ["## Reverse coverage", f"- coverage: {_pct(rc['coverage'])}", f"- silently dropped: {len(rc['silently_dropped'])}", ""]

    if report.get("semantic_judging"):
        sj = report["semantic_judging"]
        lines += ["## Independent semantic judging (hard gate: zero majority-unsupported)",
                  f"- majority-unsupported elements: {sj['unsupported_count']}", ""]

    stability = report.get("translation_stability")
    if stability and stability.get("average_f1"):
        lines.append("## Translation stability (report-only, heuristic)")
        for kind, f1 in stability["average_f1"].items():
            lines.append(f"- {kind}: F1={f1:.2f}")
        lines.append("")

    if report.get("round_trip"):
        rt = report["round_trip"]
        avg = f"{rt['average_score']:.2f}" if isinstance(rt["average_score"], (int, float)) else "n/a"
        lines += ["## Round-trip score (diagnostic, report-only)", f"- sampled: {rt['sampled']}, average score: {avg}", ""]

    if report.get("cq_support"):
        cq = report["cq_support"]
        lines += ["## Competency-question support (report-only)",
                  f"- support score: {_pct(cq['support_score'])} ({len(cq['results'])} CQs)", ""]

    return "\n".join(lines)


def _write_reports(out_dir: Path, domain_id: str, report: dict) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / f"{domain_id}.translation-evaluation.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    (out_dir / f"{domain_id}.translation-report.md").write_text(_render_markdown(domain_id, report), encoding="utf-8")


# ---------------------------------------------------------------------------
# Orchestration.
# ---------------------------------------------------------------------------


def run_evaluation(
    domain_yaml_path: Path,
    translation_path: Path,
    source_ir_path: Path,
    manifest_path: Path,
    out_dir: Path,
    stability_run_paths: list[Path] | None = None,
    judges: int = 3,
    round_trip_sample_size: int = 5,
    cq_count: int = 10,
    dry_run: bool = False,
) -> int:
    manifest = load_manifest(manifest_path)
    domain_data = yaml.safe_load(domain_yaml_path.read_text(encoding="utf-8")) or {}
    translation = json.loads(translation_path.read_text(encoding="utf-8"))
    source_ir = json.loads(source_ir_path.read_text(encoding="utf-8"))

    structural = structural_gate(domain_data)
    provenance = provenance_gate(domain_data, translation, source_ir)
    reverse = reverse_coverage(source_ir, translation)

    stability = {"note": "no stability_run_paths supplied", "pairs": [], "average_f1": None}
    if stability_run_paths:
        domain_datas = [yaml.safe_load(p.read_text(encoding="utf-8")) or {} for p in stability_run_paths]
        stability = translation_stability(domain_datas)

    hard_gates_ok = structural["ok"] and provenance["ok"]

    report = {
        "domain": manifest.id,
        "structural_validity": structural,
        "provenance_completeness": provenance,
        "reverse_coverage": reverse,
        "translation_stability": stability,
        "semantic_judging": None,
        "round_trip": None,
        "cq_support": None,
        "hard_gates_ok": hard_gates_ok,
    }

    if dry_run:
        n_mappings = len(translation.get("mappings", []))
        est_judge_cost = n_mappings * judges * estimate_cost(approx_tokens(JUDGE_SYSTEM_PROMPT) + 300, 60)
        est_roundtrip_cost = round_trip_sample_size * (estimate_cost(400, 150) + estimate_cost(300, 80))
        est_cq_cost = estimate_cost(approx_tokens(json.dumps(_summarize_source_ir(source_ir))) + 200, 800) + cq_count * estimate_cost(
            approx_tokens(domain_yaml_path.read_text(encoding="utf-8")) + 200, 100
        )
        est_total = est_judge_cost + est_roundtrip_cost + est_cq_cost
        print(f"[evaluate] DRY RUN -- {manifest.id}: hard gates {'PASS' if hard_gates_ok else 'FAIL'}")
        print(f"[evaluate] DRY RUN -- {n_mappings} mappings x {judges} judges = {n_mappings * judges} judge calls (~${est_judge_cost:.2f})")
        print(f"[evaluate] DRY RUN -- {round_trip_sample_size} round-trip samples x 2 calls (~${est_roundtrip_cost:.2f})")
        print(f"[evaluate] DRY RUN -- {cq_count} CQs generated + judged (~${est_cq_cost:.2f})")
        print(f"[evaluate] DRY RUN -- approx total LLM-layer cost ~${est_total:.2f}")
        print("[evaluate] DRY RUN -- no API call made; hard-gate report written, LLM layers left null")
        _write_reports(out_dir, manifest.id, report)
        return 0 if hard_gates_ok else 1

    if not hard_gates_ok:
        print("[evaluate] hard gates failed -- skipping LLM-based layers, a rejected translation isn't worth spending on")
        _write_reports(out_dir, manifest.id, report)
        return 1

    azure_config = load_azure_config()
    missing = [k for k in ("endpoint", "api_key") if not azure_config[k]]
    if missing:
        print(f"[evaluate] ERROR: missing Azure config: {missing}. Set AZURE_OPENAI_ENDPOINT / AZURE_OPENAI_API_KEY.", file=sys.stderr)
        _write_reports(out_dir, manifest.id, report)
        return 1

    from openai import AzureOpenAI

    client = AzureOpenAI(api_version=azure_config["api_version"], azure_endpoint=azure_config["endpoint"], api_key=azure_config["api_key"])
    logger = RunLogger(out_dir / "evaluate.log.jsonl")
    logger.event("evaluate_start", domain=manifest.id)
    try:
        report["semantic_judging"] = judge_mappings(
            client, azure_config["deployment"], translation, logger, judges=judges, domain_data=domain_data, source_ir=source_ir
        )
        report["round_trip"] = round_trip_sample(
            client, azure_config["deployment"], domain_data, translation, logger, sample_size=round_trip_sample_size
        )
        cqs, cq_gen_cost = generate_cqs(client, azure_config["deployment"], source_ir, logger, n=cq_count)
        report["cq_support"] = judge_cq_support(client, azure_config["deployment"], domain_yaml_path.read_text(encoding="utf-8"), cqs, logger)
        report["cq_support"]["generation_cost_usd"] = round(cq_gen_cost, 4)
    finally:
        logger.event("evaluate_end", domain=manifest.id)
        logger.close()

    zero_majority_unsupported = report["semantic_judging"]["unsupported_count"] == 0
    report["hard_gates_ok"] = hard_gates_ok and zero_majority_unsupported
    _write_reports(out_dir, manifest.id, report)
    print(f"[evaluate] {manifest.id}: done, hard_gates_ok={report['hard_gates_ok']}")
    return 0 if report["hard_gates_ok"] else 1


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--domain-yaml", type=Path, required=True)
    parser.add_argument("--translation", type=Path, required=True)
    parser.add_argument("--source-ir", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--stability-runs", type=Path, nargs="*", default=None, help="other runs' domain.yaml files, for layer 4")
    parser.add_argument("--judges", type=int, default=3)
    parser.add_argument("--round-trip-sample", type=int, default=5)
    parser.add_argument("--cq-count", type=int, default=10)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)

    return run_evaluation(
        args.domain_yaml,
        args.translation,
        args.source_ir,
        args.manifest,
        args.out_dir,
        stability_run_paths=args.stability_runs,
        judges=args.judges,
        round_trip_sample_size=args.round_trip_sample,
        cq_count=args.cq_count,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    sys.exit(main())
