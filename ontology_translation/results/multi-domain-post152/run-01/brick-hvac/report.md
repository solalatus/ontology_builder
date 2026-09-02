# Ontology-recovery eval report

Generated: 2026-09-02T18:09:16.366Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **72.3%** | **63.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 71.8% / 100.0% / 83.6% | 88.9% / 57.1% / 69.6% | 28/39 full · 16/18 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 77.1% / 79.4% / 78.3% | 73.7% / 41.2% / 52.8% | 27/35 full · 14/19 scoped ground-truth relationships matched; 34 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 38.1% / 100.0% / 55.2% | 68.8% / 68.8% / 68.8% | 16/42 full · 11/16 scoped ground-truth properties matched; 16 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **75.2%** | **67.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 71.8% / 100.0% / 83.6% | 94.4% / 60.7% / 73.9% | 28/39 full · 17/18 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 85.7% / 88.2% / 87.0% | 84.2% / 47.1% / 60.4% | 30/35 full · 16/19 scoped ground-truth relationships matched; 34 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 38.1% / 100.0% / 55.2% | 68.8% / 68.8% / 68.8% | 16/42 full · 11/16 scoped ground-truth properties matched; 16 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 75.0% / 54.5% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 32.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 24.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 39.9% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 42.9% / 75.0% / 54.5% | 3/7 ground-truth rules matched (core condition equivalence, not name alone); 4 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 32.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 24.8% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 39.9% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 55 turns, 865s wall-clock
- Real app-agent API calls: 103 (apply_ontology_yaml called 37× · get_graph_state called 8×)
- Tool outcomes seen in transcript: 37 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 4015309 total (3990651 prompt · 24658 completion) across 168 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 2 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3**
  - Tool says `✓ Applied: 21 added`, but the user had provided ~12 questions plus a split of item 11. The count seems implausible / unexplained.
- **Turn 6**
  - Two tool writes in a row (`5 added` then `2 added`) after the persona asked to persist only five core actions and treat the other three as non-actions. Assistant says it added placeholder classes, but the extra write is opaque and suggests state mutation beyond what was requested.
- **Turn 6**
  - System warns: `The agent left 5 consistency problem(s) unresolved — see Check.` The assistant proceeds anyway and does not inspect/resolve them before continuing.
- **Turn 19**
  - Assistant introduces new class **Economizer** after declaring the class phase complete, then notes it will need later checks. Not fatal, but indicates phase discipline/state management drift.
- **Turn 40–42**
  - Assistant adds `Zone isServedBy Thermostat`, immediately hits an inverse-pair warning, then removes it. This was avoidable because the tool constraint (“one directed relationship per connection”) should have been anticipated before applying the edit.
- **Turn 51**
  - Validation reports deterministic open issues and “automated second-opinion findings,” but the session ends without a final validation/check showing all non-intentional issues cleared. Final “usable state” claim is not backed by a final tool check after the last edits.
- **Turn 55**
  - Final recap claims **21 competency questions**. The transcript does not make that number clearly auditable from the captured list; likely a carryover from the suspicious tool count at turn 3.

## Noteworthy observations
- **Turn 1**
  - Good opening structure: starts from competency questions before classes/properties.
- **Turns 2–5**
  - Strong interviewing move: forces atomicity on questions/actions and gets the persona to distinguish first-class actions from checks/reasoning tasks.
- **Turn 3**
  - Good follow-up on roles/context, but somewhat process-heavy; risks slowing momentum before enough domain structure is captured.
- **Turns 6–18**
  - Generally good discipline in keeping classes/relationships justified by accepted questions and actions, with repeated “do we really need this?” checks.
- **Turns 8–10**
  - Nice adaptation to tool limitation (“no subclassing”); interviewer explicitly asks for an alternative representation rather than assuming one.
- **Turns 14–16**
  - Good catch separating `hasPart` vs `hasPoint`, and recognizing that generic temperature concepts were no longer sufficient.
- **Turns 16–17**
  - Missed obvious pressure test: once `Zone` and `Space` were intentionally left unlinked, the interviewer could have flagged immediately that `verifyOccupiedZoneConditioning` would likely remain under-modeled.
- **Turns 23–25**
  - The agent does eventually surface that `Zone.conditioningAvailable` would be stale and pushes toward relationship-based verification; good ontology hygiene.
- **Turns 36–42**
  - Good honesty: instead of inventing unsupported facts, the assistant explicitly marks `verifyOccupiedZoneConditioning` as partly modeled. This is reviewer-worthy positive behavior.
- **Turns 43–50**
  - Bounded expansion pass is useful and prompt-compliant in spirit. Good example: adding **AirPlenum** only when tied back to an already accepted competency question.
- **Turns 47–50**
  - Good recovery on **Pump**: added due to expert suggestion, then removed when a truthful relationship couldn’t be justified. Shows willingness to back out over-modeled concepts.
- **Turns 51–54**
  - Strong validation behavior overall: the assistant surfaces concrete remaining gaps instead of pretending completion.
- **Overall**
  - Efficient, careful ontology elicitation with good scope control.
  - Main weakness is tool/state handling: several opaque `Applied` counts, unresolved warning handling, and an avoidable inverse-relationship edit churn.


## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
