# Ontology-recovery eval report

Generated: 2026-09-02T18:21:39.115Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **75.5%** | **51.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 61.8% / 95.5% / 75.0% | 91.7% / 50.0% / 64.7% | 42/68 full · 22/24 scoped ground-truth classes matched; 44 recovered |
| Relationship recall / precision / F1 | 57.4% / 89.9% / 70.1% | 83.3% / 43.5% / 57.1% | 62/108 full · 30/36 scoped ground-truth relationships matched; 69 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 75.7% / 88.4% / 81.6% | 80.0% / 21.1% / 33.3% | 84/111 full · 20/25 scoped ground-truth properties matched; 95 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **76.1%** | **52.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 63.2% / 97.7% / 76.8% | 95.8% / 52.3% / 67.6% | 43/68 full · 23/24 scoped ground-truth classes matched; 44 recovered |
| Relationship recall / precision / F1 | 57.4% / 89.9% / 70.1% | 83.3% / 43.5% / 57.1% | 62/108 full · 30/36 scoped ground-truth relationships matched; 69 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 75.7% / 88.4% / 81.6% | 80.0% / 21.1% / 33.3% | 84/111 full · 20/25 scoped ground-truth properties matched; 95 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 27.3% / 42.9% / 33.3% | 3/11 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 100.0% | of 11 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 20.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 50.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 38.0% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 27.3% / 42.9% / 33.3% | 3/11 ground-truth rules matched (core condition equivalence, not name alone); 7 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 100.0% | of 11 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 20.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 50.0% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 38.0% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 93 turns, 1610s wall-clock
- Real app-agent API calls: 198 (apply_ontology_yaml called 49× · get_graph_state called 49×)
- Tool outcomes seen in transcript: 49 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 22756302 total (22709942 prompt · 46360 completion) across 306 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 3 app-agent error turn(s) (generic=3), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 13** — Tool reports `✓ Applied: 17 added, 0 updated` after the user only confirmed 5 new classes plus a handful of relationships. Count looks implausibly high and suggests opaque/miscounted edits.
- **Turn 17** — Assistant says the tool “flagged one likely contradiction” between `Incident resolvedBy Change` and `Change justifiedBy Incident`, but no such tool output is shown. Looks like invented tool feedback.
- **Turn 19** — Tool says “only one edit is applied per message,” forcing a cleanup-only turn. This is a real tool limitation that caused extra turns and state-management overhead.
- **Turn 21** — Assistant says the tool raised “another inverse-pair warning” for `EmergencyChange justifiedBy Incident` vs `Incident resolvedBy EmergencyChange`, but again no warning is shown in tool output. Likely fabricated/assumed tool feedback.
- **Turn 52 / 54 / 56 / 61 / 64** — Repeated duplicate-edge situations caused by relationship-name normalization (`impactsITService`, `supportsITService`, etc.). This looks like a genuine ontology-edit bug/pathology: meaning updates are creating duplicate edges instead of annotating existing ones.
- **Turn 59 / 62 / 79** — `Something went wrong contacting the agent.` Multiple runtime interruptions; interviewer recovers, but these are real failures.
- **Turn 66** — User provided allowed values for 10 properties, but tool reports only `0 added, 2 updated`. Severe mismatch between requested/presented edits and applied count; likely partial persistence or bad reporting.
- **Turn 76** — Assistant says it “recorded the first action batch and added” properties, while tool output shows two separate apply messages and a remaining unresolved consistency problem. State is partly unstable here.
- **Turn 76–78** — Assistant claims “The tighter phrasings are in the model now” at turn 77, but there is no successful apply output until turn 78. Mild state overclaim.
- **Turn 83** — Assistant says “All 11 actions … are now represented” immediately after a step that only updated 1 item; system explicitly flags this as a misstatement. Clear state-summary bug.
- **Turn 93** — Assistant again says “all 11 named actions are captured” in a summary attached to a single-item update, and system again flags the misleading phrasing. Repeated failure to respect tool/system correction about reporting true last-step counts.
- **Throughout late phases** — Assistant repeatedly says it has “persisted” or “captured” large conceptual bundles after tool outputs showing only a few updates. Even if conceptually true over many turns, the wording often blurs cumulative state vs. the last actual tool commit.

## Noteworthy observations
- **Turn 2** — Good canonicalization move, but the first rewrite expanded 12 business questions into 20 ontology questions too aggressively. Persona had to pull it back; interviewer initially over-atomized.
- **Turn 3** — Good recovery: interviewer accepted corrections and tightened to the expert’s 10-question set before proceeding.
- **Turn 4** — Follow-up about roles/context was useful, but it interrupted the action capture flow before persisting actions. Mild inefficiency / phase drift.
- **Turn 6 onward** — Interviewer generally did a strong job batching candidate classes and asking keep/drop with justification tied to competency questions.
- **Turn 12** — Strong prompt behavior: explicitly adapted modeling strategy to tool limitation (“no subclassing”) instead of pretending taxonomy support existed.
- **Turns 13–36** — Relationship elicitation was thorough and mostly disciplined, but quite long. The interviewer sometimes asked candidate-link laundry lists that the expert repeatedly pruned; could be optimized by asking for “must-have direct links only.”
- **Turns 15–18** — Good handling of nuanced distinction between remediation outcome and governance justification for emergency changes. This is a genuine modeling subtlety the interviewer surfaced well.
- **Turn 21–23** — Good catch that cyber branch should connect via `CybersecurityIncident` rather than overconnecting `SecurityEvent` directly to everything.
- **Turns 30–33** — Good restraint: interviewer checked whether to add shortcut links for corrective actions and workaround/runbook/service bindings instead of assuming them.
- **Turns 35–36** — Nice bounded-expansion behavior: new classes (`MonitoringTool`, `CloudService`, `Bank`) were introduced only after the expert explicitly motivated them.
- **Turns 37–46** — Property elicitation was methodical and generally strong. Good clarification that `Incident.category` is not the same as the cyber/non-cyber branch distinction.
- **Turns 46–65** — Language-layer pass was efficient in batches, but the duplicate-edge normalization bug repeatedly consumed turns. The agent handled cleanup consistently, but the prompt/tooling should likely avoid re-“adding” edges when only annotating meanings.
- **Turn 49** — Good tiny QA note about “A application...” typo; however, it was not actually cleaned up later.
- **Turns 71–74** — Rules elicitation was thoughtful. Especially good move to rephrase closure conditions to facts already in the model instead of inventing a residual-condition property.
- **Turns 74–93** — Action modeling was pragmatic and realistically constrained by tool/parser limitations. The interviewer did well to simplify verification text when parser stability demanded it rather than forcing richer but uncheckable logic.
- **Turns 75 / 80 / 82 / 88 / 90 / 92** — Strong behavior: instead of bloating the ontology with execution-detail artifacts, the interviewer explicitly asked which details to keep out and simplified rules/actions to fit current scope.
- **Turn 85** — Final validation step was useful and surfaced real remaining gaps; this was one of the better moments in the interview.
- **Overall** — The interviewer was generally strong at ontology discipline, scope control, and adapting to tool limits. Biggest optimization opportunities are:
  - reduce repetitive duplicate-cleanup churn caused by name normalization,
  - avoid claiming unseen tool warnings,
  - be more precise distinguishing cumulative model state from the last applied edit,
  - trim some long candidate-list questioning in the relationship phase.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
