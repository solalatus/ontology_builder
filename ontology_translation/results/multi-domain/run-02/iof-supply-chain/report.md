# Ontology-recovery eval report

Generated: 2026-08-22T16:59:02.667Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **75.3%** | **83.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 50.9% / 100.0% / 67.5% | 75.0% / 77.8% / 76.4% | 27/53 full · 21/28 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 66.7% / 95.2% / 78.4% | 69.6% / 76.2% / 72.7% | 20/30 full · 16/23 scoped ground-truth relationships matched; 21 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **76.6%** | **84.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 50.9% / 100.0% / 67.5% | 75.0% / 77.8% / 76.4% | 27/53 full · 21/28 scoped ground-truth classes matched; 27 recovered |
| Relationship recall / precision / F1 | 70.0% / 100.0% / 82.4% | 73.9% / 81.0% / 77.3% | 21/30 full · 17/23 scoped ground-truth relationships matched; 21 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 100.0% / 80.0% | 100.0% / 100.0% / 100.0% | 2/3 full · 2/2 scoped ground-truth properties matched; 2 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 100.0% / 88.9% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 51.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 60.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 67.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 80.0% / 100.0% / 88.9% | 4/5 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 51.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 60.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 67.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **pleasantry_loop_detected**, after 63 turns, 1254s wall-clock
- Real app-agent API calls: 107 (apply_ontology_yaml called 39× · get_graph_state called 5×)
- Tool outcomes seen in transcript: 39 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 3472593 total (3450513 prompt · 22080 completion) across 225 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 5**
  - Assistant says the tool “correctly rejected” the 5 actions because input classes weren’t confirmed, but the tool output immediately before was **“✓ Applied: 5 added, 0 updated.”** This is a clear contradiction / state-tracking bug.
- **Turn 5**
  - System reports **“The agent left 5 consistency problem(s) unresolved — see Check.”** The assistant does not inspect or address them directly, and instead continues the interview.
- **Turn 9**
  - Persona says **Product: no — use MaterialTradeItem** and **Lot: yes, but broader class is TraceableResourceUnit**. Tool reports **6 added**, and assistant recap still says **Lot** was kept and **MaterialTradeItem / TraceableResourceUnit** remained only “open candidate replacements/additions not yet confirmed.” That looks like a misapplied or misleading state recap.
- **Turn 13**
  - Tool says **“✓ Applied: 1 added, 0 updated”** after merely confirming the class list. No clear new class was introduced in that turn, so this suggests a tool/application mismatch or unexplained edit.
- **Turn 22**
  - Tool says **“✓ Applied: 3 added, 0 updated”** when the user only confirmed a single new class (**FreightForwardingService**) and the assistant says it captured 1 class + 2 relationships that were only discussed in prior turns. This may be valid deferred persistence, but from the transcript it looks like batched / delayed application that obscures state.
- **Turn 28**
  - Assistant explicitly notes it **cannot remove Consignee** from the live graph due to tool limitations. This leaves the persisted ontology knowingly out of sync with the agreed scope.
- **Turn 32–33**
  - Persona approves **event time** and **event type**, but assistant records **eventTime — type: date** even though the persona only said “time,” not “date.” Minor modeling overcommitment.
- **Turn 57**
  - Persona rejects the proposed predicates and gives corrected wording (**depends on supplier/customer/material trade item**). Tool reports **3 added, 1 updated** even though these are effectively replacements of the proposed links; plausible, but the persistence semantics are muddy.
- **Overall**
  - The transcript repeatedly shows tool “Applied” counts that do not cleanly align with what was just confirmed, making it hard to trust whether the interviewer has an accurate model state at each step.

## Noteworthy observations
- **Turn 1**
  - Good opening move: starts with competency questions before ontology structure.
- **Turns 2–4**
  - Strong elicitation technique: asks for selective cleanup/splitting of mixed questions before recording.
- **Turns 5–12**
  - Generally good discipline in distinguishing **distinct classes** from **broader/narrower variants** and refusing to create subclasses without operational justification.
- **Turns 13–18**
  - Positive behavior: when the first relationship batch is rejected, the assistant recognizes it overcommitted and backtracks instead of arguing.
- **Turns 14–18**
  - The assistant does a good job surfacing missing classes only when needed by rejected relationships. Efficient and grounded.
- **Turns 18–30**
  - Interview becomes somewhat inefficient: repeated attempts to force direct **Shipment → process/service** relationships despite the persona repeatedly signaling those links are not confirmable from current scope. Could have pivoted earlier to mark them as intentional open issues.
- **Turns 23–30**
  - Good methodological discipline: distinguishes **typing/subclassing** from **operational relationships** and avoids recording disguised is-a links in the relationship phase.
- **Turns 27–30**
  - Mixed: useful recovery by asking whether underconnected classes should stay in scope, but it also reveals the agent had allowed several classes into the model before securing any operational links for them.
- **Turns 31–36**
  - Good property minimalism: assistant correctly refuses to duplicate relationships as properties and trims back to only justified properties.
- **Turn 35**
  - Nice prompt hygiene: challenges **FreightForwarder.status** rather than accepting an unjustified property.
- **Turns 44–50**
  - Good rule-handling: records only the subset of rule conditions currently supported by the model and leaves unsupported conditions explicitly open.
- **Turns 52–54**
  - Strong debugging behavior: assistant responds appropriately to reachability warnings by simplifying action definitions to what the model can actually support.
- **Turns 59–61**
  - Very good endgame behavior: explicit validation pass, honest accounting of partial coverage, and a clear open-items list instead of pretending completion.
- **Overall**
  - The interviewer is generally careful, conservative, and methodologically strong.
  - Main weakness is **state/tool transparency**: several “applied” edits don’t match the immediate conversational step, which creates ambiguity about whether the assistant truly knows the current ontology contents.
  - Another weakness is occasional **over-insistence on direct named relationships**, even when the expert keeps framing some concepts as action preconditions rather than stable ontology links.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
