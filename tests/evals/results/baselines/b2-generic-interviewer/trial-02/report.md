# Ontology-recovery eval report

Generated: 2026-08-05T10:15:34.444Z

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
| **Recovery effectiveness (composite)** | **11.9%** | **9.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 27.9% / 36.5% / 31.7% | 46.4% / 25.0% / 32.5% | 19/68 full · 13/28 scoped ground-truth classes matched; 52 recovered |
| Relationship recall / precision / F1 | 2.8% / 4.0% / 3.3% | 0.0% / 0.0% / 0.0% | 3/108 full · 0/41 scoped ground-truth relationships matched; 75 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 3.6% / 9.8% / 5.3% | 7.7% / 4.9% / 6.0% | 4/111 full · 2/26 scoped ground-truth properties matched; 41 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 7.4% | 0.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **21.1%** | **21.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 30.9% / 40.4% / 35.0% | 53.6% / 28.8% / 37.5% | 21/68 full · 15/28 scoped ground-truth classes matched; 52 recovered |
| Relationship recall / precision / F1 | 6.5% / 9.3% / 7.7% | 4.9% / 2.7% / 3.4% | 7/108 full · 2/41 scoped ground-truth relationships matched; 75 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 4.5% / 12.2% / 6.6% | 11.5% / 7.3% / 9.0% | 5/111 full · 3/26 scoped ground-truth properties matched; 41 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 35.0% | 37.5% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 7 turns, 257s wall-clock
- Real app-agent API calls: 14 (apply_ontology_yaml called 7× · get_graph_state called 0×)
- Tool outcomes seen in transcript: 7 applied · 0 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

None observed.

## Noteworthy observations

- **Turn 1**: Good anchoring move: the interviewer started with service/dependency structure, which appropriately grounds impact, ownership, recovery, and reporting.
- **Turn 2**: Strong summary of extracted concepts and relationships, but the interviewer began making some structural assertions — e.g., “Business Services are supported by IT Services” and “IT Services are supported by Applications” — without explicitly checking cardinality, exceptions, or whether these are formal CMDB relationships.
- **Turn 3**: Good catch on the newly introduced **Incident Commander** role and potential ambiguity with **Major Incident Manager**.
- **Turn 3**: The interviewer asked the Incident Commander clarification and immediately moved into a large new topic. This worked here, but in a real interview it risks burying the clarification or getting an incomplete answer.
- **Turns 2–7**: The interview was consistently well-structured, using clear domain sections and examples that helped the persona provide comprehensive answers.
- **Turns 4–6**: The interviewer accepted several vague/process-variable answers — “may,” “typically,” “depending on content,” “several months to several years” — without pressing for bank-specific rules, thresholds, or required decision authorities.
- **Turn 5**: Good transition into evidence and auditability; this is a high-value ontology area because it introduces artifacts, decisions, approvals, retention, and sign-off relationships.
- **Turn 6**: Missed obvious follow-up on the formal incident lifecycle: distinction between **detected**, **confirmed**, **declared major**, **restored**, **resolved**, **closed**, and **cancelled**. The assistant later notes this as a gap but does not explore it.
- **Turn 7**: Good closing synthesis and identification of precision gaps. However, instead of ending, the interviewer could have selected one high-value remaining gap, especially exact regulatory deadlines, resilience thresholds, or evidence retention periods.
- **Overall**: The interviewer’s repeated summaries are useful for state tracking but somewhat verbose and repetitive; a more efficient approach would summarize only deltas or ask sharper follow-ups after each tool update.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
