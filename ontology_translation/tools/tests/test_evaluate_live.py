"""Live smoke test against the real Azure OpenAI resource -- same opt-in
convention as test_compile_live.py / helper-agent-live-azure.spec.mjs:
included in normal discovery, skips with a clear reason unless
AZURE_OPENAI_ENDPOINT/AZURE_OPENAI_API_KEY are set, never runs in CI.

Kept deliberately tiny (judges=1, round_trip_sample=1, cq_count=2, a
single-class translation) to catch real integration issues -- especially
whether the real model actually returns the exact JSON keys each of
evaluate.py's four prompt shapes assumes -- without the cost of a real
domain evaluation (which would be dozens of calls, see the --dry-run
estimate).
"""

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import evaluate as evaluate_mod
from env import load_azure_config

SMOKE_DOMAIN_YAML = "classes:\n  Fan:\n    meaning: A device that moves air to ventilate a space.\n" \
    "relationships: []\nrules: {}\nactions: {}\ncompetency_questions: []\n"

SMOKE_TRANSLATION = {
    "mappings": [
        {
            "target_path": "classes.Fan",
            "source_iris": ["http://example.org/smoke#Fan"],
            "source_evidence": "rdfs:comment \"A device that moves air to ventilate a space.\"",
            "confidence": "high",
            "rationale": "Directly renamed from the source class.",
        }
    ],
    "dispositions": [{"source_iri": "http://example.org/smoke#Fan", "disposition": "mapped"}],
}

SMOKE_SOURCE_IR = {
    "classes": [
        {
            "iri": "http://example.org/smoke#Fan",
            "kind": "class",
            "labels": ["Fan"],
            "definitions": ["A device that moves air to ventilate a space."],
        }
    ],
    "object_properties": [],
    "datatype_properties": [],
    "enumerations": [],
    "restrictions": [],
    "imports": [],
}


def _azure_creds_present() -> bool:
    config = load_azure_config()
    return bool(config["endpoint"]) and bool(config["api_key"])


@unittest.skipUnless(
    _azure_creds_present(),
    "AZURE_OPENAI_ENDPOINT/AZURE_OPENAI_API_KEY not set (env or .env) -- live Azure smoke test skipped",
)
class EvaluateLiveSmokeTest(unittest.TestCase):
    def test_one_real_pass_through_all_llm_layers_on_a_tiny_translation(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest_path = tmp_path / "source-manifest.yaml"
            manifest_path.write_text(
                "id: smoke-eval\n"
                "source_url: https://example.org/smoke.ttl\n"
                "scope:\n  roots: []\n"
                "compiler:\n  prompt_version: compiler-v1\n  runs: 1\n",
                encoding="utf-8",
            )
            domain_yaml_path = tmp_path / "run-1.domain.yaml"
            domain_yaml_path.write_text(SMOKE_DOMAIN_YAML, encoding="utf-8")
            translation_path = tmp_path / "run-1.translation.json"
            translation_path.write_text(json.dumps(SMOKE_TRANSLATION), encoding="utf-8")
            source_ir_path = tmp_path / "source_ir.json"
            source_ir_path.write_text(json.dumps(SMOKE_SOURCE_IR), encoding="utf-8")
            out_dir = tmp_path / "out"

            rc = evaluate_mod.run_evaluation(
                domain_yaml_path,
                translation_path,
                source_ir_path,
                manifest_path,
                out_dir,
                judges=1,
                round_trip_sample_size=1,
                cq_count=2,
                dry_run=False,
            )

            self.assertEqual(rc, 0, "run_evaluation returned nonzero -- see stdout above")

            report = json.loads((out_dir / "smoke-eval.translation-evaluation.json").read_text(encoding="utf-8"))
            self.assertTrue(report["hard_gates_ok"])

            judging = report["semantic_judging"]
            self.assertEqual(len(judging["results"]), 1)
            self.assertIn(judging["results"][0]["majority_verdict"], {"supported", "partially_supported", "unsupported"})

            round_trip = report["round_trip"]
            self.assertEqual(round_trip["sampled"], 1)
            self.assertIsInstance(round_trip["results"][0]["reconstruction"], str)
            self.assertIsInstance(round_trip["results"][0]["score"], (int, float))

            cq_support = report["cq_support"]
            self.assertGreater(len(cq_support["results"]), 0)
            for result in cq_support["results"]:
                self.assertIsInstance(result["supported"], bool)

            total_cost = (
                judging["total_cost_usd"] + round_trip["total_cost_usd"] + cq_support["total_cost_usd"] + cq_support["generation_cost_usd"]
            )
            print(f"[live smoke] evaluate.py real cost: ${total_cost:.4f}")
            print(f"[live smoke] judge verdict: {judging['results'][0]['majority_verdict']}")
            print(f"[live smoke] round-trip score: {round_trip['results'][0]['score']}")
            print(f"[live smoke] generated CQs: {[r['question'] for r in cq_support['results']]}")


if __name__ == "__main__":
    unittest.main()
