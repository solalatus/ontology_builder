# Ontology-recovery eval report

Generated: 2026-08-21T14:05:16.854Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **49.3%** | **56.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 58.5% / 100.0% / 73.8% | 92.9% / 83.9% / 88.1% | 31/53 full · 26/28 scoped ground-truth classes matched; 31 recovered |
| Relationship recall / precision / F1 | 66.7% / 83.3% / 74.1% | 82.6% / 79.2% / 80.9% | 20/30 full · 19/23 scoped ground-truth relationships matched; 24 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/3 full · 0/2 scoped ground-truth properties matched; 0 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **53.0%** | **59.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 58.5% / 100.0% / 73.8% | 92.9% / 83.9% / 88.1% | 31/53 full · 26/28 scoped ground-truth classes matched; 31 recovered |
| Relationship recall / precision / F1 | 76.7% / 95.8% / 85.2% | 91.3% / 87.5% / 89.4% | 23/30 full · 21/23 scoped ground-truth relationships matched; 24 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0.0% / 0.0% / 0.0% | 0/3 full · 0/2 scoped ground-truth properties matched; 0 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/5 ground-truth rules matched (core condition equivalence, not name alone); 0 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 51.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 25.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 0.0% / 0.0% / 0.0% | 0/5 ground-truth rules matched (core condition equivalence, not name alone); 0 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 0.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 51.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 25.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 56 turns, 579s wall-clock
- Real app-agent API calls: 84 (apply_ontology_yaml called 20× · get_graph_state called 8×)
- Tool outcomes seen in transcript: 20 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 2618090 total (2601234 prompt · 16856 completion) across 189 API calls

## LLM review of the conversation

## Errors
- **Turn 3** — Tool says `✓ Applied: 16 added, 0 updated` after the persona explicitly edited several of the 16 atomic competency questions. That should have included updates/corrections, not pure adds.
- **Turn 3** — Assistant then claims “16 confirmed competency questions” were persisted, despite multiple non-confirmed lines. This suggests the edited wording may not have been faithfully applied.
- **Turn 9** — Direct contradiction: tool says `✓ Applied: 5 added, 0 updated` for actions, then assistant says the tool rejected them and no valid action records exist yet.
- **Turn 9** — System message reports unresolved consistency problems; assistant ignores this and proceeds as if state is usable.
- **Turn 19** — Tool says `✓ Applied: 5 added, 0 updated`, but assistant only accounts for 4 additions (new class + 3 relationships). One change is unaccounted for, likely the held/dropped shipment-preparation link or a bad apply report.
- **Turn 22** — Same mismatch: tool says `5 added`, assistant lists 4 recorded items (new class + 3 relationships).
- **Turn 48** — The assistant updates only one of the two originally split carrier questions (“transport move”), but the earlier list also included “Which carrier is responsible for a given shipment-preparation activity?” which had already been edited differently by the persona. State tracking around these carrier questions looks muddled.
- **Turn 55** — Assistant reports “25 competency questions … and one marked deferred.” Earlier there were 25 after additions; deferring/removing one should change the active count unless they are counting deferred items too. Count semantics are unclear/inconsistent.
- **Throughout** — The interviewer repeatedly insists isolated classes are unacceptable / Phase 3 cannot complete, even after the expert explicitly wants to keep in-scope but currently unlinked classes. This may reflect a tool/prompt bug: enforcing structural completeness over stated user intent.

## Noteworthy observations
- **Turn 2** — Good move splitting compound competency questions into atomic ones before persisting.
- **Turns 2–3** — Efficient confirmation pattern, but after receiving line-by-line edits the interviewer should have restated the revised final wording before applying, to avoid silent mis-edits.
- **Turns 8–9** — Nice handling of tool constraint (“one input class per action”); the interviewer elicited a good workaround centered on `TrackingEvent`.
- **Turns 13–14** — Good explicit check where tool lacks subclassing; interviewer didn’t silently encode hierarchy as subclass.
- **Turns 17–31** — Mixed quality: commendable caution about not inventing links, but the interview gets stuck in a long, low-yield loop asking for relationships the persona repeatedly says are not in scope yet. This is inefficient and likely caused by over-rigid phase completion rules.
- **Turns 28–47** — The assistant eventually adapts by rewording competency questions to match what *is* modeled. This is a strong recovery pattern and probably the best part of the interaction.
- **Turn 31 onward** — Once the persona repeatedly answers “none in scope,” the interviewer should probably switch strategy sooner: either accept intentionally partial modeling, mark placeholders, or move to another phase. Instead it keeps interrogating one isolated class at a time.
- **Turn 38 onward** — Good idea to consider deferring question groups when the model cannot support them, but once the persona says “defer none,” the interviewer should recognize the ontology may intentionally contain unresolved requirements rather than treat that as a blockage to all progress.
- **Overall** — Strong domain-faithful caution: the interviewer generally avoids fabricating ontology structure. The main weakness is process rigidity and state inconsistency around what was actually saved.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
