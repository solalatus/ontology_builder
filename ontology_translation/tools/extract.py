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
import re
import sys
from pathlib import Path

import rdflib
from rdflib import OWL, RDF, RDFS
from rdflib.namespace import DCTERMS, SKOS

from source_manifest import load_manifest

LABEL_PREDICATES = (RDFS.label, SKOS.prefLabel)
ALT_LABEL_PREDICATES = (SKOS.altLabel,)
DEFINITION_PREDICATES = (RDFS.comment, SKOS.definition, DCTERMS.description)

# Many real ontologies mint their OWN annotation properties for definition/
# synonym/acronym roles instead of reusing rdfs:comment/skos:definition/
# skos:altLabel -- found for real on IOF Maintenance (issue #108): every one
# of its 20 classes came out of extraction with `definitions: []` despite 46
# real `iof-av:naturalLanguageDefinition` elements (a custom predicate from
# IOF's own annotation vocabulary) sitting right there in the source file.
# A fixed allowlist of one more vocabulary would only ever fix the *next*
# ontology this pipeline happens to be pointed at, not "whatever ontology
# possible" (this pipeline's own explicit goal, not just IOF's) -- so
# instead of hardcoding IOF's specific IRIs, this discovers ANY ontology's
# own custom annotation predicates by NAMING CONVENTION: authors overwhelmingly
# name a custom annotation property after the role it plays (something with
# "definition"/"comment"/"description"/"note"/"gloss" in it for definitional
# text; "synonym"/"altlabel"/"acronym"/"alias"/"abbreviation" for alternate
# names) even when they don't reuse rdfs/skos/dcterms. Deliberately scoped to
# predicates actually used with a LITERAL object somewhere in the graph (a
# genuine textual annotation, never an object-valued relationship) and never
# overrides the small set of well-known standard predicates above.
_DEFINITION_NAME_RE = re.compile(r"definition|description|comment|explanatorynote|usagenote|gloss", re.IGNORECASE)
_ALT_LABEL_NAME_RE = re.compile(r"synonym|altlabel|alternate(?:name|label)|acronym|alias|abbreviation", re.IGNORECASE)


def discover_annotation_predicates(graph: rdflib.Graph) -> tuple[set, set]:
    """(definition-like predicates, alt-label-like predicates) discovered in
    `graph` by naming convention, excluding the well-known predicates
    already handled explicitly. See the module comment above for why this
    is a naming-convention heuristic rather than a per-ontology allowlist."""
    known = set(LABEL_PREDICATES) | set(ALT_LABEL_PREDICATES) | set(DEFINITION_PREDICATES)
    literal_predicates = {p for _, p, o in graph if isinstance(o, rdflib.Literal)}
    definition_preds, alt_label_preds = set(), set()
    for pred in literal_predicates:
        if pred in known:
            continue
        name = local_name(str(pred))
        if _DEFINITION_NAME_RE.search(name):
            definition_preds.add(pred)
        elif _ALT_LABEL_NAME_RE.search(name):
            alt_label_preds.add(pred)
    return definition_preds, alt_label_preds


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


def _term_record(
    graph: rdflib.Graph, subject, kind: str, source_ontology: str,
    extra_definition_preds: set = frozenset(), extra_alt_label_preds: set = frozenset(),
) -> dict:
    iri = str(subject)
    labels = _literals(graph, subject, LABEL_PREDICATES) or [local_name(iri)]
    return {
        "iri": iri,
        "kind": kind,
        "labels": labels,
        "altLabels": _literals(graph, subject, (*ALT_LABEL_PREDICATES, *extra_alt_label_preds)),
        "definitions": _literals(graph, subject, (*DEFINITION_PREDICATES, *extra_definition_preds)),
        "sourceOntology": source_ontology,
    }


def extract_classes(
    graph: rdflib.Graph, source_ontology: str,
    extra_definition_preds: set = frozenset(), extra_alt_label_preds: set = frozenset(),
) -> list[dict]:
    subjects = set(graph.subjects(RDF.type, OWL.Class)) | set(graph.subjects(RDF.type, RDFS.Class))
    records = []
    for subject in sorted(subjects):
        if isinstance(subject, rdflib.BNode):
            continue  # anonymous class expressions are captured via restrictions, not as classes
        record = _term_record(graph, subject, "class", source_ontology, extra_definition_preds, extra_alt_label_preds)
        record["parents"] = sorted(
            str(p) for p in graph.objects(subject, RDFS.subClassOf) if not isinstance(p, rdflib.BNode)
        )
        # owl:equivalentClass is a standard OWL construct (not specific to
        # any one source ontology) that many real ontologies use for
        # deprecated/alternate names of the same concept -- e.g. Brick's
        # "AHU" is owl:equivalentClass of "Air_Handling_Unit". Fold the
        # equivalent term's own label(s) in as extra alt-label evidence,
        # since that is exactly what an alias is.
        for equivalent in graph.objects(subject, OWL.equivalentClass):
            if isinstance(equivalent, rdflib.BNode):
                continue
            for label in _literals(graph, equivalent, LABEL_PREDICATES):
                if label not in record["altLabels"]:
                    record["altLabels"].append(label)
        records.append(record)
    return records


def _property_records(
    graph: rdflib.Graph, rdf_type, kind: str, source_ontology: str,
    extra_definition_preds: set = frozenset(), extra_alt_label_preds: set = frozenset(),
) -> list[dict]:
    records = []
    for subject in sorted(graph.subjects(RDF.type, rdf_type)):
        record = _term_record(graph, subject, kind, source_ontology, extra_definition_preds, extra_alt_label_preds)
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
    extra_definitions, extra_alt_labels = discover_annotation_predicates(graph)
    return {
        "classes": extract_classes(graph, source_ontology, extra_definitions, extra_alt_labels),
        "object_properties": _property_records(
            graph, OWL.ObjectProperty, "object_property", source_ontology, extra_definitions, extra_alt_labels
        ),
        "datatype_properties": _property_records(
            graph, OWL.DatatypeProperty, "datatype_property", source_ontology, extra_definitions, extra_alt_labels
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
        domain, range_ = prop.get("domain", []), prop.get("range", [])
        if not domain and not range_:
            # No rdfs:domain/rdfs:range declared at all -- common in
            # SHACL-styled ontologies (Brick included: relationships are
            # constrained via sh:property shapes on individual classes, not
            # global domain/range triples on the property itself). There is
            # nothing to filter by, so include rather than silently drop --
            # global property counts are small enough (in the hundreds, not
            # thousands) that keeping them all is cheap, and dropping every
            # relationship property is worse than including a few
            # irrelevant ones.
            return True
        endpoints = set(domain) | set(range_)
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
    parser.add_argument(
        "--max-depth", type=int, default=None,
        help="cap the subClassOf BFS depth from scope roots; overrides manifest scope.max_depth when given, "
        "same precedence pattern as compile.py's --runs",
    )
    args = parser.parse_args(argv)

    manifest = load_manifest(args.manifest)
    print(f"[extract] {manifest.id}: parsing {args.input}")
    graph = parse_graph(args.input, args.format)
    print(f"[extract] {manifest.id}: {len(graph)} triples parsed")

    ir = extract_all(graph, manifest.id)
    counts = {k: len(v) for k, v in ir.items()}
    print(f"[extract] {manifest.id}: full extraction {counts}")

    if not args.no_scope and manifest.scope_roots:
        max_depth = args.max_depth if args.max_depth is not None else manifest.scope_max_depth
        ir = select_scope(ir, manifest.scope_roots, max_depth=max_depth)
        counts = {k: len(v) for k, v in ir.items()}
        print(f"[extract] {manifest.id}: scoped to roots {manifest.scope_roots} (max_depth={max_depth}) -> {counts}")

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(ir, indent=2, sort_keys=False), encoding="utf-8")
    print(f"[extract] {manifest.id}: wrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
