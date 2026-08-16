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


if __name__ == "__main__":
    unittest.main()
