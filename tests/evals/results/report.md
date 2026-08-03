# Ontology-recovery eval report

Generated: 2026-08-03T11:50:51.736Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's 68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **36.4%** | **50.6%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 30.9% / 80.8% / 44.7% | 67.9% / 73.1% / 70.4% | 21/68 full · 19/28 scoped ground-truth classes matched; 26 recovered |
| Relationship recall / precision / F1 | 9.3% / 23.8% / 13.3% | 24.4% / 23.8% / 24.1% | 10/108 full · 10/41 scoped ground-truth relationships matched; 42 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 12.6% | 26.9% | 14/111 full · 7/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 75.2% | 80.8% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **40.0%** | **56.3%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 33.8% / 88.5% / 48.9% | 75.0% / 80.8% / 77.8% | 23/68 full · 21/28 scoped ground-truth classes matched; 26 recovered |
| Relationship recall / precision / F1 | 13.0% / 33.3% / 18.7% | 31.7% / 31.0% / 31.3% | 14/108 full · 13/41 scoped ground-truth relationships matched; 42 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 16.2% | 34.6% | 18/111 full · 9/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 76.3% | 81.6% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 52 turns, 1062s wall-clock
- Real app-agent API calls: 138 (apply_ontology_yaml called 40× · get_graph_state called 46×)
- Tool outcomes seen in transcript: 40 applied · 0 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

- **Turn 46–48:** Several recorded rules depend on concepts not modeled as properties/classes or explicitly marked as external checks, e.g. business impact, incident history, implementation/backout plans, target environment readiness, SLO milestones, stakeholder concern, propagation risk, isolation procedures, findings, and policy mandates. This makes some rules hard to execute against the ontology.
- **Turn 50:** The interviewer added a new supporting rule, **containmentReady**, even though the persona only said it “might not” need a separate named rule and did not provide a formal condition list for it.
- **Turn 52:** Final validation overstates coverage for “What evidence do we need to gather?” The model has actual `Evidence` records and `evidenceCollectionRequired`, but earlier the persona explicitly rejected direct evidence-requirement tracking; there is no clear way to enumerate required evidence types for a specific incident.
- **Turn 52:** “No blocking gaps found” is too strong given the unmodeled inputs embedded in the recorded decision rules.

## Noteworthy observations

- **Turn 1–4:** Strong opening structure: collected real competency questions/actions first, then confirmed a concise acceptance-test recap before modeling.
- **Turn 5–11:** Good class-elicitation technique: small batches, explicit “identify/retrieve/connect/pass to tools” criterion, and a useful follow-up on role granularity.
- **Turn 10:** Good correction probe distinguishing internal **Compliance Officer** from external **Regulator**; prevented a bad merge.
- **Turn 14–16:** Good handling of conditional relationship inclusion: did not add `Incident — contained by → Workaround` until the persona confirmed it is actually tracked.
- **Turn 18:** Good coverage check caught the missing **Change Approver** class needed for the “who approved the last change?” question.
- **Turn 20–23:** Efficient relationship gap-closing before moving on; interviewer checked direct-vs-derived links instead of adding everything automatically.
- **Turn 24–28:** Property elicitation was disciplined and tied to decisions/actions, though it could have challenged date vs datetime precision for operational timestamps.
- **Turn 32–40:** Alias elicitation was thorough and allowed “not an alias” responses, which helped avoid overbroad synonym capture.
- **Turn 41–44:** Good prompt for allowed values plus “what breaks if missing/wrong,” capturing operational importance rather than just enums.
- **Turn 45–48:** Rule elicitation captured important decision logic, but the interviewer should have followed up to bind vague rule criteria to modeled fields, external tools, or new properties.
- **Turn 49–51:** Action definitions were clear and tool-oriented, with input class, preconditions, effects, and verification steps.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
