# Ontology-recovery eval report

Generated: 2026-08-05T09:54:14.302Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's 68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **10.5%** | **12.7%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 26.5% / 31.0% / 28.6% | 42.9% / 20.7% / 27.9% | 18/68 full · 12/28 scoped ground-truth classes matched; 58 recovered |
| Relationship recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/108 full · 0/41 scoped ground-truth relationships matched; 0 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 13.5% | 23.1% | 15/111 full · 6/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 0.0% | 0.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **11.1%** | **14.5%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 27.9% / 32.8% / 30.2% | 53.6% / 25.9% / 34.9% | 19/68 full · 15/28 scoped ground-truth classes matched; 58 recovered |
| Relationship recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/108 full · 0/41 scoped ground-truth relationships matched; 0 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 14.4% | 23.1% | 16/111 full · 6/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 0.0% | 0.0% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 9 turns, 315s wall-clock
- Real app-agent API calls: 17 (apply_ontology_yaml called 8× · get_graph_state called 0×)
- Tool outcomes seen in transcript: 8 applied · 0 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

- **Turn 1:** `app-assistant` response is duplicated verbatim in the same turn, which looks like a real output/rendering bug.
- **Turn 7–9:** Concept proliferation without resolution: the model now contains overlapping roles/groups such as **Executive Group** vs **Executive Stakeholder Group**, **Risk/Compliance** vs **Legal/Compliance** vs **Legal**, and **Owner** vs **Service Owner**. The assistant notices this only at the end instead of reconciling earlier.
- **Turn 8:** The assistant models example deadlines as rules — e.g. “assessment often within 24 hours,” “initial notification often within 48 hours,” “final report often within 10 business days” — even though the persona framed them as examples/generic timeframes, not confirmed bank policy.
- **Turn 4:** Similarly, the Sev1 30-minute escalation example is modeled as a rule, though the persona gave it as “like 30 minutes,” not necessarily an authoritative fixed threshold.

## Noteworthy observations

- **Turn 1:** Good opening scope choice: starting with services/dependencies gives a solid backbone for later incident, ownership, severity, and reporting concepts.
- **Turn 3:** Good clarification on **start time** vs **detected time** before proceeding; this prevented a likely semantic ambiguity.
- **Turns 2–9:** The interviewer follows a clear layered progression: service model → incident classification → governance → recovery/change → evidence/comms → PIR → regulatory reporting → ongoing governance. Efficient and coherent.
- **Turns 2–9:** The assistant consistently summarizes what was captured before moving on, which helps maintain shared state and makes model-building transparent.
- **Turns 3–8:** Questions are broad and productive, but often elicit generic lists. The interviewer missed chances to ask for stricter ontology details: lifecycle statuses, cardinalities, mandatory vs optional relationships, controlled vocabularies, authority matrices, and exact threshold tables.
- **Turn 5:** Good coverage of restoration criteria, but a missed follow-up: whether **technical recovery**, **business validation**, **customer validation**, and **monitoring stability** are sequential gates, independent evidence items, or alternative closure criteria.
- **Turn 6:** Good evidence/comms capture, but missed asking about retention periods, systems of record, immutability, audit ownership, and evidence quality/completeness checks.
- **Turn 7:** Good PIR/remediation coverage, but missed distinguishing **Problem Management** from **Post-Incident Review** and whether remediation actions can spawn risks, controls, changes, or known-error records.
- **Turn 8:** Regulatory workflow section is strong, especially asking about **Regulator**, **Jurisdiction**, and **Regulation** objects. However, it should have pressed for jurisdiction-specific deadline variance rather than recording generic examples.
- **Turn 9:** Good closing synthesis, but the assistant should have actively resolved the terminology cleanup it identified rather than leaving it as a “remaining refinement.”

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
