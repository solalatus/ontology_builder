"""Tests for repair.py. Everything here is mocked/offline -- no real Azure
OpenAI call, no cost, no network, no credentials required, same convention
as test_compile.py."""

import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

import sys as _sys
from pathlib import Path as _Path

_sys.path.insert(0, str(_Path(__file__).resolve().parents[1]))

import repair as repair_mod

SAMPLE_DOMAIN = {
    "classes": {
        "AHU": {"meaning": "An air handling unit."},
        "AirPlenum": {"meaning": "An air plenum."},
        "Chiller": {"meaning": "A chiller."},
        "CondensingUnit": {"meaning": "A condensing unit."},
        "Compressor": {"meaning": "A compressor."},
    },
    "relationships": [
        {"name": "feeds", "from": "AHU", "to": "AirPlenum", "meaning": "x", "aliases": []},
    ],
    "rules": {},
    "actions": {},
    "competency_questions": [],
}

SAMPLE_TRANSLATION = {
    "mappings": [
        {"target_path": "relationships[0]", "source_iris": [], "source_evidence": "e", "confidence": "high", "rationale": "r"},
    ],
    "dispositions": [],
}

REJECTED = [
    repair_mod.RejectedItem(
        target_path="relationships[dropped-1]",
        current_shape={"name": "hasPart", "from": "Chiller", "to": "Compressor", "meaning": "x", "aliases": []},
        rejection_rationale="Evidence actually describes a Condensing Unit, not a Chiller, having a compressor.",
    ),
    repair_mod.RejectedItem(
        target_path="relationships[dropped-2]",
        current_shape={"name": "hasPart", "from": "AHU", "to": "AirPlenum", "meaning": "x", "aliases": []},
        rejection_rationale="Evidence was indirect ('receives air from') rather than a real part-of claim.",
    ),
]


def _fake_client_class(contents: list[str], prompt_tokens=500, completion_tokens=200, cached_tokens=0):
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


class BuildRepairUserPromptTests(unittest.TestCase):
    def test_includes_items_and_source_context_and_classes(self):
        prompt = repair_mod.build_repair_user_prompt(REJECTED, {"Chiller": {"definitions": ["x"]}}, ["AHU", "Chiller"])
        self.assertIn("relationships[dropped-1]", prompt)
        self.assertIn("Evidence actually describes a Condensing Unit", prompt)
        self.assertIn("Chiller", prompt)
        self.assertIn("definitions", prompt)


class ValidateRepairsTests(unittest.TestCase):
    def setUp(self):
        self.classes = {"AHU", "AirPlenum", "Chiller", "Compressor", "CondensingUnit"}

    def test_valid_replace_and_drop_pass(self):
        repairs = [
            {
                "target_path": "relationships[dropped-1]",
                "action": "replace",
                "new_relationship": {"name": "hasPart", "from": "CondensingUnit", "to": "Compressor", "meaning": "x"},
                "source_evidence": "e",
                "confidence": "high",
                "rationale": "r",
            },
            {"target_path": "relationships[dropped-2]", "action": "drop", "rationale": "already covered by an existing feeds relationship"},
        ]
        errors = repair_mod.validate_repairs(repairs, REJECTED, self.classes)
        self.assertEqual(errors, [])

    def test_valid_reground_passes(self):
        repairs = [
            {"target_path": "relationships[dropped-1]", "action": "reground", "source_evidence": "e", "confidence": "high", "rationale": "r"},
            {"target_path": "relationships[dropped-2]", "action": "drop", "rationale": "r"},
        ]
        errors = repair_mod.validate_repairs(repairs, REJECTED, self.classes)
        self.assertEqual(errors, [])

    def test_unknown_target_path_flagged(self):
        repairs = [{"target_path": "relationships[999]", "action": "drop", "rationale": "r"}]
        errors = repair_mod.validate_repairs(repairs, REJECTED, self.classes)
        self.assertTrue(any("unknown target_path" in e for e in errors))

    def test_invalid_action_flagged(self):
        repairs = [{"target_path": "relationships[dropped-1]", "action": "rewrite", "rationale": "r"}]
        errors = repair_mod.validate_repairs(repairs, REJECTED, self.classes)
        self.assertTrue(any("invalid action" in e for e in errors))

    def test_drop_without_rationale_flagged(self):
        repairs = [{"target_path": "relationships[dropped-1]", "action": "drop"}]
        errors = repair_mod.validate_repairs(repairs, REJECTED, self.classes)
        self.assertTrue(any("drop needs a rationale" in e for e in errors))

    def test_reground_missing_provenance_flagged(self):
        repairs = [{"target_path": "relationships[dropped-1]", "action": "reground", "confidence": "high"}]
        errors = repair_mod.validate_repairs(repairs, REJECTED, self.classes)
        self.assertTrue(any("missing 'source_evidence'" in e for e in errors))
        self.assertTrue(any("missing 'rationale'" in e for e in errors))

    def test_replace_with_unknown_endpoint_class_flagged(self):
        repairs = [
            {
                "target_path": "relationships[dropped-1]",
                "action": "replace",
                "new_relationship": {"name": "hasPart", "from": "GhostClass", "to": "Compressor", "meaning": "x"},
                "source_evidence": "e",
                "confidence": "high",
                "rationale": "r",
            }
        ]
        errors = repair_mod.validate_repairs(repairs, [REJECTED[0]], self.classes)
        self.assertTrue(any("not an existing domain class" in e for e in errors))

    def test_missing_decision_for_an_expected_item_flagged(self):
        repairs = [{"target_path": "relationships[dropped-1]", "action": "drop", "rationale": "r"}]
        errors = repair_mod.validate_repairs(repairs, REJECTED, self.classes)
        self.assertTrue(any("no repair decision returned for relationships[dropped-2]" in e for e in errors))


class ApplyRepairsTests(unittest.TestCase):
    def test_reground_appends_original_shape_with_new_provenance(self):
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        repairs = [
            {"target_path": "relationships[dropped-1]", "action": "reground", "source_evidence": "e2", "confidence": "high", "rationale": "r2"},
        ]
        summary = repair_mod.apply_repairs(domain, translation, repairs, [REJECTED[0]])

        self.assertEqual(len(domain["relationships"]), 2)
        self.assertEqual(domain["relationships"][1], REJECTED[0].current_shape)
        self.assertEqual(translation["mappings"][-1]["target_path"], "relationships[1]")
        self.assertEqual(translation["mappings"][-1]["source_evidence"], "e2")
        self.assertEqual(len(summary["reground"]), 1)
        self.assertEqual(summary["reground"][0]["new_target_path"], "relationships[1]")

    def test_replace_appends_new_relationship_not_the_old_one(self):
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        new_rel = {"name": "hasPart", "from": "CondensingUnit", "to": "Compressor", "meaning": "The compressor is part of the condensing unit."}
        repairs = [
            {
                "target_path": "relationships[dropped-1]",
                "action": "replace",
                "new_relationship": new_rel,
                "source_evidence": "e",
                "confidence": "high",
                "rationale": "r",
            }
        ]
        summary = repair_mod.apply_repairs(domain, translation, repairs, [REJECTED[0]])

        self.assertEqual(len(domain["relationships"]), 2)
        appended = domain["relationships"][1]
        self.assertEqual(appended["from"], "CondensingUnit")
        self.assertEqual(appended["to"], "Compressor")
        self.assertEqual(appended["aliases"], [])  # defaulted, since the model wasn't required to include it
        # the wrong original pairing (Chiller/Compressor) must never appear
        self.assertNotIn({"name": "hasPart", "from": "Chiller", "to": "Compressor"}, [
            {k: v for k, v in r.items() if k in ("name", "from", "to")} for r in domain["relationships"]
        ])

    def test_drop_appends_nothing(self):
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        repairs = [{"target_path": "relationships[dropped-1]", "action": "drop", "rationale": "no honest grounding"}]
        summary = repair_mod.apply_repairs(domain, translation, repairs, [REJECTED[0]])

        self.assertEqual(len(domain["relationships"]), 1)
        self.assertEqual(len(translation["mappings"]), 1)
        self.assertEqual(summary["drop"][0]["rationale"], "no honest grounding")

    def test_multiple_repairs_get_sequential_fresh_indices(self):
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        repairs = [
            {"target_path": "relationships[dropped-1]", "action": "reground", "source_evidence": "e1", "confidence": "high", "rationale": "r1"},
            {"target_path": "relationships[dropped-2]", "action": "drop", "rationale": "already covered by an existing feeds relationship"},
        ]
        repair_mod.apply_repairs(domain, translation, repairs, REJECTED)

        self.assertEqual(len(domain["relationships"]), 2)  # 1 original + 1 reground (drop adds nothing)
        self.assertEqual(translation["mappings"][-1]["target_path"], "relationships[1]")


class RunRepairDryRunTests(unittest.TestCase):
    def test_dry_run_makes_no_api_call_and_writes_nothing(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            domain_path = tmp_path / "domain.yaml"
            translation_path = tmp_path / "translation.json"
            rejected_path = tmp_path / "rejected.json"
            source_context_path = tmp_path / "source-context.json"
            import yaml as _yaml

            domain_path.write_text(_yaml.safe_dump(SAMPLE_DOMAIN), encoding="utf-8")
            translation_path.write_text(json.dumps(SAMPLE_TRANSLATION), encoding="utf-8")
            rejected_path.write_text(json.dumps([
                {"target_path": it.target_path, "current_shape": it.current_shape, "rejection_rationale": it.rejection_rationale}
                for it in REJECTED
            ]), encoding="utf-8")
            source_context_path.write_text(json.dumps({}), encoding="utf-8")
            out_dir = tmp_path / "out"

            rc = repair_mod.run_repair(domain_path, translation_path, rejected_path, source_context_path, out_dir, dry_run=True)

        self.assertEqual(rc, 0)
        self.assertFalse(out_dir.exists())


class RunRepairLiveMockedTests(unittest.TestCase):
    def _write_inputs(self, tmp_path: Path):
        import yaml as _yaml

        domain_path = tmp_path / "domain.yaml"
        translation_path = tmp_path / "translation.json"
        rejected_path = tmp_path / "rejected.json"
        source_context_path = tmp_path / "source-context.json"
        domain_path.write_text(_yaml.safe_dump(SAMPLE_DOMAIN), encoding="utf-8")
        translation_path.write_text(json.dumps(SAMPLE_TRANSLATION), encoding="utf-8")
        rejected_path.write_text(json.dumps([
            {"target_path": it.target_path, "current_shape": it.current_shape, "rejection_rationale": it.rejection_rationale}
            for it in REJECTED
        ]), encoding="utf-8")
        source_context_path.write_text(json.dumps({}), encoding="utf-8")
        return domain_path, translation_path, rejected_path, source_context_path

    def test_missing_credentials_fails_cleanly_without_calling_the_api(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            inputs = self._write_inputs(tmp_path)
            out_dir = tmp_path / "out"
            with mock.patch.object(
                repair_mod, "load_azure_config", return_value={"endpoint": None, "api_key": None, "api_version": "x", "deployment": "gpt-5.4"}
            ):
                rc = repair_mod.run_repair(*inputs, out_dir, dry_run=False)
        self.assertEqual(rc, 1)

    def test_full_flow_applies_repairs_and_writes_summary(self):
        response = json.dumps({
            "repairs": [
                {
                    "target_path": "relationships[dropped-1]",
                    "action": "replace",
                    "new_relationship": {"name": "hasPart", "from": "CondensingUnit", "to": "Compressor", "meaning": "x"},
                    "source_evidence": "e",
                    "confidence": "high",
                    "rationale": "r",
                },
                {"target_path": "relationships[dropped-2]", "action": "drop", "rationale": "already covered by an existing feeds relationship"},
            ]
        })
        FakeClient, calls = _fake_client_class([response])
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            inputs = self._write_inputs(tmp_path)
            out_dir = tmp_path / "out"

            with mock.patch.object(
                repair_mod,
                "load_azure_config",
                return_value={
                    "endpoint": "https://fake.openai.azure.com/",
                    "api_key": "fake-key",
                    "api_version": "2024-12-01-preview",
                    "deployment": "gpt-5.4",
                },
            ), mock.patch("openai.AzureOpenAI", FakeClient):
                rc = repair_mod.run_repair(*inputs, out_dir, dry_run=False)

            self.assertEqual(rc, 0)
            self.assertEqual(len(calls), 1)
            summary = json.loads((out_dir / "repair-summary.json").read_text(encoding="utf-8"))
            self.assertEqual(summary["replace_count"], 1)
            self.assertEqual(summary["drop_count"], 1)
            self.assertTrue(summary["structural_validation_ok"])

            repaired_domain = json.loads((out_dir / "repaired.domain.yaml").read_text(encoding="utf-8")) if False else None
            import yaml as _yaml

            repaired_domain = _yaml.safe_load((out_dir / "repaired.domain.yaml").read_text(encoding="utf-8"))
            self.assertEqual(len(repaired_domain["relationships"]), 2)

    def test_invalid_response_is_rejected_and_nothing_is_applied(self):
        response = json.dumps({
            "repairs": [
                {"target_path": "relationships[dropped-1]", "action": "not-a-real-action"},
            ]
        })
        FakeClient, calls = _fake_client_class([response])
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            inputs = self._write_inputs(tmp_path)
            out_dir = tmp_path / "out"

            with mock.patch.object(
                repair_mod,
                "load_azure_config",
                return_value={
                    "endpoint": "https://fake.openai.azure.com/",
                    "api_key": "fake-key",
                    "api_version": "2024-12-01-preview",
                    "deployment": "gpt-5.4",
                },
            ), mock.patch("openai.AzureOpenAI", FakeClient):
                rc = repair_mod.run_repair(*inputs, out_dir, dry_run=False)

            self.assertEqual(rc, 1)
            self.assertFalse((out_dir / "repaired.domain.yaml").exists())


if __name__ == "__main__":
    unittest.main()
