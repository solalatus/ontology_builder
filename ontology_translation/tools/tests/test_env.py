"""Tests for env.py's .env/environment precedence. Offline, no dependencies
beyond the standard library. Run: python3 -m unittest discover -s
ontology_translation/tools/tests -p "test_*.py" -t ontology_translation/tools
"""

import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import sys as _sys
from pathlib import Path as _Path

_sys.path.insert(0, str(_Path(__file__).resolve().parents[1]))

import env


class LoadEnvKeyTests(unittest.TestCase):
    def test_missing_env_file_returns_default(self):
        with mock.patch.object(env, "ENV_PATH", Path("/nonexistent/.env")):
            self.assertIsNone(env.load_env_key("SOME_KEY_THAT_IS_NOT_SET"))
            self.assertEqual(env.load_env_key("SOME_KEY", default="fallback"), "fallback")

    def test_env_file_is_parsed(self):
        with tempfile.TemporaryDirectory() as tmp:
            env_path = Path(tmp) / ".env"
            env_path.write_text(
                "\n".join(
                    [
                        "# a comment",
                        "",
                        'AZURE_OPENAI_ENDPOINT="https://example.openai.azure.com/"',
                        "AZURE_OPENAI_API_KEY=abc123",
                    ]
                ),
                encoding="utf-8",
            )
            with mock.patch.object(env, "ENV_PATH", env_path):
                self.assertEqual(env.load_env_key("AZURE_OPENAI_ENDPOINT"), "https://example.openai.azure.com/")
                self.assertEqual(env.load_env_key("AZURE_OPENAI_API_KEY"), "abc123")

    def test_process_env_wins_over_dotenv_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            env_path = Path(tmp) / ".env"
            env_path.write_text("AZURE_OPENAI_API_KEY=from-file\n", encoding="utf-8")
            with mock.patch.object(env, "ENV_PATH", env_path):
                with mock.patch.dict(os.environ, {"AZURE_OPENAI_API_KEY": "from-process-env"}):
                    self.assertEqual(env.load_env_key("AZURE_OPENAI_API_KEY"), "from-process-env")

    def test_load_azure_config_never_raises_when_unset(self):
        with mock.patch.object(env, "ENV_PATH", Path("/nonexistent/.env")):
            with mock.patch.dict(os.environ, {}, clear=True):
                config = env.load_azure_config()
        self.assertIsNone(config["endpoint"])
        self.assertIsNone(config["api_key"])
        self.assertEqual(config["api_version"], "2024-12-01-preview")
        self.assertEqual(config["deployment"], "gpt-5.4")


class LlmConfigTests(unittest.TestCase):
    """Issue #183: one provider choice, resolved the same way as
    tests/lib/llmProvider.mjs."""

    def _config(self, values):
        with mock.patch.object(env, "ENV_PATH", Path("/nonexistent/.env")):
            with mock.patch.dict(os.environ, values, clear=True):
                return env.load_llm_config()

    def test_provider_follows_the_credentials_present(self):
        self.assertEqual(self._config({})["provider"], "openai")
        self.assertEqual(self._config({"OPENAI_API_KEY": "sk-x"})["provider"], "openai")
        self.assertEqual(self._config({"AWS_BEARER_TOKEN_BEDROCK": "ABSKx"})["provider"], "bedrock")
        # An Azure endpoint wins over a Bedrock key: that was the only
        # provider these tools knew, and configuring an endpoint is explicit.
        both = {"AZURE_OPENAI_ENDPOINT": "https://r.openai.azure.com", "AWS_BEARER_TOKEN_BEDROCK": "ABSKx"}
        self.assertEqual(self._config(both)["provider"], "azure")
        self.assertEqual(self._config({**both, "LLM_PROVIDER": "bedrock"})["provider"], "bedrock")

    def test_an_unknown_provider_is_refused(self):
        with self.assertRaises(ValueError):
            self._config({"LLM_PROVIDER": "vertex"})

    def test_bedrock_defaults_to_us_east_1_mantle_and_gpt_5_4_in_bedrock_naming(self):
        config = self._config({"AWS_BEARER_TOKEN_BEDROCK": "ABSKx"})
        self.assertEqual(config["endpoint"], "https://bedrock-mantle.us-east-1.api.aws")
        self.assertEqual(config["region"], "us-east-1")
        self.assertEqual(config["api_key"], "ABSKx")
        self.assertEqual(config["deployment"], "openai.gpt-5.4")
        self.assertIsNone(env.missing_llm_config(config))

    def test_bedrock_region_endpoint_and_model_overrides(self):
        config = self._config({
            "AWS_BEARER_TOKEN_BEDROCK": "ABSKx", "AWS_REGION": "us-west-2",
            "BEDROCK_MODEL": "openai.gpt-6.1-sol",
        })
        self.assertEqual(config["endpoint"], "https://bedrock-mantle.us-west-2.api.aws")
        self.assertEqual(config["deployment"], "openai.gpt-6.1-sol")
        pasted = self._config({"AWS_BEARER_TOKEN_BEDROCK": "ABSKx", "BEDROCK_ENDPOINT": "https://bedrock-mantle.us-east-2.api.aws/openai/v1/"})
        self.assertEqual(pasted["endpoint"], "https://bedrock-mantle.us-east-2.api.aws")

    def test_llm_model_overrides_every_provider(self):
        self.assertEqual(self._config({"LLM_MODEL": "m", "AWS_BEARER_TOKEN_BEDROCK": "k"})["deployment"], "m")
        self.assertEqual(self._config({"LLM_MODEL": "m", "AZURE_OPENAI_ENDPOINT": "https://r", "AZURE_OPENAI_DEPLOYMENT": "d"})["deployment"], "m")
        self.assertEqual(self._config({"AZURE_OPENAI_ENDPOINT": "https://r", "AZURE_OPENAI_DEPLOYMENT": "d"})["deployment"], "d")

    def test_azure_config_keeps_its_previous_shape(self):
        config = self._config({"AZURE_OPENAI_ENDPOINT": "https://r.openai.azure.com", "AZURE_OPENAI_API_KEY": "k"})
        self.assertEqual(config["api_version"], "2024-12-01-preview")
        self.assertEqual(config["deployment"], "gpt-5.4")
        self.assertIsNone(env.missing_llm_config(config))

    def test_missing_credentials_name_the_provider_variables(self):
        self.assertIn("OPENAI_API_KEY", env.missing_llm_config(self._config({})))
        self.assertIn("AWS_BEARER_TOKEN_BEDROCK", env.missing_llm_config(self._config({"LLM_PROVIDER": "bedrock"})))

    def test_bedrock_chat_path_matches_the_app(self):
        self.assertEqual(env.bedrock_chat_path("openai.gpt-6.1-sol"), "/openai/v1")
        self.assertEqual(env.bedrock_chat_path("openai.gpt-5.4"), "/openai/v1")
        self.assertEqual(env.bedrock_chat_path("openai.gpt-oss-120b"), "/v1")
        self.assertEqual(env.bedrock_chat_path("qwen.qwen3-32b"), "/v1")

    def test_make_llm_client_per_provider(self):
        import openai

        built = []

        def fake(kind):
            return lambda **kwargs: built.append((kind, kwargs)) or kind

        with mock.patch.object(openai, "OpenAI", fake("openai")), mock.patch.object(openai, "AzureOpenAI", fake("azure")):
            env.make_llm_client({"provider": "bedrock", "endpoint": "https://bedrock-mantle.us-east-1.api.aws", "api_key": "k", "deployment": "openai.gpt-6.1-sol"})
            env.make_llm_client({"provider": "bedrock", "endpoint": "https://bedrock-mantle.us-east-1.api.aws", "api_key": "k", "deployment": "openai.gpt-oss-120b"})
            env.make_llm_client({"provider": "azure", "endpoint": "https://r", "api_key": "k", "api_version": "v", "deployment": "d"})
            env.make_llm_client({"provider": "openai", "endpoint": "https://api.openai.com", "api_key": "k", "deployment": "gpt-5.4"})
        self.assertEqual(built, [
            ("openai", {"api_key": "k", "base_url": "https://bedrock-mantle.us-east-1.api.aws/openai/v1"}),
            ("openai", {"api_key": "k", "base_url": "https://bedrock-mantle.us-east-1.api.aws/v1"}),
            ("azure", {"api_version": "v", "azure_endpoint": "https://r", "api_key": "k"}),
            ("openai", {"api_key": "k"}),
        ])


if __name__ == "__main__":
    unittest.main()
