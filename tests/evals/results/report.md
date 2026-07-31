# Ontology-recovery eval report

Generated: 2026-07-31T06:45:30.149Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's 68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **37.4%** | **44.2%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 35.3% / 79.3% / 48.8% | 60.7% / 62.1% / 61.4% | 24/68 full · 17/28 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 6.5% / 17.5% / 9.5% | 17.1% / 17.5% / 17.3% | 7/108 full · 7/41 scoped ground-truth relationships matched; 40 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 13.5% | 23.1% | 15/111 full · 6/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 77.8% | 75.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **45.1%** | **55.6%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 38.2% / 86.2% / 53.0% | 67.9% / 69.0% / 68.4% | 26/68 full · 19/28 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 12.0% / 32.5% / 17.6% | 26.8% / 27.5% / 27.2% | 13/108 full · 11/41 scoped ground-truth relationships matched; 40 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 15.3% | 26.9% | 17/111 full · 7/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 94.5% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 62 turns, 1051s wall-clock
- Real app-agent API calls: 122 (apply_ontology_yaml called 49× · get_graph_state called 11×)
- Tool outcomes seen in transcript: 49 applied · 0 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

- **Turn 23 / Turn 60**: The interviewer excluded `Incident.issueKey` even though the Phase 1 acceptance question “What incidents have been logged for the same issue previously?” required a stable repeat-issue matching mechanism. This was caught and repaired only during final validation.
- **Turn 62**: Final validation claims “Who should be assigned to resolve this incident?” is covered by `Incident --assigned to--> Resolver Group`, but that only records the assignment after it exists. The model still lacks a way to determine/recommend the correct resolver group, e.g. `IT Service --supported by/resolved by--> Resolver Group` or routing rules.
- **Turn 62**: Final competency check refers to `Recovery Plan --forIncident--> Incident`, but the confirmed relationship was `Recovery Plan --for--> Incident`. Likely a recap/serialization naming inconsistency.

## Noteworthy observations

- **Turn 2**: Good focused follow-up on day-to-day roles and deployment contexts; it kept scope tied to the original questions/actions.
- **Turns 4–10**: Candidate class elicitation was systematic and justified, but highly leading. The persona tended to accept nearly every proposed class, resulting in many role classes that may be over-specified.
- **Turn 8**: Good modeling discipline: the interviewer avoided adding `Service Dependency` as a class and instead modeled `IT Service --depends on--> IT Service`.
- **Turns 13–21**: Strong handling of optional relationships. The interviewer repeatedly avoided adding “nice to have” communication/audience links without confirmation.
- **Turns 22–28**: “Decision-bearing properties only” framing was useful, but the interviewer still initially missed a property required by an original competency question (`issueKey`).
- **Turns 34–42**: Alias elicitation was thorough but probably inefficient. Many relationship aliases were accepted with little scrutiny, and some may be semantically loose, e.g. `detected in` for `occurs in`, or `assesses` for `monitors`.
- **Turns 47–58**: Rule/action phases were well structured around preconditions, effects, and verification. However, several rules remain qualitative rather than operational, e.g. “sev2-high requires additional impact criteria” without thresholds.
- **Turn 52–55**: Good recovery from the all-staff communication gap: the interviewer added `StakeholderCommunication.audienceType` instead of inventing an unnecessary `All Staff` class, and constrained values to the Phase 1 scope.
- **Turn 60–62**: Final validation pass was valuable and caught a real competency gap. This is a strong pattern to preserve.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
