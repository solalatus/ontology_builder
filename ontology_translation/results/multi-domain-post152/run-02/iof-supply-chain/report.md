# Ontology-recovery eval report

Generated: 2026-09-03T10:06:18.478Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **74.6%** | **85.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 58.5% / 100.0% / 73.8% | 89.3% / 80.6% / 84.7% | 31/53 full · 25/28 scoped ground-truth classes matched; 31 recovered |
| Relationship recall / precision / F1 | 73.3% / 66.7% / 69.8% | 87.0% / 60.6% / 71.4% | 22/30 full · 20/23 scoped ground-truth relationships matched; 33 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **74.6%** | **85.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 58.5% / 100.0% / 73.8% | 89.3% / 80.6% / 84.7% | 31/53 full · 25/28 scoped ground-truth classes matched; 31 recovered |
| Relationship recall / precision / F1 | 73.3% / 66.7% / 69.8% | 87.0% / 60.6% / 71.4% | 22/30 full · 20/23 scoped ground-truth relationships matched; 33 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 60.0% / 100.0% / 75.0% | 3/5 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 69.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 41.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 55.2% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 60.0% / 100.0% / 75.0% | 3/5 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 69.6% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 41.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 55.2% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 75 turns, 1068s wall-clock
- Real app-agent API calls: 163 (apply_ontology_yaml called 43× · get_graph_state called 44×)
- Tool outcomes seen in transcript: 43 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 11396038 total (11367971 prompt · 28067 completion) across 239 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3** — Tool reported `✓ Applied: 26 added, 0 updated` immediately after the persona requested mostly **updates/deletions/merges** to the competency questions. This strongly suggests the edit was misapplied rather than updating the prior question set.
- **Turn 3** — Assistant then claimed it had recorded “26 confirmed competency questions, including your reworded shipment and storage questions, the merged forwarding question, and the added umbrella traceability question,” despite the tool saying **0 updated** and despite the user having asked to **drop** one question and probably merge another. Likely state inconsistency.
- **Turn 8** — Tool again reported `6 added, 0 updated` after the persona explicitly requested several **renames** (`Transport` → `TransportProcess`, etc.). Same likely rename/update failure pattern.
- **Turn 9** — Tool reported `6 added, 0 updated` after a requested **rename** (`Forwarding service` → `freight forwarding service`), suggesting another add-vs-update bug.
- **Turn 14** — Tool reported `5 added` after only one newly confirmed edge (`Shipment --has shipment preparation process--> ...`) should have been added; likely hidden extra writes or incorrect count.
- **Turn 16** — Tool reported `10 added` when the exchange justified **3 new classes + 7 relationships**; count is plausible, but it depended on prior unresolved class-state issues (ShipFromLocation/ShipToLocation/SupplyChainNode not previously justified). This looked okay numerically but highlights fragile state transitions.
- **Turn 42** — Assistant asked for “these seven classes” and then listed **eight** classes.
- **Turn 50** — Assistant asked for “these nine relationships” and then listed **ten** relationships.
- **Turn 66** — Assistant said “All 5 actions from Phase 1 are now structurally captured” right after a turn that added only **1** item. A system message flagged this explicitly as an error.
- **Turn 67** — Assistant corrected itself well after the system warning, but the need for a system intervention indicates the agent was not reliably grounding its recap in live tool state.
- **Across turns 12–29** — Repeated pattern where the assistant proposes direct edges, the persona rejects them as too strong, and later the assistant reintroduces nearby direct links to patch coverage. Not always wrong, but it shows the interviewer repeatedly drifting toward overcommitted structure and then backing out.
- **Turn 70 onward** — “Phase 10(a)” validation surfaced real unresolved modeling gaps that should arguably have been caught earlier:
  - receive-shipment rule not grounded (`ShipToLocation` not connected to `SupplyChainNode`);
  - prepare-shipment rule referenced unsupported direct carrier wording;
  - evaluateSupplyRelationship action effect/verification mismatch.
  This indicates earlier phase completion claims were premature.

## Noteworthy observations
- **Turn 1** — Good opening move: immediately constrained the interview to competency questions/actions before ontology details.
- **Turns 2–3** — Efficient atomicization of compound questions, but somewhat over-fragmented the user’s natural questions into many test items, increasing bookkeeping burden and contributing to later state confusion.
- **Turns 4–6** — Strong scoping discipline around roles/context. Good job distinguishing core roles from nearby but optional ones (shipper/consignee) instead of bloating the model early.
- **Turns 6–10** — Generally solid class elicitation cadence: propose a batch, ask whether each is needed, and request merge/rename/exclude rationale.
- **Turns 12–20** — Good technique when the persona resisted direct edges: the assistant often switched to asking for a **path** instead of forcing a relationship. This was productive and domain-appropriate.
- **Turns 13, 22, 24, 26, 27** — Nice pattern of introducing explicit structural links only when needed to support action logic or query paths.
- **Turns 17–19** — Strong handling of traceability: the assistant accepted the expert’s preference for deriving shipment-to-traceable-unit answers through **TrackingEvent** rather than forcing direct shipment links.
- **Turns 28–33** — Mixed quality. Good persistence in ensuring every class gets at least one relationship, but this became somewhat mechanical; it pushed the interview into adding `PackagingProcess` and `LogisticsProcess` mainly to connect floating service classes, which may be methodologically sound but felt tool/prompt-driven rather than user-driven.
- **Turns 34–39** — Good challenge on excluding status/identifier properties. The assistant appropriately tested whether “none needed” was actually consistent with action verification.
- **Turns 58–65** — Strong action modeling discipline: the assistant caught when proposed action effects referenced unmodeled states (“received”, “dispatched”) and pushed the persona to restate effects using only captured facts.
- **Turn 60** — Notable positive: the assistant explicitly mentioned fixing a tool warning by making the action effect mention `eventTime` and `eventType`, showing some internal consistency checking.
- **Turns 66–75** — Good bounded expansion and validation pass in principle, but the assistant claimed phase completion several times before later discovering important gaps. The “final validation” step was useful, but it also revealed that earlier “phase complete” statements were too confident.
- **Overall** — The interviewer was generally methodical, careful about scope, and good at converting domain talk into ontology structure. The main optimization target is **state management and tool-grounded recapping**: too many “recorded”/“complete” claims were made without matching the actual applied edits.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
