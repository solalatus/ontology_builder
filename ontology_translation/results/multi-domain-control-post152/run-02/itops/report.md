# Ontology-recovery eval report

Generated: 2026-09-02T18:46:05.142Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **50.7%** | **56.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 42.6% / 100.0% / 59.8% | 75.0% / 62.1% / 67.9% | 29/68 full · 18/24 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 30.6% / 100.0% / 46.8% | 50.0% / 54.5% / 52.2% | 33/108 full · 18/36 scoped ground-truth relationships matched; 33 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 31.5% / 81.4% / 45.5% | 68.0% / 39.5% / 50.0% | 35/111 full · 17/25 scoped ground-truth properties matched; 43 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 88.9% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **52.0%** | **57.7%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 42.6% / 100.0% / 59.8% | 75.0% / 62.1% / 67.9% | 29/68 full · 18/24 scoped ground-truth classes matched; 29 recovered |
| Relationship recall / precision / F1 | 30.6% / 100.0% / 46.8% | 50.0% / 54.5% / 52.2% | 33/108 full · 18/36 scoped ground-truth relationships matched; 33 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 34.2% / 88.4% / 49.4% | 72.0% / 41.9% / 52.9% | 38/111 full · 18/25 scoped ground-truth properties matched; 43 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 88.9% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 27.3% / 60.0% / 37.5% | 3/11 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 100.0% | of 10 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 16.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 62.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 78.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 27.3% / 60.0% / 37.5% | 3/11 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 100.0% | of 10 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 16.4% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 62.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 78.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 75 turns, 1417s wall-clock
- Real app-agent API calls: 172 (apply_ontology_yaml called 45× · get_graph_state called 49×)
- Tool outcomes seen in transcript: 45 applied · 1 skipped · 0 no-op · 0 error
- Tokens: 14916660 total (14877803 prompt · 38857 completion) across 274 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 2 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**: `app-user` repeats the persona’s opening message verbatim. Looks like a message-routing/transcript bug.
- **Turn 39**: Assistant says it normalized the relationship name to **`dependsOnService`**, but the persona explicitly wanted the spoken relationship name to be simply **“depends on”**. The stored name still appears tool-internal / awkward rather than the requested clean phrasing.
- **Turn 47**: After two consecutive “none” alias batches, the assistant says it will stop soliciting more relationship aliases, but then immediately moves on to Phase 6 without recording any “none” result via tool. Not necessarily fatal, but state handling is a bit loose.
- **Turn 50**: Tool reports only one edit can be applied per message; assistant correctly notes partial application, but had already removed both `BackupSet.verificationStatus` and `KnownError.knownErrorStatus` before adding the replacement `BackupSet.status`. Temporary misapplication left the model in an incomplete state for a turn.
- **Turn 56**: Assistant says the first 5 actions’ input classes are “Recorded,” but there is no `✓ Applied` tool confirmation for those actions in that turn—only a state check. Likely claimed persistence without an actual write.
- **Turn 59**: Tool says `✓ Applied: 4 added, 2 updated`, but assistant recap mentions only 2 new properties and 4 actions, omitting what the 2 updates were. Weak state accounting.
- **Turn 65**: Assistant claims “All 11 core governed actions are now captured,” but the system immediately flags this as false for that turn’s actual persisted changes (`0 added, 1 updated`). This is a concrete state-reporting bug.
- **Turn 72**: Validation says “Every relationship except one has a meaning sentence,” but by the end of the same validation it identifies only `RegulatoryNotification --sentTo--> Regulator` as missing. Since `Regulator` itself had also been introduced late, the assistant had partially lost track earlier of late-added language-layer completion.
- **Across multiple turns**: The assistant repeatedly says things are “covered” at a “usable/workable” level even when key supporting structure was explicitly missing. Not a tool failure per se, but validation wording drifted from strict ontology completeness into optimistic interpretation.

## Noteworthy observations
- **Turn 2–6**: Good discipline converting raw user questions into atomic competency questions before modeling classes/relations.
- **Turn 7–24**: Generally strong incremental elicitation. The assistant often avoided inventing edges when the persona resisted over-modeling.
- **Turn 14–15**: Good catch that `ConfigurationItem` was too broad for `runsOn`; introducing `InfrastructureComponent` was an effective refinement.
- **Turn 16–17**: Good restraint not forcing speculative `ResolverGroup supports X` relationships. This preserved fidelity, though it left a known competency gap unresolved.
- **Turn 18–24**: The assistant handled indirect paths reasonably well, especially workaround via `KnownError` and later `Problem`.
- **Turn 22**: Nice recovery when `Release` emerged as necessary to connect `Change` and `Deployment`; this was a sensible bounded expansion.
- **Turn 25–31**: Property elicitation was efficient overall, but the assistant sometimes proposed implementation-ish fields first and then had to prune aggressively after persona pushback.
- **Turn 27–29**: The persona repeatedly rejected names/IDs/metadata as nonessential; this suggests the interviewer prompt may over-bias toward CRUD-style properties instead of decision-bearing fields.
- **Turn 39–40**: Good that the assistant explicitly checked for duplicate relationships after renaming; this is exactly the sort of state hygiene that matters.
- **Turn 41–45**: Strong alias handling. The assistant appropriately challenged risky near-synonyms like **ticket** and **major-incident lead**.
- **Turn 47–51**: Good fixed-list elicitation, but the assistant should probably anticipate tool single-edit limits and batch less aggressively when doing renames/removals/replacements.
- **Turn 52–54**: Good behavior when a rule introduced an unmapped concept (`Regulator`): assistant paused and added the class/relationship before pretending the rule was supported.
- **Turn 54–64**: Action modeling was mixed. Good that the assistant refused to fabricate machine-checkable preconditions, but many action verifications still referenced unmodeled facts. This created churn and warnings later.
- **Turn 58–64**: The assistant did a solid job responding to model-review warnings by asking minimal follow-ups rather than silently patching ontology structure.
- **Turn 65–71**: Bounded expansion pass was useful and surfaced a genuinely important missing class (`Problem`). Good example of late addition done mostly correctly.
- **Turn 69–70**: Nice choice to avoid storing both `Incident linkedTo Problem` and `Problem groups Incident`; asking for one canonical direction was clean.
- **Turn 72–75**: Validation was helpful and honest about remaining gaps, especially CQ4 and routing derivation. Good reviewer-style summary at the end.
- **Overall**: Interview technique was thoughtful and conservative, but somewhat overlong. There were many micro-confirmation turns where the agent could likely have combined a small batch of class/relationship/property follow-ups to reduce friction.
- **Overall**: Biggest prompt-level issue is state-claim reliability. The assistant occasionally said items were recorded or fully covered when the tool output didn’t support that. That is the most important thing to tighten.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
