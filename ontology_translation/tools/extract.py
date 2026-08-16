"""Stage 1 of the compiler pipeline (issue #102): deterministic extraction
of a neutral source IR from RDF/OWL. Pure RDFLib graph-walking, no LLM
involved anywhere in this file -- "do not ask an LLM to parse RDF."

Produces one record per class/object-property/datatype-property/enumeration/
restriction/import, each shaped like the issue's example:

    {"iri": "...", "kind": "class", "labels": [...], "altLabels": [...],
     "definitions": [...], "parents": [...], "sourceOntology": "brick"}

`select_scope()` is the piece that keeps large upstream ontologies (Brick,
FIBO) from blowing the compiler's context: given a manifest's
`scope.roots` (IRIs or case-insensitive label substrings), it walks the
subClassOf graph outward from whatever matches and keeps only the connected
slice, plus any property whose domain or range lands inside it. This is
what "requested domain scope" (issue #102 Stage 2 input) is built from.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import rdflib
from rdflib import OWL, RDF, RDFS
from rdflib.namespace import DCTERMS, SKOS

from source_manifest import load_manifest

LABEL_PREDICATES = (RDFS.label, SKOS.prefLabel)
ALT_LABEL_PREDICATES = (SKOS.altLabel,)
DEFINITION_PREDICATES = (RDFS.comment, SKOS.definition, DCTERMS.description)


def local_name(iri: str) -> str:
    """Last path/fragment segment of an IRI, for a readable fallback label
    when a term carries no rdfs:label/skos:prefLabel at all."""
    for sep in ("#", "/"):
        if sep in iri:
            tail = iri.rsplit(sep, 1)[-1]
            if tail:
                return tail
    return iri


def parse_graph(path: str | Path, fmt: str | None = None) -> rdflib.Graph:
    graph = rdflib.Graph()
    graph.parse(str(path), format=fmt)  # format=None -> rdflib guesses from extension/content
    return graph


def _literals(graph: rdflib.Graph, subject, predicates) -> list[str]:
    out = []
    for pred in predicates:
        for obj in graph.objects(subject, pred):
            text = str(obj)
            if text not in out:
                out.append(text)
    return out


def _term_record(graph: rdflib.Graph, subject, kind: str, source_ontology: str) -> dict:
    iri = str(subject)
    labels = _literals(graph, subject, LABEL_PREDICATES) or [local_name(iri)]
    return {
        "iri": iri,
        "kind": kind,
        "labels": labels,
        "altLabels": _literals(graph, subject, ALT_LABEL_PREDICATES),
        "definitions": _literals(graph, subject, DEFINITION_PREDICATES),
        "sourceOntology": source_ontology,
    }


def extract_classes(graph: rdflib.Graph, source_ontology: str) -> list[dict]:
    subjects = set(graph.subjects(RDF.type, OWL.Class)) | set(graph.subjects(RDF.type, RDFS.Class))
    records = []
    for subject in sorted(subjects):
        if isinstance(subject, rdflib.BNode):
            continue  # anonymous class expressions are captured via restrictions, not as classes
        record = _term_record(graph, subject, "class", source_ontology)
        record["parents"] = sorted(
            str(p) for p in graph.objects(subject, RDFS.subClassOf) if not isinstance(p, rdflib.BNode)
        )
        records.append(record)
    return records


def _property_records(graph: rdflib.Graph, rdf_type, kind: str, source_ontology: str) -> list[dict]:
    records = []
    for subject in sorted(graph.subjects(RDF.type, rdf_type)):
        record = _term_record(graph, subject, kind, source_ontology)
        record["domain"] = sorted(str(d) for d in graph.objects(subject, RDFS.domain))
        record["range"] = sorted(str(r) for r in graph.objects(subject, RDFS.range))
        record["inverseOf"] = sorted(str(i) for i in graph.objects(subject, OWL.inverseOf))
        records.append(record)
    return records


def extract_enumerations(graph: rdflib.Graph, source_ontology: str) -> list[dict]:
    records = []
    for subject, _, collection_node in sorted(graph.triples((None, OWL.oneOf, None))):
        members = [str(m) for m in rdflib.collection.Collection(graph, collection_node)]
        records.append(
            {
                "iri": str(subject),
                "kind": "enumeration",
                "members": members,
                "sourceOntology": source_ontology,
            }
        )
    return records


def extract_restrictions(graph: rdflib.Graph, source_ontology: str) -> list[dict]:
    records = []
    restriction_predicates = {
        OWL.someValuesFrom: "someValuesFrom",
        OWL.allValuesFrom: "allValuesFrom",
        OWL.hasValue: "hasValue",
        OWL.cardinality: "cardinality",
        OWL.minCardinality: "minCardinality",
        OWL.maxCardinality: "maxCardinality",
        OWL.qualifiedCardinality: "qualifiedCardinality",
    }
    for subject in sorted(graph.subjects(RDF.type, OWL.Restriction)):
        on_property = next(graph.objects(subject, OWL.onProperty), None)
        constraint = None
        for pred, name in restriction_predicates.items():
            value = next(graph.objects(subject, pred), None)
            if value is not None:
                constraint = {"type": name, "value": str(value)}
                break
        records.append(
            {
                "iri": str(subject),
                "kind": "restriction",
                "onProperty": str(on_property) if on_property else None,
                "constraint": constraint,
                "sourceOntology": source_ontology,
            }
        )
    return records


def extract_imports(graph: rdflib.Graph, source_ontology: str) -> list[dict]:
    records = []
    for subject, imported in sorted(graph.subject_objects(OWL.imports)):
        records.append(
            {
                "iri": str(subject),
                "kind": "import",
                "imports": str(imported),
                "sourceOntology": source_ontology,
            }
        )
    return records


def extract_all(graph: rdflib.Graph, source_ontology: str) -> dict:
    return {
        "classes": extract_classes(graph, source_ontology),
        "object_properties": _property_records(graph, OWL.ObjectProperty, "object_property", source_ontology),
        "datatype_properties": _property_records(
            graph, OWL.DatatypeProperty, "datatype_property", source_ontology
        ),
        "enumerations": extract_enumerations(graph, source_ontology),
        "restrictions": extract_restrictions(graph, source_ontology),
        "imports": extract_imports(graph, source_ontology),
    }


def _matches_root(record: dict, roots_lower: list[str]) -> bool:
    """Exact (case-insensitive) match against the term's local name or any
    of its labels -- deliberately not substring containment. A curator
    writing `scope.roots: [Fan]` means the class named Fan, not every term
    whose name happens to contain "fan" as a substring (e.g. an unrelated
    FanStatusEnum) -- on a large ontology like Brick or FIBO, substring
    matching would silently balloon the selected scope."""
    candidates = {local_name(record["iri"]).lower(), *(l.lower() for l in record.get("labels", []))}
    return any(root.strip().lower() in candidates for root in roots_lower)


def select_scope(ir: dict, roots: list[str], max_depth: int | None = None) -> dict:
    """Filters the extracted IR down to the connected subgraph reachable
    from `roots` (IRI or label substrings) along subClassOf edges in either
    direction, plus any property whose domain/range lands in that class set.
    Taxonomy is used for scope selection only, per issue #102 -- callers
    still must not turn the resulting `parents` edges into relationships.
    """
    if not roots:
        return ir  # no scope configured -- caller gets the whole extraction

    roots_lower = [r.lower() for r in roots]
    classes_by_iri = {c["iri"]: c for c in ir["classes"]}

    children_of: dict[str, list[str]] = {}
    for c in ir["classes"]:
        for parent in c.get("parents", []):
            children_of.setdefault(parent, []).append(c["iri"])

    selected: set[str] = set()
    frontier = [c["iri"] for c in ir["classes"] if _matches_root(c, roots_lower)]
    depth = 0
    while frontier and (max_depth is None or depth <= max_depth):
        next_frontier = []
        for iri in frontier:
            if iri in selected or iri not in classes_by_iri:
                continue
            selected.add(iri)
            next_frontier.extend(classes_by_iri[iri].get("parents", []))
            next_frontier.extend(children_of.get(iri, []))
        frontier = [i for i in next_frontier if i not in selected]
        depth += 1

    scoped_classes = [c for c in ir["classes"] if c["iri"] in selected]

    def _property_in_scope(prop: dict) -> bool:
        endpoints = set(prop.get("domain", [])) | set(prop.get("range", []))
        return bool(endpoints & selected) or _matches_root(prop, roots_lower)

    return {
        "classes": scoped_classes,
        "object_properties": [p for p in ir["object_properties"] if _property_in_scope(p)],
        "datatype_properties": [p for p in ir["datatype_properties"] if _property_in_scope(p)],
        "enumerations": ir["enumerations"],  # cheap to keep in full; compiler ignores irrelevant ones
        "restrictions": [
            r for r in ir["restrictions"] if r.get("onProperty") in selected or r["iri"] in selected
        ],
        "imports": ir["imports"],
    }


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True, help="RDF/XML, Turtle or JSON-LD source file")
    parser.add_argument("--format", type=str, default=None, help="rdflib format hint (turtle, xml, json-ld, ...)")
    parser.add_argument("--manifest", type=Path, required=True, help="source-manifest.yaml (for id + scope.roots)")
    parser.add_argument("--out", type=Path, required=True, help="path to write the extracted source_ir.json")
    parser.add_argument("--no-scope", action="store_true", help="skip scope filtering, emit the full extraction")
    parser.add_argument("--max-depth", type=int, default=None, help="cap the subClassOf BFS depth from scope roots")
    args = parser.parse_args(argv)

    manifest = load_manifest(args.manifest)
    print(f"[extract] {manifest.id}: parsing {args.input}")
    graph = parse_graph(args.input, args.format)
    print(f"[extract] {manifest.id}: {len(graph)} triples parsed")

    ir = extract_all(graph, manifest.id)
    counts = {k: len(v) for k, v in ir.items()}
    print(f"[extract] {manifest.id}: full extraction {counts}")

    if not args.no_scope and manifest.scope_roots:
        ir = select_scope(ir, manifest.scope_roots, max_depth=args.max_depth)
        counts = {k: len(v) for k, v in ir.items()}
        print(f"[extract] {manifest.id}: scoped to roots {manifest.scope_roots} -> {counts}")

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(ir, indent=2, sort_keys=False), encoding="utf-8")
    print(f"[extract] {manifest.id}: wrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
