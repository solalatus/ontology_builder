# Ontology-recovery eval report

Generated: 2026-08-23T17:36:39.263Z

## Heuristic (regex/token-overlap) metrics

Two denominators, side by side: **full domain** is every class/relationship/property in the ground truth's 68-class comprehensive reference model; **practical scope** is the subset the ground truth's own canonical competency questions and actions actually talk about (see tests/evals/README.md) -- the ceiling a real, single-session, competency-driven interview could reach even with perfect elicitation. Full-domain numbers give context and cross-run comparability; practical-scope numbers are the more meaningful read of interview quality on their own.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **54.2%** | **52.1%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 51.5% / 97.2% / 67.3% | 83.3% / 55.6% / 66.7% | 35/68 full · 20/24 scoped ground-truth classes matched; 36 recovered |
| Relationship recall / precision / F1 | 30.6% / 78.6% / 44.0% | 47.2% / 40.5% / 43.6% | 33/108 full · 17/36 scoped ground-truth relationships matched; 42 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 37.8% / 79.2% / 51.2% | 72.0% / 34.0% / 46.2% | 42/111 full · 18/25 scoped ground-truth properties matched; 53 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 82.4% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Semantic (LLM-adjudicated) metrics

Same two denominators, same table shape, computed by `llmMatcher.mjs`'s `computeSemanticRecoveryMetrics()`: the heuristic pass above, plus a strict LLM judge given a second, structured look at every residual near-miss the heuristic pass rejected (a class/relationship/property phrased very differently than gold's hidden wording, or a controlled-value list using a different labeling convention for the same real scale). The judge only ever adds matches the heuristic pass missed -- it never overrides or removes a heuristic match, so this section's numbers are always >= the section above's on every recall metric. Any gap between the two sections is exactly the wording-variance tax the heuristic-only score was paying; a genuinely wrong or missing recovery costs the same in both.

| Metric | Full domain | Practical scope | Detail |
|---|---|---|---|
| **Recovery effectiveness (composite)** | **54.8%** | **53.2%** | equal-weighted: class F1, relationship F1, property F1, value fidelity |
| Class recall / precision / F1 | 52.9% / 100.0% / 69.2% | 87.5% / 58.3% / 70.0% | 36/68 full · 21/24 scoped ground-truth classes matched; 36 recovered |
| Relationship recall / precision / F1 | 30.6% / 78.6% / 44.0% | 47.2% / 40.5% / 43.6% | 33/108 full · 17/36 scoped ground-truth relationships matched; 42 recovered (subclass/"is a" predicates excluded from both -- see README) |
| Property recall / precision / F1 | 37.8% / 79.2% / 51.2% | 72.0% / 34.0% / 46.2% | 42/111 full · 18/25 scoped ground-truth properties matched; 53 recovered (technical identifier/URI fields excluded — see tests/evals/README.md) |
| Controlled-value fidelity | 82.4% | 100.0% | average allowed-value overlap across matched controlled-value properties |

## Rules and actions (heuristic)

Reported as their own dimensions, not folded into the recovery-effectiveness composite above (issue #105 -- a later issue can define a new composite once enough domains have been run with this data). A rule counts as recovered only when its core decision condition is semantically close to gold's, not merely its name (recoveryMetrics.mjs's `computeRuleMetrics`); an action's identification is separate from whether its input class, preconditions, effect, and verification text were also individually recovered.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 27.3% / 100.0% / 42.9% | 3/11 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 90.9% | of 11 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 19.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 62.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 61.7% | token-overlap similarity between gold and recovered verification text |

## Rules and actions (semantic)

Same shape as above, plus a strict LLM judge given a second look at every residual rule/action the heuristic pass didn't match (`llmMatcher.mjs`'s `computeSemanticRuleActionMetrics`). Input-class accuracy and precondition/effect/verification recovery are not themselves semantically re-judged -- only whether the rule/action itself counts as recovered at all is.

| Metric | Value | Detail |
|---|---|---|
| Rule recall / precision / F1 | 27.3% / 100.0% / 42.9% | 3/11 ground-truth rules matched (core condition equivalence, not name alone); 3 recovered |
| Action identification recall / precision / F1 | 100.0% / 100.0% / 100.0% | 11/11 ground-truth actions matched by name/meaning; 11 recovered |
| Action input-class accuracy | 90.9% | of 11 matched action(s) whose input class itself was recoverable at all |
| Action precondition recovery | 19.3% | token-overlap similarity between gold rule conditions and the recovered action's own linked rules, averaged over matched actions that had any |
| Action effect recovery | 62.4% | token-overlap similarity between gold and recovered effect text |
| Action verification recovery | 61.7% | token-overlap similarity between gold and recovered verification text |

## Run stats

- Interviewer model: `gpt-5.4` · Persona model: `gpt-5.4` · Classifier model: `gpt-5.4`
- Stopped: **app_agent_appears_finished**, after 111 turns, 1713s wall-clock
- Real app-agent API calls: 230 (apply_ontology_yaml called 58× · get_graph_state called 61×)
- Tool outcomes seen in transcript: 58 applied · 0 skipped · 0 no-op · 0 error
- Tokens: 31074035 total (31029422 prompt · 44613 completion) across 443 API calls
- **Degraded run** (issue #133/E4, E13, item 8): 0 app-agent error turn(s) (none), 0 context-compaction event(s), 0 unresolved ground-truth leak event(s) out of 0 caught, 8 consecutive turn(s) with no tool activity at the run's worst stretch -- exclude from macro statistics unless explicitly overridden.

## LLM review of the conversation

## Errors
- **Turn 3** — The system reports “11 consistency problem(s) unresolved,” but the interviewer keeps going without checking or resolving them. This looks like a real state/validation handling bug.
- **Turn 11** — Tool says “✓ Applied: 12 added” after a response that only justified 7 new classes and 2 non-classes; likely over-applied or counted unintended edits.
- **Turn 18** — Tool says “✓ Applied: 5 added” even though only 2 provider relationships were newly confirmed in that turn; likely miscount / possible unintended additions.
- **Turn 22** — Tool says “✓ Applied: 6 added” after confirming 4 prior relationships plus 2 new support links. The assistant had previously *not* confirmed `ResolverGroup --supports--> ITService`; applying it now is reasonable, but the pattern suggests the tool is batching older pending edits opaquely, making state hard to trust.
- **Turn 24 / 90–92** — The model keeps both `CybersecurityIncident` as a distinct class **and** later shifts to `Incident.cybersecurityIncidentFlag` because subclassing is unsupported. This leaves a conceptual contradiction/unresolved duplication in the ontology.
- **Turn 32–34** — `InfrastructureComponent` is added as a class and used in `Application --runsOn--> InfrastructureComponent`, then later declared not to be a real standalone class because the tool cannot model specialization. The bad class/relationship remain in the live model as a “cleanup item,” i.e. a known unresolved modeling bug.
- **Turn 33–34** — The interviewer explicitly says the tool cannot cleanly delete, so the model is knowingly left inconsistent with the elicited decisions.
- **Turn 75–79** — Rule `canSubmitRegulatoryNotification` includes “required fields and supporting evidence are complete,” but there is no modeled representation for “required fields complete”; the assistant records the rule anyway in partially ungrounded form.
- **Turn 80–81** — `canCloseIncident` is recorded with “post-incident review is scheduled or completed,” but `PostIncidentReview` has only `heldOn`; no status/scheduled representation exists. Rule is only partially model-supported.
- **Turn 82–84** — For `acknowledgeAlert` and `assignIncidentToResolverGroup`, the assistant repeatedly notes that preconditions are confirmed conceptually but not actually attached as formal rules. Action definitions are therefore incomplete despite being presented as recorded.
- **Turn 94** — After the user accepted `Communication` as the input for `send stakeholder communication`, the assistant fails to record the action and instead re-asks the same action question. This is a real interviewer state-tracking bug.
- **Turn 96** — Even after the user supplied richer preconditions, the assistant records only the effect/verification for `sendStakeholderCommunication`, dropping the confirmed preconditions because the model lacked fields. This is a partial/misapplied action edit.
- **Turn 101–103** — `restoreFromBackup` uses precondition values `successful`/`verified` before `BackupSet.status` allowed values exist; the assistant has to backfill the vocabulary later. Order-of-operations problem.
- **Turn 107** — `EmergencyChange` is introduced as a distinct class, but there is no relationship recorded between `EmergencyChange` and `Change` or `Incident`, despite the elicitation saying emergency changes are linked to active incidents. Leaves a gap in navigability.
- **Turn 109–110** — Validation claims the model is largely complete while explicitly acknowledging unresolved stale warnings, leftover invalid classes/relations, partially formalized actions, and only partial coverage for a competency question. The pass/fail threshold is inconsistent.

## Noteworthy observations
- **Turn 1** — Good structured kickoff: the interviewer establishes phases and starts with competency questions, which is efficient for ontology elicitation.
- **Turns 3–5** — Good follow-up on roles and “vendor vs external dependency”; catches an important category distinction early.
- **Turns 6–18** — The interviewer is generally disciplined about proposing small class/relationship batches and asking for explicit confirmation/correction, which works well.
- **Turns 12–18** — Strong interview behavior: when the persona rejects broad links like `ITService -> ConfigurationItem`, the interviewer pivots to ask for missing intermediate classes (`Application`, `InfrastructureComponent`) rather than forcing the original design.
- **Turns 20–22** — Good recovery from an initial over-broad `supportedBy` assumption; the interviewer asks what stable connector actually derives resolver-group routing.
- **Turns 24–28** — Nice handling of workaround modeling: instead of forcing a direct workaround link, the interviewer follows the persona into `Problem` / `KnownError` structure.
- **Throughout** — The assistant is transparent when the model/tool cannot support what the persona wants, often separating “operationally true” from “currently model-supported.” That’s useful and realistic.
- **Throughout** — However, this transparency often turns into inefficiency: many turns are spent re-litigating whether to record only the model-supported subset rather than proactively adding the obviously needed minimal properties/objects earlier.
- **Turns 33–34 and 90–92** — Repeated pattern: when subclassing is unavailable, the interviewer falls back to booleans on `Incident`. Pragmatic, but it leaves duplicate concepts in place instead of revisiting earlier class choices more decisively.
- **Turns 35–42** — Good discipline on properties: the interviewer avoids adding speculative fields and asks “what breaks if missing/wrong,” which is very effective for identifying decision-bearing properties.
- **Turns 59–74** — The one-by-one “what breaks if missing?” checks are methodical but somewhat slow; after a couple examples, the interviewer could likely have batched similar status properties to save turns.
- **Turns 75–81** — Good move surfacing missing concepts (`Regulator`, due time, residual-condition flag) only when rules actually require them.
- **Turns 82–108** — Action modeling is mixed:
  - good: the interviewer keeps noticing when operational action anchors differ from naive object anchors;
  - weak: many actions end up as “lean tool-compatible” shells with unmodeled preconditions, and the assistant keeps presenting them as if mostly done.
- **Turn 94** — The duplicate question on `sendStakeholderCommunication` suggests the agent may lose track after tool warnings; prompt should likely emphasize preserving conversational state across warning-handling.
- **Turn 109–110** — Missed obvious follow-up: once the persona says change/deployment causality is analytical over timelines, the interviewer could have checked whether missing time properties on `Change`/`Release` are needed to answer that competency question better.
- **Overall** — Strong elicitation quality, but the prompt/tool combo appears weak on deletion, subclassing, and binding action preconditions to formal rules. Those limitations repeatedly cause leftover artifacts and “accepted but not really modeled” outcomes.

## Full conversation log

See `conversation-log.md` in this same directory (overwritten every run alongside this report). Every real apply_ontology_yaml/get_graph_state tool call's exact arguments and results are in `tool-calls.md` alongside it, for verifying any suspected tool/state-sync issue against what was actually sent and returned rather than the interviewer's own narration of it.
