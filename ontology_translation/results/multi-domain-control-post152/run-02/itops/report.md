# Ontology-recovery eval report

Generated: 2026-09-03T07:44:18.765Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **66.8%** | **59.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 66.2% / 100.0% / 79.6% | 95.8% / 51.1% / 66.7% | 45/68 full · 23/24 scoped ground-truth classes matched; 45 recovered |
| Relationship recall / precision / F1 | 45.4% / 94.2% / 61.3% | 63.9% / 44.2% / 52.3% | 49/108 full · 23/36 scoped ground-truth relationships matched; 52 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 43.2% / 96.0% / 59.6% | 88.0% / 44.0% / 58.7% | 48/111 full · 22/25 scoped ground-truth properties matched; 50 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 72.7% | 84.6% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **67.3%** | **60.0%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 66.2% / 100.0% / 79.6% | 95.8% / 51.1% / 66.7% | 45/68 full · 23/24 scoped ground-truth classes matched; 45 recovered |
| Relationship recall / precision / F1 | 46.3% / 96.2% / 62.5% | 66.7% / 46.2% / 54.5% | 50/108 full · 24/36 scoped ground-truth relationships matched; 52 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 43.2% / 96.0% / 59.6% | 88.0% / 44.0% / 58.7% | 48/111 full · 22/25 scoped ground-truth properties matched; 50 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 72.7% | 84.6% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 18.2% / 100.0% / 30.8% | 2/11 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 100.0% | of 11 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 14.7% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 28.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 32.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 18.2% / 100.0% / 30.8% | 2/11 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 100.0% | of 11 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 14.7% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 28.6% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 32.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 92 turns, 2116s wall-clock
- Real app-agent API calls: 202 (apply_ontology_yaml called 51× · get_graph_state called 57×)
- Tool outcomes seen in transcript: 51 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 29578002 total (29538298 prompt · 39704 completion) across 296 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3** — Assistant claims “Captured and persisted: **33 competency questions** and 11 actions,” but the persona provided 20 questions. This looks like a real counting/state bug.
- **Turn 3** — Assistant says “the actions reference input classes that do not exist yet, so those tool warnings are expected,” but the system message immediately says **11 consistency problems unresolved**; the assistant hand-waves rather than accurately reconciling/checking them.
- **Turn 16** — Assistant introduces **Monitoring tool** and **Security event** as “new classes implicitly required” only after relationship elicitation, despite them arising from the assistant’s own newly proposed relationships. This is a prompt/process flaw that forces unnecessary backtracking.
- **Turn 18** — Assistant’s “zero-link risk” recap is internally contradictory: it first lists **Deployment, Service owner, Technical owner, Application owner** as unconnected, then immediately says they are “actually already connected.” Clear state-tracking bug.
- **Turn 23** — Tool reports **0 added, 1 updated**, but assistant says it “Captured these Incident properties” including many properties at once. The recap overstates what was actually persisted that turn.
- **Turn 26** — Similar persistence mismatch: assistant says broad property decisions were captured for many classes, but the tool reports only **8 updated** after several earlier property answers had not yet clearly been committed. Hard to trust state narration.
- **Turn 46** — Tool reports **0 added, 4 updated** after a batch containing 10 fixed-choice properties; assistant says all allowed-value lists were persisted. Another likely misreport of what actually got written.
- **Turn 53–57** — Assistant says Post-incident review still needs class creation/relationships/properties, but later claims to have recorded a relationship meaning/property bundle with only **1 added, 2 updated**. The state narration around this late-added class is shaky.
- **Turn 57** — System explicitly flags that assistant said “**all 11** were recorded” even though the turn only added/updated 3 items. Confirmed bug in assistant’s turn summary.
- **Turn 72** — Tool reports **0 added, 1 updated**, but assistant says “Post-incident review now has a meaning sentence” while the user had answered about **Major incident** in the prior turn. This looks like a misapplied edit / wrong recap.
- **Turn 79** — Tool says **0 added, 3 updated**, but assistant recaps only meaning/relationship meaning for Corrective action, then later at turn 80 tool says **0 added, 1 updated** for adding three properties. Persistence/accounting remains inconsistent.
- **Turn 81** — Assistant says “Major incident is still the one late-added concept we confirmed but have **not yet persisted**,” immediately after prior confirmation and despite earlier claims. Loss of state.
- **Turn 81** — Assistant claims “Recorded just now: **0 added, 1 updated**” but then says Major incident is still missing. Indicates either the wrong item was updated or the assistant does not know what the tool applied.
- **Turn 83** — Tool says only one edit can be applied per message; assistant removes the bad relation but cannot add the replacement. This exposed a real tooling limitation the interviewer did not plan around.
- **Turn 90** — Assistant says “Captured… intended next relationship” for `Incident --wasCausedBy--> Change` but explicitly has **not yet committed it**, then asks for confirmation again. Inefficient state handling; the transcript repeatedly lands in known-incomplete states because the assistant asks, summarizes, then commits later.
- **Turn 92** — Final claim “Every class now has at least one relationship recorded” is dubious given multiple late additions and inconsistent persistence bookkeeping; even if true, the assistant has not demonstrated it reliably.

## Noteworthy observations
- **Turn 1** — Good opening move: starts with competency questions before classes. Solid ontology-elicitation sequencing.
- **Turns 4–9** — Efficient batching of candidate classes worked well; persona could quickly keep/drop/rename in grouped sets.
- **Turns 8–10** — Good interviewer behavior in accepting renames like **Communication**, **Evidence item**, **Regulator**, and replacing **Recovery environment** with **Environment** instead of forcing the original labels.
- **Turns 10–18** — Relationship elicitation was generally strong: assistant repeatedly asked for the **real path** rather than vague “related to,” which produced useful structure like Incident → Business service → IT service and Application → Database.
- **Turn 12** — Nice restraint: after the persona rejected fabricated support mappings for Resolver group, the assistant explicitly agreed not to invent a permanent relationship just to make derivation tidy.
- **Turns 18–21** — Good example of adapting to expert pushback: routing derivation remained a **rule-level** concept instead of being over-modeled.
- **Turns 21–31** — Property elicitation was careful about not auto-adding “useful to have” fields. Good discipline overall.
- **Turns 24–25** — The assistant correctly noticed that a competency question (“target recovery environment available”) implied a property the persona didn’t want, and it chose to revise the question instead of forcing the schema. Good technique.
- **Turns 48–57** — Rules were elicited reasonably well, but the assistant often discovered only afterward that rule terms were unsupported by the model. This suggests the prompt could tell the agent to preflight each rule against existing classes/relations before proposing to persist it.
- **Turns 52–57** — Late addition of **Post-incident review** was handled fairly cleanly, with a good correction to avoid inventing scheduled/completed status fields.
- **Turns 57–65** — Action repair was useful, especially revisiting early-captured actions once classes existed. Good recovery from earlier premature action capture.
- **Turns 58–62** — Strong follow-up on action context: the persona clarified that **Isolate configuration item** and **Fail over service** should still take **Incident** as input. Good distinction between acted-on object vs action context.
- **Turns 62–65** — The assistant did a decent job identifying that communication verification language was overfitting to nonexistent status values and sought a wording fix instead of blindly adding `sent`.
- **Turns 68–82** — The “bounded domain-expansion pass” was productive and surfaced meaningful omissions: **Stakeholder**, **Corrective action**, **Major incident**. This was one of the most valuable interview moves.
- **Turns 69–82** — However, the assistant processed these late additions very inefficiently: each needed to go back through class/relationship/property/meaning checks one at a time, causing lots of extra turns. A better prompt could batch late additions through a mini-pipeline.
- **Turns 84–92** — Final validation by replaying competency-question coverage was a good technique and caught a real modeling gap (`resolvedBy Change` ≠ `causedBy Change`).
- **Overall** — Biggest prompt optimization opportunity: reduce repeated “recap + one narrow question” loops when the expert is clearly comfortable working in larger batches. The interview was competent but verbose and sometimes tool-limited, creating avoidable churn.
- **Overall** — The assistant was commendably conservative about not inventing schema, but it too often narrated certainty about persistence/state that the tool output did not support. A stronger prompt should force the agent to align summaries strictly to tool results.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
