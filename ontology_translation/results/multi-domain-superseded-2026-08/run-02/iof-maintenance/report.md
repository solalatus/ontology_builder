# Ontology-recovery eval report

Generated: 2026-08-21T14:21:15.669Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 20-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **82.2%** | **66.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 92.9% / 76.5% | 80.0% / 85.7% / 82.8% | 13/20 full · 12/15 scoped ground-truth classes matched; 14 recovered |
| Relationship recall / precision / F1 | 61.5% / 61.5% / 61.5% | 87.5% / 53.8% / 66.7% | 8/13 full · 7/8 scoped ground-truth relationships matched; 13 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 83.3% / 90.9% | 100.0% / 33.3% / 50.0% | 5/5 full · 2/2 scoped ground-truth properties matched; 6 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **82.2%** | **66.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 65.0% / 92.9% / 76.5% | 80.0% / 85.7% / 82.8% | 13/20 full · 12/15 scoped ground-truth classes matched; 14 recovered |
| Relationship recall / precision / F1 | 61.5% / 61.5% / 61.5% | 87.5% / 53.8% / 66.7% | 8/13 full · 7/8 scoped ground-truth relationships matched; 13 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 100.0% / 83.3% / 90.9% | 100.0% / 33.3% / 50.0% | 5/5 full · 2/2 scoped ground-truth properties matched; 6 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 100.0% | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 28.6% / 100.0% / 44.4% | 2/7 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 26.1% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 78.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 64.2% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 28.6% / 100.0% / 44.4% | 2/7 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 5/5 ground-truth actions matched by name/meaning; 5 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 26.1% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 78.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 64.2% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 46 turns, 612s wall-clock
- Real app-agent API calls: 102 (apply_ontology_yaml called 25× · get_graph_state called 31×)
- Tool outcomes seen in transcript: 25 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 4360930 total (4342357 prompt · 18573 completion) across 187 API calls

## LLM review of the conversation

## Errors
- **Turn 3** — Tool reported `✓ Applied: 17 added, 0 updated` before the assistant had actually elicited or confirmed the follow-up role/context distinctions; likely over-applied or applied unseen edits.
- **Turn 3** — System surfaced “5 consistency problem(s) unresolved,” but the assistant neither inspected nor explained them before continuing; this looks like dropped tool/state management.
- **Turn 6** — Persona explicitly renamed **Qualification** to **QualificationSpecification**, but tool said `6 added, 0 updated`; likely failed to perform the rename and instead just added a new class.
- **Turn 9** — Tool said `6 added, 0 updated` after only two new classes and four relationships were discussed; could be correct numerically, but no explicit mention that those relationships were persisted until the assistant recap. Mild state-opacity issue.
- **Turn 15** — Assistant claims “one confirmed class still has zero relationships,” then lists every class as connected. Contradictory narration / likely stale checker interpretation.
- **Turn 18–24** — Assistant says “Next is Phase 4: decision-bearing properties,” then later says “Next phase is the language layer” without clearly closing the prior phase; mild phase/state drift.
- **Turn 29** — Tool checked state but assistant says “Confirmed — I’ll keep that distinction explicit” without any apply step; possible missed persistence of the alias clarification.
- **Turn 32** — Persona says keep the create-work-order rule in business language as an open item, but the assistant does not clearly say whether the rule itself was stored as open/unmodeled versus not stored at all; state handling remains ambiguous.
- **Turn 35 / 37 / 46** — Multiple “open item” and “accepted limitation” decisions are discussed, but there’s no tool apply step confirming they were actually recorded. Could be a real persistence gap if the system expects explicit storage of such statuses.

## Noteworthy observations
- **Turn 1** — Strong opening: the interviewer immediately anchors on competency questions before ontology structure, which is efficient and well-scaffolded.
- **Turn 3** — The follow-up about “closely related role” and “operating context” feels generic and weakly motivated by the prior answers; it interrupts momentum before classes were fully grounded.
- **Turn 4** — Good recovery: the interviewer proposes a small candidate class batch and explicitly asks whether each must be identified/retrieved/connected/passed to tools.
- **Turn 5–7** — Good technique in accepting renames from the persona and testing whether an implied concept (**UndesirableDisposition**) truly needs to be separate rather than assuming it.
- **Turn 7–13** — Strong handling of an initially underspecified modeling choice around **MaintenanceState**. The interviewer notices the CQ cannot work if state is just a type, asks a crisp disambiguation, and repairs the model cleanly.
- **Turn 9–11** — Nice example of detecting action/model mismatch: the interviewer notices that “assign” requires more than “qualified for,” then prompts the persona to distinguish eligibility vs assignment.
- **Turn 11–17** — The interviewer is persistent about action navigability and eventually gets an operational **FailureEvent → affectsMaintainableItem** link while preserving the persona’s preferred analytical structure. Good balance between implementation needs and conceptual purity.
- **Turn 19–22** — Useful pushback on missing status fields/properties. The assistant repeatedly checks whether claimed verification logic is actually representable in the model instead of silently assuming it.
- **Turn 23 onward** — The “language layer” batching is efficient: meanings and aliases are collected in compact batches rather than one-by-one.
- **Turn 28–29** — Good clarification on “failure mode” vs “failure mode code”; this is exactly the kind of ambiguity that often causes ontology bugs.
- **Turn 30–38** — Rules phase is handled responsibly: the interviewer resists inventing fields just to make rules computable and explicitly marks several rules as open/not yet modeled. This is a strength.
- **Turn 41–45** — Good action refinement work: the interviewer catches that “active work order” and “closed” are not modeled and forces verification text back onto modeled facts.
- **Turn 46** — Final validation summary is useful and skimmable, especially in distinguishing what is fully covered vs intentionally partial.
- **Overall** — The main optimization opportunity is reducing repetitive recaps. Nearly every turn restates prior decisions at length; useful for safety, but inefficient and likely token-heavy.
- **Overall** — The interviewer is sometimes too checker-driven: several questions are prompted by navigation-direction warnings rather than domain salience. This helps consistency, but can make the interview feel tool-led instead of expert-led.


## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
