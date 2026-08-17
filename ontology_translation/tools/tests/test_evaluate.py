"""Tests for evaluate.py. Deterministic layers (1/2/4/5) are tested with
plain dicts, no mocking needed. LLM-dependent layers (3/6/7) use the same
fake-Azure-client pattern as test_compile.py -- offline, no network, no
cost. See test_evaluate_live.py for the one opt-in exception."""

import json
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import evaluate as evaluate_mod

DOMAIN_DATA = {
    "classes": {
        "Fan": {
            "meaning": "A device that moves air.",
            "properties": {"status": {"type": "text", "allowed": ["on", "off"]}},
        },
        "Zone": {"meaning": "A controlled area of a building."},
    },
    "relationships": [{"name": "serves", "from": "Fan", "to": "Zone", "meaning": "The fan supplies air to the zone.", "aliases": []}],
    "rules": {"canRunFan": {"conditions": ["zone occupancy is above threshold"]}},
    "actions": {
        "startFan": {"input": "Fan", "preconditions": ["canRunFan"], "effect": "fan status becomes on", "verification": "confirm status"}
    },
    "competency_questions": [{"id": "cq1", "text": "Which fan serves which zone?"}],
}

TRANSLATION_FULL = {
    "mappings": [
        {"target_path": "classes.Fan", "source_iris": ["http://ex.org#Fan"], "source_evidence": "A device that moves air.", "confidence": "high", "rationale": "renamed"},
        {"target_path": "classes.Fan.properties.status", "source_iris": ["http://ex.org#status"], "source_evidence": "status prop", "confidence": "high", "rationale": "renamed"},
        {"target_path": "classes.Zone", "source_iris": ["http://ex.org#Zone"], "source_evidence": "A controlled area.", "confidence": "high", "rationale": "renamed"},
        {"target_path": "relationships[0]", "source_iris": ["http://ex.org#serves", "http://ex.org#Fan", "http://ex.org#Zone"], "source_evidence": "serves relation", "confidence": "medium", "rationale": "renamed"},
        {"target_path": "rules.canRunFan", "source_iris": [], "source_evidence": "inferred from operational text", "confidence": "low", "rationale": "no direct source"},
        {"target_path": "actions.startFan", "source_iris": ["http://ex.org#Fan"], "source_evidence": "inferred", "confidence": "low", "rationale": "no direct source"},
    ],
    "dispositions": [
        {"source_iri": "http://ex.org#Fan", "disposition": "mapped"},
        {"source_iri": "http://ex.org#status", "disposition": "mapped"},
        {"source_iri": "http://ex.org#Zone", "disposition": "mapped"},
        {"source_iri": "http://ex.org#serves", "disposition": "mapped"},
        {"source_iri": "http://ex.org#Irrelevant", "disposition": "not_agent_relevant", "note": "identifier bookkeeping only"},
    ],
}

SOURCE_IR = {
    "classes": [
        {"iri": "http://ex.org#Fan", "kind": "class", "labels": ["Fan"], "definitions": ["A device that moves air."]},
        {"iri": "http://ex.org#Zone", "kind": "class", "labels": ["Zone"], "definitions": ["A controlled area."]},
        {"iri": "http://ex.org#Irrelevant", "kind": "class", "labels": ["Irrelevant"], "definitions": []},
    ],
    "object_properties": [{"iri": "http://ex.org#serves", "kind": "object_property", "labels": ["serves"]}],
    "datatype_properties": [{"iri": "http://ex.org#status", "kind": "datatype_property", "labels": ["status"]}],
    "enumerations": [],
    "restrictions": [],
    "imports": [],
}


class StructuralGateTests(unittest.TestCase):
    def test_ok_domain(self):
        result = evaluate_mod.structural_gate(DOMAIN_DATA)
        self.assertTrue(result["ok"])
        self.assertEqual(result["error_count"], 0)

    def test_bad_domain(self):
        result = evaluate_mod.structural_gate({"classes": {"Fan": {}}})
        self.assertFalse(result["ok"])


class IterGeneratedElementsTests(unittest.TestCase):
    def test_all_kinds_present(self):
        elements = evaluate_mod._iter_generated_elements(DOMAIN_DATA)
        paths = {e["target_path"] for e in elements}
        self.assertEqual(
            paths,
            {
                "classes.Fan",
                "classes.Fan.properties.status",
                "classes.Zone",
                "relationships[0]",
                "rules.canRunFan",
                "actions.startFan",
            },
        )

    def test_competency_questions_excluded(self):
        elements = evaluate_mod._iter_generated_elements(DOMAIN_DATA)
        self.assertFalse(any("competency" in e["target_path"] for e in elements))


class ProvenanceGateTests(unittest.TestCase):
    def test_fully_covered_is_ok(self):
        result = evaluate_mod.provenance_gate(DOMAIN_DATA, TRANSLATION_FULL, SOURCE_IR)
        self.assertTrue(result["ok"])
        self.assertEqual(result["element_provenance_coverage"], 1.0)

    def test_missing_element_mapping_fails(self):
        translation = json.loads(json.dumps(TRANSLATION_FULL))
        translation["mappings"] = [m for m in translation["mappings"] if m["target_path"] != "classes.Zone"]
        result = evaluate_mod.provenance_gate(DOMAIN_DATA, translation, SOURCE_IR)
        self.assertFalse(result["ok"])
        self.assertIn("classes.Zone", result["missing_evidence"])

    def test_missing_disposition_fails(self):
        translation = json.loads(json.dumps(TRANSLATION_FULL))
        translation["dispositions"] = [d for d in translation["dispositions"] if d["source_iri"] != "http://ex.org#Irrelevant"]
        result = evaluate_mod.provenance_gate(DOMAIN_DATA, translation, SOURCE_IR)
        self.assertFalse(result["ok"])
        self.assertIn("http://ex.org#Irrelevant", result["missing_dispositions"])

    def test_unknown_disposition_does_not_block_ok(self):
        translation = json.loads(json.dumps(TRANSLATION_FULL))
        translation["dispositions"].append({"source_iri": "http://ex.org#NeverExisted", "disposition": "mapped"})
        result = evaluate_mod.provenance_gate(DOMAIN_DATA, translation, SOURCE_IR)
        self.assertTrue(result["ok"])
        self.assertIn("http://ex.org#NeverExisted", result["unknown_dispositions"])


class EndpointCitationGateTests(unittest.TestCase):
    def test_fully_covered_is_ok(self):
        result = evaluate_mod.endpoint_citation_gate(DOMAIN_DATA, TRANSLATION_FULL)
        self.assertTrue(result["ok"])
        self.assertEqual(result["gaps"], [])

    def test_relationship_missing_to_endpoint_citation_flagged(self):
        translation = json.loads(json.dumps(TRANSLATION_FULL))
        rel = next(m for m in translation["mappings"] if m["target_path"] == "relationships[0]")
        rel["source_iris"] = ["http://ex.org#serves", "http://ex.org#Fan"]  # Zone's own IRI dropped
        result = evaluate_mod.endpoint_citation_gate(DOMAIN_DATA, translation)
        self.assertFalse(result["ok"])
        gap = result["gaps"][0]
        self.assertEqual(gap["target_path"], "relationships[0]")
        self.assertEqual(gap["endpoint"], "to")
        self.assertEqual(gap["class"], "Zone")

    def test_relationship_missing_from_endpoint_citation_flagged(self):
        translation = json.loads(json.dumps(TRANSLATION_FULL))
        rel = next(m for m in translation["mappings"] if m["target_path"] == "relationships[0]")
        rel["source_iris"] = ["http://ex.org#serves", "http://ex.org#Zone"]  # Fan's own IRI dropped
        result = evaluate_mod.endpoint_citation_gate(DOMAIN_DATA, translation)
        self.assertFalse(result["ok"])
        gap = result["gaps"][0]
        self.assertEqual(gap["endpoint"], "from")
        self.assertEqual(gap["class"], "Fan")

    def test_action_missing_input_citation_flagged(self):
        translation = json.loads(json.dumps(TRANSLATION_FULL))
        action = next(m for m in translation["mappings"] if m["target_path"] == "actions.startFan")
        action["source_iris"] = []
        result = evaluate_mod.endpoint_citation_gate(DOMAIN_DATA, translation)
        self.assertFalse(result["ok"])
        gap = result["gaps"][0]
        self.assertEqual(gap["target_path"], "actions.startFan")
        self.assertEqual(gap["endpoint"], "input")
        self.assertEqual(gap["class"], "Fan")

    def test_endpoint_class_with_no_known_citations_of_its_own_is_not_flagged(self):
        # If the endpoint class's OWN classes.<Name> mapping has no
        # source_iris either (nothing to cross-check against), this gate
        # has nothing to compare and must not manufacture a false gap --
        # that's provenance_gate's job (every element needs *a* mapping),
        # not this one's (a mapping's own citations must cover its
        # structural endpoints, when those endpoints have known citations).
        domain = json.loads(json.dumps(DOMAIN_DATA))
        translation = json.loads(json.dumps(TRANSLATION_FULL))
        zone_mapping = next(m for m in translation["mappings"] if m["target_path"] == "classes.Zone")
        zone_mapping["source_iris"] = []
        result = evaluate_mod.endpoint_citation_gate(domain, translation)
        self.assertTrue(result["ok"])

    def test_relationship_with_no_own_mapping_is_skipped_not_crashed(self):
        translation = json.loads(json.dumps(TRANSLATION_FULL))
        translation["mappings"] = [m for m in translation["mappings"] if m["target_path"] != "relationships[0]"]
        result = evaluate_mod.endpoint_citation_gate(DOMAIN_DATA, translation)
        self.assertTrue(result["ok"])


class ReverseCoverageTests(unittest.TestCase):
    def test_fully_justified(self):
        result = evaluate_mod.reverse_coverage(SOURCE_IR, TRANSLATION_FULL)
        self.assertEqual(result["coverage"], 1.0)
        self.assertEqual(result["silently_dropped"], [])

    def test_disposition_without_note_is_silently_dropped(self):
        translation = json.loads(json.dumps(TRANSLATION_FULL))
        for d in translation["dispositions"]:
            if d["source_iri"] == "http://ex.org#Irrelevant":
                d["disposition"] = "out_of_scope"
                d.pop("note", None)
        result = evaluate_mod.reverse_coverage(SOURCE_IR, translation)
        self.assertIn("http://ex.org#Irrelevant", result["silently_dropped"])

    def test_missing_disposition_entirely_is_silently_dropped(self):
        translation = json.loads(json.dumps(TRANSLATION_FULL))
        translation["dispositions"] = [d for d in translation["dispositions"] if d["source_iri"] != "http://ex.org#Zone"]
        result = evaluate_mod.reverse_coverage(SOURCE_IR, translation)
        self.assertIn("http://ex.org#Zone", result["silently_dropped"])


class TranslationStabilityTests(unittest.TestCase):
    def test_fewer_than_two_runs(self):
        result = evaluate_mod.translation_stability([DOMAIN_DATA])
        self.assertIsNone(result["average_f1"])

    def test_identical_runs_score_perfect_f1(self):
        result = evaluate_mod.translation_stability([DOMAIN_DATA, DOMAIN_DATA])
        for f1 in result["average_f1"].values():
            self.assertAlmostEqual(f1, 1.0)

    def test_divergent_class_names_lower_f1(self):
        other = json.loads(json.dumps(DOMAIN_DATA))
        other["classes"]["Blower"] = other["classes"].pop("Fan")
        result = evaluate_mod.translation_stability([DOMAIN_DATA, other])
        self.assertLess(result["average_f1"]["classes"], 1.0)


class DescribeTargetElementTests(unittest.TestCase):
    def test_class_path(self):
        element = evaluate_mod._describe_target_element(DOMAIN_DATA, "classes.Fan")
        self.assertEqual(element["meaning"], "A device that moves air.")

    def test_relationship_path_via_index(self):
        element = evaluate_mod._describe_target_element(DOMAIN_DATA, "relationships[0]")
        self.assertEqual(element["to"], "Zone")

    def test_missing_path_returns_none(self):
        self.assertIsNone(evaluate_mod._describe_target_element(DOMAIN_DATA, "classes.GhostClass"))

    def test_out_of_range_relationship_index_returns_none(self):
        self.assertIsNone(evaluate_mod._describe_target_element(DOMAIN_DATA, "relationships[7]"))


class LeafLabelTests(unittest.TestCase):
    def test_property_gets_owning_class_context(self):
        # A property's raw dict value (e.g. {"type": "number"}) carries no
        # name of its own -- round_trip_sample needs this label so the
        # reconstruction prompt has something to work with beyond a bare type.
        self.assertEqual(evaluate_mod._leaf_label("classes.Building.properties.yearBuilt"), "Building.yearBuilt")

    def test_class_path(self):
        self.assertEqual(evaluate_mod._leaf_label("classes.Fan"), "Fan")

    def test_rule_path(self):
        self.assertEqual(evaluate_mod._leaf_label("rules.canRunFan"), "canRunFan")


def _fake_client_class(responder):
    """responder(call_index, kwargs) -> content string. Mirrors
    test_compile.py's fake-client pattern but with a callback so different
    tests can vary the response per call (needed for judge-majority tests)."""
    calls = []

    class FakeResponse:
        def __init__(self, content):
            self.choices = [SimpleNamespace(message=SimpleNamespace(content=content))]
            self.usage = SimpleNamespace(
                prompt_tokens=100, completion_tokens=20, prompt_tokens_details=SimpleNamespace(cached_tokens=0)
            )

    class FakeCompletions:
        def create(self, **kwargs):
            calls.append(kwargs)
            return FakeResponse(responder(len(calls) - 1, kwargs))

    class FakeChat:
        def __init__(self):
            self.completions = FakeCompletions()

    class FakeAzureOpenAI:
        def __init__(self, **kwargs):
            self.chat = FakeChat()

    return FakeAzureOpenAI, calls


class ChatJsonCallTests(unittest.TestCase):
    def test_parses_response_and_logs(self):
        FakeClient, calls = _fake_client_class(lambda i, kw: json.dumps({"a": 1}))
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = evaluate_mod.RunLogger(Path(tmp) / "log.jsonl")
            parsed, usage = evaluate_mod.chat_json_call(client, "gpt-5.4", "sys", "user", logger, "label-1")
            logger.close()
        self.assertEqual(parsed, {"a": 1})
        self.assertEqual(usage["prompt_tokens"], 100)
        self.assertEqual(len(calls), 1)


class ClassNamesInvolvedTests(unittest.TestCase):
    def test_class_path_resolves_the_class_itself(self):
        self.assertEqual(evaluate_mod._class_names_involved(DOMAIN_DATA, "classes.Fan"), ["Fan"])

    def test_property_path_resolves_the_owning_class(self):
        self.assertEqual(evaluate_mod._class_names_involved(DOMAIN_DATA, "classes.Fan.properties.status"), ["Fan"])

    def test_relationship_path_resolves_both_endpoints(self):
        self.assertEqual(evaluate_mod._class_names_involved(DOMAIN_DATA, "relationships[0]"), ["Fan", "Zone"])

    def test_action_path_resolves_its_input_class(self):
        self.assertEqual(evaluate_mod._class_names_involved(DOMAIN_DATA, "actions.startFan"), ["Fan"])

    def test_rule_path_resolves_nothing(self):
        # Rule conditions are free text with no structural class reference --
        # returning [] (not guessing by parsing prose) is deliberate.
        self.assertEqual(evaluate_mod._class_names_involved(DOMAIN_DATA, "rules.canRunFan"), [])

    def test_unresolvable_index_returns_nothing(self):
        self.assertEqual(evaluate_mod._class_names_involved(DOMAIN_DATA, "relationships[99]"), [])


class NormalizeClassNameTests(unittest.TestCase):
    def test_pascal_case_compiled_name_matches_spaced_source_label(self):
        # The actual bug: compiled class names are PascalCase
        # (CondensingUnit), source labels are space-separated (Condensing
        # Unit). _normalize_name alone ("condensingunit" vs "condensing
        # unit") never matches these -- ground-truth resolution silently
        # failed for every multi-word class until this existed.
        self.assertEqual(evaluate_mod._normalize_class_name("CondensingUnit"), evaluate_mod._normalize_class_name("Condensing Unit"))

    def test_three_word_pascal_case_name(self):
        self.assertEqual(
            evaluate_mod._normalize_class_name("WaterTemperatureSetpoint"), evaluate_mod._normalize_class_name("Water Temperature Setpoint")
        )

    def test_leading_acronym_with_digit_is_split_correctly(self):
        # "CO2DifferentialSensor" -> "CO2 Differential Sensor": the digit-to-
        # uppercase boundary (2|D) must split too, not just lower-to-upper.
        self.assertEqual(
            evaluate_mod._normalize_class_name("CO2DifferentialSensor"), evaluate_mod._normalize_class_name("CO2 Differential Sensor")
        )

    def test_single_word_or_acronym_name_is_unaffected(self):
        self.assertEqual(evaluate_mod._normalize_class_name("Chiller"), "chiller")
        self.assertEqual(evaluate_mod._normalize_class_name("AHU"), "ahu")

    def test_already_spaced_label_is_unaffected(self):
        self.assertEqual(evaluate_mod._normalize_class_name("Condensing Unit"), "condensing unit")


class IndexSourceClassesByLabelTests(unittest.TestCase):
    def test_indexes_by_normalized_label(self):
        index = evaluate_mod._index_source_classes_by_label(SOURCE_IR)
        self.assertIn("fan", index)
        self.assertEqual(index["fan"][0]["iri"], "http://ex.org#Fan")

    def test_indexes_by_alt_label_too(self):
        source_ir = {"classes": [{"iri": "http://ex.org#AHU", "labels": ["AHU"], "altLabels": ["Air Handling Unit"], "definitions": []}]}
        index = evaluate_mod._index_source_classes_by_label(source_ir)
        self.assertIn("air handling unit", index)

    def test_multiple_source_classes_sharing_a_label_are_both_kept(self):
        source_ir = {
            "classes": [
                {"iri": "http://ex.org#A", "labels": ["Widget"], "definitions": ["def A"]},
                {"iri": "http://ex.org#B", "labels": ["Widget"], "definitions": ["def B"]},
            ]
        }
        index = evaluate_mod._index_source_classes_by_label(source_ir)
        self.assertEqual(len(index["widget"]), 2)


class IndexSourceRecordsByIriTests(unittest.TestCase):
    def test_indexes_classes_and_both_property_kinds_by_iri(self):
        index = evaluate_mod._index_source_records_by_iri(SOURCE_IR)
        self.assertEqual(index["http://ex.org#Fan"]["labels"], ["Fan"])
        self.assertEqual(index["http://ex.org#serves"]["kind"], "object_property")
        self.assertEqual(index["http://ex.org#status"]["kind"], "datatype_property")

    def test_unknown_iri_is_absent(self):
        index = evaluate_mod._index_source_records_by_iri(SOURCE_IR)
        self.assertNotIn("http://ex.org#DoesNotExist", index)


class GroundTruthForTargetTests(unittest.TestCase):
    def setUp(self):
        self.source_index = evaluate_mod._index_source_classes_by_label(SOURCE_IR)

    def test_resolves_ground_truth_for_a_class(self):
        ground_truth = evaluate_mod._ground_truth_for_target(DOMAIN_DATA, self.source_index, "classes.Fan")
        self.assertIn("Fan", ground_truth)
        self.assertEqual(ground_truth["Fan"][0]["definitions"], ["A device that moves air."])

    def test_resolves_ground_truth_for_both_relationship_endpoints(self):
        ground_truth = evaluate_mod._ground_truth_for_target(DOMAIN_DATA, self.source_index, "relationships[0]")
        self.assertIn("Fan", ground_truth)
        self.assertIn("Zone", ground_truth)

    def test_returns_none_when_nothing_resolves(self):
        # "canRunFan" isn't a class name and rules have no structural class
        # reference at all -- must be None, not an empty dict, so a judge
        # correctly falls back to evidence-only judging rather than being
        # shown a misleading "we checked, found nothing" block for a target
        # type that was never checkable in the first place.
        self.assertIsNone(evaluate_mod._ground_truth_for_target(DOMAIN_DATA, self.source_index, "rules.canRunFan"))

    def test_returns_none_when_class_name_has_no_source_match(self):
        # This is the exact real-world case that motivated this feature: a
        # class the compiler named doesn't match any real source label at
        # all -- e.g. it was merged/renamed beyond recognition, or (as with
        # the Brick HVAC repair) the compiler simply invented an association
        # with no source backing whatsoever.
        domain_data = {"classes": {"TotallyInvented": {"meaning": "x"}}, "relationships": []}
        self.assertIsNone(evaluate_mod._ground_truth_for_target(domain_data, self.source_index, "classes.TotallyInvented"))

    def test_multi_word_pascal_case_endpoints_both_resolve(self):
        # Regression for the real bug: relationships[57] in the live Brick
        # HVAC re-judge (CondensingUnit hasPart Compressor) silently lost
        # CondensingUnit's ground truth -- the judge saw only Compressor's
        # definition (which says nothing about composition) and rejected a
        # genuinely well-grounded claim, because "condensingunit" (no
        # camelCase splitting) never matched source label "Condensing Unit".
        domain_data = {
            "classes": {"CondensingUnit": {"meaning": "x"}, "Compressor": {"meaning": "y"}},
            "relationships": [{"name": "hasPart", "from": "CondensingUnit", "to": "Compressor", "meaning": "z", "aliases": []}],
        }
        source_ir = {
            "classes": [
                {"iri": "http://ex.org#CU", "labels": ["Condensing Unit"], "definitions": ["Comprises a condenser coil, compressor, fan."]},
                {"iri": "http://ex.org#C", "labels": ["Compressor"], "definitions": ["A device for compressing gas."]},
            ]
        }
        source_index = evaluate_mod._index_source_classes_by_label(source_ir)
        ground_truth = evaluate_mod._ground_truth_for_target(domain_data, source_index, "relationships[0]")
        self.assertIn("CondensingUnit", ground_truth)
        self.assertIn("Compressor", ground_truth)
        self.assertIn("compressor", ground_truth["CondensingUnit"][0]["definitions"][0].lower())

    def test_iri_fallback_resolves_a_rule_that_has_no_structural_class_reference(self):
        # The real gap: rules.canRunFan structurally resolves to zero class
        # names (_class_names_involved returns [] for rules -- conditions
        # are free text), so it always got None ground truth even when its
        # own translation.json mapping cited a real source_iri. Found for
        # real via a repair pass that nearly dropped rules.canUseEconomizer
        # for "no source definition provided" when one genuinely existed and
        # was simply never looked up.
        iri_index = evaluate_mod._index_source_records_by_iri(SOURCE_IR)
        ground_truth = evaluate_mod._ground_truth_for_target(
            DOMAIN_DATA, self.source_index, "rules.canRunFan",
            source_iris=["http://ex.org#Fan"], iri_index=iri_index,
        )
        self.assertIsNotNone(ground_truth)
        self.assertIn("cited:Fan", ground_truth)
        self.assertEqual(ground_truth["cited:Fan"][0]["definitions"], ["A device that moves air."])

    def test_iri_fallback_is_additive_not_a_replacement(self):
        # A target that already resolves structurally (a class) should keep
        # that entry and gain the IRI-cited one alongside it, not have one
        # clobber the other.
        iri_index = evaluate_mod._index_source_records_by_iri(SOURCE_IR)
        ground_truth = evaluate_mod._ground_truth_for_target(
            DOMAIN_DATA, self.source_index, "classes.Fan",
            source_iris=["http://ex.org#Zone"], iri_index=iri_index,
        )
        self.assertIn("Fan", ground_truth)
        self.assertIn("cited:Zone", ground_truth)

    def test_unresolvable_iri_is_silently_skipped(self):
        iri_index = evaluate_mod._index_source_records_by_iri(SOURCE_IR)
        ground_truth = evaluate_mod._ground_truth_for_target(
            DOMAIN_DATA, self.source_index, "rules.canRunFan",
            source_iris=["http://ex.org#DoesNotExist"], iri_index=iri_index,
        )
        self.assertIsNone(ground_truth)

    def test_no_source_iris_or_iri_index_behaves_as_before(self):
        ground_truth = evaluate_mod._ground_truth_for_target(DOMAIN_DATA, self.source_index, "rules.canRunFan")
        self.assertIsNone(ground_truth)


class JudgeMappingsTests(unittest.TestCase):
    def test_majority_verdict_computed_per_mapping(self):
        # 3 judges per mapping x 6 mappings = 18 calls. Alternate verdicts
        # deterministically by call index so every mapping's 3 judges are
        # [supported, supported, unsupported] -> majority "supported".
        verdicts_cycle = ["supported", "supported", "unsupported"]

        def responder(i, kw):
            return json.dumps({"verdict": verdicts_cycle[i % 3], "rationale": "r"})

        FakeClient, calls = _fake_client_class(responder)
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = evaluate_mod.RunLogger(Path(tmp) / "log.jsonl")
            result = evaluate_mod.judge_mappings(client, "gpt-5.4", TRANSLATION_FULL, logger, judges=3)
            logger.close()

        self.assertEqual(len(calls), len(TRANSLATION_FULL["mappings"]) * 3)
        self.assertTrue(all(r["majority_verdict"] == "supported" for r in result["results"]))
        self.assertEqual(result["unsupported_count"], 0)

    def test_all_unsupported_is_flagged(self):
        FakeClient, calls = _fake_client_class(lambda i, kw: json.dumps({"verdict": "unsupported", "rationale": "no evidence"}))
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = evaluate_mod.RunLogger(Path(tmp) / "log.jsonl")
            result = evaluate_mod.judge_mappings(client, "gpt-5.4", TRANSLATION_FULL, logger, judges=3)
            logger.close()

        self.assertEqual(result["unsupported_count"], len(TRANSLATION_FULL["mappings"]))

    def test_three_way_split_is_not_a_majority(self):
        # Each mapping's 3 judges give three different verdicts -- a real
        # 3-way tie, not a majority for any of them. Counter.most_common(1)
        # alone would silently pick whichever verdict was voted first
        # (here, "unsupported", since it cycles first) and wrongly flag it
        # as majority-unsupported; _majority_verdict must return None instead.
        verdicts_cycle = ["unsupported", "supported", "partially_supported"]

        def responder(i, kw):
            return json.dumps({"verdict": verdicts_cycle[i % 3], "rationale": "r"})

        FakeClient, calls = _fake_client_class(responder)
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = evaluate_mod.RunLogger(Path(tmp) / "log.jsonl")
            result = evaluate_mod.judge_mappings(client, "gpt-5.4", TRANSLATION_FULL, logger, judges=3)
            logger.close()

        self.assertTrue(all(r["majority_verdict"] is None for r in result["results"]))
        self.assertEqual(result["unsupported_count"], 0)

    def test_without_domain_data_and_source_ir_no_ground_truth_is_sent(self):
        # Backward compatibility: existing callers that only have
        # `translation` (and every test above) must keep working unchanged.
        FakeClient, calls = _fake_client_class(lambda i, kw: json.dumps({"verdict": "supported", "rationale": "r"}))
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = evaluate_mod.RunLogger(Path(tmp) / "log.jsonl")
            evaluate_mod.judge_mappings(client, "gpt-5.4", TRANSLATION_FULL, logger, judges=1)
            logger.close()

        for call in calls:
            user_message = call["messages"][1]["content"]
            self.assertNotIn("actual_source_class_definitions", user_message)

    def test_with_domain_data_and_source_ir_ground_truth_is_sent_when_resolvable(self):
        # This is the actual fix: a judge must be able to see the real
        # source class definitions, not just the compiler's own retelling
        # of what the evidence supposedly says (see the module-level
        # comment above _class_names_involved -- this is what would have
        # caught Chiller hasPart CondensingUnit having zero real backing).
        FakeClient, calls = _fake_client_class(lambda i, kw: json.dumps({"verdict": "supported", "rationale": "r"}))
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = evaluate_mod.RunLogger(Path(tmp) / "log.jsonl")
            evaluate_mod.judge_mappings(
                client, "gpt-5.4", TRANSLATION_FULL, logger, judges=1, domain_data=DOMAIN_DATA, source_ir=SOURCE_IR
            )
            logger.close()

        # classes.Fan (call 0) resolves against the real source -- must carry ground truth.
        fan_call_message = calls[0]["messages"][1]["content"]
        self.assertIn("actual_source_class_definitions", fan_call_message)
        self.assertIn("A device that moves air.", fan_call_message)

        # rules.canRunFan (call 4, see TRANSLATION_FULL's mapping order) has
        # no structural class reference at all -- must fall back cleanly,
        # not send a misleading empty/wrong ground-truth block.
        rule_call_message = calls[4]["messages"][1]["content"]
        self.assertNotIn("actual_source_class_definitions", rule_call_message)

    def test_a_rule_that_cites_a_real_source_iri_gets_ground_truth_via_iri_fallback(self):
        # Companion to the test above: TRANSLATION_FULL's rule has an empty
        # source_iris, which is why it correctly gets no ground truth there.
        # A rule that *does* cite a real source_iri in its own mapping --
        # which rules.canUseEconomizer genuinely did on the live Brick HVAC
        # rerun -- must now get it, closing the gap that nearly caused a
        # repair pass to drop a well-grounded rule for "no source material".
        translation = {
            "mappings": [
                {
                    "target_path": "rules.canRunFan",
                    "source_iris": ["http://ex.org#Fan"],
                    "source_evidence": "Fan definition supports a run-condition rule.",
                    "confidence": "high",
                    "rationale": "Directly tied to the Fan concept.",
                }
            ]
        }
        FakeClient, calls = _fake_client_class(lambda i, kw: json.dumps({"verdict": "supported", "rationale": "r"}))
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = evaluate_mod.RunLogger(Path(tmp) / "log.jsonl")
            evaluate_mod.judge_mappings(
                client, "gpt-5.4", translation, logger, judges=1, domain_data=DOMAIN_DATA, source_ir=SOURCE_IR
            )
            logger.close()

        rule_call_message = calls[0]["messages"][1]["content"]
        self.assertIn("actual_source_class_definitions", rule_call_message)
        self.assertIn("A device that moves air.", rule_call_message)

    def test_ground_truth_catches_a_fabricated_standard_practice_claim(self):
        # The real motivating scenario, reproduced directly: a relationship
        # between two classes that really exist, evidenced only by a
        # confident-sounding standard-practice rationale that has no actual
        # connection to either class's real source definition. A judge
        # given the real ground truth should be able to tell -- simulated
        # here by having the fake judge's response itself depend on whether
        # ground truth was present in what it was asked to judge, which is
        # exactly the information judge_mappings must make available.
        domain_data = {
            "classes": {"Chiller": {"meaning": "x"}, "Compressor": {"meaning": "y"}},
            "relationships": [{"name": "hasPart", "from": "Chiller", "to": "Compressor", "meaning": "z", "aliases": []}],
        }
        translation = {
            "mappings": [
                {
                    "target_path": "relationships[0]",
                    "source_iris": [],
                    "source_evidence": "Standard practice: chillers commonly include a compressor.",
                    "confidence": "medium",
                    "rationale": "Grounded in general refrigeration knowledge.",
                }
            ]
        }
        source_ir = {
            "classes": [
                {"iri": "http://ex.org#Chiller", "labels": ["Chiller"], "definitions": ["Refrigerating machine used to transfer heat."]},
                {"iri": "http://ex.org#Compressor", "labels": ["Compressor"], "definitions": ["A device for compressing gas."]},
            ]
        }

        def responder(i, kw):
            user_message = kw["messages"][1]["content"]
            # A judge actually using the ground truth notices neither
            # definition says anything about composition/parts at all.
            if "actual_source_class_definitions" in user_message and "part" not in user_message.lower():
                return json.dumps({"verdict": "unsupported", "rationale": "ground truth definitions say nothing about composition"})
            return json.dumps({"verdict": "supported", "rationale": "sounds plausible"})

        FakeClient, calls = _fake_client_class(responder)
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = evaluate_mod.RunLogger(Path(tmp) / "log.jsonl")
            result = evaluate_mod.judge_mappings(
                client, "gpt-5.4", translation, logger, judges=1, domain_data=domain_data, source_ir=source_ir
            )
            logger.close()

        self.assertEqual(result["results"][0]["majority_verdict"], "unsupported")

    def test_contested_elements_are_flagged_even_when_majority_still_supports(self):
        # The exact real-world shape found on Brick HVAC's
        # Chiller-hasPart-CondensingUnit: 2 judges say "supported", 1 says
        # "partially_supported" -- a real majority for "supported" (so the
        # unsupported hard gate correctly stays quiet), but genuine
        # disagreement exists that a random 10% manual sample could easily
        # miss entirely. contested_count/contested_paths must surface it as
        # a report-only diagnostic regardless of what the majority says.
        verdicts_by_call = ["supported", "partially_supported", "supported"]

        def responder(i, kw):
            return json.dumps({"verdict": verdicts_by_call[i], "rationale": "r"})

        FakeClient, calls = _fake_client_class(responder)
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = evaluate_mod.RunLogger(Path(tmp) / "log.jsonl")
            translation = {"mappings": [TRANSLATION_FULL["mappings"][0]]}
            result = evaluate_mod.judge_mappings(client, "gpt-5.4", translation, logger, judges=3)
            logger.close()

        self.assertEqual(result["results"][0]["majority_verdict"], "supported")
        self.assertTrue(result["results"][0]["contested"])
        self.assertEqual(result["contested_count"], 1)
        self.assertEqual(result["contested_paths"], ["classes.Fan"])
        self.assertEqual(result["unsupported_count"], 0)  # the hard gate itself is unaffected

    def test_unanimous_verdicts_are_not_contested(self):
        FakeClient, calls = _fake_client_class(lambda i, kw: json.dumps({"verdict": "supported", "rationale": "r"}))
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = evaluate_mod.RunLogger(Path(tmp) / "log.jsonl")
            result = evaluate_mod.judge_mappings(client, "gpt-5.4", TRANSLATION_FULL, logger, judges=3)
            logger.close()

        self.assertTrue(all(not r["contested"] for r in result["results"]))
        self.assertEqual(result["contested_count"], 0)
        self.assertEqual(result["contested_paths"], [])


class SiblingContextForIriTests(unittest.TestCase):
    def setUp(self):
        self.source_ir = {
            "classes": [
                {"iri": "http://ex.org#Compressor", "kind": "class", "labels": ["Compressor"], "definitions": ["Compresses gas."], "parents": ["http://ex.org#HVACEquipment"]},
                {"iri": "http://ex.org#Fan", "kind": "class", "labels": ["Fan"], "definitions": ["Moves air."], "parents": ["http://ex.org#HVACEquipment"]},
                {"iri": "http://ex.org#Filter", "kind": "class", "labels": ["Filter"], "definitions": ["Removes particulates."], "parents": ["http://ex.org#HVACEquipment"]},
                {"iri": "http://ex.org#Building", "kind": "class", "labels": ["Building"], "definitions": ["A building."], "parents": []},
            ],
        }
        self.iri_index = evaluate_mod._index_source_records_by_iri(self.source_ir)

    def test_finds_mapped_siblings_sharing_a_parent(self):
        mapped = {"http://ex.org#Fan": "classes.Fan", "http://ex.org#Filter": "classes.Filter"}
        siblings = evaluate_mod._sibling_context_for_iri("http://ex.org#Compressor", self.iri_index, mapped)
        iris = {s["iri"] for s in siblings}
        self.assertEqual(iris, {"http://ex.org#Fan", "http://ex.org#Filter"})
        self.assertEqual(next(s for s in siblings if s["iri"] == "http://ex.org#Fan")["mapped_to"], "classes.Fan")

    def test_unmapped_siblings_are_excluded(self):
        # Only siblings that actually made it into the domain are useful
        # comparison context -- an unmapped sibling proves nothing.
        siblings = evaluate_mod._sibling_context_for_iri("http://ex.org#Compressor", self.iri_index, {})
        self.assertEqual(siblings, [])

    def test_class_with_no_parents_has_no_siblings(self):
        siblings = evaluate_mod._sibling_context_for_iri("http://ex.org#Building", self.iri_index, {"http://ex.org#Fan": "classes.Fan"})
        self.assertEqual(siblings, [])

    def test_non_class_record_has_no_siblings(self):
        source_ir = {"object_properties": [{"iri": "http://ex.org#hasPoint", "kind": "object_property", "labels": ["hasPoint"]}]}
        iri_index = evaluate_mod._index_source_records_by_iri(source_ir)
        siblings = evaluate_mod._sibling_context_for_iri("http://ex.org#hasPoint", iri_index, {})
        self.assertEqual(siblings, [])

    def test_unresolvable_iri_has_no_siblings(self):
        siblings = evaluate_mod._sibling_context_for_iri("http://ex.org#DoesNotExist", self.iri_index, {})
        self.assertEqual(siblings, [])


class JudgeDispositionsTests(unittest.TestCase):
    def test_only_non_mapped_resolvable_dispositions_are_judged(self):
        # "mapped" dispositions are judge_mappings' job, not this layer's.
        # A disposition whose source_iri doesn't resolve to a real class/
        # property (e.g. a restriction/enumeration/import) has nothing to
        # check the exclusion against, so it's skipped, not force-judged.
        translation = {
            "dispositions": [
                {"source_iri": "http://ex.org#Fan", "disposition": "mapped", "note": "renamed"},
                {"source_iri": "http://ex.org#Compressor", "disposition": "out_of_scope", "note": "not needed"},
                {"source_iri": "http://ex.org#SomeRestriction", "disposition": "not_agent_relevant", "note": "structural only"},
            ]
        }
        source_ir = {
            "classes": [
                {"iri": "http://ex.org#Fan", "kind": "class", "labels": ["Fan"], "definitions": ["Moves air."], "parents": []},
                {"iri": "http://ex.org#Compressor", "kind": "class", "labels": ["Compressor"], "definitions": ["Compresses gas."], "parents": []},
            ]
        }
        FakeClient, calls = _fake_client_class(lambda i, kw: json.dumps({"verdict": "justified", "rationale": "r"}))
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = evaluate_mod.RunLogger(Path(tmp) / "log.jsonl")
            result = evaluate_mod.judge_dispositions(client, "gpt-5.4", translation, source_ir, logger, judges=1)
            logger.close()

        self.assertEqual(len(result["results"]), 1)
        self.assertEqual(result["results"][0]["source_iri"], "http://ex.org#Compressor")
        self.assertEqual(len(calls), 1)

    def test_majority_unjustified_is_flagged(self):
        translation = {"dispositions": [{"source_iri": "http://ex.org#Compressor", "disposition": "out_of_scope", "note": "not needed for selected subset"}]}
        source_ir = {
            "classes": [
                {"iri": "http://ex.org#Compressor", "kind": "class", "labels": ["Compressor"], "definitions": ["Compresses gas."], "parents": ["http://ex.org#HVACEquipment"]},
                {"iri": "http://ex.org#Fan", "kind": "class", "labels": ["Fan"], "definitions": ["Moves air."], "parents": ["http://ex.org#HVACEquipment"]},
            ]
        }
        FakeClient, calls = _fake_client_class(lambda i, kw: json.dumps({"verdict": "unjustified", "rationale": "generic boilerplate reused verbatim"}))
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = evaluate_mod.RunLogger(Path(tmp) / "log.jsonl")
            result = evaluate_mod.judge_dispositions(client, "gpt-5.4", translation, source_ir, logger, judges=3)
            logger.close()

        self.assertEqual(result["unjustified_count"], 1)
        self.assertEqual(result["unjustified_iris"], ["http://ex.org#Compressor"])

    def test_contested_dispositions_are_flagged_even_when_majority_justified(self):
        verdicts_by_call = ["justified", "partially_justified", "justified"]

        def responder(i, kw):
            return json.dumps({"verdict": verdicts_by_call[i], "rationale": "r"})

        translation = {"dispositions": [{"source_iri": "http://ex.org#Compressor", "disposition": "out_of_scope", "note": "n"}]}
        source_ir = {"classes": [{"iri": "http://ex.org#Compressor", "kind": "class", "labels": ["Compressor"], "definitions": [], "parents": []}]}
        FakeClient, calls = _fake_client_class(responder)
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = evaluate_mod.RunLogger(Path(tmp) / "log.jsonl")
            result = evaluate_mod.judge_dispositions(client, "gpt-5.4", translation, source_ir, logger, judges=3)
            logger.close()

        self.assertEqual(result["contested_count"], 1)
        self.assertEqual(result["unjustified_count"], 0)

    def test_sibling_context_is_included_in_the_judge_prompt(self):
        translation = {
            "dispositions": [{"source_iri": "http://ex.org#Compressor", "disposition": "out_of_scope", "note": "n"}],
            "mappings": [{"target_path": "classes.Fan", "source_iris": ["http://ex.org#Fan"], "source_evidence": "e", "confidence": "high", "rationale": "r"}],
        }
        source_ir = {
            "classes": [
                {"iri": "http://ex.org#Compressor", "kind": "class", "labels": ["Compressor"], "definitions": [], "parents": ["http://ex.org#HVACEquipment"]},
                {"iri": "http://ex.org#Fan", "kind": "class", "labels": ["Fan"], "definitions": ["Moves air."], "parents": ["http://ex.org#HVACEquipment"]},
            ]
        }
        FakeClient, calls = _fake_client_class(lambda i, kw: json.dumps({"verdict": "justified", "rationale": "r"}))
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = evaluate_mod.RunLogger(Path(tmp) / "log.jsonl")
            evaluate_mod.judge_dispositions(client, "gpt-5.4", translation, source_ir, logger, judges=1)
            logger.close()

        user_message = calls[0]["messages"][1]["content"]
        self.assertIn("included_siblings", user_message)
        self.assertIn("classes.Fan", user_message)


class MajorityVerdictTests(unittest.TestCase):
    def test_strict_majority_wins(self):
        judgments = [{"verdict": "unsupported"}, {"verdict": "unsupported"}, {"verdict": "supported"}]
        self.assertEqual(evaluate_mod._majority_verdict(judgments), "unsupported")

    def test_three_way_tie_has_no_majority(self):
        judgments = [{"verdict": "unsupported"}, {"verdict": "supported"}, {"verdict": "partially_supported"}]
        self.assertIsNone(evaluate_mod._majority_verdict(judgments))

    def test_empty_judgments_has_no_majority(self):
        self.assertIsNone(evaluate_mod._majority_verdict([]))


class RoundTripSampleTests(unittest.TestCase):
    def test_sample_size_caps_calls(self):
        def responder(i, kw):
            if i % 2 == 0:
                return json.dumps({"reconstruction": "a device moving air"})
            return json.dumps({"score": 0.8, "rationale": "close match"})

        FakeClient, calls = _fake_client_class(responder)
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = evaluate_mod.RunLogger(Path(tmp) / "log.jsonl")
            result = evaluate_mod.round_trip_sample(client, "gpt-5.4", DOMAIN_DATA, TRANSLATION_FULL, logger, sample_size=2)
            logger.close()

        self.assertEqual(result["sampled"], 2)
        self.assertEqual(len(calls), 4)  # 2 samples x (reconstruct + compare)
        self.assertAlmostEqual(result["average_score"], 0.8)


class CqSupportTests(unittest.TestCase):
    def test_generate_then_judge(self):
        def responder(i, kw):
            if i == 0:
                return json.dumps({"questions": ["Which fan serves which zone?", "What starts a fan?"]})
            return json.dumps({"supported": True, "rationale": "covered"})

        FakeClient, calls = _fake_client_class(responder)
        client = FakeClient()
        with tempfile.TemporaryDirectory() as tmp:
            logger = evaluate_mod.RunLogger(Path(tmp) / "log.jsonl")
            cqs, gen_cost = evaluate_mod.generate_cqs(client, "gpt-5.4", SOURCE_IR, logger, n=2)
            result = evaluate_mod.judge_cq_support(client, "gpt-5.4", "classes: {}\n", cqs, logger)
            logger.close()

        self.assertEqual(len(cqs), 2)
        self.assertEqual(result["support_score"], 1.0)
        self.assertEqual(len(calls), 3)  # 1 generate + 2 support judgments


class RunEvaluationDryRunTests(unittest.TestCase):
    def _write_inputs(self, tmp_path: Path):
        manifest_path = tmp_path / "source-manifest.yaml"
        manifest_path.write_text(
            "id: test-domain\nsource_url: https://example.org/x.rdf\nscope:\n  roots: []\ncompiler:\n  prompt_version: compiler-v1\n  runs: 3\n",
            encoding="utf-8",
        )
        domain_yaml_path = tmp_path / "run-1.domain.yaml"
        import yaml

        domain_yaml_path.write_text(yaml.safe_dump(DOMAIN_DATA), encoding="utf-8")
        translation_path = tmp_path / "run-1.translation.json"
        translation_path.write_text(json.dumps(TRANSLATION_FULL), encoding="utf-8")
        source_ir_path = tmp_path / "source_ir.json"
        source_ir_path.write_text(json.dumps(SOURCE_IR), encoding="utf-8")
        return manifest_path, domain_yaml_path, translation_path, source_ir_path

    def test_dry_run_writes_hard_gate_report_only(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest_path, domain_yaml_path, translation_path, source_ir_path = self._write_inputs(tmp_path)
            out_dir = tmp_path / "out"

            rc = evaluate_mod.run_evaluation(
                domain_yaml_path, translation_path, source_ir_path, manifest_path, out_dir, dry_run=True
            )

            self.assertEqual(rc, 0)
            eval_json = json.loads((out_dir / "test-domain.translation-evaluation.json").read_text(encoding="utf-8"))
            self.assertTrue(eval_json["hard_gates_ok"])
            self.assertIsNone(eval_json["semantic_judging"])
            self.assertTrue((out_dir / "test-domain.translation-report.md").exists())

    def test_hard_gate_failure_skips_llm_layers_without_touching_credentials(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest_path, domain_yaml_path, translation_path, source_ir_path = self._write_inputs(tmp_path)
            # Break provenance: drop a mapping.
            translation = json.loads(translation_path.read_text(encoding="utf-8"))
            translation["mappings"] = translation["mappings"][:1]
            translation_path.write_text(json.dumps(translation), encoding="utf-8")
            out_dir = tmp_path / "out"

            # dry_run=False but no Azure env/patch at all -- must not attempt
            # a real client construction, since hard gates already failed.
            with mock.patch.dict("os.environ", {}, clear=False):
                rc = evaluate_mod.run_evaluation(
                    domain_yaml_path, translation_path, source_ir_path, manifest_path, out_dir, dry_run=False
                )

        self.assertEqual(rc, 1)


class RunEvaluationLiveMockedTests(unittest.TestCase):
    def test_full_flow_with_mocked_client(self):
        def responder(i, kw):
            content = kw["messages"][0]["content"]
            if "EXCLUDE a source ontology element" in content:
                return json.dumps({"verdict": "justified", "rationale": "ok"})
            if "independent judge" in content:
                return json.dumps({"verdict": "supported", "rationale": "ok"})
            if "Compare a blind reconstruction" in content:
                return json.dumps({"score": 0.9, "rationale": "close"})
            if "real-world concept" in content:
                return json.dumps({"reconstruction": "a device that moves air"})
            if "generate source-grounded competency" in content:
                return json.dumps({"questions": ["Which fan serves which zone?"]})
            if "judge" in content.lower() and "orientation" in content:
                return json.dumps({"supported": True, "rationale": "covered"})
            raise AssertionError(f"unexpected prompt: {content[:80]}")

        FakeClient, calls = _fake_client_class(responder)

        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest_path = tmp_path / "source-manifest.yaml"
            manifest_path.write_text(
                "id: test-domain\nsource_url: https://example.org/x.rdf\nscope:\n  roots: []\ncompiler:\n  prompt_version: compiler-v1\n  runs: 3\n",
                encoding="utf-8",
            )
            import yaml

            domain_yaml_path = tmp_path / "run-1.domain.yaml"
            domain_yaml_path.write_text(yaml.safe_dump(DOMAIN_DATA), encoding="utf-8")
            translation_path = tmp_path / "run-1.translation.json"
            translation_path.write_text(json.dumps(TRANSLATION_FULL), encoding="utf-8")
            source_ir_path = tmp_path / "source_ir.json"
            source_ir_path.write_text(json.dumps(SOURCE_IR), encoding="utf-8")
            out_dir = tmp_path / "out"

            with mock.patch.object(
                evaluate_mod,
                "load_azure_config",
                return_value={"endpoint": "https://fake/", "api_key": "fake", "api_version": "v1", "deployment": "gpt-5.4"},
            ), mock.patch("openai.AzureOpenAI", FakeClient):
                rc = evaluate_mod.run_evaluation(
                    domain_yaml_path,
                    translation_path,
                    source_ir_path,
                    manifest_path,
                    out_dir,
                    judges=1,
                    round_trip_sample_size=1,
                    cq_count=1,
                    dry_run=False,
                )

            self.assertEqual(rc, 0)
            eval_json = json.loads((out_dir / "test-domain.translation-evaluation.json").read_text(encoding="utf-8"))
            self.assertTrue(eval_json["hard_gates_ok"])
            self.assertEqual(eval_json["semantic_judging"]["unsupported_count"], 0)
            self.assertEqual(eval_json["disposition_judging"]["unjustified_count"], 0)
            self.assertIsNotNone(eval_json["round_trip"]["average_score"])
            self.assertEqual(eval_json["cq_support"]["support_score"], 1.0)
            self.assertTrue((out_dir / "evaluate.log.jsonl").exists())

    def test_majority_unjustified_disposition_fails_the_overall_hard_gate(self):
        def responder(i, kw):
            content = kw["messages"][0]["content"]
            if "EXCLUDE a source ontology element" in content:
                return json.dumps({"verdict": "unjustified", "rationale": "boilerplate reused with no real reason"})
            if "independent judge" in content:
                return json.dumps({"verdict": "supported", "rationale": "ok"})
            if "Compare a blind reconstruction" in content:
                return json.dumps({"score": 0.9, "rationale": "close"})
            if "real-world concept" in content:
                return json.dumps({"reconstruction": "a device that moves air"})
            if "generate source-grounded competency" in content:
                return json.dumps({"questions": ["Which fan serves which zone?"]})
            if "judge" in content.lower() and "orientation" in content:
                return json.dumps({"supported": True, "rationale": "covered"})
            raise AssertionError(f"unexpected prompt: {content[:80]}")

        FakeClient, calls = _fake_client_class(responder)

        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest_path = tmp_path / "source-manifest.yaml"
            manifest_path.write_text(
                "id: test-domain\nsource_url: https://example.org/x.rdf\nscope:\n  roots: []\ncompiler:\n  prompt_version: compiler-v1\n  runs: 3\n",
                encoding="utf-8",
            )
            import yaml

            domain_yaml_path = tmp_path / "run-1.domain.yaml"
            domain_yaml_path.write_text(yaml.safe_dump(DOMAIN_DATA), encoding="utf-8")
            translation_path = tmp_path / "run-1.translation.json"
            translation_path.write_text(json.dumps(TRANSLATION_FULL), encoding="utf-8")
            source_ir_path = tmp_path / "source_ir.json"
            source_ir_path.write_text(json.dumps(SOURCE_IR), encoding="utf-8")
            out_dir = tmp_path / "out"

            with mock.patch.object(
                evaluate_mod,
                "load_azure_config",
                return_value={"endpoint": "https://fake/", "api_key": "fake", "api_version": "v1", "deployment": "gpt-5.4"},
            ), mock.patch("openai.AzureOpenAI", FakeClient):
                rc = evaluate_mod.run_evaluation(
                    domain_yaml_path, translation_path, source_ir_path, manifest_path, out_dir,
                    judges=1, round_trip_sample_size=1, cq_count=1, dry_run=False,
                )

            # SOURCE_IR's "Irrelevant" class is the one non-mapped, resolvable
            # disposition in TRANSLATION_FULL -- structural/provenance/
            # semantic-judging all pass, but a majority-unjustified exclusion
            # must still fail the overall hard gate on its own.
            self.assertEqual(rc, 1)
            eval_json = json.loads((out_dir / "test-domain.translation-evaluation.json").read_text(encoding="utf-8"))
            self.assertFalse(eval_json["hard_gates_ok"])
            self.assertEqual(eval_json["disposition_judging"]["unjustified_count"], 1)


class RenderMarkdownTests(unittest.TestCase):
    def test_contains_expected_sections(self):
        report = {
            "hard_gates_ok": True,
            "structural_validity": {"ok": True, "error_count": 0, "warning_count": 0},
            "provenance_completeness": {"ok": True, "element_provenance_coverage": 1.0, "source_disposition_coverage": 1.0},
            "reverse_coverage": {"coverage": 1.0, "silently_dropped": []},
            "translation_stability": {"average_f1": None},
            "semantic_judging": None,
            "round_trip": None,
            "cq_support": None,
        }
        markdown = evaluate_mod._render_markdown("test-domain", report)
        self.assertIn("Translation quality report: test-domain", markdown)
        self.assertIn("PASS", markdown)
        self.assertIn("Structural validity", markdown)
        self.assertIn("Provenance completeness", markdown)
        self.assertIn("Reverse coverage", markdown)
        self.assertNotIn("Independent judging of exclusions", markdown)

    def test_endpoint_citation_completeness_section_renders_when_present(self):
        report = {
            "hard_gates_ok": False,
            "structural_validity": {"ok": True, "error_count": 0, "warning_count": 0},
            "provenance_completeness": {"ok": True, "element_provenance_coverage": 1.0, "source_disposition_coverage": 1.0},
            "endpoint_citation_completeness": {"ok": False, "gaps": [{"target_path": "relationships[0]", "endpoint": "to", "class": "Zone", "known_class_iris": ["http://ex.org#Zone"]}]},
            "reverse_coverage": {"coverage": 1.0, "silently_dropped": []},
            "translation_stability": {"average_f1": None},
            "semantic_judging": None,
            "round_trip": None,
            "cq_support": None,
        }
        markdown = evaluate_mod._render_markdown("test-domain", report)
        self.assertIn("endpoint citation completeness", markdown.lower())
        self.assertIn("gaps: 1", markdown)

    def test_disposition_judging_section_renders_when_present(self):
        report = {
            "hard_gates_ok": False,
            "structural_validity": {"ok": True, "error_count": 0, "warning_count": 0},
            "provenance_completeness": {"ok": True, "element_provenance_coverage": 1.0, "source_disposition_coverage": 1.0},
            "reverse_coverage": {"coverage": 1.0, "silently_dropped": []},
            "translation_stability": {"average_f1": None},
            "semantic_judging": None,
            "disposition_judging": {"unjustified_count": 2, "contested_count": 1},
            "round_trip": None,
            "cq_support": None,
        }
        markdown = evaluate_mod._render_markdown("test-domain", report)
        self.assertIn("Independent judging of exclusions", markdown)
        self.assertIn("majority-unjustified exclusions: 2", markdown)


if __name__ == "__main__":
    unittest.main()
