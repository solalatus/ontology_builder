# Ontology-recovery eval report

Generated: 2026-07-30T14:15:24.817Z

## Headline metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's 68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **30.0%** | **40.7%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 29.4% / 86.4% / 43.9% | 60.7% / 72.7% / 66.2% | 20/68 full · 17/28 scoped ground-truth classes matched; 22 recovered |
| Relationship recall / precision / F1 | 4.6% / 17.9% / 7.4% | 9.8% / 14.3% / 11.6% | 5/108 full · 4/41 scoped ground-truth relationships matched; 28 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 10.8% | 19.2% | 12/111 full · 5/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 57.8% | 66.0% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 53 turns, 707s wall-clock
- Real app-agent API calls: 96 (apply_ontology_yaml called 38× · get_graph_state called 5×)
- Tool outcomes seen in transcript: 38 applied · 0 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

- **Turn 16:** The assistant said it needed to check the live graph but did not call the tool until after the persona responded in turn 17. This caused an awkward state/control handoff where the persona effectively commented on an internal validation step.
- **Turn 44–46:** `canCreateRegulatoryNotificationTask` uses the condition “no existing open regulatory notification task,” but `RegulatoryNotificationTask.status` has no `open` value. It should likely mean no existing task with status `created`, `in-progress`, or `submitted`, or the term “open” should have been defined.
- **Turn 48–49:** `initiateRecoveryPlan` says the recovery plan is “marked as initiated,” but no property/status value was modeled to represent “initiated.” The verification only checks `Incident —usesRecoveryPlan→ RecoveryPlan`, so the effect is partly unsupported by the ontology.
- **Turn 52–53:** After adding the late relationship **Incident —hasStakeholder→ Stakeholder**, the assistant immediately assigned a meaning and aliases without running the same confirmation process used for other relationship meanings/aliases. This new relationship also bypassed the earlier Phase 5 language-layer review.

## Noteworthy observations

- **Turn 1:** Strong start: the interviewer correctly began with competency/acceptance questions rather than jumping into ontology design.
- **Turn 4:** Good class elicitation technique: proposed candidate classes from the acceptance questions and explicitly asked about keep/remove/merge/rename.
- **Turns 5–18:** Relationship elicitation was well paced in batches and repeatedly asked about directionality and whether direct links were needed versus indirect paths.
- **Turns 9–10:** Good disambiguation of “time to restore” into three distinct properties: service target, incident actual, and recovery-plan objective.
- **Turn 12:** Good discipline in not creating a `RegulatoryCriteria` class when the expert clarified it should be rule logic.
- **Turn 22:** The interviewer appropriately pushed back on adding `Application.criticality` despite the persona approving it, because it was not tied to a Phase 1 question/action or rule.
- **Turns 28–31:** Alias elicitation was careful and useful, especially excluding misleading aliases like “major incident,” “server,” and general “notification.”
- **Turn 43:** Strong rule-tightening move: the interviewer separated precise regulatory-notification conditions from vague/unmodeled ones and avoided encoding fuzzy thresholds.
- **Turns 44–46:** Action precondition rules covered the original actions well, but several were somewhat generic/redundant, e.g. “status is `new` or `investigating`” plus “not `closed` or `cancelled`.”
- **Turn 51:** The “direct-pair gap” check for stakeholders may encourage over-modeling. The existing path through **Communication** was already process-accurate; adding **Incident —hasStakeholder→ Stakeholder** is useful but denormalizes the model.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
