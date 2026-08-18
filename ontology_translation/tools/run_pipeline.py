"""Single-command orchestration of the full pipeline (issues #101/#102/#103):
fetch -> extract -> compile -> evaluate -> automatic repair/reinstate ->
re-evaluate, looped until the hard gates pass or progress stalls.

Every stage here is also independently runnable via its own CLI (see
tools/README.md) -- this just chains them using the exact same file
conventions each already uses on its own, and automates the one step that
was, before this existed, done by hand every round this session: reading
evaluate.py's own report and building the next tool's input from it.

Nothing here is domain-specific. The batch-builders below
(`_build_repair_batch`, `_build_reinstate_batch`) reuse the same generic
helpers evaluate.py's own judges use internally to resolve real source
definitions (`_class_names_involved`, `_index_source_classes_by_label`,
`_index_source_records_by_iri`, `_sibling_context_for_iri`,
`_ground_truth_for_target`) -- if evaluate.py's judging is domain-agnostic,
so is this, by construction, not by separate claim.

This does not loop forever or fabricate its way to a passing report.
repair.py/reinstate.py only ever fix what the model can ground for real
(the same no-fabrication discipline as every other prompt in this
pipeline) -- some elements get correctly `drop`ped, some exclusions get
correctly reground with a better note but stay excluded, and some
CQ/contested-judgment gaps have no real fix available at all (a domain-
agnostic pipeline cannot know whether that's true for YOUR source ontology
without trying). If hard gates still fail after `--max-fix-rounds`, or a
round makes no further progress at all, this stops and reports the
remaining state honestly rather than pretending success.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import yaml

import compile as compile_mod
import evaluate as evaluate_mod
import extract as extract_mod
import fetch as fetch_mod
import reinstate as reinstate_mod
import repair as repair_mod
from source_manifest import load_manifest


def _run_stage(label: str, main_fn, argv: list[str]) -> int:
    print(f"\n[pipeline] === {label} ===")
    print(f"[pipeline] {' '.join(str(a) for a in argv)}")
    rc = main_fn(argv)
    if rc != 0:
        print(f"[pipeline] {label} FAILED (exit {rc})", file=sys.stderr)
    return rc


# ---------------------------------------------------------------------------
# Batch builders: turn evaluate.py's own report into repair.py's/
# reinstate.py's input files, the same way this was done by hand all
# session. Pure, deterministic, no LLM calls of their own.
# ---------------------------------------------------------------------------


def _build_repair_batch(domain_data: dict, translation: dict, source_ir: dict, semantic_judging: dict) -> tuple[list[dict], dict]:
    """Rejected items + combined source_context for repair.py, derived from
    evaluate.py's own semantic_judging report."""
    unsupported_paths = semantic_judging.get("unsupported_paths") or []
    if not unsupported_paths:
        return [], {}

    results_by_path = {r["target_path"]: r for r in semantic_judging.get("results", [])}
    source_index = evaluate_mod._index_source_classes_by_label(source_ir)
    iri_index = evaluate_mod._index_source_records_by_iri(source_ir)
    mapping_by_path = {m["target_path"]: m for m in translation.get("mappings", [])}

    rejected = []
    combined_context: dict[str, list[dict]] = {}
    for target_path in unsupported_paths:
        resolved = repair_mod._resolve_container_and_key(domain_data, target_path)
        if resolved is None:
            # Nothing left to repair against (already removed by an earlier
            # fix in this same round) -- skip rather than guess.
            continue
        container, key = resolved
        current_shape = container[key]

        result = results_by_path.get(target_path, {})
        rationale_bits = [
            j["rationale"] for j in result.get("raw_judgments", [])
            if j.get("verdict") == "unsupported" and j.get("rationale")
        ]
        rejection_rationale = " / ".join(dict.fromkeys(rationale_bits)) or "Independent semantic judges found this majority-unsupported."
        rejected.append({"target_path": target_path, "current_shape": current_shape, "rejection_rationale": rejection_rationale})

        mapping = mapping_by_path.get(target_path, {})
        ground_truth = evaluate_mod._ground_truth_for_target(
            domain_data, source_index, target_path, source_iris=mapping.get("source_iris"), iri_index=iri_index,
        )
        if ground_truth:
            combined_context.update(ground_truth)

    return rejected, combined_context


def _build_reinstate_batch(translation: dict, source_ir: dict, disposition_judging: dict) -> list[dict]:
    """FlaggedDisposition-shaped items for reinstate.py, derived from
    evaluate.py's own disposition_judging report."""
    unjustified_iris = disposition_judging.get("unjustified_iris") or []
    if not unjustified_iris:
        return []

    results_by_iri = {r["source_iri"]: r for r in disposition_judging.get("results", [])}
    disposition_by_iri = {d["source_iri"]: d for d in translation.get("dispositions", [])}
    iri_index = evaluate_mod._index_source_records_by_iri(source_ir)
    mapped_source_iris = evaluate_mod._mapped_source_iris_by_disposition(translation)

    flagged = []
    for iri in unjustified_iris:
        record = iri_index.get(iri)
        disposition = disposition_by_iri.get(iri)
        if record is None or disposition is None:
            continue
        result = results_by_iri.get(iri, {})
        rationale_bits = [
            j["rationale"] for j in result.get("raw_judgments", [])
            if j.get("verdict") == "unjustified" and j.get("rationale")
        ]
        judge_rationale = " / ".join(dict.fromkeys(rationale_bits)) or "Independent judges found this exclusion unjustified."
        flagged.append(
            {
                "source_iri": iri,
                "disposition": disposition.get("disposition"),
                "note": disposition.get("note") or "",
                "source_definition": {"labels": record.get("labels"), "altLabels": record.get("altLabels"), "definitions": record.get("definitions")},
                "included_siblings": evaluate_mod._sibling_context_for_iri(iri, iri_index, mapped_source_iris),
                "judge_rationale": judge_rationale,
            }
        )
    return flagged


# ---------------------------------------------------------------------------
# Fix loop.
# ---------------------------------------------------------------------------


def _fix_round(
    domain_yaml_path: Path,
    translation_path: Path,
    source_ir_path: Path,
    manifest_path: Path,
    out_dir: Path,
    round_num: int,
    judges: int,
    round_trip_sample: int,
    cq_count: int,
) -> tuple[bool, Path, Path]:
    """Runs one evaluate -> (repair + reinstate as needed) round. Returns
    (hard_gates_ok, current_domain_yaml_path, current_translation_path) --
    the paths are unchanged from the input unless a fix was actually
    applied, so the caller can tell whether this round made progress."""
    eval_out_dir = out_dir / f"eval-round-{round_num}"
    rc = _run_stage(
        f"evaluate (round {round_num})", evaluate_mod.main,
        [
            "--domain-yaml", str(domain_yaml_path), "--translation", str(translation_path),
            "--source-ir", str(source_ir_path), "--manifest", str(manifest_path),
            "--out-dir", str(eval_out_dir), "--judges", str(judges),
            "--round-trip-sample", str(round_trip_sample), "--cq-count", str(cq_count),
        ],
    )
    manifest = load_manifest(manifest_path)
    report_path = eval_out_dir / f"{manifest.id}.translation-evaluation.json"
    report = json.loads(report_path.read_text(encoding="utf-8"))
    if rc == 0 and report.get("hard_gates_ok"):
        return True, domain_yaml_path, translation_path

    structural_ok = report.get("structural_validity", {}).get("ok", True)
    endpoint_ok = (report.get("endpoint_citation_completeness") or {}).get("ok", True)
    if not structural_ok or not endpoint_ok:
        # These indicate a real compile-time defect (bad structure, or an
        # endpoint citation gap) -- repair.py/reinstate.py fix *content*
        # judges reject, not this. No automatic fix available; report and
        # stop rather than loop uselessly.
        print("[pipeline] structural_validity or endpoint_citation_completeness failed -- "
              "not something repair.py/reinstate.py can fix automatically. Stopping.")
        return False, domain_yaml_path, translation_path

    semantic_judging = report.get("semantic_judging") or {}
    disposition_judging = report.get("disposition_judging") or {}
    if semantic_judging.get("unsupported_count", 0) == 0 and disposition_judging.get("unjustified_count", 0) == 0:
        # Hard gates failed for a reason neither fix tool addresses (e.g.
        # provenance element coverage, or missing Azure config upstream) --
        # nothing more this loop can do.
        return False, domain_yaml_path, translation_path

    domain_data = yaml.safe_load(domain_yaml_path.read_text(encoding="utf-8")) or {}
    translation = json.loads(translation_path.read_text(encoding="utf-8"))
    source_ir = json.loads(source_ir_path.read_text(encoding="utf-8"))

    made_progress = False
    current_domain_path, current_translation_path = domain_yaml_path, translation_path

    if semantic_judging.get("unsupported_count", 0) > 0:
        rejected, source_context = _build_repair_batch(domain_data, translation, source_ir, semantic_judging)
        if rejected:
            repair_dir = out_dir / f"repair-round-{round_num}"
            repair_dir.mkdir(parents=True, exist_ok=True)
            rejected_path = repair_dir / "rejected.json"
            source_context_path = repair_dir / "source-context.json"
            rejected_path.write_text(json.dumps(rejected, indent=2), encoding="utf-8")
            source_context_path.write_text(json.dumps(source_context, indent=2), encoding="utf-8")
            rc = _run_stage(
                f"repair (round {round_num})", repair_mod.main,
                [
                    "--domain-yaml", str(current_domain_path), "--translation", str(current_translation_path),
                    "--rejected", str(rejected_path), "--source-context", str(source_context_path),
                    "--out-dir", str(repair_dir),
                ],
            )
            if rc == 0:
                current_domain_path = repair_dir / "repaired.domain.yaml"
                current_translation_path = repair_dir / "repaired.translation.json"
                made_progress = True
            else:
                print(f"[pipeline] repair round {round_num} did not apply cleanly -- continuing with pre-repair state.")

    if disposition_judging.get("unjustified_count", 0) > 0:
        # Re-load from whatever repair just produced, so reinstate sees the
        # up-to-date domain/translation.
        flagged = _build_reinstate_batch(
            json.loads(current_translation_path.read_text(encoding="utf-8")), source_ir, disposition_judging,
        )
        if flagged:
            reinstate_dir = out_dir / f"reinstate-round-{round_num}"
            reinstate_dir.mkdir(parents=True, exist_ok=True)
            flagged_path = reinstate_dir / "flagged.json"
            flagged_path.write_text(json.dumps(flagged, indent=2), encoding="utf-8")
            rc = _run_stage(
                f"reinstate (round {round_num})", reinstate_mod.main,
                [
                    "--domain-yaml", str(current_domain_path), "--translation", str(current_translation_path),
                    "--flagged", str(flagged_path), "--out-dir", str(reinstate_dir),
                ],
            )
            if rc == 0:
                current_domain_path = reinstate_dir / "reinstated.domain.yaml"
                current_translation_path = reinstate_dir / "reinstated.translation.json"
                made_progress = True
            else:
                print(f"[pipeline] reinstate round {round_num} did not apply cleanly -- continuing with pre-reinstate state.")

    if not made_progress:
        print(f"[pipeline] round {round_num} made no progress -- stopping rather than looping.")
        return False, current_domain_path, current_translation_path

    return False, current_domain_path, current_translation_path


def run_pipeline(
    manifest_path: Path,
    out_dir: Path,
    source_file: Path | None,
    runs: int | None,
    max_fix_rounds: int,
    judges: int,
    round_trip_sample: int,
    cq_count: int,
    dry_run: bool,
) -> int:
    manifest = load_manifest(manifest_path)
    out_dir.mkdir(parents=True, exist_ok=True)

    if source_file is None:
        source_file = out_dir / "source.ttl"
        rc = _run_stage("fetch", fetch_mod.main, ["--manifest", str(manifest_path), "--out", str(source_file)])
        if rc != 0:
            return rc
    else:
        print(f"[pipeline] === fetch === skipped, using existing {source_file}")

    source_ir_path = out_dir / "source_ir.json"
    rc = _run_stage(
        "extract", extract_mod.main,
        ["--input", str(source_file), "--manifest", str(manifest_path), "--out", str(source_ir_path)],
    )
    if rc != 0:
        return rc

    compile_argv = ["--source-ir", str(source_ir_path), "--manifest", str(manifest_path), "--out-dir", str(out_dir)]
    if runs is not None:
        compile_argv += ["--runs", str(runs)]
    if dry_run:
        compile_argv.append("--dry-run")
    rc = _run_stage("compile", compile_mod.main, compile_argv)
    if rc != 0:
        return rc
    if dry_run:
        print("[pipeline] DRY RUN -- stopping after compile's own estimate; no further stages run.")
        return 0

    domain_yaml_path = out_dir / "run-1.domain.yaml"
    translation_path = out_dir / "run-1.translation.json"

    hard_gates_ok = False
    for round_num in range(1, max_fix_rounds + 1):
        hard_gates_ok, domain_yaml_path, translation_path = _fix_round(
            domain_yaml_path, translation_path, source_ir_path, manifest_path, out_dir,
            round_num, judges, round_trip_sample, cq_count,
        )
        if hard_gates_ok:
            break

    final_eval_dir = out_dir / "eval-final"
    rc = _run_stage(
        "evaluate (final)", evaluate_mod.main,
        [
            "--domain-yaml", str(domain_yaml_path), "--translation", str(translation_path),
            "--source-ir", str(source_ir_path), "--manifest", str(manifest_path),
            "--out-dir", str(final_eval_dir), "--judges", str(judges),
            "--round-trip-sample", str(round_trip_sample), "--cq-count", str(cq_count),
        ],
    )
    report_path = final_eval_dir / f"{manifest.id}.translation-evaluation.json"
    report = json.loads(report_path.read_text(encoding="utf-8"))
    print(f"\n[pipeline] === DONE === hard_gates_ok={report.get('hard_gates_ok')}")
    print(f"[pipeline] final domain.yaml: {domain_yaml_path}")
    print(f"[pipeline] final translation.json: {translation_path}")
    print(f"[pipeline] final report: {report_path}")
    return 0 if report.get("hard_gates_ok") else 1


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--source-file", type=Path, default=None, help="already-downloaded source file; skips fetch.py")
    parser.add_argument("--runs", type=int, default=None, help="override manifest.compiler.runs")
    parser.add_argument("--max-fix-rounds", type=int, default=2, help="max evaluate+repair/reinstate loop iterations")
    parser.add_argument("--judges", type=int, default=3)
    parser.add_argument("--round-trip-sample", type=int, default=5)
    parser.add_argument("--cq-count", type=int, default=10)
    parser.add_argument("--dry-run", action="store_true", help="fetch+extract+compile --dry-run only; no API calls, nothing written past the cost estimate")
    args = parser.parse_args(argv)

    return run_pipeline(
        args.manifest, args.out_dir, args.source_file, args.runs, args.max_fix_rounds,
        args.judges, args.round_trip_sample, args.cq_count, args.dry_run,
    )


if __name__ == "__main__":
    sys.exit(main())
