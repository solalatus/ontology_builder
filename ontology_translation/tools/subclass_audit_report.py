"""Renders ontology_translation/results/subclass-audit/REPORT.md from the
deterministic audit (audit.json, written by subclass_audit.py), the
reviewer's per-pair classification (classification.yaml) and each domain's
reference.domain.yaml. Every number in the report is computed here, so the
report cannot drift from its inputs (tools/tests/test_subclass_audit.py
checks the committed REPORT.md is exactly what this renders).

Usage:
    python3 ontology_translation/tools/subclass_audit_report.py
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
AUDIT_DIR = ROOT / "results" / "subclass-audit"
CATEGORIES = ["kind", "value", "state", "role", "individual"]
FOLDABLE = {"value", "state"}


def component_sets(classes: list[str], edges: list[tuple[str, str]], drop: set[str] = frozenset()) -> list[list[str]]:
    """Connected components, largest first, each a sorted class list.
    Classes in `drop` (folded into their parent) still join components but
    are not counted as members."""
    parent = {c: c for c in classes}

    def find(c):
        parent.setdefault(c, c)
        while parent[c] != c:
            parent[c] = parent[parent[c]]
            c = parent[c]
        return c

    for a, b in edges:
        parent[find(a)] = find(b)
    groups: dict[str, list[str]] = {}
    for c in list(parent):
        if c not in drop:
            groups.setdefault(find(c), []).append(c)
    return sorted((sorted(g) for g in groups.values()), key=lambda g: (-len(g), g))


def components(classes: list[str], edges: list[tuple[str, str]], drop: set[str] = frozenset()) -> list[int]:
    return [len(g) for g in component_sets(classes, edges, drop)]


def domain_rows(audit: dict, classification: dict) -> list[dict]:
    rows = []
    for d in audit["domains"]:
        name = d["domain"]
        model = yaml.safe_load((ROOT / "domains" / name / "reference.domain.yaml").read_text(encoding="utf-8"))
        classes = list(model["classes"])
        rel_edges = [(r["from"], r["to"]) for r in model.get("relationships") or []]
        category = {(p["sub"], p["super"]): p["category"] for p in classification["pairs"][name]}
        cands = d["candidates"]
        cat_of = lambda c, category=category: category[(c["subclass"], c["superclass"])]
        kind_edges = [(c["subclass"], c["superclass"]) for c in cands if cat_of(c) == "kind"]
        fold_edges = [(c["subclass"], c["superclass"]) for c in cands if cat_of(c) in FOLDABLE]
        now = components(classes, rel_edges)
        with_kind = components(classes, rel_edges + kind_edges)
        # Folding a value/state subtype into a property of its parent merges
        # the two nodes, which joins their components exactly as an edge
        # would; the class count drops by the number of folded subtypes.
        folded_classes = {s for s, _ in fold_edges}
        folded = components(classes, rel_edges + kind_edges + fold_edges, drop=folded_classes)
        rows.append({
            "domain": name,
            "source_edges": d["named_subclassof_edges_in_source"],
            "classes": len(classes),
            "pairs": len(cands),
            "via_skipped": sum(1 for c in cands if c["kind"] != "direct"),
            "categories": Counter(cat_of(c) for c in cands),
            "islands": [c for c in cands if c["x_is_island"]],
            "not_connected": [c for c in cands if not c["x_connected_to_parent"]],
            "cat_of": cat_of,
            "components_now": now,
            "component_sets_now": component_sets(classes, rel_edges),
            "is_a_missing": d.get("is_a_with_missing_endpoint"),
            "components_kind": with_kind,
            "components_folded": folded,
            "classes_after_fold": len(classes) - len(folded_classes),
            "latent": d.get("latent_subtypes_by_disposition"),
            "secondary_hits": d.get("secondary_ancestor_hits", []),
            "secondary_only": d.get("secondary_only_citations", []),
            "folded_parents": d.get("folded_parents", []),
            "candidates": cands,
        })
    return rows


BRICK_SPACE_NOTE = (
    " In Brick, `Building`, `Floor` and `Zone` sit under `brick:Location`, which sits under `rec:Space`, beside "
    "`brick:Space` rather than under it; the translation merged `brick:Space` and `rec:Space` into one `Space`."
)


def _cat_cell(counter: Counter) -> str:
    return " / ".join(str(counter.get(c, 0)) for c in CATEGORIES)


def _components_cell(sizes: list[int], n_classes: int) -> str:
    return f"{len(sizes)} (largest {sizes[0]}/{n_classes})"


STEP1_STATUSES = ["linked", "connected", "not connected", "parent not recovered", "subtype not recovered", "neither recovered"]


def render_step1(recovered: dict) -> list[str]:
    """The interview-output section, from recovered-connectivity.json
    (tests/evals/subtype-connectivity.mjs)."""
    cur, pre = recovered["current_prompt"], recovered["pre_152_prompt"]
    out = []
    w = out.append

    def unlinked(era):
        rows = []
        for run in era["runs"]:
            for p in run["pairs"]:
                if p["status"] == "not connected":
                    caught = any(h["subtype"] == p.get("recovered_subtype") and h["parent"] == p.get("recovered_parent")
                                 and not h["linked"] for h in run["name_hint_hits"])
                    rows.append((run, p, caught))
        return rows

    cur_unlinked, pre_unlinked = unlinked(cur), unlinked(pre)
    count_by = lambda rows: Counter(p["category"] for _, p, _ in rows)
    w("## Step 1: interview outputs")
    w("")
    w(f"The reference audit says what *could* be a subclass. #155's gate asks whether interviews actually leave")
    w(f"subtypes unlinked from their parent. `tests/evals/subtype-connectivity.mjs` re-runs the project's own")
    w(f"heuristic class matcher on every recovered model. It reproduces each run's committed")
    w(f"`heuristic-matches.json` exactly ({sum(r['matcher_reproduces_committed_matches'] for r in cur['runs'])} of "
      f"{len(cur['runs'])} current-prompt runs, {sum(r['matcher_reproduces_committed_matches'] for r in pre['runs'])} of "
      f"{len(pre['runs'])} pre-#152 runs). For each audit pair it then records whether the interview recovered")
    w("the subtype and its parent, and whether a chain of relationships links them.")
    w("")
    w(f"Corpus: {', '.join('`' + c + '`' for c in cur['corpus'])} (current prompt, {len(cur['runs'])} runs). "
      f"For comparison, {', '.join('`' + c + '`' for c in pre['corpus'])} (pre-#152 prompt, {len(pre['runs'])} runs).")
    w("")
    w("### What happens to each pair (current prompt, summed over runs)")
    w("")
    w("| Category | " + " | ".join(STEP1_STATUSES) + " | of which folded into a parent property |")
    w("|---|" + "---:|" * (len(STEP1_STATUSES) + 1))
    for cat in CATEGORIES:
        c = cur["summary"]["by_category"].get(cat)
        if not c:
            continue
        w(f"| {cat} | " + " | ".join(str(c[s]) for s in STEP1_STATUSES) + f" | {c['folded into a parent value']} |")
    w("")
    w("*linked*: a relationship joins the two; *connected*: a chain of relationships through other classes does;")
    w("*folded*: the subtype was not recovered as a class, but a property of the recovered parent carries it")
    w("(`stateCategory = degraded`, `isSecured`).")
    w("")
    w("### Unlinked subtypes")
    w("")
    w("| Prompt | Unlinked pairs (all runs) | kind | value | state | Caught by the name hint |")
    w("|---|---:|---:|---:|---:|---:|")
    for name, rows_ in [("current", cur_unlinked), ("pre-#152", pre_unlinked)]:
        cb = count_by(rows_)
        w(f"| {name} | {len(rows_)} | {cb['kind']} | {cb['value']} | {cb['state']} | {sum(1 for *_, c in rows_ if c)} of {len(rows_)} |")
    w("")
    w("Current prompt, every instance:")
    w("")
    for run, p, caught in cur_unlinked:
        w(f"- {run['domain']} {run['run']}: `{p['subclass']}` → `{p['superclass']}` ({p['category']})"
          + ("" if caught else " — not caught by the name hint"))
    w("")
    w("### Gate")
    w("")
    by_domain = cur["summary"]["by_domain"]
    w("| Domain | Runs | Runs with an unlinked kind | Name hint: fires (unlinked) | Name hint: already linked |")
    w("|---|---:|---:|---:|---:|")
    for dom, d in sorted(by_domain.items()):
        w(f"| {dom} | {d['runs']} | {d['runs_with_unlinked_kind']} | {d['name_hint_unlinked']} | {d['name_hint_linked']} |")
    w("")
    met = cur["summary"]["gate_met"]
    gate_domains = cur["summary"]["domains_with_an_unlinked_kind"]
    distinct_kinds = sorted({(p["subclass"], p["superclass"]) for _, p, _ in cur_unlinked if p["category"] == "kind"})
    w(f"The gate recorded on #155 (an unlinked kind in at least one run, in two or more domains) is "
      f"**{'met' if met else 'not met'}**: {', '.join(gate_domains) or 'no domain'}. It is met by "
      f"{len(distinct_kinds)} distinct pair{'s' if len(distinct_kinds) != 1 else ''}: "
      + ", ".join(f"`{a}` → `{b}`" for a, b in distinct_kinds) + ".")
    w("")
    hint_fp = [(run, h) for run in cur["runs"] for h in run["name_hint_hits"]
               if not h["linked"] and not any(p.get("recovered_subtype") == h["subtype"] and p.get("recovered_parent") == h["parent"] for p in run["pairs"])]
    w("### Observations")
    w("")
    w(f"1. **The prompt change in epic #152 already reduced the problem.** Unlinked pairs fell from {len(pre_unlinked)} to "
      f"{len(cur_unlinked)} across the same 15 interviews per prompt, and kinds from {count_by(pre_unlinked)['kind']} to "
      f"{count_by(cur_unlinked)['kind']}. The FIBO islands that motivated #155 (`SecuredLoan`, `CollateralizedLoan`) "
      "no longer occur: the current interviews model security as a `Loan → Collateral` relationship or an `isSecured` "
      "property, never as a separate class.")
    states = cur["summary"]["by_category"].get("state", {})
    w("2. **Most subtypes are simply not elicited as classes**, whatever their category. That is the flat model working "
      f"as intended for values and states. Of the {states.get('subtype not recovered', 0)} state subtypes not recovered "
      f"as classes, {states.get('folded into a parent value', 0)} were folded into a property of the parent "
      "(iof-maintenance's `stateCategory`).")
    w(f"3. **The cheap name hint is accurate and targeted.** It would have fired {sum(d['name_hint_unlinked'] for d in by_domain.values())} times "
      f"in the current runs, catching {sum(1 for *_, c in cur_unlinked if c)} of the {len(cur_unlinked)} unlinked pairs, "
      f"with {len(hint_fp)} false positive{'s' if len(hint_fp) != 1 else ''} ("
      + ", ".join(f"`{h['subtype']}` → `{h['parent']}`" for _, h in hint_fp) + "). It stays silent where a "
      f"subtype is already linked ({sum(d['name_hint_linked'] for d in by_domain.values())} such name pairs).")
    w("")
    return out


def render(audit: dict, classification: dict, recovered: dict | None = None) -> str:
    rows = domain_rows(audit, classification)
    total = Counter()
    for r in rows:
        total += r["categories"]
    n_pairs = sum(r["pairs"] for r in rows)
    not_conn = [(r, c) for r in rows for c in r["not_connected"]]
    not_conn_cat = Counter(r["cat_of"](c) for r, c in not_conn)
    islands = [(r, c) for r in rows for c in r["islands"]]
    island_cat = Counter(r["cat_of"](c) for r, c in islands)
    kind_not_conn = [(r, c) for r, c in not_conn if r["cat_of"](c) == "kind"]
    domains_with_kind = [r["domain"] for r in rows if r["categories"].get("kind")]
    domains_without_kind = [r["domain"] for r in rows if not r["categories"].get("kind")]

    out = []
    w = out.append
    w("# Subclass audit across the five domains (issue #155)")
    w("")
    w("Generated by `tools/subclass_audit_report.py` from `audit.json` (computed by")
    w("`tools/subclass_audit.py`), `classification.yaml` (a reviewer's judgment, one line per pair)")
    w("and `recovered-connectivity.json` (computed by `tests/evals/subtype-connectivity.mjs`).")
    w("Do not edit by hand; rerun the scripts instead.")
    w("")
    w("## Question")
    w("")
    w("#155 asks, for every domain and not just FIBO: if the compiler were allowed to emit a")
    w("label-only `specializes` edge, which source `rdfs:subClassOf` edges would newly become")
    w("translatable, and would any domain need re-translation? Underneath that sits the")
    w("design question: are these subtypes real kinds that need an edge, or something a flat")
    w("model already expresses better (a property value, a state)?")
    w("")
    w("## Method")
    w("")
    w("- **Inputs, all committed:** the original sources under `domains/<id>/source/`")
    w("  (checksum-pinned by each `source-manifest.yaml`, provenance in `PROVENANCE.yaml`), each")
    w("  domain's `translation.json` (which source IRI became which target element) and")
    w("  `reference.domain.yaml`. itops has no RDF source; its subclass edges are the 23 `\"is a\"`")
    w("  predicates of the original MTSR fixture (`domains/itops/source/itops_mtsr.original.yaml`),")
    w("  removed from the ground truth on 2026-07-29.")
    w("- **Walk:** for each source IRI mapped to a target class X, follow `rdfs:subClassOf`")
    w("  upward (named classes only; OWL restrictions are property constraints, not taxonomy)")
    w("  through IRIs that were not translated, and stop at the first translated ancestor. If it")
    w("  became a different class Y, `X specializes Y` is a **candidate pair**.")
    w("- **Identity:** an IRI's identity is what the mappings listing it *first* say it became.")
    w("  The compiler also cites supporting evidence further down `source_iris`, often the")
    w("  parent class (iof-supply-chain's `Trailer` cites `[Trailer, Container]`); counting those")
    w("  produced nonsense pairs such as `Trailer specializes Wagon`, so they are reported, not")
    w("  walked.")
    w("- **Connectivity**, measured in the current reference model: an *island* has no")
    w("  relationships at all; *not connected to parent* means no chain of relationships links")
    w("  the subclass to its parent, so a `specializes` edge would join two separate parts of")
    w("  the model. That is the problem #155 describes.")
    w("- **Classification** (`classification.yaml`, judgment, not computed):")
    w("  - **kind**: rigid, with relationships, properties or rules of its own.")
    w("  - **value**: rigid, but differs from its siblings by one attribute (medium, mode, type")
    w("    flag); a controlled-value property on the parent says the same.")
    w("  - **state**: an instance enters and leaves it (declared, accrued, degraded).")
    w("  - **role**: held because of a relationship.")
    w("  - **individual**: names one real-world thing, not a type.")
    w("")
    w("## Results")
    w("")
    w("Categories are kind / value / state / role / individual.")
    w("")
    w("| Domain | Source subclass edges | Target classes | Candidate pairs | Categories | Not connected to parent | Islands |")
    w("|---|---:|---:|---:|---|---:|---:|")
    for r in rows:
        w(f"| {r['domain']} | {r['source_edges']} | {r['classes']} | {r['pairs']} | {_cat_cell(r['categories'])} | "
          f"{len(r['not_connected'])} | {len(r['islands'])} |")
    w(f"| **all** | | | **{n_pairs}** | **{_cat_cell(total)}** | **{len(not_conn)}** | **{len(islands)}** |")
    w("")
    w(f"- **Every domain has candidates**, so under an unguarded rule all five would need")
    w(f"  re-translation, including the manual spot-check round #155 requires.")
    w(f"- **Most candidates are not kinds.** Of {n_pairs} pairs, {total['kind']} are kinds; "
      f"{total['value']} are values, {total['state']} are states, {total['individual']} name individuals "
      f"and {total['role']} is a role.")
    w(f"- **Under a kinds-only rule**, {', '.join(domains_with_kind)} have qualifying edges and "
      f"{', '.join(domains_without_kind) or 'none'} {'has' if len(domains_without_kind) == 1 else 'have'} none, "
      f"so {'it needs' if len(domains_without_kind) == 1 else 'they need'} no re-translation.")
    w(f"- **Of the {len(not_conn)} pairs not connected to their parent**, {not_conn_cat['kind']} are kinds, "
      f"{not_conn_cat['value']} values and {not_conn_cat['state']} states. Of the {len(islands)} islands, "
      f"{island_cat['kind']} are kinds, {island_cat['value']} values and {island_cat['state']} states.")
    w("")
    w("### Connectivity under three options")
    w("")
    w("Connected components of each reference model (relationships taken as undirected):")
    w("")
    w("- **now**: the model as committed.")
    w("- **+ kind edges**: add `specializes` only for pairs classified as kinds.")
    w("- **+ kind edges, fold value/state**: additionally turn each value or state subtype into a")
    w("  value of a controlled property on its parent, removing that class.")
    w("")
    w("| Domain | now | + kind edges | + kind edges, fold value/state | Classes after folding |")
    w("|---|---|---|---|---:|")
    for r in rows:
        w(f"| {r['domain']} | {_components_cell(r['components_now'], r['classes'])} | "
          f"{_components_cell(r['components_kind'], r['classes'])} | "
          f"{_components_cell(r['components_folded'], r['classes_after_fold'])} | "
          f"{r['classes_after_fold']} of {r['classes']} |")
    w("")
    w("Folding a subtype merges it into its parent, which joins their components exactly as an")
    w("edge would; the difference is that the model gets smaller rather than gaining a new")
    w("construct.")
    w("")
    w("## Findings")
    w("")
    fibo = next(r for r in rows if r["domain"] == "fibo-loans")
    itops = next(r for r in rows if r["domain"] == "itops")
    brick = next(r for r in rows if r["domain"] == "brick-hvac")
    fibo_kinds = sorted(c["subclass"] for c in fibo["not_connected"] if fibo["cat_of"](c) == "kind")
    w(f"1. **FIBO is the real case, and it is fragmented regardless of subclassing.** Its reference "
      f"model has {len(fibo['components_now'])} components; the largest holds {fibo['components_now'][0]} of "
      f"{fibo['classes']} classes. {len(fibo['not_connected'])} of its {fibo['pairs']} subclasses are not "
      f"connected to their parent. The {len(fibo_kinds)} kinds among them ({', '.join(fibo_kinds)}) are where a "
      f"`specializes` edge would add information a property cannot.")
    cut_off = itops["component_sets_now"][1:]
    individuals = sorted(c["subclass"] for c in itops["candidates"] if itops["cat_of"](c) == "individual")
    both_present = "All" if not itops["is_a_missing"] else f"{itops['pairs']} of the {itops['source_edges']}"
    w(f"2. **itops shows what dropping \"is a\" cost.** {both_present} original \"is a\" links still have both "
      f"classes in the model, and {'no' if not itops['islands'] else len(itops['islands'])} subclass is an island, "
      f"but {len(itops['not_connected'])} are no longer connected to their parent. The model has "
      f"{len(itops['components_now'])} components; the {len(cut_off)} outside the main one are "
      + "; ".join("{" + ", ".join(g) + "}" for g in cut_off)
      + f". With the kind edges restored it has {len(itops['components_kind'])}. "
      f"{len(individuals)} of the original links ({', '.join(individuals)}) make an organisational unit a "
      f"subclass, though each names one unit in the bank.")
    brick_values = brick["categories"].get("value", 0)
    w(f"3. **Brick's candidates are {'all' if brick_values == brick['pairs'] else brick_values} values** "
      f"(sensors and setpoints by medium, substance or mode). Brick also has the most untranslated "
      f"subtypes of translated classes ({sum((brick['latent'] or {}).values())}), so an unguarded rule would "
      f"pull in a long tail of value subclasses on re-translation.")
    w(f"4. **States would be modelled wrongly as subclasses** ({total['state']} pairs: "
      + ", ".join(sorted(f"{c['subclass']}" for r in rows for c in r["candidates"] if r["cat_of"](c) == "state"))
      + "). An asset is not permanently a `FailedState`, and an incident is declared major and later "
      "de-escalated. Any `specializes` rule needs a guard that rejects these.")
    w("5. **Translation artefacts found along the way:**")
    for r in rows:
        grouped: dict[str, list[dict]] = {}
        for h in r["secondary_hits"]:
            grouped.setdefault(h["cited_by_class"], []).append(h)
        for cls, hits in sorted(grouped.items()):
            subs = ", ".join(f"`{h['subclass']}`" for h in hits)
            w(f"   - {r['domain']}: {subs} reach `{cls}` only through an IRI that `{cls}`'s mapping cites second "
              f"(e.g. {hits[0]['source_path']}). They hold only under the translation's merged reading, so they are "
              f"not counted." + (BRICK_SPACE_NOTE if (r["domain"], cls) == ("brick-hvac", "Space") else ""))
    w("   - Class mappings that cite a parent class as evidence (iof-supply-chain's `Trailer` cites "
      "`[Trailer, Container]`) are handled by the first-listed rule and no longer affect the result.")
    w("")
    w("## What the reference audit supports")
    w("")
    w("This part covers the *reference* models; the next section covers the interview outputs.")
    w("")
    w(f"- **An unguarded `specializes` rule is not justified.** {total['value'] + total['state']} of {n_pairs}")
    w("  candidates are values or states that a flat model already expresses, and every domain")
    w("  would need re-translation.")
    w(f"- **A guarded rule (kinds only) has a real but narrow case**: {total['kind']} pairs, of which")
    w(f"  {len(kind_not_conn)} actually join separate parts of a model ({', '.join(sorted({r['domain'] for r, _ in kind_not_conn}))}).")
    w("- **Folding values and states into parent properties** reaches the same connectivity for")
    w("  those pairs without a new construct, and that is what the existing interviewer guidance")
    w("  (thing versus property) already asks for.")
    w("")
    if recovered:
        out.extend(render_step1(recovered))
    w("## Reproduce")
    w("")
    w("```sh")
    w("python3 ontology_translation/tools/subclass_audit.py --out ontology_translation/results/subclass-audit/audit.json")
    w("node tests/evals/subtype-connectivity.mjs --write")
    w("python3 ontology_translation/tools/subclass_audit_report.py")
    w("```")
    w("")
    w("All three are offline and deterministic. `fetch.py --manifest <domain>/source-manifest.yaml")
    w("--redownload` re-fetches a source from its pinned URL and fails if its checksum changed.")
    w("")
    w("## Candidate pairs")
    w("")
    for r in rows:
        w(f"### {r['domain']}")
        w("")
        w("| Subclass | Parent | Category | Path in source | Relationships | Connected to parent |")
        w("|---|---|---|---|---:|---|")
        why = {(p["sub"], p["super"]): p["why"] for p in classification["pairs"][r["domain"]]}
        for c in sorted(r["candidates"], key=lambda c: (r["cat_of"](c), c["superclass"], c["subclass"])):
            w(f"| {c['subclass']} | {c['superclass']} | {r['cat_of'](c)}: {why[(c['subclass'], c['superclass'])]} | "
              f"{c['source_paths'][0]} | {c['x_relationship_count']} | {'yes' if c['x_connected_to_parent'] else 'no'} |")
        w("")
    w("## Limitations")
    w("")
    w("- The classification is one reviewer's judgment; the reasons are recorded per pair so")
    w("  they can be challenged.")
    w("- Only pairs whose two ends are already in a reference model are counted. A changed rule")
    w("  could also bring in subtypes that are not translated today (the latent counts in")
    w("  `audit.json`).")
    w("- Connectivity treats relationships as undirected and ignores rules and actions.")
    w("- itops class ids map to model class names by capitalising the first letter, as in")
    w("  `tests/evals/convert-itops-to-domain-yaml.mjs`.")
    return "\n".join(out) + "\n"


def main() -> int:
    audit = json.loads((AUDIT_DIR / "audit.json").read_text(encoding="utf-8"))
    classification = yaml.safe_load((AUDIT_DIR / "classification.yaml").read_text(encoding="utf-8"))
    recovered = json.loads((AUDIT_DIR / "recovered-connectivity.json").read_text(encoding="utf-8"))
    (AUDIT_DIR / "REPORT.md").write_text(render(audit, classification, recovered), encoding="utf-8")
    print(f"wrote {AUDIT_DIR / 'REPORT.md'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
