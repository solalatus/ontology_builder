"""Tests for validate_domain.py's structural hard gate (issue #103 layer 1).
Offline, hand-built dicts -- no YAML files, no network, no LLM."""

import unittest

import sys as _sys
from pathlib import Path as _Path

_sys.path.insert(0, str(_Path(__file__).resolve().parents[1]))

from validate_domain import validate_domain

GOOD_DOMAIN = {
    "competency_questions": [{"id": "cq1", "text": "Which fan serves which zone?"}],
    "classes": {
        "Fan": {
            "meaning": "A device that moves air.",
            "aliases": ["blower"],
            "properties": {
                "status": {"type": "text", "allowed": ["on", "off"]},
                "airflow": {"type": "number", "unit": "CFM"},
            },
        },
        "Zone": {"meaning": "A controlled area of a building."},
    },
    "relationships": [
        {"name": "serves", "from": "Fan", "to": "Zone", "meaning": "The fan supplies air to the zone.", "aliases": []}
    ],
    "rules": {"canRunFan": {"conditions": ["zone occupancy is above threshold"]}},
    "actions": {
        "startFan": {
            "input": "Fan",
            "preconditions": ["canRunFan"],
            "effect": "fan status becomes on",
            "verification": "confirm fan status reads on",
        }
    },
}


def _mutate(base: dict, **overrides) -> dict:
    import copy

    out = copy.deepcopy(base)
    for path, value in overrides.items():
        keys = path.split(".")
        node = out
        for key in keys[:-1]:
            node = node[key]
        node[keys[-1]] = value
    return out


class ValidDomainTests(unittest.TestCase):
    def test_good_domain_has_no_errors(self):
        report = validate_domain(GOOD_DOMAIN)
        self.assertTrue(report.ok, msg=[i.message for i in report.errors])


class StructuralErrorTests(unittest.TestCase):
    def test_class_missing_meaning(self):
        bad = {"classes": {"Fan": {}}, "relationships": [], "rules": {}, "actions": {}, "competency_questions": []}
        report = validate_domain(bad)
        self.assertIn("missing_meaning", [i.code for i in report.errors])

    def test_invalid_property_type(self):
        bad = {
            "classes": {"Fan": {"meaning": "x", "properties": {"speed": {"type": "velocity"}}}},
            "relationships": [],
            "rules": {},
            "actions": {},
            "competency_questions": [],
        }
        report = validate_domain(bad)
        self.assertIn("invalid_property_type", [i.code for i in report.errors])

    def test_unit_on_non_number_property(self):
        bad = {
            "classes": {"Fan": {"meaning": "x", "properties": {"status": {"type": "text", "unit": "CFM"}}}},
            "relationships": [],
            "rules": {},
            "actions": {},
            "competency_questions": [],
        }
        report = validate_domain(bad)
        self.assertIn("unit_on_non_number", [i.code for i in report.errors])

    def test_relationship_endpoint_dangling(self):
        bad = {
            "classes": {"Fan": {"meaning": "x"}},
            "relationships": [{"name": "serves", "from": "Fan", "to": "GhostClass", "meaning": "x", "aliases": []}],
            "rules": {},
            "actions": {},
            "competency_questions": [],
        }
        report = validate_domain(bad)
        self.assertIn("dangling_relationship_endpoint", [i.code for i in report.errors])

    def test_action_input_unresolved(self):
        bad = {
            "classes": {"Fan": {"meaning": "x"}},
            "relationships": [],
            "rules": {},
            "actions": {
                "startFan": {"input": "GhostClass", "preconditions": [], "effect": "x", "verification": "x"}
            },
            "competency_questions": [],
        }
        report = validate_domain(bad)
        self.assertIn("action_input_unresolved", [i.code for i in report.errors])

    def test_action_precondition_unresolved(self):
        bad = _mutate(GOOD_DOMAIN, **{"actions.startFan.preconditions": ["noSuchRule"]})
        report = validate_domain(bad)
        self.assertIn("action_precondition_unresolved", [i.code for i in report.errors])

    def test_duplicate_class_after_normalization(self):
        bad = {
            "classes": {"Fan": {"meaning": "a"}, "  fan  ": {"meaning": "b"}},
            "relationships": [],
            "rules": {},
            "actions": {},
            "competency_questions": [],
        }
        report = validate_domain(bad)
        self.assertIn("duplicate_identifier", [i.code for i in report.errors])

    def test_duplicate_competency_question_id(self):
        bad = {
            "classes": {},
            "relationships": [],
            "rules": {},
            "actions": {},
            "competency_questions": [{"id": "cq1", "text": "a"}, {"id": "cq1", "text": "b"}],
        }
        report = validate_domain(bad)
        self.assertIn("duplicate_identifier", [i.code for i in report.errors])

    def test_root_not_a_mapping(self):
        report = validate_domain([])
        self.assertIn("root_not_mapping", [i.code for i in report.errors])

    def test_relationships_not_a_list(self):
        bad = {"classes": {}, "relationships": {}, "rules": {}, "actions": {}, "competency_questions": []}
        report = validate_domain(bad)
        self.assertIn("relationships_not_list", [i.code for i in report.errors])


if __name__ == "__main__":
    unittest.main()
