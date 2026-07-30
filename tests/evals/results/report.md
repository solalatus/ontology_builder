# Ontology-recovery eval report

Generated: 2026-07-30T15:07:49.716Z

## Headline metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the fixture's 68-class comprehensive reference model; **practical scope** is the subset the fixture's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **27.0%** | **35.9%** | equal-weighted: class F1, relationship F1, property recall, value fidelity |
| Class recall / precision / F1 | 32.4% / 70.0% / 44.3% | 57.1% / 50.0% / 53.3% | 22/68 full · 16/28 scoped ground-truth classes matched; 30 recovered |
| Relationship recall / precision / F1 | 9.3% / 23.3% / 13.2% | 17.1% / 16.3% / 16.7% | 10/108 full · 7/41 scoped ground-truth relationships matched; 43 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall | 25.2% | 42.3% | 28/111 full · 11/26 scoped ground-truth properties matched (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 25.2% | 31.3% | average allowed-value overlap across matched controlled-value properties |

## Run stats

- Interviewer model: `gpt-5.5-2026-04-23` · Persona model: `gpt-4o-mini` · Classifier model: `gpt-5.5-2026-04-23`
- Stopped: **app_agent_appears_finished**, after 45 turns, 903s wall-clock
- Real app-agent API calls: 87 (apply_ontology_yaml called 36× · get_graph_state called 6×)
- Tool outcomes seen in transcript: 36 applied · 0 skipped · 0 no-op · 0 error

## LLM review of the conversation

## Errors

- **Turn 14, 15, 16, 18, 33, 34, 35, 45:** Tool reports such as “0 added, 3 updated” for property/value additions are ambiguous and suggest properties may be stored as updates to classes rather than distinct additions. Not necessarily wrong, but hard to audit from transcript.
- **Turn 38:** The assistant says it recorded six rules “with the corrective-action ownership condition removed,” but the persona had only said the condition was “Not Recommended” unless structure exists. The app did not explicitly re-present the modified `canTrackCorrectiveAction` rule before applying it, so the actual stored version is not independently confirmed.
- **Turn 45:** Final validation claims “Every class has at least one relationship.” Likely true after added relationships, but no ontology dump is shown; reviewer cannot verify. Minor transparency issue rather than a clear bug.

## Noteworthy observations

- **Turn 1:** Strong opening: established phases and acceptance-test approach before modeling.
- **Turn 2:** Good targeted follow-up about roles and deployment context before proposing classes.
- **Turn 3:** Candidate class list was comprehensive but accepted all 29 classes with little pruning; interviewer could have challenged whether many role classes should be subtypes/instances of a common `Person/Role/Team`.
- **Turns 4–12:** Relationship elicitation was systematic and batched well. The agent also checked state and noticed `Deployment Context` was unconnected, which is good ontology hygiene.
- **Turn 11:** Good catch adding `CommunicationUpdate` as a class based on acceptance-test wording.
- **Turns 13–18:** Property elicitation stayed tied to decision/action needs and handled ambiguous unit for `estimatedRecoveryTime` properly by pausing to get a single standard.
- **Turns 23–31:** Alias elicitation was unusually thorough, including explicit rejection of misleading near-synonyms. This is useful but quite lengthy/repetitive.
- **Turn 35:** Good handling of tool limitation: explained that required-property constraints cannot be stored directly and would instead inform rules/action preconditions.
- **Turn 36–38:** Rule elicitation was well grounded in actions. The assistant correctly flagged that corrective-action ownership lacked a relationship/property before adding it.
- **Turn 39:** Good adaptation to action tool constraint of “one input class,” explaining how other participants are represented through relationships and rules.
- **Turn 42:** Strong validation behavior: checked live graph against original questions and found missing direct relationships.
- **Turn 44:** Excellent final gap detection: noticed DR test needed `testedAt` and `result` to answer “last disaster recovery test results.”
- **Overall:** The simulated persona mostly rubber-stamped suggestions; the interviewer compensated somewhat by asking about misleading aliases and state gaps, but could have used more open-ended domain probing for bank-specific severity/materiality thresholds, regulatory timing deadlines, communication approval rules, and evidence retention requirements.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
