"""Tests for reinstate.py. Everything here is mocked/offline -- no real
Azure OpenAI call, no cost, no network, no credentials required, same
convention as test_repair.py."""

import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

import yaml

import sys as _sys
from pathlib import Path as _Path

_sys.path.insert(0, str(_Path(__file__).resolve().parents[1]))

import reinstate as reinstate_mod
from validate_domain import validate_domain

SAMPLE_DOMAIN = {
    "classes": {
        "Chiller": {"meaning": "A refrigerating machine.", "properties": {"status": {"type": "text", "allowed": ["off", "on"]}}},
        "CondensingUnit": {"meaning": "An outdoor HVAC unit that condenses refrigerant."},
    },
    "relationships": [
        {"name": "hasPart", "from": "Chiller", "to": "CondensingUnit", "meaning": "x", "aliases": []},
    ],
    "rules": {},
    "actions": {},
    "competency_questions": [],
}

SAMPLE_TRANSLATION = {
    "mappings": [
        {"target_path": "classes.Chiller", "source_iris": ["http://ex.org#Chiller"], "source_evidence": "e", "confidence": "high", "rationale": "r"},
        {"target_path": "classes.CondensingUnit", "source_iris": ["http://ex.org#CondensingUnit"], "source_evidence": "e", "confidence": "high", "rationale": "r"},
        {"target_path": "relationships[0]", "source_iris": [], "source_evidence": "e", "confidence": "high", "rationale": "r"},
    ],
    "dispositions": [
        {"source_iri": "http://ex.org#Chiller", "disposition": "mapped", "note": "mapped to classes.Chiller"},
        {"source_iri": "http://ex.org#CondensingUnit", "disposition": "mapped", "note": "mapped to classes.CondensingUnit"},
        {"source_iri": "http://ex.org#Compressor", "disposition": "out_of_scope", "note": "not needed for selected subset"},
        {"source_iri": "http://ex.org#Wing", "disposition": "out_of_scope", "note": "spatial subdivision not needed"},
    ],
}

FLAGGED = [
    reinstate_mod.FlaggedDisposition(
        source_iri="http://ex.org#Compressor",
        disposition="out_of_scope",
        note="not needed for selected subset",
        source_definition={"labels": ["Compressor"], "definitions": ["Compresses refrigerant gas."]},
        included_siblings=[{"iri": "http://ex.org#Chiller", "mapped_to": "classes.Chiller"}],
        judge_rationale="Compressor is well-defined and comparable to kept siblings; the note is generic.",
    ),
    reinstate_mod.FlaggedDisposition(
        source_iri="http://ex.org#Wing",
        disposition="out_of_scope",
        note="spatial subdivision not needed",
        source_definition={"labels": ["Wing"], "definitions": ["A subordinate part of a building."]},
        included_siblings=[],
        judge_rationale="The note is generic but plausible; on reflection this may be a legitimate exclusion.",
    ),
]


def _fake_client_class(contents, prompt_tokens=500, completion_tokens=200, cached_tokens=0):
    calls = []

    class FakeResponse:
        def __init__(self, content):
            message = SimpleNamespace(content=content)
            self.choices = [SimpleNamespace(message=message)]
            self.usage = SimpleNamespace(
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                prompt_tokens_details=SimpleNamespace(cached_tokens=cached_tokens),
            )

    class FakeCompletions:
        def create(self, **kwargs):
            calls.append(kwargs)
            if callable(contents):
                return FakeResponse(contents(len(calls) - 1, kwargs))
            idx = min(len(calls) - 1, len(contents) - 1)
            return FakeResponse(contents[idx])

    class FakeChat:
        def __init__(self):
            self.completions = FakeCompletions()

    class FakeAzureOpenAI:
        def __init__(self, **kwargs):
            self.kwargs = kwargs
            self.chat = FakeChat()

    return FakeAzureOpenAI, calls


class BuildReinstateUserPromptTests(unittest.TestCase):
    def test_includes_flagged_items_and_domain_classes(self):
        prompt = reinstate_mod.build_reinstate_user_prompt(FLAGGED, ["Chiller", "CondensingUnit"])
        self.assertIn("http://ex.org#Compressor", prompt)
        self.assertIn("Compresses refrigerant gas", prompt)
        self.assertIn("included_siblings", prompt)
        self.assertIn("Chiller", prompt)


    def test_includes_existing_relationships_when_given(self):
        # Regression: a first real run against Brick HVAC with only class
        # names in the prompt (no relationship examples) added 10
        # well-grounded classes with zero relationships each, even for
        # equipment whose real physical connections were exactly what this
        # domain's existing hasPart/feeds relationships already model for
        # comparable equipment.
        relationships = [{"name": "hasPart", "from": "Chiller", "to": "CondensingUnit", "meaning": "x", "aliases": []}]
        prompt = reinstate_mod.build_reinstate_user_prompt(FLAGGED, ["Chiller", "CondensingUnit"], relationships)
        self.assertIn("Existing relationships", prompt)
        self.assertIn("hasPart", prompt)

    def test_omits_relationship_section_when_none_given(self):
        prompt = reinstate_mod.build_reinstate_user_prompt(FLAGGED, ["Chiller", "CondensingUnit"])
        self.assertNotIn("Existing relationships", prompt)


EVIDENCE = {"source_evidence": "e", "confidence": "high", "rationale": "r"}


class ValidateReinstatementsTests(unittest.TestCase):
    def test_valid_reinstate_and_reground_pass(self):
        reinstatements = [
            {
                "source_iri": "http://ex.org#Compressor",
                "action": "reinstate",
                "class_name": "Compressor",
                "class_content": {"meaning": "Compresses refrigerant gas.", "aliases": [], "properties": {"status": {"type": "text", "allowed": ["off", "on"]}}},
                "class_evidence": dict(EVIDENCE),
                "property_evidence": {"status": dict(EVIDENCE)},
                "new_relationships": [{"name": "hasPart", "from": "CondensingUnit", "to": "Compressor", "meaning": "x", **EVIDENCE}],
            },
            {"source_iri": "http://ex.org#Wing", "action": "reground", "new_note": "A specific reason.", "rationale": "r"},
        ]
        errors = reinstate_mod.validate_reinstatements(reinstatements, FLAGGED, {"Chiller", "CondensingUnit"})
        self.assertEqual(errors, [])

    def test_reinstate_missing_meaning_flagged(self):
        reinstatements = [
            {"source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Compressor", "class_content": {}, "class_evidence": dict(EVIDENCE)},
            {"source_iri": "http://ex.org#Wing", "action": "reground", "new_note": "n", "rationale": "r"},
        ]
        errors = reinstate_mod.validate_reinstatements(reinstatements, FLAGGED, {"Chiller"})
        self.assertTrue(any("meaning" in e for e in errors))

    def test_reinstate_missing_class_evidence_flagged(self):
        reinstatements = [
            {"source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Compressor", "class_content": {"meaning": "m"}},
            {"source_iri": "http://ex.org#Wing", "action": "reground", "new_note": "n", "rationale": "r"},
        ]
        errors = reinstate_mod.validate_reinstatements(reinstatements, FLAGGED, {"Chiller"})
        self.assertTrue(any("class_evidence" in e for e in errors))

    def test_reinstate_class_name_collision_flagged(self):
        reinstatements = [
            {"source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Chiller", "class_content": {"meaning": "m"}, "class_evidence": dict(EVIDENCE)},
            {"source_iri": "http://ex.org#Wing", "action": "reground", "new_note": "n", "rationale": "r"},
        ]
        errors = reinstate_mod.validate_reinstatements(reinstatements, FLAGGED, {"Chiller"})
        self.assertTrue(any("already exists" in e for e in errors))

    def test_property_missing_its_own_evidence_is_flagged(self):
        # A class's own definition doesn't itself justify a specific
        # property -- found for real when a shared evidence block let
        # every reinstated property through unjustified. property_evidence
        # must have its own entry per property key.
        reinstatements = [
            {
                "source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Compressor",
                "class_content": {"meaning": "m", "properties": {"status": {"type": "text", "allowed": ["off", "on"]}}},
                "class_evidence": dict(EVIDENCE),
                "property_evidence": {},
            },
            {"source_iri": "http://ex.org#Wing", "action": "reground", "new_note": "n", "rationale": "r"},
        ]
        errors = reinstate_mod.validate_reinstatements(reinstatements, FLAGGED, {"Chiller"})
        self.assertTrue(any("property_evidence" in e and "status" in e for e in errors))

    def test_property_evidence_incomplete_block_is_flagged(self):
        reinstatements = [
            {
                "source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Compressor",
                "class_content": {"meaning": "m", "properties": {"status": {"type": "text", "allowed": ["off", "on"]}}},
                "class_evidence": dict(EVIDENCE),
                "property_evidence": {"status": {"source_evidence": "e"}},  # missing confidence/rationale
            },
            {"source_iri": "http://ex.org#Wing", "action": "reground", "new_note": "n", "rationale": "r"},
        ]
        errors = reinstate_mod.validate_reinstatements(reinstatements, FLAGGED, {"Chiller"})
        self.assertTrue(any("confidence" in e for e in errors))

    def test_no_properties_needs_no_property_evidence(self):
        reinstatements = [
            {
                "source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Compressor",
                "class_content": {"meaning": "m", "properties": {}},
                "class_evidence": dict(EVIDENCE),
            },
            {"source_iri": "http://ex.org#Wing", "action": "reground", "new_note": "n", "rationale": "r"},
        ]
        errors = reinstate_mod.validate_reinstatements(reinstatements, FLAGGED, {"Chiller"})
        self.assertEqual(errors, [])

    def test_relationship_missing_its_own_evidence_is_flagged(self):
        reinstatements = [
            {
                "source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Compressor",
                "class_content": {"meaning": "m"}, "class_evidence": dict(EVIDENCE),
                "new_relationships": [{"name": "hasPart", "from": "CondensingUnit", "to": "Compressor", "meaning": "x"}],
            },
            {"source_iri": "http://ex.org#Wing", "action": "reground", "new_note": "n", "rationale": "r"},
        ]
        errors = reinstate_mod.validate_reinstatements(reinstatements, FLAGGED, {"CondensingUnit"})
        self.assertTrue(any("new_relationships[0]" in e for e in errors))

    def test_relationship_endpoint_must_be_existing_or_batch_class(self):
        reinstatements = [
            {
                "source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Compressor",
                "class_content": {"meaning": "m"}, "class_evidence": dict(EVIDENCE),
                "new_relationships": [{"name": "hasPart", "from": "TotallyUnknown", "to": "Compressor", "meaning": "x", **EVIDENCE}],
            },
            {"source_iri": "http://ex.org#Wing", "action": "reground", "new_note": "n", "rationale": "r"},
        ]
        errors = reinstate_mod.validate_reinstatements(reinstatements, FLAGGED, {"Chiller"})
        self.assertTrue(any("TotallyUnknown" in e for e in errors))

    def test_relationship_endpoint_may_reference_a_sibling_reinstated_in_the_same_batch(self):
        # Two items reinstated together in one call can reference each other.
        flagged = FLAGGED + [
            reinstate_mod.FlaggedDisposition(
                source_iri="http://ex.org#CoolingTower", disposition="out_of_scope", note="n",
                source_definition={"labels": ["Cooling Tower"], "definitions": []}, included_siblings=[], judge_rationale="r",
            )
        ]
        reinstatements = [
            {
                "source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Compressor",
                "class_content": {"meaning": "m"}, "class_evidence": dict(EVIDENCE),
                "new_relationships": [{"name": "feeds", "from": "CoolingTower", "to": "Compressor", "meaning": "x", **EVIDENCE}],
            },
            {
                "source_iri": "http://ex.org#CoolingTower", "action": "reinstate", "class_name": "CoolingTower",
                "class_content": {"meaning": "m"}, "class_evidence": dict(EVIDENCE),
            },
            {"source_iri": "http://ex.org#Wing", "action": "reground", "new_note": "n", "rationale": "r"},
        ]
        errors = reinstate_mod.validate_reinstatements(reinstatements, flagged, {"Chiller"})
        self.assertEqual(errors, [])

    def test_missing_decision_for_a_flagged_item_is_caught(self):
        reinstatements = [{"source_iri": "http://ex.org#Compressor", "action": "reground", "new_note": "n", "rationale": "r"}]
        errors = reinstate_mod.validate_reinstatements(reinstatements, FLAGGED, {"Chiller"})
        self.assertTrue(any("Wing" in e for e in errors))

    def test_invalid_action_flagged(self):
        reinstatements = [
            {"source_iri": "http://ex.org#Compressor", "action": "delete", "rationale": "r"},
            {"source_iri": "http://ex.org#Wing", "action": "reground", "new_note": "n", "rationale": "r"},
        ]
        errors = reinstate_mod.validate_reinstatements(reinstatements, FLAGGED, {"Chiller"})
        self.assertTrue(any("invalid action" in e for e in errors))


class ApplyReinstatementsTests(unittest.TestCase):
    def test_reinstate_adds_class_relationship_mappings_and_flips_disposition(self):
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        reinstatements = [
            {
                "source_iri": "http://ex.org#Compressor",
                "action": "reinstate",
                "class_name": "Compressor",
                "class_content": {
                    "meaning": "Compresses refrigerant gas.", "aliases": [],
                    "properties": {"status": {"type": "text", "allowed": ["off", "on", "alarm"]}},
                },
                "class_evidence": {"source_evidence": "class-e", "confidence": "high", "rationale": "class-r"},
                "property_evidence": {"status": {"source_evidence": "prop-e", "confidence": "medium", "rationale": "prop-r"}},
                "new_relationships": [
                    {"name": "hasPart", "from": "CondensingUnit", "to": "Compressor", "meaning": "x",
                     "source_evidence": "rel-e", "confidence": "high", "rationale": "rel-r"}
                ],
            }
        ]
        summary = reinstate_mod.apply_reinstatements(domain, translation, reinstatements)

        self.assertIn("Compressor", domain["classes"])
        self.assertEqual(len(domain["relationships"]), 2)
        self.assertEqual(domain["relationships"][1]["from"], "CondensingUnit")
        self.assertEqual(domain["relationships"][1]["to"], "Compressor")
        self.assertEqual(domain["relationships"][1]["aliases"], [])
        self.assertNotIn("source_evidence", domain["relationships"][1])  # provenance stays out of domain.yaml content

        mapping_by_path = {m["target_path"]: m for m in translation["mappings"]}
        self.assertEqual(mapping_by_path["classes.Compressor"]["source_evidence"], "class-e")
        self.assertEqual(mapping_by_path["classes.Compressor.properties.status"]["source_evidence"], "prop-e")
        self.assertEqual(mapping_by_path["relationships[1]"]["source_evidence"], "rel-e")

        disposition = next(d for d in translation["dispositions"] if d["source_iri"] == "http://ex.org#Compressor")
        self.assertEqual(disposition["disposition"], "mapped")
        self.assertIn("Compressor", disposition["note"])

        self.assertEqual(len(summary["reinstated"]), 1)
        self.assertEqual(summary["reinstated"][0]["new_relationships"], ["relationships[1]"])

        report = validate_domain(domain)
        self.assertTrue(report.ok, report.errors)

    def test_new_relationship_cites_the_other_endpoints_own_iri_too(self):
        # Regression: apply_reinstatements() used to cite only the newly
        # reinstated class's own source_iri on a new relationship mapping,
        # never the pre-existing endpoint's -- exactly the defect class
        # evaluate.py's endpoint_citation_gate (added the same session this
        # was found) exists to catch. CondensingUnit's own citation
        # (established in SAMPLE_TRANSLATION) must appear on the new
        # relationships[1] mapping alongside Compressor's.
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        reinstatements = [
            {
                "source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Compressor",
                "class_content": {"meaning": "m", "aliases": [], "properties": {}},
                "class_evidence": dict(EVIDENCE),
                "new_relationships": [
                    {"name": "hasPart", "from": "CondensingUnit", "to": "Compressor", "meaning": "x", **EVIDENCE}
                ],
            }
        ]
        reinstate_mod.apply_reinstatements(domain, translation, reinstatements)
        mapping_by_path = {m["target_path"]: m for m in translation["mappings"]}
        rel_iris = mapping_by_path["relationships[1]"]["source_iris"]
        self.assertIn("http://ex.org#Compressor", rel_iris)
        self.assertIn("http://ex.org#CondensingUnit", rel_iris)

    def test_new_relationship_between_two_classes_reinstated_in_the_same_batch(self):
        # The "other" endpoint can itself be a class reinstated earlier in
        # the same batch, not just a pre-existing one -- its mapping must
        # already be indexed by the time the later relationship is applied.
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        reinstatements = [
            {
                "source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Compressor",
                "class_content": {"meaning": "m", "aliases": [], "properties": {}},
                "class_evidence": dict(EVIDENCE),
            },
            {
                "source_iri": "http://ex.org#ReversingValve", "action": "reinstate", "class_name": "ReversingValve",
                "class_content": {"meaning": "m", "aliases": [], "properties": {}},
                "class_evidence": dict(EVIDENCE),
                "new_relationships": [
                    {"name": "hasPart", "from": "Compressor", "to": "ReversingValve", "meaning": "x", **EVIDENCE}
                ],
            },
        ]
        reinstate_mod.apply_reinstatements(domain, translation, reinstatements)
        mapping_by_path = {m["target_path"]: m for m in translation["mappings"]}
        self.assertEqual(len(domain["relationships"]), 2)  # original relationships[0] + this one
        rel_iris = mapping_by_path["relationships[1]"]["source_iris"]
        self.assertIn("http://ex.org#Compressor", rel_iris)
        self.assertIn("http://ex.org#ReversingValve", rel_iris)

    def test_reinstate_with_no_properties_adds_only_the_class_mapping(self):
        # Regression: a real reinstate run on Brick HVAC dropped provenance
        # coverage to 93.6% because reinstated classes' properties never
        # got their own mapping, only the class itself did -- every
        # property is its own generated element for the provenance hard
        # gate (evaluate.py's _iter_generated_elements).
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        reinstatements = [
            {
                "source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Compressor",
                "class_content": {"meaning": "m", "aliases": [], "properties": {}},
                "class_evidence": dict(EVIDENCE),
            }
        ]
        reinstate_mod.apply_reinstatements(domain, translation, reinstatements)
        target_paths = {m["target_path"] for m in translation["mappings"]}
        self.assertIn("classes.Compressor", target_paths)
        self.assertFalse(any(p.startswith("classes.Compressor.properties.") for p in target_paths))

    def test_reinstate_with_multiple_properties_maps_each_one_with_its_own_evidence(self):
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        reinstatements = [
            {
                "source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Compressor",
                "class_content": {
                    "meaning": "m", "aliases": [],
                    "properties": {
                        "status": {"type": "text", "allowed": ["off", "on"]},
                        "capacity": {"type": "number", "unit": "kW"},
                    },
                },
                "class_evidence": dict(EVIDENCE),
                "property_evidence": {
                    "status": {"source_evidence": "status-e", "confidence": "high", "rationale": "status-r"},
                    "capacity": {"source_evidence": "capacity-e", "confidence": "low", "rationale": "capacity-r"},
                },
            }
        ]
        reinstate_mod.apply_reinstatements(domain, translation, reinstatements)
        mapping_by_path = {m["target_path"]: m for m in translation["mappings"]}
        self.assertEqual(mapping_by_path["classes.Compressor.properties.status"]["source_evidence"], "status-e")
        self.assertEqual(mapping_by_path["classes.Compressor.properties.capacity"]["source_evidence"], "capacity-e")

    def test_reground_updates_the_note_and_leaves_disposition_category_unchanged(self):
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        reinstatements = [{"source_iri": "http://ex.org#Wing", "action": "reground", "new_note": "A specific, non-generic reason.", "rationale": "r"}]
        summary = reinstate_mod.apply_reinstatements(domain, translation, reinstatements)

        disposition = next(d for d in translation["dispositions"] if d["source_iri"] == "http://ex.org#Wing")
        self.assertEqual(disposition["disposition"], "out_of_scope")
        self.assertEqual(disposition["note"], "A specific, non-generic reason.")
        self.assertNotIn("Wing", domain["classes"])
        self.assertEqual(len(summary["reground"]), 1)

    def test_reinstate_without_new_relationships_still_adds_the_class(self):
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        reinstatements = [
            {
                "source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Compressor",
                "class_content": {"meaning": "m", "aliases": [], "properties": {}},
                "class_evidence": dict(EVIDENCE),
            }
        ]
        summary = reinstate_mod.apply_reinstatements(domain, translation, reinstatements)
        self.assertIn("Compressor", domain["classes"])
        self.assertEqual(len(domain["relationships"]), 1)  # unchanged
        self.assertEqual(summary["reinstated"][0]["new_relationships"], [])


class RunReinstateDryRunTests(unittest.TestCase):
    def test_dry_run_makes_no_api_call_and_writes_nothing(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            domain_yaml_path = tmp_path / "domain.yaml"
            translation_path = tmp_path / "translation.json"
            flagged_path = tmp_path / "flagged.json"
            domain_yaml_path.write_text(yaml.safe_dump(SAMPLE_DOMAIN), encoding="utf-8")
            translation_path.write_text(json.dumps(SAMPLE_TRANSLATION), encoding="utf-8")
            flagged_path.write_text(json.dumps([
                {"source_iri": it.source_iri, "disposition": it.disposition, "note": it.note,
                 "source_definition": it.source_definition, "included_siblings": it.included_siblings,
                 "judge_rationale": it.judge_rationale}
                for it in FLAGGED
            ]), encoding="utf-8")
            out_dir = tmp_path / "out"

            rc = reinstate_mod.run_reinstate(domain_yaml_path, translation_path, flagged_path, out_dir, dry_run=True)

        self.assertEqual(rc, 0)
        self.assertFalse(out_dir.exists())


class RunReinstateLiveMockedTests(unittest.TestCase):
    def _write_inputs(self, tmp_path: Path):
        domain_yaml_path = tmp_path / "domain.yaml"
        translation_path = tmp_path / "translation.json"
        flagged_path = tmp_path / "flagged.json"
        domain_yaml_path.write_text(yaml.safe_dump(SAMPLE_DOMAIN), encoding="utf-8")
        translation_path.write_text(json.dumps(SAMPLE_TRANSLATION), encoding="utf-8")
        flagged_path.write_text(json.dumps([
            {"source_iri": it.source_iri, "disposition": it.disposition, "note": it.note,
             "source_definition": it.source_definition, "included_siblings": it.included_siblings,
             "judge_rationale": it.judge_rationale}
            for it in FLAGGED
        ]), encoding="utf-8")
        return domain_yaml_path, translation_path, flagged_path

    def test_missing_credentials_fails_cleanly_without_calling_the_api(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            domain_yaml_path, translation_path, flagged_path = self._write_inputs(tmp_path)
            out_dir = tmp_path / "out"
            with mock.patch.object(
                reinstate_mod, "load_azure_config",
                return_value={"endpoint": None, "api_key": None, "api_version": "x", "deployment": "gpt-5.4"},
            ):
                rc = reinstate_mod.run_reinstate(domain_yaml_path, translation_path, flagged_path, out_dir, dry_run=False)
        self.assertEqual(rc, 1)

    def test_full_flow_applies_reinstatements_and_writes_summary(self):
        response = json.dumps({
            "reinstatements": [
                {
                    "source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Compressor",
                    "class_content": {"meaning": "Compresses refrigerant gas.", "aliases": [], "properties": {}},
                    "class_evidence": {"source_evidence": "e", "confidence": "high", "rationale": "r"},
                    "new_relationships": [
                        {"name": "hasPart", "from": "CondensingUnit", "to": "Compressor", "meaning": "x",
                         "source_evidence": "e", "confidence": "high", "rationale": "r"}
                    ],
                },
                {"source_iri": "http://ex.org#Wing", "action": "reground", "new_note": "A specific reason.", "rationale": "r"},
            ]
        })
        FakeClient, calls = _fake_client_class([response])

        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            domain_yaml_path, translation_path, flagged_path = self._write_inputs(tmp_path)
            out_dir = tmp_path / "out"

            with mock.patch.object(
                reinstate_mod, "load_azure_config",
                return_value={"endpoint": "https://fake/", "api_key": "fake", "api_version": "v1", "deployment": "gpt-5.4"},
            ), mock.patch("openai.AzureOpenAI", FakeClient):
                rc = reinstate_mod.run_reinstate(domain_yaml_path, translation_path, flagged_path, out_dir, dry_run=False)

            self.assertEqual(rc, 0)
            self.assertEqual(len(calls), 1)
            summary = json.loads((out_dir / "reinstate-summary.json").read_text(encoding="utf-8"))
            self.assertEqual(summary["reinstated_count"], 1)
            self.assertEqual(summary["reground_count"], 1)
            self.assertTrue(summary["structural_validation_ok"])

            new_domain = yaml.safe_load((out_dir / "reinstated.domain.yaml").read_text(encoding="utf-8"))
            self.assertIn("Compressor", new_domain["classes"])

    def test_invalid_response_is_rejected_and_nothing_is_applied(self):
        response = json.dumps({
            "reinstatements": [
                {"source_iri": "http://ex.org#Compressor", "action": "not-a-real-action", "rationale": "r"},
            ]
        })
        FakeClient, calls = _fake_client_class([response])

        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            domain_yaml_path, translation_path, flagged_path = self._write_inputs(tmp_path)
            out_dir = tmp_path / "out"

            with mock.patch.object(
                reinstate_mod, "load_azure_config",
                return_value={"endpoint": "https://fake/", "api_key": "fake", "api_version": "v1", "deployment": "gpt-5.4"},
            ), mock.patch("openai.AzureOpenAI", FakeClient):
                rc = reinstate_mod.run_reinstate(domain_yaml_path, translation_path, flagged_path, out_dir, dry_run=False)

            self.assertEqual(rc, 1)
            self.assertFalse((out_dir / "reinstated.domain.yaml").exists())


if __name__ == "__main__":
    unittest.main()
