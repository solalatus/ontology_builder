"""Subclass audit for issue #155: across all five domains, which source
`rdfs:subClassOf` edges would become translatable `specializes` edges
under a changed compiler rule, and which are already represented some
other way.

Deterministic and offline: reads the committed original sources under
`domains/<id>/source/` (checksum-pinned by each `source-manifest.yaml`),
each domain's committed `translation.json` (which source IRI became which
target element) and `reference.domain.yaml` (the current relationships).
No LLM, no network.

A source IRI's identity is what the mappings that list it FIRST in their
`source_iris` say it became; later positions are supporting evidence the
compiler cited (often the parent class) and are reported, never walked.

For every source IRI that the compiler mapped to a target class X, the
audit walks up `rdfs:subClassOf` (named classes only; OWL restriction
blank nodes are property constraints, not taxonomy) through source classes
that were *not* mapped to anything, and stops at the first ancestor that
was mapped:

- ancestor mapped to a different class Y -> candidate `X specializes Y`
  ("direct" when the source edge is immediate, "via N skipped" when it
  passes through unmapped intermediates)
- ancestor mapped to X itself -> merged; nothing to add
- ancestor mapped only to a property / relationship / rule / action -> the
  parent was folded into something that is not a class; reported, no
  candidate
- no mapped ancestor -> the parent lies outside the translated scope (an
  upper ontology such as BFO/IOF Core, or an unselected Brick branch)

It also counts the reverse direction: source subclasses of a mapped class
that the compiler did not bring in at all ("latent subtypes"), grouped by
their recorded disposition.

The itops domain has no RDF source: its ground truth is
`tests/evals/fixtures/itops_mtsr.yaml`, whose 23 `"is a"` predicates were
removed on 2026-07-29 (commit d197883). The original, pre-cleaning fixture
is committed as `domains/itops/source/itops_mtsr.original.yaml`, and its
`"is a"` predicates are audited the same way (class ids map to
reference.domain.yaml class names by capitalising the first letter, as in
tests/evals/convert-itops-to-domain-yaml.mjs).

Usage:
    python3 ontology_translation/tools/subclass_audit.py \
        --out ontology_translation/results/subclass-audit/audit.json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict, deque
from pathlib import Path

import rdflib
import yaml
from rdflib.namespace import RDF, RDFS, OWL

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch import source_filename  # noqa: E402
from source_manifest import load_manifest  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
DOMAINS_DIR = ROOT / "domains"
RDF_DOMAINS = ["brick-hvac", "fibo-loans", "iof-maintenance", "iof-supply-chain"]
MAX_DEPTH = 12

CLASS_PATH = re.compile(r"^classes\.([^.\[\]]+)$")
PROPERTY_PATH = re.compile(r"^classes\.([^.\[\]]+)\.properties\.([^.\[\]]+)$")


def committed_source_paths(domain_id: str) -> list[Path]:
    manifest = load_manifest(DOMAINS_DIR / domain_id / "source-manifest.yaml")
    return [DOMAINS_DIR / domain_id / "source" / source_filename(url, i) for i, url in enumerate(manifest.source_urls)]


def load_graph(paths: list[Path]) -> rdflib.Graph:
    graph = rdflib.Graph()
    for p in paths:
        fmt = "turtle" if p.suffix == ".ttl" else "xml"
        graph.parse(str(p), format=fmt)
    return graph


def label_of(graph: rdflib.Graph, iri: str) -> str:
    for lbl in graph.objects(rdflib.URIRef(iri), RDFS.label):
        if getattr(lbl, "language", None) in (None, "en"):
            return str(lbl)
    return re.split(r"[#/]", iri)[-1]


def index_mappings(translation: dict) -> tuple[dict[str, list[tuple[str, str]]], dict[str, list[str]]]:
    """Returns (identity, secondary).

    identity: IRI -> [(kind, target)] for the mappings that list the IRI
    FIRST in their source_iris, kind in class/property/other. Only these
    say what a source IRI became.

    secondary: IRI -> [target_path] for mappings that cite the IRI further
    down their source_iris list. The compiler cites supporting evidence
    there, often the parent class (iof-supply-chain's classes.Trailer cites
    [Trailer, Container]); treating those as identity would make Container
    "be" Trailer too, so they are reported but never walked."""
    identity: dict[str, list[tuple[str, str]]] = defaultdict(list)
    secondary: dict[str, list[str]] = defaultdict(list)
    for m in translation.get("mappings", []):
        path = m["target_path"]
        if (cm := CLASS_PATH.match(path)):
            target = ("class", cm.group(1))
        elif (pm := PROPERTY_PATH.match(path)):
            target = ("property", f"{pm.group(1)}.{pm.group(2)}")
        else:
            target = ("other", path)
        for position, iri in enumerate(m.get("source_iris", [])):
            if position == 0:
                if target not in identity[iri]:
                    identity[iri].append(target)
            elif path not in secondary[iri]:
                secondary[iri].append(path)
    return dict(identity), dict(secondary)


def relationship_index(domain: dict):
    """Relationship counts per class, the related class pairs, and each
    class's connected component (relationships taken as undirected)."""
    touching: dict[str, int] = Counter()
    pairs: set[frozenset] = set()
    parent = {c: c for c in (domain.get("classes") or {})}

    def find(c):
        parent.setdefault(c, c)
        while parent[c] != c:
            parent[c] = parent[parent[c]]
            c = parent[c]
        return c

    for r in domain.get("relationships", []) or []:
        touching[r["from"]] += 1
        touching[r["to"]] += 1
        pairs.add(frozenset((r["from"], r["to"])))
        parent[find(r["from"])] = find(r["to"])
    component = {c: find(c) for c in list(parent)}
    return touching, pairs, component


def connectivity(domain: dict, x: str, y: str, index) -> dict:
    touching, pairs, component = index
    return {
        "x_relationship_count": touching.get(x, 0),
        "x_is_island": touching.get(x, 0) == 0,
        "already_related_to_parent": frozenset((x, y)) in pairs,
        # The edge would join two otherwise separate parts of the model:
        # the "disconnected subclass" problem issue #155 is about.
        "x_connected_to_parent": component.get(x, x) == component.get(y, y),
    }


def audit_rdf_domain(domain_id: str) -> dict:
    ddir = DOMAINS_DIR / domain_id
    paths = committed_source_paths(domain_id)
    return audit_rdf_parts(
        domain_id,
        load_graph(paths),
        json.loads((ddir / "translation.json").read_text(encoding="utf-8")),
        yaml.safe_load((ddir / "reference.domain.yaml").read_text(encoding="utf-8")),
        [str(p.relative_to(ROOT.parent)) for p in paths],
    )


def audit_rdf_parts(domain_id: str, graph: rdflib.Graph, translation: dict, domain: dict, source_files: list[str]) -> dict:
    """The audit proper, on already-loaded inputs (unit-testable)."""
    mapped, secondary = index_mappings(translation)
    dispositions = {d["source_iri"]: d["disposition"] for d in translation.get("dispositions", [])}
    rel_index = relationship_index(domain)

    parents: dict[str, list[str]] = defaultdict(list)
    children: dict[str, list[str]] = defaultdict(list)
    named_edges = 0
    for s, o in graph.subject_objects(RDFS.subClassOf):
        if isinstance(s, rdflib.URIRef) and isinstance(o, rdflib.URIRef) and s != o and o != OWL.Thing:
            parents[str(s)].append(str(o))
            children[str(o)].append(str(s))
            named_edges += 1

    def class_targets(iri):
        return [t for k, t in mapped.get(iri, []) if k == "class"]

    candidates: dict[tuple[str, str], dict] = {}
    outcomes = Counter()
    folded_parents = []
    secondary_hits = []
    for iri, targets in sorted(mapped.items()):
        for x in [t for k, t in targets if k == "class"]:
            # BFS up through unmapped ancestors; stop a branch at the first
            # mapped one. Each ancestor is visited once, so a pair reachable
            # by several routes from the same source IRI keeps its shortest.
            queue = deque((p, [iri, p]) for p in parents.get(iri, []))
            seen = set()
            hit_any = False
            while queue:
                anc, path = queue.popleft()
                if anc in seen or len(path) > MAX_DEPTH:
                    continue
                seen.add(anc)
                anc_targets = mapped.get(anc, [])
                if not anc_targets:
                    for cited in secondary.get(anc, []):
                        if (cm := CLASS_PATH.match(cited)) and cm.group(1) != x:
                            secondary_hits.append({
                                "subclass": x, "cited_by_class": cm.group(1),
                                "source_path": " -> ".join(label_of(graph, p) for p in path),
                            })
                    queue.extend((p, path + [p]) for p in parents.get(anc, []))
                    continue
                hit_any = True
                anc_classes = [t for k, t in anc_targets if k == "class"]
                if not anc_classes:
                    outcomes["parent folded into a non-class element"] += 1
                    folded_parents.append({"class": x, "source_child": label_of(graph, iri),
                                           "source_parent": label_of(graph, anc), "parent_became": [t for _, t in anc_targets]})
                    continue
                for y in anc_classes:
                    if y == x:
                        outcomes["parent merged into the same class"] += 1
                        continue
                    key = (x, y)
                    skipped = len(path) - 2
                    entry = candidates.setdefault(key, {
                        "subclass": x, "superclass": y, "source_paths": [], "min_skipped": skipped,
                        **connectivity(domain, x, y, rel_index),
                    })
                    entry["min_skipped"] = min(entry["min_skipped"], skipped)
                    entry["source_paths"].append(" -> ".join(label_of(graph, p) for p in path))
            if not hit_any:
                outcomes["no mapped ancestor (parent outside translated scope)"] += 1
    for c in candidates.values():
        c["source_paths"] = sorted(set(c["source_paths"]))
        c["kind"] = "direct" if c["min_skipped"] == 0 else f"via {c['min_skipped']} skipped"

    latent = Counter()
    latent_examples = defaultdict(list)
    for iri in mapped:
        if not class_targets(iri):
            continue
        for child in children.get(iri, []):
            if child in mapped:
                continue
            disp = dispositions.get(child, "not listed in translation.json")
            latent[disp] += 1
            if len(latent_examples[disp]) < 6:
                latent_examples[disp].append(f"{label_of(graph, child)} (subclass of {label_of(graph, iri)})")

    return {
        "domain": domain_id,
        "source_files": source_files,
        "named_subclassof_edges_in_source": named_edges,
        "mapped_source_iris": len(mapped),
        "secondary_only_citations": sorted(
            f"{label_of(graph, iri)} (cited by {', '.join(paths)})" for iri, paths in secondary.items() if iri not in mapped
        ),
        "target_classes": len(domain.get("classes", {})),
        "taxonomy_only_dispositions": sum(1 for d in dispositions.values() if d == "taxonomy_only"),
        "upward_walk_outcomes": dict(outcomes),
        "candidates": sorted(candidates.values(), key=lambda c: (c["superclass"], c["subclass"])),
        "folded_parents": folded_parents,
        # Ancestors the walk passed through because they are only cited as
        # secondary evidence, yet a class mapping does cite them: a
        # specializes edge to that class holds only under the translation's
        # own merged reading (e.g. Brick's rec:Space folded into Space).
        "secondary_ancestor_hits": secondary_hits,
        "latent_subtypes_by_disposition": dict(latent),
        "latent_subtype_examples": dict(latent_examples),
    }


def audit_itops() -> dict:
    ddir = DOMAINS_DIR / "itops"
    return audit_itops_parts(
        yaml.safe_load((ddir / "source" / "itops_mtsr.original.yaml").read_text(encoding="utf-8")),
        yaml.safe_load((ddir / "reference.domain.yaml").read_text(encoding="utf-8")),
        [str((ddir / "source" / "itops_mtsr.original.yaml").relative_to(ROOT.parent))],
    )


def audit_itops_parts(original: dict, domain: dict, source_files: list[str]) -> dict:
    rel_index = relationship_index(domain)
    preds = original["predicates"]
    preds = preds.values() if isinstance(preds, dict) else preds
    to_name = lambda cid: cid[:1].upper() + cid[1:]
    candidates, missing = [], []
    for p in preds:
        if p.get("label") != "is a":
            continue
        x, y = to_name(p["from"]), to_name(p["to"])
        if x in domain["classes"] and y in domain["classes"]:
            candidates.append({"subclass": x, "superclass": y, "kind": "direct",
                               "source_paths": [f"{original['classes'][p['from']]['label']} -> {original['classes'][p['to']]['label']}"],
                               **connectivity(domain, x, y, rel_index)})
        else:
            missing.append({"subclass": x, "superclass": y})
    return {
        "domain": "itops",
        "source_files": source_files,
        "named_subclassof_edges_in_source": len(candidates) + len(missing),
        "target_classes": len(domain.get("classes", {})),
        "candidates": sorted(candidates, key=lambda c: (c["superclass"], c["subclass"])),
        "is_a_with_missing_endpoint": missing,
    }


def run_audit() -> dict:
    return {"domains": [audit_rdf_domain(d) for d in RDF_DOMAINS] + [audit_itops()]}


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args(argv)
    results = run_audit()["domains"]
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps({"domains": results}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for r in results:
        c = r["candidates"]
        print(f"{r['domain']:18} source edges={r['named_subclassof_edges_in_source']:5}  candidates={len(c):3} "
              f"(direct {sum(1 for x in c if x['kind'] == 'direct')}, islands {sum(1 for x in c if x['x_is_island'])}, "
              f"not connected to parent {sum(1 for x in c if not x['x_connected_to_parent'])}, "
              f"already related {sum(1 for x in c if x['already_related_to_parent'])})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
