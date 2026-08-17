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
# Layer 2b: relationship/action endpoint citation completeness (hard gate).
# ---------------------------------------------------------------------------
#
# provenance_gate above only checks that every element HAS a source_iris
# list; it says nothing about whether that list actually names the specific
# classes the element structurally connects. Found for real, three separate
# times (manual spot-check rounds 3-5 on Brick HVAC): a relationship's own
# mapping cites the predicate (hasPart/hasPoint/feeds/...) and maybe ONE
# endpoint, while its evidence prose explicitly discusses the OTHER endpoint
# by name -- but that endpoint's own class citation is missing from this
# specific mapping, even though the endpoint class has its own, separate,
# perfectly-cited classes.<Name> mapping elsewhere in the same file.
#
# Every attempt to catch this with text-matching against evidence/rationale
# prose (case-insensitive label search, no-space compiled-name search,
# stoplists for generic words, synonym clusters...) caught real instances
# but also missed real instances, because it depends on how the compiler
# happened to phrase the sentence. This check needs no prose at all: a
# relationship's `from`/`to` and an action's `input` are structural fields
# every domain has (agent_ontology_spec.md), and each named class already
# has its own canonical source_iris from its own classes.<Name> mapping --
# so this just checks set membership. It cannot be fooled by phrasing,
# and it generalizes to any domain, not just Brick HVAC.


def endpoint_citation_gate(domain_data: dict, translation: dict) -> dict:
    mapping_by_path = {m.get("target_path"): m for m in translation.get("mappings", [])}
    class_iris = {
        name: set(mapping_by_path.get(f"classes.{name}", {}).get("source_iris") or [])
        for name in (domain_data.get("classes") or {})
    }

    gaps = []
    for idx, rel in enumerate(domain_data.get("relationships") or []):
        if not isinstance(rel, dict):
            continue
        target_path = f"relationships[{idx}]"
        mapping = mapping_by_path.get(target_path)
        if mapping is None:
            continue
        cited = set(mapping.get("source_iris") or [])
        for end in ("from", "to"):
            cls = rel.get(end)
            known = class_iris.get(cls)
            if known and not (cited & known):
                gaps.append({"target_path": target_path, "endpoint": end, "class": cls, "known_class_iris": sorted(known)})

    for action_name, action_def in (domain_data.get("actions") or {}).items():
        if not isinstance(action_def, dict):
            continue
        target_path = f"actions.{action_name}"
        mapping = mapping_by_path.get(target_path)
        if mapping is None:
            continue
        cited = set(mapping.get("source_iris") or [])
        inp = action_def.get("input")
        known = class_iris.get(inp)
        if known and not (cited & known):
            gaps.append({"target_path": target_path, "endpoint": "input", "class": inp, "known_class_iris": sorted(known)})

    return {"ok": not gaps, "gaps": gaps}


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


_CAMEL_BOUNDARY_RE = re.compile(r"(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])")


def _normalize_class_name(name: str) -> str:
    """Like _normalize_name, but also splits camelCase/PascalCase word
    boundaries before lowercasing. Compiled .domain.yaml class names are
    virtually always PascalCase (`CondensingUnit`, `WaterTemperatureSensor`),
    while source ontology labels are virtually always space-separated
    (`Condensing Unit`, `Water Temperature Sensor`) -- _normalize_name alone
    (lowercase + whitespace-collapse only) treats these as different
    strings, so ground-truth resolution silently failed for almost every
    multi-word class name. Found for real, and it was actively misleading,
    not just incomplete: a judge shown only a *different*, unrelated class's
    definition (because the real one failed to resolve) rejected a
    genuinely well-grounded claim, reading the absence as real evidence
    against it. Single-word/acronym names (`Chiller`, `AHU`) are unaffected
    -- there's no boundary to split, so this is a pure superset fix."""
    spaced = _CAMEL_BOUNDARY_RE.sub(" ", name)
    return _normalize_name(spaced)


def _index_source_classes_by_label(source_ir: dict) -> dict[str, list[dict]]:
    """Normalized label/altLabel -> matching source_ir class record(s).
    Multiple records can share a label (e.g. two source classes the compiler
    merged into one target class), so this returns a list, not a single
    record."""
    index: dict[str, list[dict]] = {}
    for record in source_ir.get("classes", []):
        for label in (record.get("labels") or []) + (record.get("altLabels") or []):
            index.setdefault(_normalize_class_name(label), []).append(record)
    return index


def _index_source_records_by_iri(source_ir: dict) -> dict[str, dict]:
    """iri -> the full source_ir record (class, object/datatype property),
    for direct IRI-based ground-truth lookup. This is the fallback
    `_ground_truth_for_target` needs for target kinds `_class_names_involved`
    cannot resolve structurally at all -- rules (conditions are free text,
    no structural class reference) and actions whose real grounding is a
    class other than their declared `input` (e.g. an action citing a
    setpoint/sensor concept). Found for real on a rule
    (`rules.canUseEconomizer`, cited `Economizer` by IRI in its own
    `translation.json` mapping) that a repair pass nearly dropped for lack
    of *any* source context, purely because rules structurally resolve to
    no class names -- not because the source material didn't exist."""
    index: dict[str, dict] = {}
    for key in ("classes", "object_properties", "datatype_properties"):
        for record in source_ir.get(key, []):
            index[record["iri"]] = record
    return index


def _ground_truth_for_target(
    domain_data: dict,
    source_index: dict,
    target_path: str,
    source_iris: list[str] | None = None,
    iri_index: dict | None = None,
) -> dict | None:
    """The real source_ir definitions for the class(es) a target_path
    involves, when resolvable -- None (not an empty dict) when nothing could
    be resolved, so callers can tell "checked, nothing relevant" from
    "class name doesn't match any source label" apart if they need to.

    `source_iris`/`iri_index` are optional: when given, any of the mapping's
    own cited `source_iris` that resolve by exact IRI are folded in too,
    under a `cited:<label>` key so they're distinguishable from the
    structurally-inferred entries. This is strictly additive -- it never
    replaces the structural class-name resolution, only supplements it for
    target kinds (rules especially) that resolve to no class names at all.
    """
    class_names = _class_names_involved(domain_data, target_path)
    found = {}
    for name in class_names:
        records = source_index.get(_normalize_class_name(name))
        if records:
            found[name] = [
                {"iri": r.get("iri"), "labels": r.get("labels"), "altLabels": r.get("altLabels"), "definitions": r.get("definitions")}
                for r in records
            ]
    if source_iris and iri_index:
        for iri in source_iris:
            record = iri_index.get(iri)
            if record is None:
                continue
            label = (record.get("labels") or [iri])[0]
            key = f"cited:{label}"
            if key not in found:
                found[key] = [
                    {"iri": record.get("iri"), "labels": record.get("labels"), "altLabels": record.get("altLabels"), "definitions": record.get("definitions")}
                ]
    return found or None


JUDGE_SYSTEM_PROMPT = """You are an independent judge evaluating whether a translated Agent Ontology
element is adequately grounded by its cited evidence. You do not see any other judge's answer.

The evidence you are given is one of two legitimate kinds for this pipeline -- judge each on its own
terms, do not require a literal source quote for everything:

1. A literal or paraphrased snippet from the source ontology (an RDF label, comment, or definition).
2. A citation of standard, well-established domain practice tied to the *specific* named concepts the
   target element actually involves -- practice for whatever domain the ontology being judged actually
   is, not any one domain in particular. This is a deliberately sanctioned evidence category for this
   pipeline's compiler, valid in *any* domain it's applied to -- do not classify an element "unsupported"
   merely because its evidence is a standard-practice citation rather than a literal source quote, and do
   not weigh this evidence category differently depending on which domain happens to be in front of you.

When present, you will also be given `actual_source_class_definitions` -- the real, independently
looked-up source text for the class(es) the target element involves (resolved from the source ontology
itself, not supplied by whoever produced the mapping). Treat this as ground truth, not as more
self-reporting: it exists specifically so you can check the cited evidence and rationale *against* what
the source material actually says, rather than judging only whether the rationale reads plausibly in
isolation. A confident, well-written rationale is not itself evidence -- if a ground truth definition
directly contradicts what's being claimed, or a claim rests entirely on a class's ground truth definition
saying something it plainly doesn't say, that is real grounds for "unsupported" even when the prose
sounds authoritative.

Know what `actual_source_class_definitions` does and doesn't cover, and don't over-read an absence: for a
class or property, it's that class's own definition -- reasonably complete for judging a claim about that
class. For a relationship, it's both endpoint classes -- also reasonably complete for judging that specific
pair. For an **action**, it is *only* the action's declared input class, never every class the action's
effect/precondition/verification text might reasonably involve (e.g. a class that triggers or is checked
by the action but isn't the input itself) -- silence there about some other concept the action mentions is
expected and not itself evidence against the action, so weigh the cited evidence on its own terms in that
case, using the input class's definition mainly to catch an outright contradiction, not as an exhaustive
completeness check. **Rules** get no `actual_source_class_definitions` at all (conditions are free text
with no structural class reference) -- judge those purely on the cited evidence, same as when the field is
absent for any other target. When `actual_source_class_definitions` is absent entirely, judge the cited
evidence on its own terms, same as before this field existed.

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
    iri_index = _index_source_records_by_iri(source_ir) if source_ir is not None else None
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
            ground_truth = _ground_truth_for_target(
                domain_data, source_index, target_path,
                source_iris=mapping.get("source_iris"), iri_index=iri_index,
            )
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
# Layer 3b: independent judging of *exclusions* (hard gate).
# ---------------------------------------------------------------------------
#
# judge_mappings above only ever looks at elements that made it INTO the
# domain. Nothing symmetric ever checked whether an element the compiler
# left OUT was correctly left out -- reverse_coverage (layer 5) only checks
# that a disposition carries a *non-empty* note, never that the note is
# actually a *sound* reason. Found for real on the Brick HVAC clean rerun:
# asked directly whether the judges had actually verified out_of_scope
# calls were right, the honest answer was no -- only that a sentence
# existed. Manual inspection then found the exact same shallow, templated-
# justification failure mode already fixed once this session for a
# fabricated `status` property enum, this time on the exclusion side:
# "not needed for/in selected subset", reused near-verbatim across dozens
# of real, well-defined, directly-relevant source classes (Compressor,
# CondensingUnit, CoolingTower, Pump, HeatExchanger -- all direct
# HVAC_Equipment siblings of classes the compiler DID keep, with the
# accepted domain modeling other equipment's real components in detail but
# giving these zero treatment, no principled distinction drawn). This is
# general, not Brick-specific: any domain's compiler can take the cheap way
# out on a source element it doesn't feel like translating, and nothing
# before this caught it.

_SIBLING_CONTEXT_LIMIT = 8


def _sibling_context_for_iri(iri: str, iri_index: dict, mapped_source_iris: dict[str, str]) -> list[dict]:
    """Other source classes sharing at least one subClassOf parent with
    `iri` that the compiler actually mapped into the domain -- gives a
    disposition judge the comparison context needed to catch an exclusion
    that's inconsistent with what similar concepts at the same taxonomy
    depth received, not just plausible-sounding in isolation. Empty for
    non-class records (object/datatype properties carry no `parents`) and
    for classes with no source-declared parent -- there is nothing to
    compare against, not a sign the sibling check failed."""
    record = iri_index.get(iri)
    if record is None or record.get("kind") != "class":
        return []
    parents = set(record.get("parents") or [])
    if not parents:
        return []
    siblings = []
    for other_iri, other_record in iri_index.items():
        if other_iri == iri or other_record.get("kind") != "class":
            continue
        if not parents & set(other_record.get("parents") or []):
            continue
        target_path = mapped_source_iris.get(other_iri)
        if not target_path:
            continue
        siblings.append(
            {"iri": other_iri, "labels": other_record.get("labels"), "definitions": other_record.get("definitions"), "mapped_to": target_path}
        )
        if len(siblings) >= _SIBLING_CONTEXT_LIMIT:
            break
    return siblings


DISPOSITION_JUDGE_SYSTEM_PROMPT = """You are an independent judge evaluating whether a compiler's decision to
EXCLUDE a source ontology element from a generated Agent Ontology was actually justified -- not just
whether it wrote a plausible-sounding sentence. You do not see any other judge's answer.

You are given: the excluded element's real source definition (`source_definition`, independently
looked up from the source ontology itself, not supplied by whoever made the exclusion decision), the
compiler's own stated `disposition` category and `note` explaining why it was excluded, and
`included_siblings` -- other source elements from the same immediate area of the source ontology
(sharing a direct parent, when the excluded element is a class) that the compiler DID keep, with what
they were mapped to. `included_siblings` is empty when no such comparison exists to make (e.g. the
excluded element is a property, or a class with no siblings) -- that is not itself evidence for or
against the exclusion.

Judge the SUBSTANCE of the exclusion, not just whether a note exists:
- A generic, boilerplate-sounding note ("not needed in selected subset", "outside selected scope") is
  not on its own grounds for "unjustified" -- some genuinely out-of-scope elements deserve exactly that
  brief a note. But when the excluded element is well-defined, clearly on-topic for the domain, and
  `included_siblings` shows materially similar concepts (same immediate source-ontology neighborhood,
  comparable specificity and real-world operational relevance) that WERE kept with no principled reason
  given to treat this one differently, that inconsistency is real grounds for "unjustified" even though
  the note itself reads plausibly in isolation.
- A note that engages with something specific about the element (why it's out of the domain's chosen
  operational slice, why it's redundant with something already modeled, why it's a name-only taxonomy
  rung rather than an operational concept) is a real reason and should be judged as such, even briefly
  worded.
- This is domain-agnostic: judge substance and consistency for whatever domain and element are actually
  in front of you, not against any one domain's expected content.

Classify the exclusion as exactly one of:
- "justified" -- the note engages with something real and specific about this element, and nothing in
  `included_siblings` contradicts it.
- "partially_justified" -- the note is plausible but generic/templated, or a comparably relevant sibling
  was kept without a clear principled distinction, but the exclusion is not obviously wrong.
- "unjustified" -- the excluded element is clearly on-topic, well-defined, and operationally comparable
  to elements that were kept, with the note giving no real reason to treat it differently -- or the note
  is generic boilerplate reused with no engagement with this specific element at all.

Respond with exactly one JSON object, no prose, no markdown fences:
{"verdict": "justified" | "partially_justified" | "unjustified", "rationale": "one sentence"}"""


def judge_dispositions(
    client,
    deployment: str,
    translation: dict,
    source_ir: dict,
    logger: RunLogger,
    judges: int = 3,
) -> dict:
    """Independent judging of every non-`mapped` disposition that resolves
    to a real source class/property (layer 3b, hard gate: zero
    majority-unjustified). Dispositions whose `source_iri` doesn't resolve
    in `iri_index` (restrictions, enumerations, imports -- kinds
    `_index_source_records_by_iri` doesn't cover) are skipped: there is no
    real source definition to check the exclusion against, same "nothing
    to compare, not a failure" stance `_ground_truth_for_target` already
    takes elsewhere in this module."""
    iri_index = _index_source_records_by_iri(source_ir)
    mapped_source_iris: dict[str, str] = {}
    for mapping in translation.get("mappings", []):
        for src_iri in mapping.get("source_iris") or []:
            mapped_source_iris.setdefault(src_iri, mapping["target_path"])

    results = []
    total_cost = 0.0
    for disposition in translation.get("dispositions", []):
        if disposition.get("disposition") == "mapped":
            continue
        iri = disposition.get("source_iri")
        record = iri_index.get(iri)
        if record is None:
            continue
        payload = {
            "source_iri": iri,
            "source_definition": {"labels": record.get("labels"), "altLabels": record.get("altLabels"), "definitions": record.get("definitions")},
            "disposition": disposition.get("disposition"),
            "note": disposition.get("note"),
            "included_siblings": _sibling_context_for_iri(iri, iri_index, mapped_source_iris),
        }
        user_prompt = json.dumps(payload, indent=2)
        raw_judgments = []
        for judge_index in range(1, judges + 1):
            parsed, usage = chat_json_call(
                client, deployment, DISPOSITION_JUDGE_SYSTEM_PROMPT, user_prompt, logger, f"disposition-judge-{judge_index}:{iri}"
            )
            raw_judgments.append({"verdict": parsed.get("verdict"), "rationale": parsed.get("rationale")})
            total_cost += _call_cost(usage)
        contested = len({j["verdict"] for j in raw_judgments}) > 1
        results.append(
            {"source_iri": iri, "disposition": disposition.get("disposition"), "raw_judgments": raw_judgments,
             "majority_verdict": _majority_verdict(raw_judgments), "contested": contested}
        )

    unjustified = [r for r in results if r["majority_verdict"] == "unjustified"]
    contested = [r for r in results if r["contested"]]
    return {
        "results": results,
        "unjustified_count": len(unjustified),
        "unjustified_iris": [r["source_iri"] for r in unjustified],
        "contested_count": len(contested),
        "contested_iris": [r["source_iri"] for r in contested],
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

    endpoint = report.get("endpoint_citation_completeness")
    if endpoint is not None:
        lines += ["## Relationship/action endpoint citation completeness (hard gate)",
                  f"- ok: {endpoint['ok']}", f"- gaps: {len(endpoint['gaps'])}", ""]

    rc = report["reverse_coverage"]
    lines += ["## Reverse coverage", f"- coverage: {_pct(rc['coverage'])}", f"- silently dropped: {len(rc['silently_dropped'])}", ""]

    if report.get("semantic_judging"):
        sj = report["semantic_judging"]
        lines += ["## Independent semantic judging (hard gate: zero majority-unsupported)",
                  f"- majority-unsupported elements: {sj['unsupported_count']}", ""]

    if report.get("disposition_judging"):
        dj = report["disposition_judging"]
        lines += ["## Independent judging of exclusions (hard gate: zero majority-unjustified)",
                  f"- majority-unjustified exclusions: {dj['unjustified_count']}",
                  f"- contested exclusions: {dj['contested_count']}", ""]

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
    endpoint_citations = endpoint_citation_gate(domain_data, translation)
    reverse = reverse_coverage(source_ir, translation)

    stability = {"note": "no stability_run_paths supplied", "pairs": [], "average_f1": None}
    if stability_run_paths:
        domain_datas = [yaml.safe_load(p.read_text(encoding="utf-8")) or {} for p in stability_run_paths]
        stability = translation_stability(domain_datas)

    hard_gates_ok = structural["ok"] and provenance["ok"] and endpoint_citations["ok"]

    report = {
        "domain": manifest.id,
        "structural_validity": structural,
        "provenance_completeness": provenance,
        "endpoint_citation_completeness": endpoint_citations,
        "reverse_coverage": reverse,
        "translation_stability": stability,
        "semantic_judging": None,
        "disposition_judging": None,
        "round_trip": None,
        "cq_support": None,
        "hard_gates_ok": hard_gates_ok,
    }

    iri_index_for_estimate = _index_source_records_by_iri(source_ir)
    n_judgeable_dispositions = sum(
        1 for d in translation.get("dispositions", [])
        if d.get("disposition") != "mapped" and d.get("source_iri") in iri_index_for_estimate
    )

    if dry_run:
        n_mappings = len(translation.get("mappings", []))
        est_judge_cost = n_mappings * judges * estimate_cost(approx_tokens(JUDGE_SYSTEM_PROMPT) + 300, 60)
        est_disposition_cost = n_judgeable_dispositions * judges * estimate_cost(approx_tokens(DISPOSITION_JUDGE_SYSTEM_PROMPT) + 300, 60)
        est_roundtrip_cost = round_trip_sample_size * (estimate_cost(400, 150) + estimate_cost(300, 80))
        est_cq_cost = estimate_cost(approx_tokens(json.dumps(_summarize_source_ir(source_ir))) + 200, 800) + cq_count * estimate_cost(
            approx_tokens(domain_yaml_path.read_text(encoding="utf-8")) + 200, 100
        )
        est_total = est_judge_cost + est_disposition_cost + est_roundtrip_cost + est_cq_cost
        print(f"[evaluate] DRY RUN -- {manifest.id}: hard gates {'PASS' if hard_gates_ok else 'FAIL'}")
        print(f"[evaluate] DRY RUN -- {n_mappings} mappings x {judges} judges = {n_mappings * judges} judge calls (~${est_judge_cost:.2f})")
        print(f"[evaluate] DRY RUN -- {n_judgeable_dispositions} exclusions x {judges} judges = {n_judgeable_dispositions * judges} disposition-judge calls (~${est_disposition_cost:.2f})")
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
        report["disposition_judging"] = judge_dispositions(
            client, azure_config["deployment"], translation, source_ir, logger, judges=judges
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
    zero_majority_unjustified = report["disposition_judging"]["unjustified_count"] == 0
    report["hard_gates_ok"] = hard_gates_ok and zero_majority_unsupported and zero_majority_unjustified
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
