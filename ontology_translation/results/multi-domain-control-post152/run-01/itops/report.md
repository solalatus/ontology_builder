# Ontology-recovery eval report

Generated: 2026-09-02T17:33:56.567Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **76.4%** | **53.8%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 66.2% / 100.0% / 79.6% | 91.7% / 48.9% / 63.8% | 45/68 full · 22/24 scoped ground-truth classes matched; 45 recovered |
| Relationship recall / precision / F1 | 50.9% / 88.7% / 64.7% | 69.4% / 40.3% / 51.0% | 55/108 full · 25/36 scoped ground-truth relationships matched; 62 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 73.9% / 100.0% / 85.0% | 100.0% / 30.5% / 46.7% | 82/111 full · 25/25 scoped ground-truth properties matched; 82 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 86.7% | 92.9% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **76.8%** | **54.5%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 66.2% / 100.0% / 79.6% | 91.7% / 48.9% / 63.8% | 45/68 full · 22/24 scoped ground-truth classes matched; 45 recovered |
| Relationship recall / precision / F1 | 51.9% / 90.3% / 65.9% | 72.2% / 41.9% / 53.1% | 56/108 full · 26/36 scoped ground-truth relationships matched; 62 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 73.9% / 100.0% / 85.0% | 100.0% / 30.5% / 46.7% | 82/111 full · 25/25 scoped ground-truth properties matched; 82 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 86.7% | 92.9% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 9.1% / 20.0% / 12.5% | 1/11 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 90.9% | of 11 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 12.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 32.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 22.2% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 9.1% / 20.0% / 12.5% | 1/11 ground-truth rules matched (core condition equivalence, not name alone); 5 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 90.9% | of 11 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 12.0% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 32.9% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 22.2% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 67 turns, 1182s wall-clock
- Real app-agent API calls: 157 (apply_ontology_yaml called 42× · get_graph_state called 45×)
- Tool outcomes seen in transcript: 42 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 16836622 total (16801574 prompt · 35048 completion) across 282 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 2 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 5**
  - Assistant says actions “can’t keep action definitions yet because their input classes don’t exist,” immediately after the tool reported `11 added`. This is a contradiction / likely hallucinated tool interpretation.
- **Turn 5**
  - `app-system` reports “11 consistency problem(s) unresolved — see Check,” but the assistant neither inspects nor addresses them at that moment; it proceeds as if things are fine.
- **Turn 18–20**
  - Assistant asks for direct facts for `ApplicationOwner -> Application`, `SecurityOperationsCentre -> SecurityEvent`, and `NetworkOperationsCentre -> MonitoringTool` before confirming those target classes exist. It catches this only afterward in turn 19. This is a state-management miss.
- **Turn 21–22**
  - Similar pattern: assistant asks for/directly discusses relationships involving `Problem`, `PostIncidentReview`, and `OrganizationalUnit` before those classes are confirmed, then backtracks to add them.
- **Turn 27–37**
  - Tool updates for controlled values/properties seem inconsistent with the amount of content provided (e.g. large batches resulting in only `3 updated` or `12 updated`). Could be tool semantics, but it reads like possible partial persistence / mismatch the assistant never audits.
- **Turn 41**
  - Assistant claims `PostIncidentReview` has “no status or date property,” but the persona’s next reply references “held on,” which had never been modeled. The assistant then accepts this simplification without reconciling the mismatch.
- **Turn 42**
  - Persona says “we already have **held on**” for post-incident review; assistant accepts that premise even though no such property was previously elicited or persisted.
- **Turn 55**
  - Assistant says validation found “7 real modeling gaps” and then resolves several by weakening action verification text rather than actually modeling missing operational state. Not a hard bug, but it contradicts the earlier framing that these were gaps to “fix” in the model.
- **Turn 60–61**
  - Assistant says tool found `EmergencyChange` is not connected to `Change` or `Incident`; then after persona keeps only `EmergencyChange --respondsTo--> Incident`, the assistant claims this “closes the second-opinion gap around EmergencyChange,” despite `EmergencyChange` still lacking any relationship to ordinary `Change` and no status/property support.
- **Turn 66**
  - Assistant admits its own wording used “impacts” ambiguously enough that the checker interpreted it as the `Incident.impact` property instead of the `Incident -> ITService` relation. This indicates prompt/output wording was not precise enough for the tool’s parser.

## Noteworthy observations
- **Turn 1–3**
  - Good decomposition of the initial competency questions into atomic acceptance-test questions. The interviewer also accepted substantial expert corrections rather than over-defending its draft.
- **Turn 2**
  - Splitting one user question into multiple atomic questions was efficient, but it slightly over-normalized early (e.g. separating release/deployment/change before checking whether all three mattered).
- **Turn 4–5**
  - Good follow-up on roles/context before classes; this surfaced useful operational distinctions (incident commander, SOC/NOC, environments).
- **Throughout**
  - Strong technique: repeatedly asks for keep/drop and path-form answers, which keeps elicitation structured and skimmable.
- **Throughout**
  - Weakness: the simulated transcript duplicates persona messages into `app-user` turns verbatim, and the assistant never acknowledges this oddity. Not necessarily its fault, but it shows no robustness to duplicated input/state.
- **Turn 12–13**
  - The “no subclassing” constraint is handled well; assistant explicitly tests whether `MajorIncident`/`CybersecurityIncident` should be classes versus flags.
- **Turn 17**
  - Good catch that resolver-group assignment needed an explicit support relation rather than remaining opaque rule logic.
- **Turn 18–24**
  - The assistant is fairly disciplined about not auto-adding newly implied classes, instead pausing to confirm them. That’s a positive pattern, even though it occasionally asks relationship questions too early.
- **Turn 20–24**
  - Missed obvious follow-up: once `RegulatoryNotification` emerged as distinct from generic communication, it would have been natural to ask about a `Regulator` class earlier rather than much later hinting at it only in rule cleanup.
- **Turn 21–23**
  - Good inverse-duplicate cleanup. The assistant correctly recognized the tool wanted one stored direction per connection.
- **Turn 23–27**
  - Efficient “remaining stranded classes” cleanup pass was useful and likely prevented a lot of later inconsistency.
- **Turn 27 onward**
  - Property elicitation is methodical and mostly restrained to decision-bearing fields; good prompt discipline.
- **Turn 35–37**
  - Asking “what breaks if missing or wrong?” is especially strong. It elicits validation importance without prematurely forcing requiredness.
- **Turn 37–43**
  - Rule elicitation is careful about only using already-modeled structure. This is one of the better parts of the interview.
- **Turn 38–39**
  - Good intervention when the rule referenced unsupported “addressed to regulator” logic. The assistant correctly forced a modeling choice instead of hand-waving it.
- **Turn 40–50**
  - Action modeling got increasingly tool-driven and somewhat contorted. Several actions were progressively weakened to fit existing model structure instead of prompting for richer ontology support. Good for consistency, but it risks producing an ontology that underrepresents operational reality.
- **Turn 44–50**
  - Nice catch that `sendStakeholderCommunication`’s chosen input class conflicted with the stored relationship direction. This is exactly the kind of stateful consistency check the interviewer should do.
- **Turn 50–54**
  - Bounded expansion pass was well done: it resisted open-ended brainstorming and only admitted `IntegrationInterface` and `BusinessProcess` after justification.
- **Turn 55–67**
  - Validation phase is useful, but several “fixes” are really reductions in action semantics. A reviewer optimizing the prompt may want to instruct the agent to prefer asking for missing model structure over weakening actions, unless the user explicitly prefers minimalism.
- **Overall**
  - The interviewer is strong at incremental ontology construction and duplicate cleanup, but weaker at maintaining a strict distinction between:
    1. what is actually in the persisted model,
    2. what the persona has merely said informally,
    3. what the assistant wishes were true for cleaner action verification.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
