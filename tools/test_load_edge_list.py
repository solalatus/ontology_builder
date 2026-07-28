"""Tests for load_edge_list.py, standard library only (unittest).

Reuses the same fixture files under tests/fixtures/ that the JS test suite
(tests/phase6.spec.mjs) exercises the app's own importer against, so both
the Python reference and the JS importer are checked against one shared
set of example files rather than two that could quietly drift apart.

Run with: python3 -m unittest tools/test_load_edge_list.py
"""

import os
import tempfile
import unittest

from load_edge_list import load_edge_list

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "..", "tests", "fixtures")


def fixture(name):
    return os.path.join(FIXTURES_DIR, name)


def load_text(text):
    """Writes `text` to a temp file and loads it, for cases with no fixture."""
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
        f.write(text)
        path = f.name
    try:
        return load_edge_list(path)
    finally:
        os.unlink(path)


def load_text_with_bom(text):
    """Same as load_text(), but the file is written with a leading UTF-8 BOM
    — exactly what Windows Notepad/Excel produce on "Save As UTF-8", and the
    exact trigger for the BOM-drops-all-nodes bug this module's own comment
    on the utf-8-sig open() call documents."""
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8-sig") as f:
        f.write(text)
        path = f.name
    try:
        return load_edge_list(path)
    finally:
        os.unlink(path)


class TestSpecExample(unittest.TestCase):
    """Regression test for the header/comment-check-order bug: before the
    fix, this returned ([], []) for spec.md's own worked example."""

    def setUp(self):
        self.nodes, self.edges = load_edge_list(fixture("spec-example.txt"))

    def test_all_nodes_parsed(self):
        self.assertEqual(len(self.nodes), 5)
        self.assertEqual(len(self.edges), 3)

    def test_directed_edge(self):
        edge = next(e for e in self.edges if e["relation"] == "language used" and e["target"] == "Telugu")
        self.assertEqual(edge["source"], "Andhra Pradesh")
        self.assertTrue(edge["directed"])

    def test_bidirectional_edge_is_not_directed(self):
        edge = next(e for e in self.edges if e["relation"] == "diplomatic relation")
        self.assertEqual(edge["source"], "Guatemala")
        self.assertEqual(edge["target"], "European Union")
        self.assertFalse(edge["directed"])


class TestOtherFixtures(unittest.TestCase):
    def test_subset(self):
        nodes, edges = load_edge_list(fixture("subset.txt"))
        self.assertEqual([n["label"] for n in nodes], ["Andhra Pradesh", "Telugu"])
        self.assertEqual(len(edges), 1)
        self.assertEqual(edges[0]["relation"], "language used")

    def test_additional(self):
        nodes, edges = load_edge_list(fixture("additional.txt"))
        self.assertEqual([n["label"] for n in nodes], ["Andhra Pradesh", "Kerala"])
        self.assertEqual(edges[0]["relation"], "neighboring state")


class TestGrammarEdgeCases(unittest.TestCase):
    def test_comment_lines_and_blank_lines_are_ignored(self):
        nodes, edges = load_text(
            "# this is a comment\n"
            "\n"
            "## NODES\n"
            "# another comment, mid-section\n"
            "Alpha\n"
            "\n"
            "## EDGES\n"
        )
        self.assertEqual(nodes, [{"label": "Alpha"}])
        self.assertEqual(edges, [])

    def test_headers_are_recognized_even_though_they_start_with_hash(self):
        # The bug this whole file exists to pin down.
        nodes, edges = load_text("## NODES\nAlpha\n\n## EDGES\n")
        self.assertEqual(len(nodes), 1)

    def test_malformed_edge_line_missing_separator_is_skipped(self):
        nodes, edges = load_text(
            "## NODES\nAlpha\nBeta\n\n## EDGES\nAlpha Beta no separator at all\nAlpha -> Beta : real\n"
        )
        self.assertEqual(len(edges), 1)
        self.assertEqual(edges[0]["relation"], "real")

    def test_malformed_edge_line_missing_connector_is_skipped(self):
        nodes, edges = load_text(
            "## NODES\nAlpha\nBeta\n\n## EDGES\nAlpha Beta : no connector here\nAlpha -> Beta : real\n"
        )
        self.assertEqual(len(edges), 1)
        self.assertEqual(edges[0]["relation"], "real")

    def test_file_with_no_recognized_sections_returns_empty(self):
        nodes, edges = load_text("just some\nrandom text\nwith no headers at all\n")
        self.assertEqual(nodes, [])
        self.assertEqual(edges, [])

    def test_multiple_edges_between_the_same_pair_with_different_relations(self):
        nodes, edges = load_text(
            "## NODES\nAlpha\nBeta\n\n## EDGES\nAlpha -> Beta : relation one\nAlpha -> Beta : relation two\n"
        )
        self.assertEqual(len(edges), 2)
        self.assertEqual({e["relation"] for e in edges}, {"relation one", "relation two"})


class TestUtf8Bom(unittest.TestCase):
    """A leading UTF-8 BOM (str.strip() does not remove U+FEFF) used to make
    the file's first line never equal "## NODES" literally, silently
    dropping every node while edges still parsed fine — since "## EDGES"
    appears later in the file, past where the BOM's effect reaches. See the
    utf-8-sig comment on load_edge_list()'s own open() call."""

    def test_nodes_still_parse_with_a_leading_bom(self):
        nodes, edges = load_text_with_bom(
            "## NODES\nAlpha\nBeta\n\n## EDGES\nAlpha -> Beta : relation\n"
        )
        self.assertEqual([n["label"] for n in nodes], ["Alpha", "Beta"])
        self.assertEqual(len(edges), 1)

    def test_bom_file_matches_the_equivalent_non_bom_file_exactly(self):
        text = "## NODES\nAlpha\nBeta\nGamma\n\n## EDGES\nAlpha -> Beta : one\nBeta <-> Gamma : two\n"
        self.assertEqual(load_text_with_bom(text), load_text(text))


if __name__ == "__main__":
    unittest.main()
