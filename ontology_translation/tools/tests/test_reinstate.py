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


class ValidateReinstatementsTests(unittest.TestCase):
    def test_valid_reinstate_and_reground_pass(self):
        reinstatements = [
            {
                "source_iri": "http://ex.org#Compressor",
                "action": "reinstate",
                "class_name": "Compressor",
                "class_content": {"meaning": "Compresses refrigerant gas.", "aliases": [], "properties": {}},
                "new_relationships": [{"name": "hasPart", "from": "CondensingUnit", "to": "Compressor", "meaning": "x"}],
                "source_evidence": "e",
                "confidence": "high",
                "rationale": "r",
            },
            {"source_iri": "http://ex.org#Wing", "action": "reground", "new_note": "A specific reason.", "rationale": "r"},
        ]
        errors = reinstate_mod.validate_reinstatements(reinstatements, FLAGGED, {"Chiller", "CondensingUnit"})
        self.assertEqual(errors, [])

    def test_reinstate_missing_meaning_flagged(self):
        reinstatements = [
            {"source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Compressor", "class_content": {}, "source_evidence": "e", "confidence": "high", "rationale": "r"},
            {"source_iri": "http://ex.org#Wing", "action": "reground", "new_note": "n", "rationale": "r"},
        ]
        errors = reinstate_mod.validate_reinstatements(reinstatements, FLAGGED, {"Chiller"})
        self.assertTrue(any("meaning" in e for e in errors))

    def test_reinstate_class_name_collision_flagged(self):
        reinstatements = [
            {"source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Chiller", "class_content": {"meaning": "m"}, "source_evidence": "e", "confidence": "high", "rationale": "r"},
            {"source_iri": "http://ex.org#Wing", "action": "reground", "new_note": "n", "rationale": "r"},
        ]
        errors = reinstate_mod.validate_reinstatements(reinstatements, FLAGGED, {"Chiller"})
        self.assertTrue(any("already exists" in e for e in errors))

    def test_relationship_endpoint_must_be_existing_or_batch_class(self):
        reinstatements = [
            {
                "source_iri": "http://ex.org#Compressor", "action": "reinstate", "class_name": "Compressor",
                "class_content": {"meaning": "m"},
                "new_relationships": [{"name": "hasPart", "from": "TotallyUnknown", "to": "Compressor", "meaning": "x"}],
                "source_evidence": "e", "confidence": "high", "rationale": "r",
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
                "class_content": {"meaning": "m"},
                "new_relationships": [{"name": "feeds", "from": "CoolingTower", "to": "Compressor", "meaning": "x"}],
                "source_evidence": "e", "confidence": "high", "rationale": "r",
            },
            {
                "source_iri": "http://ex.org#CoolingTower", "action": "reinstate", "class_name": "CoolingTower",
                "class_content": {"meaning": "m"}, "source_evidence": "e", "confidence": "high", "rationale": "r",
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
                "class_content": {"meaning": "Compresses refrigerant gas.", "aliases": [], "properties": {}},
                "new_relationships": [{"name": "hasPart", "from": "CondensingUnit", "to": "Compressor", "meaning": "x"}],
                "source_evidence": "e",
                "confidence": "high",
                "rationale": "r",
            }
        ]
        summary = reinstate_mod.apply_reinstatements(domain, translation, reinstatements)

        self.assertIn("Compressor", domain["classes"])
        self.assertEqual(len(domain["relationships"]), 2)
        self.assertEqual(domain["relationships"][1]["from"], "CondensingUnit")
        self.assertEqual(domain["relationships"][1]["to"], "Compressor")
        self.assertEqual(domain["relationships"][1]["aliases"], [])

        target_paths = {m["target_path"] for m in translation["mappings"]}
        self.assertIn("classes.Compressor", target_paths)
        self.assertIn("relationships[1]", target_paths)

        disposition = next(d for d in translation["dispositions"] if d["source_iri"] == "http://ex.org#Compressor")
        self.assertEqual(disposition["disposition"], "mapped")
        self.assertIn("Compressor", disposition["note"])

        self.assertEqual(len(summary["reinstated"]), 1)
        self.assertEqual(summary["reinstated"][0]["new_relationships"], ["relationships[1]"])

        report = validate_domain(domain)
        self.assertTrue(report.ok, report.errors)

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
                "source_evidence": "e", "confidence": "high", "rationale": "r",
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
                    "new_relationships": [{"name": "hasPart", "from": "CondensingUnit", "to": "Compressor", "meaning": "x"}],
                    "source_evidence": "e", "confidence": "high", "rationale": "r",
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
