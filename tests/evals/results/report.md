# Ontology-recovery eval report

Generated: 2026-07-30T20:54:35.677Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's 68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **26.9%** | **40.5%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 26.5% / 90.0% / 40.9% | 53.6% / 75.0% / 62.5% | 18/68 full · 15/28 scoped ground-truth classes matched; 20 recovered |
| Relationship recall / precision / F1 | 5.6% / 23.1% / 9.0% | 12.2% / 19.2% / 14.9% | 6/108 full · 5/41 scoped ground-truth relationships matched; 26 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 19.8% | 46.2% | 22/111 full · 12/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 37.9% | 38.6% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **36.6%** | **53.2%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 26.5% / 90.0% / 40.9% | 53.6% / 75.0% / 62.5% | 18/68 full · 15/28 scoped ground-truth classes matched; 20 recovered |
| Relationship recall / precision / F1 | 13.9% / 57.7% / 22.4% | 31.7% / 50.0% / 38.8% | 15/108 full · 13/41 scoped ground-truth relationships matched; 26 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 21.6% | 50.0% | 24/111 full · 13/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 61.4% | 61.7% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 33 turns, 479s wall-clock
- Real app-agent API calls: 77 (apply_ontology_yaml called 27× · get_graph_state called 17×)
- Tool outcomes seen in transcript: 27 applied · 0 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

- **Turn 11:** Tool result says “0 added, 3 updated” after confirming 12 properties across Incident, BusinessService, and ConfigurationItem. Similar pattern recurs later; the assistant says all properties were recorded, but the tool counts suggest only class-level records were updated, not individual properties. Could be normal batching, but it looks suspicious without visibility into state.
- **Turn 12:** Tool result “0 added, 8 updated” for properties across 8 classes; again implies class records updated rather than property-level additions. Not necessarily a bug, but the counts don’t match the assistant’s “recorded properties” wording.
- **Turn 13:** Tool result “0 added, 9 updated” for properties across 9 classes; same potential count/state ambiguity.
- **Turn 26:** Assistant says it recorded allowed values for 10 properties, but tool reports “0 added, 7 updated.” Possible missed value-list updates or misleading count.
- **Turn 27:** Assistant says it recorded 8 fixed-choice lists including the refined `DecisionOwner.decisionAuthorityLevel`, but tool reports only “0 added, 6 updated.” Potential dropped lists or misleading tool reporting.
- **Turn 28:** Assistant says it recorded RTO/RPO units and blocking significance for 7 properties, but tool reports only “0 added, 1 updated.” This is the clearest apparent mismatch; likely not all constraints/blocking notes were actually persisted.
- **Turn 32:** `initiateRecoveryProcedure` uses precondition **canDeclareRecovery**, whose conditions include recovery procedure execution status already being `completed`. This contradicts the action’s effect (“started or advanced”) and verification (“changed from not started to in progress or completed”). There should be a separate `canInitiateRecoveryProcedure` rule.
- **Turn 33:** Final validation claims it “ran the validation against the live ontology state,” but only a generic state check occurred and no explicit validation tool output is shown. This may be overstating what was actually verified.

## Noteworthy observations

- **Turn 1:** Strong opening structure: starts with acceptance-test questions/actions before modeling, which is good ontology elicitation practice.
- **Turns 3–4:** Good confirmation loop for candidate classes; correctly applied the user’s rename from `StakeholderUpdate` to `Communication`.
- **Turns 4–9:** Relationship elicitation was efficient and well batched. The interviewer repeatedly asked for direction/verb confirmation and incorporated terminology corrections.
- **Turn 8:** Good state-awareness moment: checked for isolated classes before adding additional plausible relationships.
- **Turns 16–18:** Good handling of aliases vs non-synonyms. The interviewer explicitly asked about ambiguous terms like `MI`, `service owner`, `emergency change`, and `event`, preventing bad synonym capture.
- **Turns 22–25:** Relationship alias elicitation was thorough, but somewhat verbose/repetitive. Could be compressed by asking for exceptions only after proposing aliases.
- **Turn 26:** Missed opportunity to clarify whether suggested `internal memo` should be added. Persona said “might also consider adding,” then “current list is sufficient,” so not adding is defensible, but a quick clarification could help.
- **Turn 27:** Potential conceptual issue: `DecisionOwner.decisionAuthorityLevel` allowed value `service owner` conflicts with earlier statement that “service owner” is a different role and not a synonym for DecisionOwner. It may still be a valid authority level, but the interviewer should have clarified.
- **Turn 28:** Rules were a useful transition from constraints to action preconditions. However, several proposed rules are quite high-level and not formalized enough to be machine-actionable, e.g. “assignment criteria matches.”
- **Turn 29:** `canExecuteEmergencyChange` includes “incident is related to the change,” but no condition that the incident is active/open, despite the persona glossing it as linked to an active incident. The interviewer missed this discrepancy.
- **Turn 31:** Good explanation that each action has exactly one input class and other entities must be represented through relationships/properties/preconditions.
- **Turn 33:** Final recap is clear and maps original competency questions back to ontology structures, which is a strong validation technique.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
