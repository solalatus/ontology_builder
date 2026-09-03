# Ontology-recovery eval report

Generated: 2026-09-03T07:07:54.927Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **56.7%** | **58.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 60.3% / 100.0% / 75.2% | 95.8% / 56.1% / 70.8% | 41/68 full · 23/24 scoped ground-truth classes matched; 41 recovered |
| Relationship recall / precision / F1 | 42.6% / 90.2% / 57.9% | 66.7% / 47.1% / 55.2% | 46/108 full · 24/36 scoped ground-truth relationships matched; 51 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 23.4% / 89.7% / 37.1% | 52.0% / 44.8% / 48.1% | 26/111 full · 13/25 scoped ground-truth properties matched; 29 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 88.9% | 85.7% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **58.5%** | **61.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 60.3% / 100.0% / 75.2% | 95.8% / 56.1% / 70.8% | 41/68 full · 23/24 scoped ground-truth classes matched; 41 recovered |
| Relationship recall / precision / F1 | 44.4% / 94.1% / 60.4% | 66.7% / 47.1% / 55.2% | 48/108 full · 24/36 scoped ground-truth relationships matched; 51 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 25.2% / 96.6% / 40.0% | 64.0% / 55.2% / 59.3% | 28/111 full · 16/25 scoped ground-truth properties matched; 29 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 88.9% | 85.7% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 18.2% / 100.0% / 30.8% | 2/11 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 100.0% | of 11 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 7.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 26.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 33.8% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 18.2% / 100.0% / 30.8% | 2/11 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 100.0% | of 11 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 7.2% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 26.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 33.8% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 95 turns, 2009s wall-clock
- Real app-agent API calls: 212 (apply_ontology_yaml called 54× · get_graph_state called 61×)
- Tool outcomes seen in transcript: 54 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 31492457 total (31451515 prompt · 40942 completion) across 309 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 6 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3**: Tool says **“37 added, 0 updated”** after the persona mostly provided edits/drops/additions to the proposed competency questions, but the assistant falsely states it persisted a **“normalized competency-question set”**. This is a real state mismatch; the edits were not actually applied.
- **Turn 5**: Assistant claims actions are in a **“known incomplete state”** because input classes don’t exist yet, but the tool had just **added 11 actions** anyway. This is inconsistent tool/model reasoning and appears to invent a constraint after persistence.
- **Turn 5 / system**: System reports **11 consistency problems unresolved**; assistant proceeds without reconciling them.
- **Turn 12**: Tool reports **“4 added”** after persona said only **Deployment, MajorIncident, CybersecurityIncident** are distinct classes and target/recovery environments should not be separate. Assistant says it added **Environment** too. That may be acceptable as an inferred replacement, but it is not what the yes/no prompt asked for; this is a prompt/edit application mismatch.
- **Turn 28**: Tool says **“10 added, 0 updated”** for reporting/evidence relationships; count appears inflated relative to the accepted list and includes replacing previously proposed directions without explicit removals.
- **Turn 36 / system**: Assistant says **“all 11”** were recorded, but system flags that the turn actually added **1** and updated **0**. Clear count/reporting bug.
- **Turn 58**: After persona says **“Incident commander needed separately”**, assistant says **“Captured and persisted”** plus a recap about Phase 5 relationship meanings; but the tool shows only a state check, not an addition. Assistant did **not** actually add IncidentCommander until turn 59. Real persistence mismatch.
- **Turn 61**: Assistant says it added the major-incident rule and updated Incident severity/IncidentCommander meaning. System then flags another bad count summary. The assistant repeatedly misreports change counts.
- **Turn 83**: After persona says **“Incident response team needed separately”**, assistant again claims **“Captured and persisted”** but tool shows no such addition. Then it moves on without ever adding the class. Real dropped requirement / false persistence claim.
- **Turn 92**: Tool shows **“0 added, 2 updated”** immediately before assistant gives a large validation summary, but assistant doesn’t explain what those 2 updates were. Likely hidden/misattributed edits during validation.
- **Turn 95**: Persona answered **“Yes”** to updating `sendStakeholderCommunication` effect wording, but there is **no tool apply result** and assistant jumps straight to final validation summary. The requested edit appears not to have been applied.

## Noteworthy observations
- **Turn 2**: Good move splitting multi-part competency questions into atomic ones; efficient requirements shaping.
- **Turn 3**: Persona gave a very high-quality correction batch. Assistant should have explicitly reconciled **keep/reword/drop/add** instead of pretending normalization was complete.
- **Turns 6–12**: Class elicitation was generally disciplined and incremental, but became somewhat mechanical; many turns were spent on yes/no confirmations that could have been batched more aggressively.
- **Turns 17–21**: Good technique in refusing to introduce shortcut relationships the expert rejected. The assistant did well to ask about **Application** and **InfrastructureComponent** rather than collapsing them into ConfigurationItem.
- **Turns 21–24**: The assistant drifted into ontology expansion driven by one illustrative example (**Database**, then **StorageSystem**), creating extra turns. Useful, but arguably over-expanded before finishing core operational rules.
- **Turns 28–33**: Strong handling of tool limitations around subtype/specialization; assistant explicitly surfaced that the tool can’t do inheritance and asked for operational connectors instead.
- **Turns 33–36**: Good distinction between **structural facts** and **assignment/routing rules**. Assistant preserved that resolver-group support coverage was conditional logic, not a standing relationship.
- **Turns 36–44**: Property elicitation was mostly effective. Good that the assistant accepted pushback and replaced weak generic properties with operationally meaningful ones.
- **Turns 45–55**: Meaning-sentence collection was exhaustive but fairly tedious. Could likely be compressed or deferred; low-value compared with unresolved rule/action gaps.
- **Turns 56–64**: Important catch that **IncidentCommander** was a new concept introduced inside a rule. Good follow-up.
- **Turns 61–64**: Good modeling discipline around regulatory notification completeness: assistant resisted inventing a “completeness” property just to make the rule machine-checkable.
- **Turns 64–80**: Action repair loop was useful, but exposed that the assistant had allowed action records to persist in a broken state earlier. Several later turns were spent patching avoidable structural issues.
- **Turns 68–80**: Assistant did a commendable job distinguishing **model-checkable verification** from **external/tool verification** instead of overclaiming ontology support.
- **Turns 80–93**: Validation was decent and candid about partial coverage, but the assistant should have fixed or explicitly persisted the wording refinements for `assignIncident`, `sendStakeholderCommunication`, `submitRegulatoryNotification`, and `executeEmergencyChange` instead of mostly narrating them.
- **Overall**: Interview technique was generally strong: focused questions, recaps, and good ontology hygiene. Main weaknesses were **false claims about persistence**, **misreported tool counts**, and occasionally continuing despite system/tool warnings without reconciling state first.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
