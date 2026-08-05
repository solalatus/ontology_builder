# Ontology-recovery eval report

Generated: 2026-08-03T19:29:47.343Z

> **Metric tables re-scored offline.** Properties were matched many-to-one when this run
> executed; `matchProperties()` (`lib/recoveryMetrics.mjs`) now assigns them one-to-one, which
> also gives the dimension a precision and an F1, and the composite averages property F1
> rather than property recall. The two tables below are the current scorer's numbers over this
> run's own persisted model and its own stored judge verdicts
> (`node tests/evals/rescore-saved-run.mjs <this directory>`); no interview was re-run and no
> judge was re-asked. Every other section is as this run wrote it.

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's 68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **39.6%** | **43.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 26.5% / 81.8% / 40.0% | 50.0% / 63.6% / 56.0% | 18/68 full · 14/28 scoped ground-truth classes matched; 22 recovered |
| Relationship recall / precision / F1 | 2.8% / 7.7% / 4.1% | 4.9% / 5.1% / 5.0% | 3/108 full · 2/41 scoped ground-truth relationships matched; 39 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 12.6% / 34.1% / 18.4% | 23.1% / 14.6% / 17.9% | 14/111 full · 6/26 scoped ground-truth properties matched; 41 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 95.9% | 96.4% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **44.4%** | **49.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 29.4% / 90.9% / 44.4% | 53.6% / 68.2% / 60.0% | 20/68 full · 15/28 scoped ground-truth classes matched; 22 recovered |
| Relationship recall / precision / F1 | 12.0% / 33.3% / 17.7% | 19.5% / 20.5% / 20.0% | 13/108 full · 8/41 scoped ground-truth relationships matched; 39 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 13.5% / 36.6% / 19.7% | 26.9% / 17.1% / 20.9% | 15/111 full · 7/26 scoped ground-truth properties matched; 41 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 95.7% | 96.5% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 57 turns, 882s wall-clock
- Real app-agent API calls: 110 (apply_ontology_yaml called 49× · get_graph_state called 5×)
- Tool outcomes seen in transcript: 48 applied · 3 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

- **Turn 1:** `app-user` repeats the persona’s opening message verbatim. This may be transcript plumbing rather than interviewer logic, but it looks like user/persona mirroring noise throughout the transcript.
- **Turn 22:** Tool reports `0 added, 1 updated` after seven Incident properties were confirmed. Could be expected if properties are stored as one class update, but the UI feedback is ambiguous and looks undercounted.
- **Turn 23:** Tool reports `0 added, 5 updated` after six properties were confirmed.
- **Turn 24:** Tool reports `0 added, 4 updated` after six properties were confirmed.
- **Turn 25:** Tool reports `0 added, 4 updated` after six properties were confirmed.
- **Turn 27:** Tool reports `0 added, 4 updated` after five properties were confirmed.
- **Turn 33:** Persona’s summary misplaces `regulator notification` and `supervisory notification` under **Materiality Assessment** instead of **Regulatory Notification**; interviewer correctly catches and records according to detailed item 6 at turn 34.
- **Turn 44:** Tool reports `0 added, 2 updated` after four allowed value lists were provided. Ambiguous/possibly incomplete tool application.
- **Turn 46:** Tool reports `0 added, 5 updated` after six allowed value lists were provided. Ambiguous/possibly incomplete tool application.
- **Turn 55:** Real tool/state-management failure: assistant attempted multiple ontology edits/checks in one message; several edits were skipped and the system stopped it for too many tool uses. This left state potentially partially applied until the continuation.
- **Turn 56:** Assistant says it “applied the missing rule refinement now” and updates **canDeclareMajorIncident**, but only after the previous over-tooling failure. It also immediately asks whether `tier-2-important` should be included, implying it had just recorded an over-specific `tier-1-critical` interpretation without confirming first.
- **Turn 57:** Final recap says **canDeclareMajorIncident** evaluates both Business Service and IT Service criticality using `tier-1-critical` and `tier-2-important`, but only the explicit follow-up asked about “critical IT Service.” It is unclear whether Business Service criticality was also meant to include `tier-2-important`; this may be an overgeneralization.

## Noteworthy observations

- **Turn 2:** Good early follow-up on related roles and operating context before modeling; helped identify later role classes and contextual properties.
- **Turns 4–8:** Candidate class elicitation was careful and well-scoped, especially asking whether some concepts should be properties vs distinct classes.
- **Turn 14:** Good self-audit: interviewer noticed **Emergency Change** from Phase 1 had not been tested as a class.
- **Turn 17:** Good self-audit: interviewer noticed **Monitoring System** from Phase 1 had not been tested as a class.
- **Turns 16–17:** Asking whether direct incident-to-role links were needed was useful, but it encouraged adding many redundant shortcut relationships. Could have challenged whether all direct links were truly required rather than accepting broad “operational efficiency” justification.
- **Turns 18–19:** Both directions between **Alert** and **Monitoring System** were accepted. This may be useful, but bidirectional modeling should be treated cautiously unless the graph semantics support inverse relationships cleanly.
- **Turns 21–27:** Property elicitation was systematic and tied to competency questions/actions. However, the interviewer did not notice the missing **ITService.criticality** until final validation, even though it introduced “critical IT Service” in a rule at turn 48.
- **Turn 34:** Good correction of the persona’s alias-summary mistake without derailing the interview.
- **Turns 43–47:** Allowed values and operational consequences were elicited efficiently and are directly usable for rules/action preconditions.
- **Turn 48:** Rule proposal introduced “critical IT Service” before ensuring the property existed. A prompt improvement would require checking property availability before proposing rules that reference it.
- **Turns 51–53:** Action definitions were well structured with input class, preconditions, effect, and verification. Good alignment to Phase 1 action list.
- **Turn 54:** Final validation pass was valuable and found a genuine coverage gap. This is a strong practice despite the later tool-use failure.
- **Overall:** The interviewer maintained phase structure and recaps well, but the transcript is very repetitive because the persona gives verbose confirmations and the interviewer often asks for confirmation of obvious items. Could be made more efficient by accepting concise confirmations or batching more aggressively once the persona pattern is established.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
