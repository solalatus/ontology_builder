# Ontology-recovery eval report

Generated: 2026-07-31T11:28:25.263Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's 68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **40.1%** | **53.4%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 30.9% / 82.6% / 45.0% | 57.1% / 69.6% / 62.7% | 21/68 full · 16/28 scoped ground-truth classes matched; 23 recovered |
| Relationship recall / precision / F1 | 6.5% / 13.7% / 8.8% | 12.2% / 9.8% / 10.9% | 7/108 full · 5/41 scoped ground-truth relationships matched; 51 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 23.4% | 57.7% | 26/111 full · 15/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 83.3% | 82.4% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **46.2%** | **62.5%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 32.4% / 87.0% / 47.2% | 60.7% / 73.9% / 66.7% | 22/68 full · 17/28 scoped ground-truth classes matched; 23 recovered |
| Relationship recall / precision / F1 | 16.7% / 35.3% / 22.6% | 31.7% / 25.5% / 28.3% | 18/108 full · 13/41 scoped ground-truth relationships matched; 51 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 25.2% | 65.4% | 28/111 full · 17/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 89.8% | 89.7% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 48 turns, 909s wall-clock
- Real app-agent API calls: 88 (apply_ontology_yaml called 36× · get_graph_state called 4×)
- Tool outcomes seen in transcript: 36 applied · 0 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

- **Turn 41–42:** `canCloseIncident` includes conditions that are not fully modeled: “root cause explicitly not required for closure,” “required stakeholder communications,” and “corrective action needed before closure” have no corresponding properties/relationships to evaluate them reliably.
- **Turn 41–42:** `requiresRegulatoryNotification` mixes the decision “is notification required?” with submission-readiness checks such as authority/jurisdiction linkage and `submissionDueAt`. If `submissionDueAt` is missing, the rule could incorrectly say notification is not required rather than “required but incomplete.”
- **Turn 45–46:** `isolateConfigurationItem` has input class `ConfigurationItem` but uses `canContainIncident`, whose conditions depend on an incident and containment action. The action definition does not specify how the related Incident/ContainmentAction is selected from the single input, so the precondition may be under-bound.
- **Turn 32 / Turn 48:** The live graph normalized `supportedByITService` as `supportedByItservice`. The assistant notes this, but it is still an implementation naming defect that may cause awkward or inconsistent API/query behavior.
- **Turn 39–40:** Some fixed-choice lists were malformed in the transcript formatting, e.g. `Communication.status` and `RootCause.status` have the “Breaks If Missing or Wrong” text visually nested under the last allowed value. The assistant did not explicitly guard against accidentally capturing explanatory text as a value.

## Noteworthy observations

- **Turn 1–4:** Strong opening technique: the interviewer began with real competency questions/actions before modeling, then summarized and confirmed scope.
- **Turn 5–9:** Good incremental class elicitation with explicit inclusion/exclusion decisions; avoided modeling Incident Response Team Member, Technical Team, and Regulatory Compliance Team when not needed.
- **Turn 10–21:** Relationship elicitation was systematic and tied back to acceptance questions/actions. The live-graph check at turn 20 caught the missing direct `Incident → ConfigurationItem` relationship.
- **Turn 16–18:** The interviewer handled derived-vs-direct links well, asking whether stakeholder and jurisdiction relationships should be direct or inferred.
- **Turn 22–26:** Property elicitation stayed mostly decision/action focused, but the persona largely rubber-stamped proposed fields. The interviewer could have pushed harder for bank-specific terminology rather than accepting generic ITSM values.
- **Turn 24–25:** Good discipline excluding `RegulatoryAuthority.submissionChannel` as “nice to know,” though this might merit a follow-up because `submitRegulatoryNotification` could depend on submission channel in real workflows.
- **Turn 30–35:** Alias elicitation was useful and explicitly warned against keeping merely related terms. However, some accepted aliases are questionable as true synonyms, e.g. `ConfigurationItem` = “asset/component,” `Workaround` = “mitigation,” and `RootCause` = “cause.”
- **Turn 36–40:** Fixed-choice elicitation was comprehensive, but many values appear generic/simulated. Missed opportunity to ask for exact lifecycle state machines or valid transitions, especially for Incident, Change, Communication, and RegulatoryNotification.
- **Turn 41–43:** Decision-rule phase was valuable, but the interviewer proposed complex rules and received confirmation without probing edge cases, exceptions, or “all vs any” logic.
- **Turn 44–46:** Action definitions were clear and consistently included input class, precondition, effect, and verification. The “exactly one input class” constraint, however, created under-specification for actions involving multiple operational objects.
- **Turn 47–48:** Final validation against the original 20 questions and 10 actions was a good closing step and caught one remaining language-layer gap.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
