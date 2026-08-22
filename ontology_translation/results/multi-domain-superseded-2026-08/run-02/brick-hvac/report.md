# Ontology-recovery eval report

Generated: 2026-08-21T14:33:44.666Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 39-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **51.1%** | **37.4%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 71.8% / 100.0% / 83.6% | 94.4% / 60.7% / 73.9% | 28/39 full · 17/18 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 62.9% / 78.6% / 69.8% | 47.4% / 32.1% / 38.3% | 22/35 full · 9/19 scoped ground-truth relationships matched; 28 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/42 full · 0/16 scoped ground-truth properties matched; 0 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **57.5%** | **45.9%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 71.8% / 100.0% / 83.6% | 94.4% / 60.7% / 73.9% | 28/39 full · 17/18 scoped ground-truth classes matched; 28 recovered |
| Relationship recall / precision / F1 | 80.0% / 100.0% / 88.9% | 78.9% / 53.6% / 63.8% | 28/35 full · 15/19 scoped ground-truth relationships matched; 28 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/42 full · 0/16 scoped ground-truth properties matched; 0 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 0 recovered |
| Action identification recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/5 ground-truth actions matched by name/meaning; 0 recovered |
| Action input-class accuracy | n/a | of 0 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | n/a (no matched gold action had preconditions) | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | n/a | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | n/a | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/7 ground-truth rules matched (core condition equivalence, not name alone); 0 recovered |
| Action identification recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/5 ground-truth actions matched by name/meaning; 0 recovered |
| Action input-class accuracy | n/a | of 0 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | n/a (no matched gold action had preconditions) | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | n/a | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | n/a | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **max_turns_reached**, after 200 turns, 1369s wall-clock
- Real app-agent API calls: 215 (apply_ontology_yaml called 11× · get_graph_state called 4×)
- Tool outcomes seen in transcript: 11 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 9697566 total (9679051 prompt · 18515 completion) across 613 API calls

## LLM review of the conversation

## Errors
- **Turn 20**: Likely tool/state bug. Persona explicitly said to **remove** `Pump`, `Heat Exchanger`, and `Cooling Tower`, but the tool output was `✓ Applied: 3 added, 0 updated.` No deletion occurred, creating the later state mismatch.
- **Turn 21**: Interviewer admits the tool lacks explicit delete support only *after* acting as if removals were in progress. This should have been surfaced earlier, before asking the persona to make deletion decisions contingent on canvas edits.
- **Turns 21–22**: State-handling failure. The assistant asks the persona to “delete those three on the canvas,” but the persona is the domain expert, not the editor. This loses track of who can actually perform tool actions.
- **Turn 22 onward**: The session becomes trapped in a pause loop because the assistant cannot delete and keeps waiting for the persona/user to do so, despite repeated signals that they can’t continue without the reference model.
- **Turns 23–31**: The assistant repeatedly restates the same stop condition without taking any recovery action (e.g., proceed with a flagged inconsistency, mark classes deprecated/inactive, or end the session definitively). Feels like a real orchestration bug.
- **Turns 32–130**: Severe stuck-loop behavior. The assistant keeps replying `Acknowledged.` to repeated mirrored pause messages for ~100 turns. This is a clear failure to terminate or suppress redundant acknowledgements.
- **Turns 131–200**: Another stuck-loop behavior. After closure (“That covers it well, thank you”), the assistant continues emitting generic closers (`You’re welcome`, `Glad to help`) indefinitely instead of ending the interaction.
- **Turn 19**: The interviewer says it “can’t leave the remaining confirmed plant classes unconnected and still call the relationship phase complete,” even though the persona’s suggestion to remove those classes was reasonable. This is not exactly a contradiction, but it reflects the agent being over-constrained by an internal completeness rule rather than following the elicitation cleanly.

## Noteworthy observations
- **Turn 1**: Good initial framing. The assistant clearly outlined phases and started with competency questions.
- **Turn 2**: Good technique converting broad questions into more atomic competency questions; the persona’s corrections improved natural phrasing and operational fidelity.
- **Turns 5 & 8**: Strong handling of the “no taxonomy/subclassing” constraint. The interviewer appropriately asked whether to keep generic umbrella classes or only specific operational classes.
- **Turns 10–12**: Good discipline in tying class additions to already accepted competency questions rather than letting scope sprawl.
- **Turn 13**: Nice follow-up on whether “path/process” needed to be a class versus inferred from relationships. Efficient and ontology-aware.
- **Turns 14–18**: Relationship elicitation was generally well-structured: small batches, explicit directionality, and checking whether direct links should be stored or inferred.
- **Turn 19**: Missed obvious recovery option: when the persona resisted vague `connectedTo` links, the interviewer could have proposed marking `Pump`, `Heat Exchanger`, and `CoolingTower` as “candidate classes pending relationships” instead of forcing a binary keep/remove decision.
- **Turn 21**: The delete limitation should likely be treated as a system/tool capability issue and surfaced proactively much earlier. Prompt optimization opportunity: require the interviewer to verify supported edit operations before proposing removals.
- **Turns 21+**: Once blocked, the agent did at least avoid inventing relationships just to satisfy schema completeness. That’s a good safety property, even though execution afterward degraded badly.
- **Overall**: The interview was efficient and high-quality up until the deletion issue. After that, the main problem was not ontology reasoning but conversation-control failure: inability to gracefully halt, summarize once, and stop responding to repeated echoes.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
