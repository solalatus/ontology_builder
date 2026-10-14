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


def render(audit: dict, classification: dict) -> str:
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
    w("`tools/subclass_audit.py`) and `classification.yaml` (a reviewer's judgment, one line per")
    w("pair). Do not edit by hand; rerun both scripts instead.")
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
    w("## What this means for #155")
    w("")
    w("This audit covers the *reference* models, not the interview outputs that motivated #155.")
    w("It does not record a decision (that is #155's next step). What the data supports:")
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
    w("## Reproduce")
    w("")
    w("```sh")
    w("python3 ontology_translation/tools/subclass_audit.py --out ontology_translation/results/subclass-audit/audit.json")
    w("python3 ontology_translation/tools/subclass_audit_report.py")
    w("```")
    w("")
    w("Both are offline and deterministic. `fetch.py --manifest <domain>/source-manifest.yaml")
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
    (AUDIT_DIR / "REPORT.md").write_text(render(audit, classification), encoding="utf-8")
    print(f"wrote {AUDIT_DIR / 'REPORT.md'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
