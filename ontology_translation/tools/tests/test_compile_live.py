"""Live smoke test against the configured model provider (Azure OpenAI,
OpenAI or AWS Bedrock; env.load_llm_config) -- mirrors
tests/README.md's helper-agent-live-azure.spec.mjs convention exactly:
included in normal test discovery, but skips every test with a clear reason
unless the configured provider's credentials are set (env or .env; see
env.load_llm_config). Never runs in CI, only when both are deliberately provided. Costs a
small amount of real money per run -- one compiler pass over a tiny
three-class synthetic ontology, not a real domain.

This exists to catch exactly the class of bug test_compile.py's mocked
client cannot: a mismatch between what compile.py assumes the real
chat.completions.create(..., response_format={"type": "json_object"})
response shape is on this SDK/deployment, and what it actually returns.
"""

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import yaml

import compile as compile_mod
from env import load_llm_config, missing_llm_config
from validate_domain import validate_domain

SMOKE_TTL = """
@prefix : <http://example.org/smoke#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

:Fan a owl:Class ; rdfs:label "Fan" ; rdfs:comment "A device that moves air to ventilate a space." .
:Zone a owl:Class ; rdfs:label "Zone" ; rdfs:comment "A controlled area of a building served by equipment." .
:serves a owl:ObjectProperty ; rdfs:label "serves" ; rdfs:domain :Fan ; rdfs:range :Zone ;
    rdfs:comment "Indicates which zone a fan supplies air to." .
"""


def _creds_present() -> bool:
    # Whichever provider env.load_llm_config resolves (issue #183).
    return missing_llm_config(load_llm_config()) is None


@unittest.skipUnless(
    _creds_present(),
    "no model provider credentials (OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT/AZURE_OPENAI_API_KEY or AWS_BEARER_TOKEN_BEDROCK; env or .env) -- live smoke test skipped",
)
class CompileLiveSmokeTest(unittest.TestCase):
    def test_one_real_compiler_pass_on_a_tiny_ontology(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest_path = tmp_path / "source-manifest.yaml"
            manifest_path.write_text(
                "id: smoke-test\n"
                "source_url: https://example.org/smoke.ttl\n"
                "scope:\n  roots: []\n"
                "compiler:\n  prompt_version: compiler-v1\n  runs: 1\n",
                encoding="utf-8",
            )

            import rdflib

            from extract import extract_all

            graph = rdflib.Graph()
            graph.parse(data=SMOKE_TTL, format="turtle")
            source_ir = extract_all(graph, "smoke-test")
            source_ir_path = tmp_path / "source_ir.json"
            source_ir_path.write_text(json.dumps(source_ir), encoding="utf-8")

            out_dir = tmp_path / "out"
            rc = compile_mod.run_compile(
                source_ir_path, manifest_path, out_dir, runs=1, scope_note=None, dry_run=False
            )

            self.assertEqual(rc, 0, "run_compile returned nonzero -- see stdout above for the ERROR line")

            domain_yaml_path = out_dir / "run-1.domain.yaml"
            translation_path = out_dir / "run-1.translation.json"
            self.assertTrue(domain_yaml_path.exists())
            self.assertTrue(translation_path.exists())

            domain_data = yaml.safe_load(domain_yaml_path.read_text(encoding="utf-8"))
            self.assertIsInstance(domain_data, dict)
            self.assertIn("classes", domain_data)
            self.assertGreater(len(domain_data["classes"]), 0, "compiler produced zero classes from a 2-class source")

            translation = json.loads(translation_path.read_text(encoding="utf-8"))
            self.assertIn("mappings", translation)
            self.assertIn("dispositions", translation)
            self.assertGreater(len(translation["dispositions"]), 0, "no source candidate received a disposition")

            report = validate_domain(domain_data)
            print(f"[live smoke] structural validation: ok={report.ok}, issues={[i.code for i in report.issues]}")

            run_manifest = json.loads((out_dir / "run-manifest.json").read_text(encoding="utf-8"))
            print(f"[live smoke] real cost: ${run_manifest['total_estimated_cost_usd']}")


if __name__ == "__main__":
    unittest.main()
