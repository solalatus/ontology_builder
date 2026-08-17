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
from validate_domain import validate_domain

SAMPLE_DOMAIN = {
    "classes": {
        "AHU": {"meaning": "An air handling unit.", "properties": {"status": {"type": "text", "allowed": ["on", "off"]}}},
        "AirPlenum": {"meaning": "An air plenum."},
        "Chiller": {"meaning": "A chiller."},
        "CondensingUnit": {"meaning": "A condensing unit."},
        "Compressor": {"meaning": "A compressor."},
        "Zone": {"meaning": "A controlled area."},
    },
    "relationships": [
        {"name": "feeds", "from": "AHU", "to": "AirPlenum", "meaning": "x", "aliases": []},
        {"name": "serves", "from": "AHU", "to": "Zone", "meaning": "y", "aliases": []},
        {"name": "hasPart", "from": "AHU", "to": "Chiller", "meaning": "z", "aliases": []},
    ],
    "rules": {},
    "actions": {},
    "competency_questions": [],
}

SAMPLE_TRANSLATION = {
    "mappings": [
        {"target_path": "classes.AHU.properties.status", "source_iris": [], "source_evidence": "e0", "confidence": "high", "rationale": "r0"},
        {"target_path": "relationships[0]", "source_iris": [], "source_evidence": "e", "confidence": "high", "rationale": "r"},
        {"target_path": "relationships[1]", "source_iris": [], "source_evidence": "e1", "confidence": "high", "rationale": "r1"},
        {"target_path": "relationships[2]", "source_iris": [], "source_evidence": "e2", "confidence": "high", "rationale": "r2"},
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
                "new_content": {"name": "hasPart", "from": "CondensingUnit", "to": "Compressor", "meaning": "x"},
                "source_evidence": "e",
                "source_iris": ["https://brickschema.org/schema/Brick#Condensing_Unit"],
                "confidence": "high",
                "rationale": "r",
            },
            {"target_path": "relationships[dropped-2]", "action": "drop", "rationale": "already covered by an existing feeds relationship"},
        ]
        errors = repair_mod.validate_repairs(repairs, REJECTED, self.classes)
        self.assertEqual(errors, [])

    def test_valid_reground_passes(self):
        repairs = [
            {"target_path": "relationships[dropped-1]", "action": "reground", "source_evidence": "e", "source_iris": [], "confidence": "high", "rationale": "r"},
            {"target_path": "relationships[dropped-2]", "action": "drop", "rationale": "r"},
        ]
        errors = repair_mod.validate_repairs(repairs, REJECTED, self.classes)
        self.assertEqual(errors, [])

    def test_reground_missing_source_iris_flagged(self):
        repairs = [{"target_path": "relationships[dropped-1]", "action": "reground", "source_evidence": "e", "confidence": "high", "rationale": "r"}]
        errors = repair_mod.validate_repairs(repairs, REJECTED, self.classes)
        self.assertTrue(any("source_iris" in e for e in errors))

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
                "new_content": {"name": "hasPart", "from": "GhostClass", "to": "Compressor", "meaning": "x"},
                "source_evidence": "e",
                "source_iris": [],
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
    # --- Retroactive fallback: target_path doesn't resolve (the historical
    # Brick HVAC case -- these 3 relationships were already removed before
    # repair.py's in-place support existed), so these still append. ---

    def test_retroactive_reground_appends_original_shape_with_new_provenance(self):
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        repairs = [
            {"target_path": "relationships[dropped-1]", "action": "reground", "source_evidence": "e2", "source_iris": ["https://brickschema.org/schema/Brick#CondensingUnit"], "confidence": "high", "rationale": "r2"},
        ]
        summary = repair_mod.apply_repairs(domain, translation, repairs, [REJECTED[0]])

        self.assertEqual(len(domain["relationships"]), 4)  # 3 original + 1 appended
        self.assertEqual(domain["relationships"][3], REJECTED[0].current_shape)
        self.assertEqual(translation["mappings"][-1]["target_path"], "relationships[3]")
        self.assertEqual(translation["mappings"][-1]["source_evidence"], "e2")
        self.assertEqual(len(summary["reground"]), 1)
        self.assertEqual(summary["reground"][0]["new_target_path"], "relationships[3]")

    def test_retroactive_replace_appends_new_content_not_the_old_pairing(self):
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        new_content = {"name": "hasPart", "from": "CondensingUnit", "to": "Compressor", "meaning": "The compressor is part of the condensing unit."}
        repairs = [
            {
                "target_path": "relationships[dropped-1]",
                "action": "replace",
                "new_content": new_content,
                "source_evidence": "e",
                "source_iris": [],
                "confidence": "high",
                "rationale": "r",
            }
        ]
        summary = repair_mod.apply_repairs(domain, translation, repairs, [REJECTED[0]])

        self.assertEqual(len(domain["relationships"]), 4)
        appended = domain["relationships"][3]
        self.assertEqual(appended["from"], "CondensingUnit")
        self.assertEqual(appended["to"], "Compressor")
        self.assertEqual(appended["aliases"], [])  # defaulted, since the model wasn't required to include it
        # the wrong original pairing (Chiller/Compressor) must never appear
        self.assertNotIn({"name": "hasPart", "from": "Chiller", "to": "Compressor"}, [
            {k: v for k, v in r.items() if k in ("name", "from", "to")} for r in domain["relationships"]
        ])

    def test_retroactive_drop_appends_nothing(self):
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        repairs = [{"target_path": "relationships[dropped-1]", "action": "drop", "rationale": "no honest grounding"}]
        summary = repair_mod.apply_repairs(domain, translation, repairs, [REJECTED[0]])

        self.assertEqual(len(domain["relationships"]), 3)
        self.assertEqual(len(translation["mappings"]), 4)
        self.assertEqual(summary["drop"][0]["rationale"], "no honest grounding")

    def test_retroactive_multiple_repairs_get_sequential_fresh_indices(self):
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        repairs = [
            {"target_path": "relationships[dropped-1]", "action": "reground", "source_evidence": "e1", "source_iris": [], "confidence": "high", "rationale": "r1"},
            {"target_path": "relationships[dropped-2]", "action": "drop", "rationale": "already covered by an existing feeds relationship"},
        ]
        repair_mod.apply_repairs(domain, translation, repairs, REJECTED)

        self.assertEqual(len(domain["relationships"]), 4)  # 3 original + 1 reground (drop adds nothing)
        self.assertEqual(translation["mappings"][-1]["target_path"], "relationships[3]")

    # --- In-place: target_path resolves against domain_data right now --
    # the normal case for any future domain's ordinary QA cycle, where
    # repair runs *before* anything gets removed. ---

    def test_in_place_reground_only_touches_the_mapping_not_the_content(self):
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        item = repair_mod.RejectedItem(
            target_path="classes.AHU.properties.status",
            current_shape={"type": "text", "allowed": ["on", "off"]},
            rejection_rationale="Evidence is a generic template reused across many classes.",
        )
        repairs = [{"target_path": "classes.AHU.properties.status", "action": "reground", "source_evidence": "e3", "source_iris": [], "confidence": "high", "rationale": "r3"}]
        summary = repair_mod.apply_repairs(domain, translation, repairs, [item])

        self.assertEqual(domain["classes"]["AHU"]["properties"]["status"], {"type": "text", "allowed": ["on", "off"]})
        self.assertEqual(len(translation["mappings"]), 4)  # unchanged count -- updated in place, not appended
        mapping = next(m for m in translation["mappings"] if m["target_path"] == "classes.AHU.properties.status")
        self.assertEqual(mapping["source_evidence"], "e3")
        self.assertEqual(summary["reground"][0]["new_target_path"], "classes.AHU.properties.status")

    def test_reground_overwrites_source_iris_not_just_prose(self):
        # Regression: a real reground call once wrote a stronger, accurate
        # evidence quote naming a specific class and relation by name in
        # the prose, but the mapping's source_iris stayed empty because
        # apply_repairs never wrote it -- the schema never asked for it
        # separately from source_evidence. A mapping that's only
        # human-readable-plausible, not machine-checkable, is exactly the
        # gap this fixes.
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        item = repair_mod.RejectedItem(
            target_path="classes.AHU.properties.status", current_shape={"type": "text", "allowed": ["on", "off"]}, rejection_rationale="r",
        )
        repairs = [{
            "target_path": "classes.AHU.properties.status", "action": "reground",
            "source_evidence": "e4", "source_iris": ["https://brickschema.org/schema/Brick#AHU"], "confidence": "high", "rationale": "r4",
        }]
        repair_mod.apply_repairs(domain, translation, repairs, [item])
        mapping = next(m for m in translation["mappings"] if m["target_path"] == "classes.AHU.properties.status")
        self.assertEqual(mapping["source_iris"], ["https://brickschema.org/schema/Brick#AHU"])

    def test_reground_merges_source_iris_instead_of_replacing(self):
        # Regression: manual spot-check rounds 3 and 4 both found real
        # mappings where a reground fix's source_context only listed the
        # *new* citation to add, never the item's pre-existing correct
        # ones. Because reground documents itself as "content is already
        # fine, just under-evidenced" -- never a reason to drop a
        # previously-valid citation -- apply_repairs must union old and
        # new source_iris, not trust the repair decision to have restated
        # every citation it should keep.
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        mapping = next(m for m in translation["mappings"] if m["target_path"] == "relationships[2]")
        mapping["source_iris"] = ["https://brickschema.org/schema/Brick#hasPart", "https://brickschema.org/schema/Brick#Chiller"]
        item = repair_mod.RejectedItem(
            target_path="relationships[2]",
            current_shape={"name": "hasPart", "from": "AHU", "to": "Chiller", "meaning": "z", "aliases": []},
            rejection_rationale="r",
        )
        repairs = [{
            "target_path": "relationships[2]", "action": "reground",
            "source_evidence": "e5", "source_iris": ["https://brickschema.org/schema/Brick#AHU"], "confidence": "high", "rationale": "r5",
        }]
        repair_mod.apply_repairs(domain, translation, repairs, [item])
        mapping = next(m for m in translation["mappings"] if m["target_path"] == "relationships[2]")
        self.assertEqual(
            mapping["source_iris"],
            [
                "https://brickschema.org/schema/Brick#hasPart",
                "https://brickschema.org/schema/Brick#Chiller",
                "https://brickschema.org/schema/Brick#AHU",
            ],
        )

    def test_in_place_replace_overwrites_content_at_the_same_path(self):
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        item = repair_mod.RejectedItem(
            target_path="classes.AHU.properties.status",
            current_shape={"type": "text", "allowed": ["on", "off"]},
            rejection_rationale="r",
        )
        repairs = [
            {
                "target_path": "classes.AHU.properties.status",
                "action": "replace",
                "new_content": {"type": "text", "allowed": ["on", "off", "fault"]},
                "source_evidence": "e",
                "source_iris": [],
                "confidence": "medium",
                "rationale": "r",
            }
        ]
        repair_mod.apply_repairs(domain, translation, repairs, [item])

        self.assertEqual(domain["classes"]["AHU"]["properties"]["status"]["allowed"], ["on", "off", "fault"])
        self.assertEqual(len(translation["mappings"]), 4)

    def test_in_place_replace_with_rename_moves_the_property_key(self):
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        item = repair_mod.RejectedItem(
            target_path="classes.AHU.properties.status",
            current_shape={"type": "text", "allowed": ["on", "off"]},
            rejection_rationale="r",
        )
        repairs = [
            {
                "target_path": "classes.AHU.properties.status",
                "action": "replace",
                "new_target_path": "classes.AHU.properties.operatingState",
                "new_content": {"type": "text", "allowed": ["on", "off"]},
                "source_evidence": "e",
                "source_iris": [],
                "confidence": "medium",
                "rationale": "renamed to a name the evidence actually supports",
            }
        ]
        summary = repair_mod.apply_repairs(domain, translation, repairs, [item])

        self.assertNotIn("status", domain["classes"]["AHU"]["properties"])
        self.assertIn("operatingState", domain["classes"]["AHU"]["properties"])
        mapping = next(m for m in translation["mappings"] if m["target_path"] == "classes.AHU.properties.operatingState")
        self.assertEqual(mapping["source_evidence"], "e")
        self.assertFalse(any(m["target_path"] == "classes.AHU.properties.status" for m in translation["mappings"]))
        self.assertEqual(summary["replace"][0]["new_target_path"], "classes.AHU.properties.operatingState")

    def test_renaming_a_rule_cascades_to_actions_that_precondition_on_it(self):
        # Regression: repairing rules.canUseEconomizer into
        # rules.economizerReducesMechanicalConditioning on the real Brick
        # HVAC clean rerun left actions.enableEconomizer's precondition
        # still pointing at the old name -- structurally valid right after
        # the rename call, but validate_domain.py's own re-check caught the
        # resulting dangling reference. This must update the precondition.
        domain = {
            "classes": {"AHU": {"meaning": "x"}},
            "relationships": [],
            "rules": {"canUseEconomizer": {"conditions": ["c1"]}},
            "actions": {
                "enableEconomizer": {
                    "input": "AHU", "preconditions": ["canUseEconomizer"],
                    "effect": "e", "verification": "v",
                }
            },
            "competency_questions": [],
        }
        translation = {"mappings": [{"target_path": "rules.canUseEconomizer", "source_iris": [], "source_evidence": "e", "confidence": "high", "rationale": "r"}]}
        item = repair_mod.RejectedItem(target_path="rules.canUseEconomizer", current_shape={"conditions": ["c1"]}, rejection_rationale="r")
        repairs = [
            {
                "target_path": "rules.canUseEconomizer",
                "action": "replace",
                "new_target_path": "rules.economizerReducesMechanicalConditioning",
                "new_content": {"conditions": ["c2"]},
                "source_evidence": "e2",
                "source_iris": [],
                "confidence": "high",
                "rationale": "renamed to match the evidence",
            }
        ]
        summary = repair_mod.apply_repairs(domain, translation, repairs, [item])

        self.assertNotIn("canUseEconomizer", domain["rules"])
        self.assertIn("economizerReducesMechanicalConditioning", domain["rules"])
        self.assertEqual(domain["actions"]["enableEconomizer"]["preconditions"], ["economizerReducesMechanicalConditioning"])
        self.assertEqual(len(summary["cascaded_renames"]), 1)
        self.assertEqual(summary["cascaded_renames"][0]["touched"], ["actions.enableEconomizer"])

        report = validate_domain(domain)
        self.assertTrue(report.ok, report.errors)

    def test_renaming_a_class_cascades_to_relationship_endpoints_and_action_inputs(self):
        domain = {
            "classes": {"AHU": {"meaning": "x"}, "Zone": {"meaning": "y"}},
            "relationships": [{"name": "serves", "from": "AHU", "to": "Zone", "meaning": "z", "aliases": []}],
            "rules": {},
            "actions": {"startAHU": {"input": "AHU", "preconditions": [], "effect": "e", "verification": "v"}},
            "competency_questions": [],
        }
        translation = {"mappings": [{"target_path": "classes.AHU", "source_iris": [], "source_evidence": "e", "confidence": "high", "rationale": "r"}]}
        item = repair_mod.RejectedItem(target_path="classes.AHU", current_shape={"meaning": "x"}, rejection_rationale="r")
        repairs = [
            {
                "target_path": "classes.AHU",
                "action": "replace",
                "new_target_path": "classes.AirHandlingUnit",
                "new_content": {"meaning": "x"},
                "source_evidence": "e2",
                "source_iris": [],
                "confidence": "high",
                "rationale": "renamed to the full source label",
            }
        ]
        summary = repair_mod.apply_repairs(domain, translation, repairs, [item])

        self.assertEqual(domain["relationships"][0]["from"], "AirHandlingUnit")
        self.assertEqual(domain["actions"]["startAHU"]["input"], "AirHandlingUnit")
        touched = {c["kind"]: c["touched"] for c in summary["cascaded_renames"]}
        self.assertIn("relationships[0]", touched["class"])
        self.assertIn("actions.startAHU", touched["class"])

        report = validate_domain(domain)
        self.assertTrue(report.ok, report.errors)

    def test_property_rename_does_not_trigger_a_cascade(self):
        # Properties aren't referenced by name anywhere else structurally --
        # a cascade here would be a no-op at best, wrong at worst if a rule
        # or action field ever happened to share the same string by
        # coincidence.
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        item = repair_mod.RejectedItem(
            target_path="classes.AHU.properties.status", current_shape={"type": "text", "allowed": ["on", "off"]}, rejection_rationale="r"
        )
        repairs = [
            {
                "target_path": "classes.AHU.properties.status",
                "action": "replace",
                "new_target_path": "classes.AHU.properties.operatingState",
                "new_content": {"type": "text", "allowed": ["on", "off"]},
                "source_evidence": "e",
                "source_iris": [],
                "confidence": "medium",
                "rationale": "renamed",
            }
        ]
        summary = repair_mod.apply_repairs(domain, translation, repairs, [item])
        self.assertEqual(summary["cascaded_renames"], [])

    def test_in_place_drop_removes_the_element_and_its_mapping(self):
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        item = repair_mod.RejectedItem(target_path="classes.AHU.properties.status", current_shape={}, rejection_rationale="r")
        repairs = [{"target_path": "classes.AHU.properties.status", "action": "drop", "rationale": "no honest grounding"}]
        repair_mod.apply_repairs(domain, translation, repairs, [item])

        self.assertNotIn("status", domain["classes"]["AHU"]["properties"])
        self.assertFalse(any(m["target_path"] == "classes.AHU.properties.status" for m in translation["mappings"]))

    def test_in_place_drop_of_a_relationship_reindexes_later_ones(self):
        # SAMPLE_DOMAIN's relationships: [0]=feeds AHU->AirPlenum,
        # [1]=serves AHU->Zone, [2]=hasPart AHU->Chiller. Dropping [0] must
        # shift both surviving relationships' mappings down by one, or
        # they'd silently point at the wrong list entries afterward.
        domain = json.loads(json.dumps(SAMPLE_DOMAIN))
        translation = json.loads(json.dumps(SAMPLE_TRANSLATION))
        item = repair_mod.RejectedItem(
            target_path="relationships[0]",
            current_shape={"name": "feeds", "from": "AHU", "to": "AirPlenum", "meaning": "x", "aliases": []},
            rejection_rationale="redundant with a taxonomy-only relationship elsewhere",
        )
        repairs = [{"target_path": "relationships[0]", "action": "drop", "rationale": "r"}]
        repair_mod.apply_repairs(domain, translation, repairs, [item])

        self.assertEqual(len(domain["relationships"]), 2)
        self.assertEqual(domain["relationships"][0]["name"], "serves")
        self.assertEqual(domain["relationships"][1]["name"], "hasPart")
        paths = sorted(m["target_path"] for m in translation["mappings"] if m["target_path"].startswith("relationships["))
        self.assertEqual(paths, ["relationships[0]", "relationships[1]"])
        # the surviving mappings' own evidence must have moved with them, not been overwritten
        by_path = {m["target_path"]: m for m in translation["mappings"]}
        self.assertEqual(by_path["relationships[0]"]["source_evidence"], "e1")  # was relationships[1]
        self.assertEqual(by_path["relationships[1]"]["source_evidence"], "e2")  # was relationships[2]


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
                    "new_content": {"name": "hasPart", "from": "CondensingUnit", "to": "Compressor", "meaning": "x"},
                    "source_evidence": "e",
                    "source_iris": [],
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

            import yaml as _yaml

            repaired_domain = _yaml.safe_load((out_dir / "repaired.domain.yaml").read_text(encoding="utf-8"))
            self.assertEqual(len(repaired_domain["relationships"]), 4)  # 3 original + 1 appended (retroactive fallback)

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
