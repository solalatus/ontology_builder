"""Tests for compile.py. Everything here is mocked/offline -- no real Azure
OpenAI call, no cost, no network, no credentials required. This is
deliberate: unlike the repo's "handful of cheap chat-completion calls" live
tests for the main app, an ontology compile call is not cheap or small
enough to run automatically on every test invocation (see README.md in this
directory). The actual live pipeline is exercised explicitly via the CLI,
never via this test file.
"""

import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

import sys as _sys
from pathlib import Path as _Path

_sys.path.insert(0, str(_Path(__file__).resolve().parents[1]))

import compile as compile_mod

SAMPLE_DOMAIN_YAML = """classes:
  Fan:
    meaning: A device that moves air.
    properties:
      status:
        type: text
        allowed:
          - "on"
          - "off"
relationships: []
rules: {}
actions: {}
competency_questions: []
"""

SAMPLE_TRANSLATION = {
    "mappings": [
        {
            "target_path": "classes.Fan",
            "source_iris": ["http://example.org/onto#Fan"],
            "source_evidence": "rdfs:comment \"A device that moves air.\"",
            "confidence": "high",
            "rationale": "Directly renamed from the source class.",
        }
    ],
    "dispositions": [{"source_iri": "http://example.org/onto#Fan", "disposition": "mapped"}],
}

SAMPLE_RESPONSE_CONTENT = json.dumps({"domain_yaml": SAMPLE_DOMAIN_YAML, "translation": SAMPLE_TRANSLATION})


def _fake_client_class(contents: list[str], prompt_tokens=1000, completion_tokens=500, cached_tokens=0):
    """Builds a class standing in for openai.AzureOpenAI: same constructor
    shape (accepts arbitrary kwargs), same .chat.completions.create(...)
    call shape, returning canned responses in order (repeating the last one
    if create() is called more times than there are canned contents)."""
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


class EstimateCostTests(unittest.TestCase):
    def test_basic_arithmetic(self):
        cost = compile_mod.estimate_cost(prompt_tokens=1_000_000, completion_tokens=1_000_000, cached_tokens=0)
        self.assertAlmostEqual(cost, 2.50 + 15.00)

    def test_cached_tokens_get_the_cheaper_rate(self):
        full_price = compile_mod.estimate_cost(prompt_tokens=1_000_000, completion_tokens=0, cached_tokens=0)
        with_cache = compile_mod.estimate_cost(prompt_tokens=1_000_000, completion_tokens=0, cached_tokens=1_000_000)
        self.assertLess(with_cache, full_price)
        self.assertAlmostEqual(with_cache, 0.25)


class ExtractJsonObjectTests(unittest.TestCase):
    def test_plain_json(self):
        parsed = compile_mod._extract_json_object('{"a": 1}')
        self.assertEqual(parsed, {"a": 1})

    def test_fenced_json_is_stripped(self):
        parsed = compile_mod._extract_json_object('```json\n{"a": 1}\n```')
        self.assertEqual(parsed, {"a": 1})


class BuildUserPromptTests(unittest.TestCase):
    def test_includes_domain_id_and_source_ir(self):
        prompt = compile_mod.build_user_prompt({"classes": []}, "iof-maintenance", None, None)
        self.assertIn("iof-maintenance", prompt)
        self.assertIn('"classes"', prompt)

    def test_includes_scope_note_when_given(self):
        prompt = compile_mod.build_user_prompt({"classes": []}, "iof-maintenance", "target ~30 classes", None)
        self.assertIn("target ~30 classes", prompt)


class CallCompilerTests(unittest.TestCase):
    def test_parses_response_and_logs_events(self):
        FakeClient, calls = _fake_client_class([SAMPLE_RESPONSE_CONTENT])
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = compile_mod.RunLogger(Path(tmp) / "run.log.jsonl")
            result = compile_mod.call_compiler(client, "gpt-5.4", "system", "user", logger, "run-1")
            logger.close()
            log_lines = (Path(tmp) / "run.log.jsonl").read_text(encoding="utf-8").strip().splitlines()

        self.assertEqual(result.domain_yaml, SAMPLE_DOMAIN_YAML)
        self.assertEqual(result.translation, SAMPLE_TRANSLATION)
        self.assertEqual(result.prompt_tokens, 1000)
        self.assertEqual(result.completion_tokens, 500)
        self.assertEqual(len(calls), 1)
        events = [json.loads(line)["event"] for line in log_lines]
        self.assertEqual(events, ["api_call_start", "api_call_end"])


class RunCompileDryRunTests(unittest.TestCase):
    def test_dry_run_makes_no_api_call_and_writes_nothing(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest_path = tmp_path / "source-manifest.yaml"
            manifest_path.write_text(
                "id: test-domain\n"
                "source_url: https://example.org/x.rdf\n"
                "scope:\n  roots: []\n"
                "compiler:\n  prompt_version: compiler-v1\n  runs: 3\n",
                encoding="utf-8",
            )
            source_ir_path = tmp_path / "source_ir.json"
            source_ir_path.write_text(json.dumps({"classes": []}), encoding="utf-8")
            out_dir = tmp_path / "out"

            rc = compile_mod.run_compile(source_ir_path, manifest_path, out_dir, runs=None, scope_note=None, dry_run=True)

        self.assertEqual(rc, 0)
        self.assertFalse(out_dir.exists())


class RunCompileLiveTests(unittest.TestCase):
    def _write_inputs(self, tmp_path: Path, runs: int = 2):
        manifest_path = tmp_path / "source-manifest.yaml"
        manifest_path.write_text(
            "id: test-domain\n"
            "source_url: https://example.org/x.rdf\n"
            "scope:\n  roots: []\n"
            f"compiler:\n  prompt_version: compiler-v1\n  runs: {runs}\n",
            encoding="utf-8",
        )
        source_ir_path = tmp_path / "source_ir.json"
        source_ir_path.write_text(json.dumps({"classes": []}), encoding="utf-8")
        return manifest_path, source_ir_path

    def test_missing_credentials_fails_cleanly_without_calling_the_api(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest_path, source_ir_path = self._write_inputs(tmp_path)
            out_dir = tmp_path / "out"
            with mock.patch.object(
                compile_mod,
                "load_azure_config",
                return_value={"endpoint": None, "api_key": None, "api_version": "x", "deployment": "gpt-5.4"},
            ):
                rc = compile_mod.run_compile(source_ir_path, manifest_path, out_dir, runs=None, scope_note=None, dry_run=False)
        self.assertEqual(rc, 1)

    def test_two_runs_write_two_sets_of_files_and_a_run_manifest(self):
        FakeClient, calls = _fake_client_class([SAMPLE_RESPONSE_CONTENT, SAMPLE_RESPONSE_CONTENT])
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest_path, source_ir_path = self._write_inputs(tmp_path, runs=2)
            out_dir = tmp_path / "out"

            with mock.patch.object(
                compile_mod,
                "load_azure_config",
                return_value={
                    "endpoint": "https://fake.openai.azure.com/",
                    "api_key": "fake-key",
                    "api_version": "2024-12-01-preview",
                    "deployment": "gpt-5.4",
                },
            ), mock.patch("openai.AzureOpenAI", FakeClient):
                rc = compile_mod.run_compile(source_ir_path, manifest_path, out_dir, runs=None, scope_note=None, dry_run=False)

            self.assertEqual(rc, 0)
            self.assertEqual(len(calls), 2)
            self.assertTrue((out_dir / "run-1.domain.yaml").exists())
            self.assertTrue((out_dir / "run-2.domain.yaml").exists())
            self.assertTrue((out_dir / "run-1.translation.json").exists())
            self.assertTrue((out_dir / "run-2.translation.json").exists())
            self.assertTrue((out_dir / "run.log.jsonl").exists())

            run_manifest = json.loads((out_dir / "run-manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(len(run_manifest["runs"]), 2)
            self.assertTrue(all(r["structural_validation_ok"] for r in run_manifest["runs"]))
            self.assertGreater(run_manifest["total_estimated_cost_usd"], 0)

    def test_runs_override_beats_manifest_runs(self):
        FakeClient, calls = _fake_client_class([SAMPLE_RESPONSE_CONTENT])
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest_path, source_ir_path = self._write_inputs(tmp_path, runs=3)
            out_dir = tmp_path / "out"

            with mock.patch.object(
                compile_mod,
                "load_azure_config",
                return_value={
                    "endpoint": "https://fake.openai.azure.com/",
                    "api_key": "fake-key",
                    "api_version": "2024-12-01-preview",
                    "deployment": "gpt-5.4",
                },
            ), mock.patch("openai.AzureOpenAI", FakeClient):
                compile_mod.run_compile(source_ir_path, manifest_path, out_dir, runs=1, scope_note=None, dry_run=False)

        self.assertEqual(len(calls), 1)


if __name__ == "__main__":
    unittest.main()
