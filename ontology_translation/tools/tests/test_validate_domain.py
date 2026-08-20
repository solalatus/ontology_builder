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

    def test_allowed_with_non_string_values_is_flagged(self):
        # agent_ontology_spec.md types `allowed` as `string[] | null`; a bare
        # YAML true/false parses as a Python bool, not a str, so mixing them
        # into a status enum (e.g. [false, true, "alarm"]) is a type
        # violation -- found via manual spot-check on Brick HVAC (S10).
        bad = {
            "classes": {"AHU": {"meaning": "x", "properties": {"status": {"type": "text", "allowed": [False, True, "alarm"]}}}},
            "relationships": [],
            "rules": {},
            "actions": {},
            "competency_questions": [],
        }
        report = validate_domain(bad)
        self.assertIn("allowed_not_all_strings", [i.code for i in report.errors])

    def test_allowed_with_all_string_values_is_not_flagged(self):
        good = {
            "classes": {"AHU": {"meaning": "x", "properties": {"status": {"type": "text", "allowed": ["off", "on", "alarm"]}}}},
            "relationships": [],
            "rules": {},
            "actions": {},
            "competency_questions": [],
        }
        report = validate_domain(good)
        self.assertNotIn("allowed_not_all_strings", [i.code for i in report.errors])

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

    def test_self_loop_relationship_is_flagged_as_a_warning_not_an_error(self):
        # Found for real on IOF Maintenance (issue #108): a relationship
        # whose real other endpoint class wasn't extracted got compiled as a
        # same-class self-loop instead of being honestly omitted -- passed
        # structural validation before this check existed, caught only by
        # direct manual reading. Warning, not error: a genuinely
        # self-referential relationship isn't impossible in principle.
        data = {
            "classes": {"MaintenanceState": {"meaning": "x"}},
            "relationships": [{"name": "hasMaintenanceState", "from": "MaintenanceState", "to": "MaintenanceState", "meaning": "x", "aliases": []}],
            "rules": {}, "actions": {}, "competency_questions": [],
        }
        report = validate_domain(data)
        self.assertNotIn("self_loop_relationship", [i.code for i in report.errors])
        self.assertIn("self_loop_relationship", [i.code for i in report.issues if i.severity == "warning"])
        self.assertTrue(report.ok, "a warning must not fail the structural hard gate")

    def test_distinct_endpoints_are_not_flagged_as_a_self_loop(self):
        data = {
            "classes": {"Fan": {"meaning": "x"}, "Zone": {"meaning": "x"}},
            "relationships": [{"name": "serves", "from": "Fan", "to": "Zone", "meaning": "x", "aliases": []}],
            "rules": {}, "actions": {}, "competency_questions": [],
        }
        report = validate_domain(data)
        self.assertNotIn("self_loop_relationship", [i.code for i in report.issues])

    def test_same_relationship_name_across_different_endpoints_is_not_a_duplicate(self):
        # agent_ontology_spec.md Section 5 chose a list over a name-keyed
        # map specifically so "hasPoint" (etc.) can repeat between many
        # different class pairs -- this must never be flagged.
        good = {
            "classes": {"AHU": {"meaning": "x"}, "Fan": {"meaning": "x"}, "Sensor": {"meaning": "x"}, "Point": {"meaning": "x"}},
            "relationships": [
                {"name": "hasPoint", "from": "AHU", "to": "Sensor", "meaning": "x", "aliases": []},
                {"name": "hasPoint", "from": "Fan", "to": "Point", "meaning": "x", "aliases": []},
            ],
            "rules": {},
            "actions": {},
            "competency_questions": [],
        }
        report = validate_domain(good)
        self.assertNotIn("duplicate_identifier", [i.code for i in report.errors])

    def test_exact_duplicate_relationship_entry_is_flagged(self):
        bad = {
            "classes": {"AHU": {"meaning": "x"}, "Sensor": {"meaning": "x"}},
            "relationships": [
                {"name": "hasPoint", "from": "AHU", "to": "Sensor", "meaning": "x", "aliases": []},
                {"name": "hasPoint", "from": "AHU", "to": "Sensor", "meaning": "x", "aliases": []},
            ],
            "rules": {},
            "actions": {},
            "competency_questions": [],
        }
        report = validate_domain(bad)
        self.assertIn("duplicate_identifier", [i.code for i in report.errors])

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
