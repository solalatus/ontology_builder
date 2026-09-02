# Ontology-recovery eval report

Generated: 2026-09-02T18:12:59.187Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **71.8%** | **89.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 45.3% / 100.0% / 62.3% | 82.1% / 95.8% / 88.5% | 24/53 full · 23/28 scoped ground-truth classes matched; 24 recovered |
| Relationship recall / precision / F1 | 63.3% / 86.4% / 73.1% | 78.3% / 81.8% / 80.0% | 19/30 full · 18/23 scoped ground-truth relationships matched; 22 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **73.1%** | **91.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 45.3% / 100.0% / 62.3% | 82.1% / 95.8% / 88.5% | 24/53 full · 23/28 scoped ground-truth classes matched; 24 recovered |
| Relationship recall / precision / F1 | 66.7% / 90.9% / 76.9% | 82.6% / 86.4% / 84.4% | 20/30 full · 19/23 scoped ground-truth relationships matched; 22 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 60.0% / 100.0% / 75.0% | 3/5 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 60.0% / 75.0% / 66.7% | 3/5 ground-truth actions matched by name/meaning; 4 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 58.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 46.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 51.2% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 60.0% / 100.0% / 75.0% | 3/5 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 60.0% / 75.0% / 66.7% | 3/5 ground-truth actions matched by name/meaning; 4 recovered |
| Action input-class accuracy | 100.0% | of 3 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 58.9% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 46.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 51.2% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 69 turns, 1123s wall-clock
- Real app-agent API calls: 127 (apply_ontology_yaml called 31× · get_graph_state called 21×)
- Tool outcomes seen in transcript: 31 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 6071821 total (6050783 prompt · 21038 completion) across 206 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: Duplicate domain intro appears as both `persona` (turn 0) and `app-user` (turn 1). Likely transcript plumbing issue / user-message duplication.
- **Turn 4**: Tool applied ontology edits before the assistant had explicitly confirmed the user’s latest answer in that turn; not clearly wrong, but the sequence suggests background persistence without transparent itemization.
- **Turn 43**: User answer is internally contradictory (“Freight forwarding service status/state — keep” then immediately corrected to “drop”), and the assistant/tool only applied one update. The assistant handled the correction verbally, but this is a fragile parsing case.
- **Turn 63**: Real tool limitation surfaced: “only one edit is applied per message.” This caused partial application and required an extra confirmation turn to finish updates. That’s a genuine workflow/tooling bug or limitation.
- **Turn 66**: Two consecutive ontology-state checks with no apparent reason. Looks like redundant tool invocation.
- **Turn 66**: Validation recap claims “Every class and relationship has a meaning sentence,” but relationship meanings were not actually elicited in this transcript—only aliases were discussed, and the assistant merely asserted relationship meanings already existed.
- **Turn 66**: Validation recap says “No consistency errors are outstanding” while simultaneously listing multiple uncovered competency-question gaps and an action-model mismatch. Not a hard contradiction if “consistency” is narrowly structural, but it reads misleadingly overconfident.

## Noteworthy observations
- **Turn 1**: Strong opening move: asks for business questions first rather than classes/properties. Good ontology-elicitation practice.
- **Turns 3–4**: Good discipline around atomic competency questions; the interviewer usefully distinguished broad business questions from drill-down acceptance-test variants.
- **Turns 4–6**: Good role hygiene: separates external supply-chain roles from internal business functions instead of flattening them into one actor model.
- **Turns 7–11**: Efficient class elicitation in coherent batches tied back to confirmed questions/actions; generally strong.
- **Turns 13–18**: Excellent pushback handling. The assistant let the expert reframe “facility” vs “location” vs “supply-chain node” rather than forcing premature simplification.
- **Turns 18–22**: Strong avoidance of overmodeling. The assistant repeatedly checked whether to add direct links vs derive through process/service structure.
- **Turns 27–31**: Very good recovery pattern when classes were introduced but left disconnected: the assistant did not invent links and instead explicitly removed unsupported classes (`FreightForwardingProcess`, `TransportationService`, `Sublot`).
- **Turns 31–40**: Also good scope control on actions: removed `receiveShipment` and `dispatchShipment` when they could not be honestly supported/verified.
- **Turns 57–64**: Good alignment work between rules and actions; especially careful about not recording the freight-forwarding branch of a rule without a Shipment→Service path.
- **Turn 61**: Nice catch that `recordTrackingEvent` verification had to match its actual modeled effect.
- **Turn 66**: The “validation pass” was useful, but a bit too sweeping/confident. It surfaced real remaining gaps, yet also introduced dubious claims about completed meaning coverage.
- **Overall**: The interviewer was unusually disciplined about pruning scope and refusing speculative links. Main weakness is some verbosity/recap overhead; many turns restated large chunks of state before asking a small follow-up, which likely lengthened the interview significantly.
- **Overall**: Missed opportunity to normalize competency-question numbering/names earlier. Late-stage references like “cq4/cq6/cq7” appeared only after many rewordings, making traceability harder than necessary.
- **Overall**: The agent handled contradictions and partial support well, but depended heavily on repeated confirmations after tool edits. A better prompt/tool contract could reduce these extra “confirm summary” turns.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
