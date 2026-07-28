"""Reference loader for the Knowledge Graph Canvas TXT edge-list format
(spec.md Section 5.2). Standard library only, no dependencies.

This is the exact snippet from spec.md's Appendix, kept in sync by hand —
see tools/test_load_edge_list.py. index.html's own importer (Section 5.3)
additionally does label-matched merge/replace against live graph state;
this module is read-only, for external scripts/pipelines.
"""

import sys


def load_edge_list(path):
    nodes, edges = [], []
    section = None
    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            # Section headers are checked before the generic "#" comment
            # skip below, since "## NODES"/"## EDGES" also start with "#" —
            # checking the comment rule first would make both headers
            # unreachable and the loader would parse nothing at all.
            if line == "## NODES":
                section = "nodes"
                continue
            if line == "## EDGES":
                section = "edges"
                continue
            if not line or line.startswith("#"):
                continue
            if section == "nodes":
                if line:
                    nodes.append({"label": line})
            elif section == "edges":
                if " : " not in line:
                    continue  # malformed — no relation separator, skip
                conn, relation = line.rsplit(" : ", 1)
                if "<->" in conn:
                    directed = False
                    src, tgt = conn.split("<->", 1)
                elif "->" in conn:
                    directed = True
                    src, tgt = conn.split("->", 1)
                else:
                    continue  # malformed — no connector, skip
                src, tgt, relation = src.strip(), tgt.strip(), relation.strip()
                if src and tgt and relation:
                    edges.append({
                        "source": src,
                        "target": tgt,
                        "relation": relation,
                        "directed": directed,
                    })
    return nodes, edges


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"usage: {sys.argv[0]} <path-to-txt-file>", file=sys.stderr)
        sys.exit(1)
    import json
    parsed_nodes, parsed_edges = load_edge_list(sys.argv[1])
    print(json.dumps({"nodes": parsed_nodes, "edges": parsed_edges}, indent=2))
