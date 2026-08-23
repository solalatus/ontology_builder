# Ontology-recovery eval report

Generated: 2026-08-23T16:51:37.603Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **58.1%** | **55.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 52.9% / 100.0% / 69.2% | 83.3% / 55.6% / 66.7% | 36/68 full · 20/24 scoped ground-truth classes matched; 36 recovered |
| Relationship recall / precision / F1 | 36.1% / 81.3% / 50.0% | 63.9% / 47.9% / 54.8% | 39/108 full · 23/36 scoped ground-truth relationships matched; 48 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 45.9% / 68.9% / 55.1% | 88.0% / 29.7% / 44.4% | 51/111 full · 22/25 scoped ground-truth properties matched; 74 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 76.2% | 84.6% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **58.5%** | **55.3%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 52.9% / 100.0% / 69.2% | 83.3% / 55.6% / 66.7% | 36/68 full · 20/24 scoped ground-truth classes matched; 36 recovered |
| Relationship recall / precision / F1 | 37.0% / 83.3% / 51.3% | 63.9% / 47.9% / 54.8% | 40/108 full · 23/36 scoped ground-truth relationships matched; 48 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 45.9% / 68.9% / 55.1% | 88.0% / 29.7% / 44.4% | 51/111 full · 22/25 scoped ground-truth properties matched; 74 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 76.2% | 84.6% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 90.9% / 90.9% / 90.9% | 10/11 ground-truth rules matched (core condition equivalence, not name alone); 11 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 100.0% | of 10 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 73.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 23.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 19.8% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 90.9% / 90.9% / 90.9% | 10/11 ground-truth rules matched (core condition equivalence, not name alone); 11 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 100.0% | of 10 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 73.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 23.2% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 19.8% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **pleasantry_loop_detected**, after 91 turns, 1936s wall-clock
- Real app-agent API calls: 183 (apply_ontology_yaml called 45× · get_graph_state called 47×)
- Tool outcomes seen in transcript: 45 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 21272180 total (21234771 prompt · 37409 completion) across 357 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 4 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3**
  - Tool applied candidate questions/actions despite the assistant saying it would “keep” them without turning them into model elements yet.
  - System immediately reports **11 unresolved consistency problems**, but the assistant proceeds without inspecting/resolving them.

- **Turn 13**
  - Assistant says it “Added classes: Application, Environment, Site, DataCentre” here, but those were only discussed earlier and not previously confirmed as applied. The state narration is a bit unreliable about what was actually persisted when.

- **Turn 19**
  - Assistant records **KnownError --documentedBy--> Workaround**, which contradicts the persona’s intended semantics and later has to be corrected.

- **Turn 20**
  - Tool reports **“1 added, 0 updated”** for the correction to `KnownError --hasWorkaround--> Workaround`, leaving the bad relationship in place instead of updating/replacing it.
  - Assistant acknowledges the bad edge remains and cannot remove it “with this tool shape,” leaving a known semantic bug in the live model.

- **Turn 23**
  - Tool reports **14 added** though the assistant’s recap only lists 13 concrete items (1 class + 12 relationships). Possible mismatch between applied changes and narrated state.

- **Turn 25**
  - Tool only checks state after introducing Regulator/Vendor; no apply happens until turn 26, despite the assistant acting as if the clarification is already integrated.

- **Turn 49**
  - Tool reports **7 updated** after 10 allowed-value lists plus rationale were provided. This suggests partial persistence or tool/application mismatch, but the assistant claims the whole batch was recorded.

- **Turn 51**
  - Tool reports **6 updated** after 8 more allowed-value lists were confirmed; again the assistant overstates completeness.

- **Turn 53**
  - Assistant says it added rule `qualifiesAsMajorIncident`, but had not actually elicited the full policy criteria; only a partial rule is captured. Not a hard bug, but premature “recorded” framing.

- **Turn 62–64**
  - Assistant adds `Incident --communicatedThrough--> Communication` to satisfy action-path navigation, then immediately recognizes it is likely an inverse duplicate of `Communication --about--> Incident`.
  - Because the tool cannot cleanly remove it, the ontology is knowingly left with a duplicate/inverse relationship bug.

- **Turn 83**
  - Assistant says it “captured the emergency-only nature” of `Change --justifiedBy--> Incident` in the rule, but the relationship itself is global in the ontology and thus overgeneralized beyond emergency changes.

- **Turn 87**
  - Validation claims “Covered” for question 5 using `Incident --impacts--> ITService`, but earlier the model’s impact backbone centered on `Incident --impacts--> BusinessService`; the assistant may be relying on later-added links inconsistently.
  - Validation also says “every relationship has a clear direction and verb” while simultaneously acknowledging known bad/duplicate edges and cleanup items.

## Noteworthy observations
- **Turn 1**
  - Good interview structure: the assistant starts with competency questions before ontology structure.

- **Turns 3–5**
  - Strong follow-up on role distinctions and operating context; it usefully surfaces application owner, technical owner, environment, criticality, channel, site, and on-call context.

- **Throughout**
  - Efficient technique: the assistant batches class/relationship/property candidates and asks for keep/remove or yes/no with corrections. This keeps momentum high.

- **Throughout**
  - The assistant often gives good recaps that help maintain conversational state, but it sometimes overstates what is actually persisted versus merely discussed.

- **Turn 10**
  - Good adaptation to tool limitation: explicitly asks whether `MajorIncident` and `EmergencyChange` should be separate records or classifications, given no subclassing support.

- **Turns 12–18**
  - Good domain sensitivity: when the persona objects to loose verbs like “dependsOn” or “ownedBy,” the assistant asks for exact operational phrasing instead of forcing generic ontology language.

- **Turns 16–17**
  - Nice catch that `Release` is a missing concept once the persona rejects a direct Change→Deployment link.

- **Turns 18–20**
  - Missed efficiency opportunity: after discovering the workaround relation was wrong, the assistant could have immediately asked whether the tool supports update/remove semantics instead of carrying a known bad edge forward.

- **Turns 24–26**
  - Good recovery from weak shortcut proposals: rather than forcing direct Incident→KnownError or Incident→ThirdPartyService links, the assistant elicits `Problem`, `Vendor`, and `Regulator`.

- **Turn 27 onward**
  - Property elicitation is disciplined: it focuses on “decision-bearing” properties and rejects many tempting but low-value fields.

- **Turns 45–46**
  - Good interview quality check on aliases: the assistant correctly pauses to prevent `Communication = notification` from colliding with `RegulatoryNotification`.

- **Turns 48–51**
  - Sensible requirement hygiene: asking “what breaks if this is missing/wrong?” is a strong way to test whether a property really deserves bounded values.

- **Turns 52–86**
  - Action/rule phase is thorough and safety-oriented, especially around failover, emergency change, closure, and regulated notification. Good alignment with operational risk.

- **Turns 57, 69–71**
  - Good pattern of noticing missing path structure when a rule references concepts not yet connected (`ResolverGroup supports ...`, `Alert concerns ...`).

- **Throughout later phases**
  - The assistant sometimes bends over backward to satisfy tool warnings by proposing extra relationships, then has to walk them back. Prompt could likely instruct it to prefer “leave as rule-level condition” sooner when the expert has already signaled not to overmodel.

- **Turn 87**
  - Validation pass is useful and skimmable, but it is too optimistic in places given unresolved warnings, partial persistence, and known duplicate/bad edges. A stricter distinction between “modeled,” “rule-level only,” and “known cleanup needed” would improve trustworthiness.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
