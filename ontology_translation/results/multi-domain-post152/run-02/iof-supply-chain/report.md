# Ontology-recovery eval report

Generated: 2026-09-03T07:27:46.778Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 53-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **65.8%** | **75.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 49.1% / 100.0% / 65.8% | 82.1% / 88.5% / 85.2% | 26/53 full · 23/28 scoped ground-truth classes matched; 26 recovered |
| Relationship recall / precision / F1 | 73.3% / 91.7% / 81.5% | 87.0% / 83.3% / 85.1% | 22/30 full · 20/23 scoped ground-truth relationships matched; 24 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 40.0% / 50.0% | 100.0% / 40.0% / 57.1% | 2/3 full · 2/2 scoped ground-truth properties matched; 5 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **65.8%** | **75.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 49.1% / 100.0% / 65.8% | 82.1% / 88.5% / 85.2% | 26/53 full · 23/28 scoped ground-truth classes matched; 26 recovered |
| Relationship recall / precision / F1 | 73.3% / 91.7% / 81.5% | 87.0% / 83.3% / 85.1% | 22/30 full · 20/23 scoped ground-truth relationships matched; 24 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 66.7% / 40.0% / 50.0% | 100.0% / 40.0% / 57.1% | 2/3 full · 2/2 scoped ground-truth properties matched; 5 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | n/a | n/a | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 40.0% / 100.0% / 57.1% | 2/5 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 50.0% / 66.7% | 5/5 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 25.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 32.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 29.1% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 40.0% / 100.0% / 57.1% | 2/5 ground-truth rules matched (core condition equivalence, not name alone); 2 recovered |
| Action identification recall / precision / F1 | 100.0% / 50.0% / 66.7% | 5/5 ground-truth actions matched by name/meaning; 10 recovered |
| Action input-class accuracy | 100.0% | of 5 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 25.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 32.1% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 29.1% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 57 turns, 1155s wall-clock
- Real app-agent API calls: 136 (apply_ontology_yaml called 36× · get_graph_state called 39×)
- Tool outcomes seen in transcript: 36 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 9837463 total (9812384 prompt · 25079 completion) across 201 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 3 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 1**
  - The app appears to echo the persona’s opening message as `app-user`, suggesting a transcript/tooling duplication bug rather than a real user turn.
- **Turn 3**
  - Tool says `✓ Applied: 36 added, 0 updated` right after the persona explicitly said they did **not** confirm the list as-is. Assistant then claims it captured the corrected questions, but no corrected list was actually supplied in structured form. Likely misapplied persistence.
- **Turn 3**
  - Assistant says actions “cannot be kept yet” because input classes do not exist, but later actions are in fact updated once classes exist. This is a workflow/tool constraint, but the earlier “captured/accepted conceptually” vs “not recorded” distinction is muddy and likely contributes to state confusion.
- **Turn 3**
  - System reports `10 consistency problem(s) unresolved`, but the assistant does not inspect or address them directly before continuing.
- **Turn 15–18**
  - Assistant treats “classes with zero relationships” as requiring removal/deferment, leading it to remove previously accepted classes/questions. That is a modeling-policy overconstraint, not something the persona asked for. It caused loss of previously accepted scope.
- **Turn 17–20**
  - Because of the above, the agent removes **SupplyChainProcess**, **DistributionCenter**, **StorageService**, **PackagingService**, and **LogisticsService**, then also removes several service-applicability competency questions. This is a substantial scope regression caused by the interviewer’s internal validation heuristic, not by domain evidence alone.
- **Turn 20**
  - Assistant says it “also removed” broader service-applicability questions, but the tool only reports `✓ Removed: 4 element(s)` without specifying what. Hard to verify whether the right things were removed; risky opaque edit.
- **Turn 21–22**
  - Assistant challenges the absence of shipment status despite earlier acceptance of event/process-based derivation. This is not inherently wrong, but it reopens a settled modeling choice and adds churn.
- **Turn 23–25**
  - Property elicitation becomes inconsistent: assistant asks for identifiers; persona answers “yes for freight forwarder” but immediately says the needed property is actually **status, not an identifier**. Assistant handles this via a follow-up, but this exposes a brittle prompt/tool design around property type confirmation.
- **Turn 42–52**
  - Major action-modeling churn: assistant first anchors actions to `Shipment`, then discovers navigation/path issues, proposes inverse relationships, adds them, then removes them due to a one-direction-only constraint, then rewrites actions to be much weaker. This is a real state-management/design bug pattern.
- **Turn 49–51**
  - Assistant adds reverse relationships to satisfy action navigation, then immediately says the tool profile forbids inverse pairs and asks which direction to keep. This indicates the assistant should have respected that constraint before applying edits.
- **Turn 51–52**
  - Final rewrites for `receiveShipmentAtDestinationFacility` and `checkWhetherTraceabilityCanBeMaintained` become so weak (“shipment is identified…”) that they no longer reflect the originally accepted business actions. This is a degradation caused by tool/model limitations rather than expert intent.
- **Turn 56**
  - Assistant says “I also filled the one remaining missing relationship meaning: ReceivingProcess --receives--> Shipment” even though that meaning sentence was never explicitly elicited from the persona in the language layer. That is an ungrounded auto-fill.

## Noteworthy observations
- **Turn 1–2**
  - Good opening move to ask for competency questions and actions first; efficient ontology scoping.
- **Turn 2**
  - Good technique splitting compound questions into atomic ones, but it overcommits before confirmation and introduces several mis-anchored formulations the persona has to correct.
- **Turn 2–3**
  - Persona gives very high-quality corrections around anchoring facts to processes/services rather than broad direct links; the interviewer benefits from this but should have followed those cues more consistently later.
- **Turn 3–5**
  - Good follow-up on role distinctions and operating context; this yielded useful scoping constraints efficiently.
- **Turn 5–11**
  - Class elicitation is generally efficient and well-batched. The interviewer does a decent job asking keep/drop and rename.
- **Turn 7–11**
  - The interviewer repeatedly proposes overly generic anchors (`SupplyChainActivity`, generic `Location`) and gets corrected toward process/location distinctions. Prompt could likely be improved to bias toward the domain expert’s operational anchors earlier.
- **Turn 11–16**
  - Relationship elicitation is mostly strong: short directed phrases, explicit direction, and willingness to hear “no direct link.”
- **Turn 12–16**
  - Good discipline in accepting “no direct link in current scope” instead of forcing edges—until later action modeling undermines that discipline.
- **Turn 15 onward**
  - A recurring anti-pattern: the agent treats its internal structural preferences (every class must have a relationship, action input must navigate forward to everything mentioned) as stronger than the domain expert’s intended scope. This drives unnecessary removals and rewrites.
- **Turn 18–20**
  - Missed obvious alternative: instead of removing service-related questions/classes, the agent could have parked them as accepted-but-underconnected for later elaboration.
- **Turn 20–26**
  - Property elicitation is nicely minimal and domain-grounded; the assistant successfully avoids overmodeling after some pushback.
- **Turn 38–41**
  - Rules phase is good: assistant notices when a proposed rule references an unmodeled concept (“traceable resource unit”) and asks for clarification before recording.
- **Turn 41–52**
  - Actions phase is the weakest part of the interview. The single-input-class/tool constraint dominates the conversation and forces unnatural modeling compromises. This is exactly the sort of prompt/tool coupling a reviewer would want to redesign.
- **Turn 52–56**
  - Bounded domain expansion works well: the assistant explicitly asks for missing important concepts, gets one (`Bill of lading`), and routes it through class/relationship/meaning capture cleanly.
- **Turn 56–57**
  - Final “second-opinion review” is useful and concise; the effect/verification mismatch checks were a good catch.
- **Overall**
  - The persona was careful and consistent; most issues stem from the interviewer’s internal constraints and state-handling, not from domain ambiguity.
  - The transcript suggests the agent would perform much better if it could tolerate:
    - accepted-but-not-yet-connected classes/questions,
    - one-direction relationships without requiring forward action navigation,
    - and deferred action formalization without repeatedly rewriting business-intuitive action text.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
