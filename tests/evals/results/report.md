# Ontology-recovery eval report

Generated: 2026-07-31T09:37:05.472Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's 68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **33.8%** | **43.6%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 27.9% / 70.4% / 40.0% | 57.1% / 59.3% / 58.2% | 19/68 full · 16/28 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 3.7% / 9.5% / 5.3% | 7.3% / 7.1% / 7.2% | 4/108 full · 3/41 scoped ground-truth relationships matched; 42 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 14.4% | 30.8% | 16/111 full · 8/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 75.3% | 78.3% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **38.4%** | **49.9%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 30.9% / 77.8% / 44.2% | 60.7% / 63.0% / 61.8% | 21/68 full · 17/28 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 12.0% / 31.0% / 17.3% | 24.4% / 23.8% / 24.1% | 13/108 full · 10/41 scoped ground-truth relationships matched; 42 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 16.2% | 34.6% | 18/111 full · 9/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 75.8% | 79.2% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 61 turns, 1025s wall-clock
- Real app-agent API calls: 140 (apply_ontology_yaml called 45× · get_graph_state called 34×)
- Tool outcomes seen in transcript: 45 applied · 0 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

- **Turn 25:** Tool result says `0 added, 1 updated`, but the assistant claims five Incident properties were added. This mismatch repeats a likely tooling/reporting or application bug: multiple properties were supposedly captured, but the tool only reports one updated object.
- **Turn 26:** Tool result says `0 added, 5 updated`, while eight properties across five classes were claimed added. Could be normal “class updated” semantics, but it is ambiguous and makes it hard to verify individual property persistence.
- **Turn 27:** Same ambiguity: eight properties claimed, tool reports `5 updated`.
- **Turn 29:** Six properties claimed, tool reports `5 updated`.
- **Turn 30:** Six properties claimed, tool reports `5 updated`.
- **Turn 49:** Allowed values were captured for five properties, but tool reports only `3 updated`. The assistant still states all five were captured. This looks like a possible missed application for **Environment.environmentName** and/or **DeploymentModel.modelName**, or opaque class-level update reporting.
- **Turn 50:** Allowed values for six properties claimed, tool reports `5 updated`.
- **Turn 56:** Tool reports `4 added, 1 updated` after adding one property and four rules; this is plausible, but no explicit check that the partially confirmed **canDeclareMajorIncident** rule was stored with the new `ITService.businessCritical` condition.
- **Turn 61:** Final validation claims “every pair of classes jointly mentioned… has a direct relationship where needed,” but the listed “Incident ↔ Alert” support is actually via **Alert —triggers→ Incident**, not the direction queried (“active alerts related to this incident”). This is navigable if inverse traversal is supported, but the statement “direct relationship where needed” glosses over directionality.

## Noteworthy observations

- **Turn 1:** Strong opening: established acceptance tests before modeling and clearly laid out phases.
- **Turn 2:** Good early follow-up on roles/context avoided premature role conflation and surfaced deployment/environment dimensions.
- **Turns 4–10:** Effective candidate-class batching with an explicit inclusion test (“identify/retrieve/connect/pass”). This kept scope controlled.
- **Turn 8:** Good discipline excluding Service Manager and Support Engineer despite their domain relevance, because original questions/actions did not require them.
- **Turn 9:** Accepted **Deployment Model** and **Third-Party Service** as separate classes without much challenge. Could have probed whether deployment model is really a class vs enum/property; the persona asserted it, but this may lead to over-modeling.
- **Turn 18–21:** Excellent recovery from a modeling mismatch: avoided conflating runbook closure steps with Corrective Actions, then elicited and added **Closure Task**.
- **Turn 22:** Good relationship gap check caught missing direct **Incident —has regulatory notification→ Regulatory Notification** needed for due-date questions/actions.
- **Turns 24–30:** Property elicitation was concise and tied to decisions/actions; however, the assistant deferred fixed choice values to Phase 6 while storing them as “text, fixed choices later,” which is fine but depends heavily on later tool correctness.
- **Turn 36–47:** Alias elicitation was thorough and included explicit exclusion of broader/misleading synonyms, improving semantic precision.
- **Turn 48 onward:** The interviewer correctly asked for real allowed values rather than relying on examples.
- **Turn 54–56:** Good handling of an emergent rule dependency: identified missing `ITService.businessCritical`, asked a binary clarification, then added it.
- **Turn 57–59:** Good adherence to action constraint (“exactly one input class”) and careful resolution of the ambiguous acknowledge precondition.
- **Throughout:** Persona tended to agree with most proposals. The interviewer generally mitigated this by asking targeted correction/exclusion questions, but some batches were large and may encourage rubber-stamping.
- **Turn 61:** Final validation is useful and skimmable, but somewhat self-certifying; it does not expose actual live graph contents, so earlier tool-count ambiguities remain unresolved.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
