"""Structural validation of a `.domain.yaml` file -- the hard gate from
issue #103 layer 1 (100% required, no exceptions): YAML parses, every
reference resolves, every property type is valid, units only where
permitted, no duplicate identifiers after normalization. This module owns
the checks; #103's evaluate.py imports and reuses it as its layer-1 gate
rather than re-implementing them.

Deliberately has no LLM calls and no network access -- these are all
mechanical checks against the parsed structure, so they're free, fast, and
belong in the default (non-live) test suite.
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass, field
from pathlib import Path

import yaml

VALID_PROPERTY_TYPES = {"text", "number", "date", "boolean"}


@dataclass
class Issue:
    code: str
    severity: str  # "error" | "warning"
    message: str
    path: str = ""


@dataclass
class ValidationReport:
    issues: list[Issue] = field(default_factory=list)

    def error(self, code: str, message: str, path: str = "") -> None:
        self.issues.append(Issue(code, "error", message, path))

    def warning(self, code: str, message: str, path: str = "") -> None:
        self.issues.append(Issue(code, "warning", message, path))

    @property
    def errors(self) -> list[Issue]:
        return [i for i in self.issues if i.severity == "error"]

    @property
    def ok(self) -> bool:
        return not self.errors

    def as_dict(self) -> dict:
        return {
            "ok": self.ok,
            "error_count": len(self.errors),
            "warning_count": len(self.issues) - len(self.errors),
            "issues": [i.__dict__ for i in self.issues],
        }


def _normalize(name: str) -> str:
    return " ".join(str(name).strip().lower().split())


def _check_duplicates(report: ValidationReport, names: list[str], category: str) -> None:
    """Flags ANY normalized collision, including exact repeats -- not just
    same-normalized-different-raw-string near-duplicates. Exact repeats are
    the more common real case (two competency questions sharing an id, two
    relationships sharing a name) and are just as much a duplicate as a
    near-miss like 'Fan' vs '  fan  '."""
    seen: dict[str, str] = {}
    for name in names:
        key = _normalize(name)
        if key in seen:
            report.error(
                "duplicate_identifier",
                f"{category} '{name}' normalizes the same as existing '{seen[key]}'",
                path=category,
            )
        else:
            seen[key] = name


def _get_typed(report: ValidationReport, data: dict, key: str, expected_type: type, default, error_code: str, message: str):
    """Reads data[key], defaulting only when the key is truly absent, and
    reports a type error when it's present but wrong-shaped -- deliberately
    NOT `data.get(key) or default`, which silently swaps in the default for
    any falsy-but-wrong-type value too (an empty dict `{}` where a list was
    required is falsy, so `{} or []` masks the type error entirely)."""
    value = data.get(key)
    if value is None:
        return default
    if not isinstance(value, expected_type):
        report.error(error_code, message)
        return default
    return value


def validate_domain(data: dict) -> ValidationReport:
    report = ValidationReport()

    if not isinstance(data, dict):
        report.error("root_not_mapping", "top-level document must be a YAML mapping")
        return report

    classes = _get_typed(report, data, "classes", dict, {}, "classes_not_mapping", "'classes' must be a mapping of name -> class")
    class_names = set(classes.keys())
    _check_duplicates(report, list(classes.keys()), "class")

    for class_name, class_def in classes.items():
        path = f"classes.{class_name}"
        if not isinstance(class_def, dict):
            report.error("class_not_mapping", f"class '{class_name}' must be a mapping", path)
            continue
        if "meaning" not in class_def:
            report.error("missing_meaning", f"class '{class_name}' has no 'meaning' key", path)

        properties = class_def.get("properties")
        if properties is None:
            properties = {}
        elif not isinstance(properties, dict):
            report.error("properties_not_mapping", f"class '{class_name}'.properties must be a mapping", path)
            properties = {}
        _check_duplicates(report, list(properties.keys()), f"{path}.properties")

        for prop_name, prop_def in properties.items():
            prop_path = f"{path}.properties.{prop_name}"
            if not isinstance(prop_def, dict):
                report.error("property_not_mapping", f"property '{prop_name}' must be a mapping", prop_path)
                continue
            prop_type = prop_def.get("type")
            if prop_type not in VALID_PROPERTY_TYPES:
                report.error(
                    "invalid_property_type",
                    f"property '{prop_name}' has type '{prop_type}', expected one of {sorted(VALID_PROPERTY_TYPES)}",
                    prop_path,
                )
            if "unit" in prop_def and prop_type != "number":
                report.error(
                    "unit_on_non_number",
                    f"property '{prop_name}' has 'unit' but type is '{prop_type}', not 'number'",
                    prop_path,
                )
            if "allowed" in prop_def and not isinstance(prop_def["allowed"], list):
                report.error("allowed_not_list", f"property '{prop_name}'.allowed must be a list", prop_path)

    relationships = _get_typed(report, data, "relationships", list, [], "relationships_not_list", "'relationships' must be a list")
    rel_names = []
    for idx, rel in enumerate(relationships):
        path = f"relationships[{idx}]"
        if not isinstance(rel, dict):
            report.error("relationship_not_mapping", f"relationship at index {idx} must be a mapping", path)
            continue
        for key in ("name", "from", "to", "meaning"):
            if key not in rel:
                report.error("relationship_missing_key", f"relationship at index {idx} missing '{key}'", path)
        if rel.get("name"):
            rel_names.append(rel["name"])
        for endpoint_key in ("from", "to"):
            endpoint = rel.get(endpoint_key)
            if endpoint and endpoint not in class_names:
                report.error(
                    "dangling_relationship_endpoint",
                    f"relationship '{rel.get('name', idx)}'.{endpoint_key} references unknown class '{endpoint}'",
                    path,
                )
    _check_duplicates(report, rel_names, "relationship")

    rules = _get_typed(report, data, "rules", dict, {}, "rules_not_mapping", "'rules' must be a mapping of name -> rule")
    rule_names = set(rules.keys())
    _check_duplicates(report, list(rules.keys()), "rule")
    for rule_name, rule_def in rules.items():
        path = f"rules.{rule_name}"
        if not isinstance(rule_def, dict) or not isinstance(rule_def.get("conditions"), list):
            report.error("rule_missing_conditions", f"rule '{rule_name}' must have a list 'conditions'", path)

    actions = _get_typed(report, data, "actions", dict, {}, "actions_not_mapping", "'actions' must be a mapping of name -> action")
    _check_duplicates(report, list(actions.keys()), "action")
    for action_name, action_def in actions.items():
        path = f"actions.{action_name}"
        if not isinstance(action_def, dict):
            report.error("action_not_mapping", f"action '{action_name}' must be a mapping", path)
            continue
        input_class = action_def.get("input")
        if not input_class:
            report.error("action_missing_input", f"action '{action_name}' has no 'input'", path)
        elif input_class not in class_names:
            report.error(
                "action_input_unresolved",
                f"action '{action_name}'.input references unknown class '{input_class}'",
                path,
            )
        preconditions = action_def.get("preconditions")
        if preconditions is None:
            preconditions = []
        elif not isinstance(preconditions, list):
            report.error("action_preconditions_not_list", f"action '{action_name}'.preconditions must be a list", path)
            preconditions = []
        for precondition in preconditions:
            if precondition not in rule_names:
                report.error(
                    "action_precondition_unresolved",
                    f"action '{action_name}' precondition '{precondition}' references unknown rule",
                    path,
                )
        for key in ("effect", "verification"):
            if key not in action_def:
                report.error("action_missing_key", f"action '{action_name}' missing '{key}'", path)

    cqs = _get_typed(report, data, "competency_questions", list, [], "cqs_not_list", "'competency_questions' must be a list")
    cq_ids = []
    for idx, cq in enumerate(cqs):
        path = f"competency_questions[{idx}]"
        if not isinstance(cq, dict) or "id" not in cq or "text" not in cq:
            report.error("cq_malformed", f"competency question at index {idx} needs 'id' and 'text'", path)
            continue
        cq_ids.append(cq["id"])
    _check_duplicates(report, cq_ids, "competency_question")

    return report


def load_and_validate(path: str | Path) -> ValidationReport:
    path = Path(path)
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as exc:
        report = ValidationReport()
        report.error("unreadable_file", f"could not read {path}: {exc}")
        return report
    try:
        data = yaml.safe_load(text)
    except yaml.YAMLError as exc:
        report = ValidationReport()
        report.error("yaml_parse_error", f"{path} is not valid YAML: {exc}")
        return report
    return validate_domain(data or {})


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("domain_yaml", type=Path, help="path to a .domain.yaml file")
    args = parser.parse_args(argv)

    report = load_and_validate(args.domain_yaml)
    for issue in report.issues:
        marker = "ERROR" if issue.severity == "error" else "warn "
        print(f"[{marker}] {issue.code} @ {issue.path}: {issue.message}")
    print(f"[validate] {len(report.errors)} error(s), {len(report.issues) - len(report.errors)} warning(s)")
    return 0 if report.ok else 1


if __name__ == "__main__":
    sys.exit(main())
