# Ontology-recovery eval report

Generated: 2026-07-31T09:09:28.634Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's 68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **20.9%** | **34.0%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 30.9% / 87.0% / 45.6% | 67.9% / 78.3% / 72.7% | 21/68 full · 19/28 scoped ground-truth classes matched; 23 recovered |
| Relationship recall / precision / F1 | 4.6% / 11.9% / 6.7% | 9.8% / 9.5% / 9.6% | 5/108 full · 4/41 scoped ground-truth relationships matched; 42 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 12.6% | 30.8% | 14/111 full · 8/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 18.6% | 23.1% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **37.3%** | **50.1%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 33.8% / 95.7% / 50.0% | 75.0% / 87.0% / 80.5% | 23/68 full · 21/28 scoped ground-truth classes matched; 23 recovered |
| Relationship recall / precision / F1 | 13.9% / 35.7% / 20.0% | 29.3% / 28.6% / 28.9% | 15/108 full · 12/41 scoped ground-truth relationships matched; 42 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 14.4% | 38.5% | 16/111 full · 10/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 64.8% | 52.6% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 52 turns, 777s wall-clock
- Real app-agent API calls: 95 (apply_ontology_yaml called 40× · get_graph_state called 3×)
- Tool outcomes seen in transcript: 40 applied · 0 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

- **Turn 21:** Tool result says “0 added, 1 updated” after confirming 7 Incident properties. This looks suspicious unless the tool groups all properties under one class update; otherwise it may indicate properties were not individually persisted.
- **Turn 22:** Tool result says “0 added, 3 updated” after confirming properties for 3 classes / 7 properties. Same ambiguity: likely class-level updates, but if property-level accounting is expected, this is a potential persistence/reporting issue.
- **Turn 23:** Tool result says “0 added, 6 updated” after confirming properties across 6 classes / 8 properties. Possible class-level update reporting, but unclear.
- **Turn 40:** Tool result says “0 added, 2 updated” after capturing allowed values for 4 properties. Potential issue: not all fixed choices may have been applied, unless grouped differently.
- **Turn 52:** Final validation claims live graph completeness, but no detailed state dump is shown. Given earlier ambiguous tool counts, the confidence of “no validation gaps” depends on trusting the tool’s opaque check.
- **Turn 52:** Final recap uses compact class names like `BusinessService`, `CommunicationUpdate`, `PostIncidentReview`, `MaterialityAssessment`, while earlier class labels were spaced (“Business Service”, etc.). Could be harmless formatting, but if ontology identifiers are label-sensitive this may be inconsistent.

## Noteworthy observations

- **Turn 1:** Good opening: the interviewer establishes that the ontology is blank and starts with acceptance-test questions/actions before modeling.
- **Turns 4–9:** Efficient class elicitation in small batches, consistently tied back to acceptance questions/actions. Good technique.
- **Turns 10–19:** Relationship elicitation is systematic and includes direction/verb confirmation. The interviewer also does a useful gap check at turn 18 before leaving relationships.
- **Turn 14–16:** The interviewer asks whether to keep reciprocal/near-duplicate relationships (evidence, commander) rather than assuming. Good clarification.
- **Turns 20–24:** Property elicitation stays focused on decision-bearing fields and explicitly avoids “nice to know” contact details unless needed. Good ontology discipline.
- **Turn 20:** The interviewer notes the tool only has `date` despite operational need for timestamps. Good transparency, though this is a modeling compromise that could affect acknowledgement/response-time calculations.
- **Turns 29–38:** Alias elicitation is careful and conservative. The interviewer correctly excludes tentative/broader aliases rather than blindly adding all suggestions.
- **Turn 41:** Good move to capture “what breaks if missing/wrong” even though the tool cannot store formal required flags; useful for rules/actions.
- **Turn 43–45:** Good state management: the interviewer does not capture `canCloseIncident` until the unresolved post-incident-review dependency is clarified.
- **Turns 48–51:** Actions are well structured with input, precondition, effect, and verification, matching the requested action list.
- **Overall:** The simulated persona is highly agreeable and often rubber-stamps proposals. The interviewer partially mitigates this by asking correction/confirmation questions, but could have elicited more bank-specific terminology and actual policy thresholds instead of mostly proposing generic ITSM defaults.
- **Missed follow-up:** For regulatory notification, the interviewer captured `requiredBy` but did not ask about regulator/jurisdiction/channel, which may be critical in a bank’s reporting workflow.
- **Missed follow-up:** Communication cadence was placed on `Incident Commander`; cadence may depend on severity/major-incident status or policy rather than the commander role. A policy/rule or incident-level cadence could have been explored.
- **Missed follow-up:** Severity and priority lists were generic; no definitions or mapping between severity/priority/business criticality were elicited.
- **Missed follow-up:** Closure rule says regulatory notification must be completed or not-required, but some regimes allow incident closure while regulatory follow-up remains open. This could have been checked like the PIR condition.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
