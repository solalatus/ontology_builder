# Ontology-recovery eval report

Generated: 2026-09-02T19:38:19.128Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **58.0%** | **62.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 48.5% / 100.0% / 65.3% | 95.8% / 69.7% / 80.7% | 33/68 full · 23/24 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 35.2% / 82.6% / 49.4% | 66.7% / 52.2% / 58.5% | 38/108 full · 24/36 scoped ground-truth relationships matched; 46 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 46.8% / 81.3% / 59.4% | 84.0% / 32.8% / 47.2% | 52/111 full · 21/25 scoped ground-truth properties matched; 64 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 98.0% | 96.7% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **59.3%** | **64.6%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 48.5% / 100.0% / 65.3% | 95.8% / 69.7% / 80.7% | 33/68 full · 23/24 scoped ground-truth classes matched; 33 recovered |
| Relationship recall / precision / F1 | 38.0% / 89.1% / 53.2% | 75.0% / 58.7% / 65.9% | 41/108 full · 27/36 scoped ground-truth relationships matched; 46 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 46.8% / 81.3% / 59.4% | 84.0% / 32.8% / 47.2% | 52/111 full · 21/25 scoped ground-truth properties matched; 64 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 98.0% | 96.7% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 18.2% / 66.7% / 28.6% | 2/11 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 100.0% | of 11 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 11.1% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 79.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 90.8% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 18.2% / 66.7% / 28.6% | 2/11 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 100.0% | of 11 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 11.1% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 79.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 90.8% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 72 turns, 1162s wall-clock
- Real app-agent API calls: 159 (apply_ontology_yaml called 41× · get_graph_state called 44×)
- Tool outcomes seen in transcript: 41 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 15612104 total (15578147 prompt · 33957 completion) across 238 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 6 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: `app-user` repeats the persona’s opening prompt verbatim instead of forwarding a user response; suggests transcript plumbing bug / duplicated speaker content.
- **Turn 3**: Tool reports `✓ Applied: 39 added, 0 updated` after the persona asked for rewording and additions, not wholesale additions. Looks like edits were misapplied as net-new items rather than updates.
- **Turn 3**: Assistant says “the tool flagged a structural issue with the actions...” but no such tool output appears; likely fabricated/internal-state leakage.
- **Turn 3**: System explicitly says “The agent left 11 consistency problem(s) unresolved,” but the assistant proceeds as if Phase 1 is complete rather than addressing or surfacing them concretely.
- **Turn 10–12**: Assistant initially pushes back on `Cybersecurity Incident` as a separate class because subclassing isn’t supported, then later recasts it as an incident property/category. Not fatal, but shows the interviewer let the persona propose an incompatible structure before steering back.
- **Turn 29 → 65–66**: Assistant had already captured and later relied on `PostIncidentReview → Incident`, then removed it to satisfy one-direction tooling and replaced it with `Incident → PostIncidentReview`. This silently invalidates an earlier relationship meaning (`reviewsIncident`) that had been captured and used in validation summaries.
- **Turn 56**: Tool says “An additional ontology edit in this message was skipped — only one edit is applied per message.” This is a real tool limitation/failure the agent worked around manually, causing unnecessary extra turn overhead.
- **Turn 57–64**: Assistant claims it “cleared several/more input errors” and later mentions “three useful path warnings from this edit,” but the visible tool outputs do not show those specifics. Again appears to report hidden or imagined tool diagnostics.
- **Turn 71**: Assistant says “final validation result” and immediately identifies missing relationship meanings for newly added relationships, meaning validation was declared before the language layer was actually complete.
- **Turn 72**: Assistant says “What remains open... There are 2 explicit unresolved warnings left,” despite earlier noting broader action effect/verification precision issues. It narrows “open items” inconsistently.

## Noteworthy observations
- **Turn 1**: Strong opening move: starts with competency questions/actions before classes, which is efficient and user-centered.
- **Turn 2**: Good practice splitting bundled questions into atomic competency questions, but it over-expanded aggressively (26 items from 14-ish prompts), creating a lot of later bookkeeping.
- **Turn 2–3**: Good responsiveness to domain nuance; the assistant accepted combined operational views in addition to atomic questions instead of forcing one modeling style.
- **Turn 3 onward**: Interview is very methodical and staged (classes → relationships → properties → rules → actions → meanings → aliases), which is strong for ontology elicitation.
- **Turn 4**: Nice clarification on service owner vs incident commander before modeling; avoided a likely merge error.
- **Turn 14–17**: Excellent follow-up when the persona warned against flattening IT service → configuration item. Surfacing **Application** was a valuable catch.
- **Turn 18–21**: Good discipline distinguishing explicit tracked links from inferred causal reasoning; especially around incidents vs changes/deployments.
- **Turn 23–29**: Another strong catch: **Problem** and later **PostIncidentReview** surfaced naturally from workaround/corrective-action discussion rather than being pre-imposed.
- **Turn 30–33**: Solid handling of property design; the assistant let the persona reject simplistic flags/statuses and pushed toward operationally meaningful fields.
- **Turn 34–39**: Good prompt sensitivity when the persona corrected “emergency change” from a value to a distinct concept. The interviewer adapted rather than forcing prior schema assumptions.
- **Turn 47–48**: Very good alias hygiene. The assistant explicitly filtered risky near-synonyms (`ticket`, `service manager`, `temporary fix`, `go-live`) instead of storing everything as aliases.
- **Turn 52–57**: Rule elicitation was mostly good, but the assistant drifted toward “what can the current model support” rather than purely eliciting the domain truth. Helpful for tool compatibility, but it sometimes constrained discovery prematurely.
- **Turn 57–64**: Action modeling was weaker than class/relationship elicitation. The assistant repeatedly needed cleanup questions because earlier phases had not captured enough operational state (timestamps, ownership, receipt, status fields), suggesting the action phase came a bit too late or needed a stronger action schema template sooner.
- **Turn 65–67**: The one-direction relationship constraint caused churn. The interviewer handled it reasonably, but this is a prompt/design smell: inverse-navigation needs should be anticipated earlier when using a single-direction graph tool.
- **Turn 67–72**: Bounded domain-expansion pass was a useful late-stage sweep and surfaced important omissions (**Stakeholder**, **SLO**, **Metric**). Good safeguard.
- **Overall**: Efficient, disciplined elicitation with strong ontology instincts, but the assistant too often narrated unseen tool state/warnings and sometimes declared completion phases before actually closing the discovered gaps.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
