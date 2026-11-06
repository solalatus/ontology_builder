# First-generation interviewer with the same models (E1): design note

Committed before the first paid call of this experiment (2026-11-04, Berlin time; the commit time is the record). No interview of this arm has run. The 2-turn smoke run of the arm comes after this commit.

## Question

With `gpt-6-sol` in every role and the same harness, persona, scorer and domains, how far is the second-generation (v2.0) interviewer from the first-generation (v1.0) interviewer?

Every column of the article's Table II changes the interviewer and the persona model at the same time, and the itops persona ablation (`../persona-ablation/`) puts most of the itops gain on the stronger simulated expert. This is the only same-model test of the claim that the interviewer itself improved.

## The two arms

| | v1 same-model (new) | final (existing + top-up) |
|---|---|---|
| Interviewer system prompt | v1.0's, verbatim (10 phases) | as shipped (`2cb93e0`) |
| Interviewer tools | `apply_ontology_yaml`, `get_graph_state` as v1.0 defined them | the four shipped tools |
| Consistency-checker repair loop | off | on |
| Everything else | shared | shared |

**What is v1** (`tests/evals/lib/interviewerGeneration.mjs`, fixtures in `tests/evals/fixtures/v1-interviewer/`, taken from `v1.0-coginfocom2026` = `2896779`):
- the system prompt: v1.0's `AGENT_SYSTEM_PROMPT_BASE` + `AGENT_KNOWLEDGE`, byte for byte (sha256 `b47e60a7…3585`), with the same output-language directive v1.0 appended. It names exactly two tools, and those are the two it is given;
- the tool definitions: v1.0's `apply_ontology_yaml` and `get_graph_state` (no arguments), and no other tool. The remove and rename tools and `get_graph_state`'s `finalValidation` flag are absent;
- the turn: one commit per turn, no consistency findings appended to any tool result, `get_graph_state` returns the plain YAML export (the app's eval switch `selfCorrectionDisabled`, which restores the pre-#84 turn). Without `finalValidation`, the end-of-interview second-opinion model review never runs;
- the note for a second commit in one turn uses v1.0's wording ("Skipped: only one apply_ontology_yaml call is applied per message."), since the current wording names a tool v1 does not have.

**How:** `ONTOLOGY_EVAL_INTERVIEWER_GENERATION=v1` in `run-multi-domain-benchmark.mjs`. `index.html` is not modified. The prompt goes in through the app's existing eval-only `systemPromptOverride`; the tool list and the one note are replaced in the Azure relay on each request the app sends. The relay checks every tool-carrying request (v1 prompt, exactly the two v1 tools) and the run fails instead of scoring if one does not match; the counts go into `provenance.json` (`v1Interviewer.relayAudit`). Unit and dry-run test: `tests/v1-interviewer-generation.spec.mjs`.

**What is shared** (identical in both arms):
- model `gpt-6-sol` on the same Azure resource in every role (interviewer, persona, completion classifier, semantic judge), the interviewer at the app's default effort (`high`), sent through the current app's provider layer (Chat Completions, and the Responses API for tool-carrying calls);
- the harness (`run-multi-domain-benchmark.mjs`, `conversationOrchestrator.mjs`), its caps (120 min, 300 turns, 600 s per app turn, 30 USD per run), stall detection and the snapshot at the wrap-up (`ONTOLOGY_EVAL_SNAPSHOT_AT_WRAPUP=1`, no coverage sweep, no naming pass);
- the persona text and wrapper of each domain, and its opening line;
- the scorer (heuristic, full domain, composite = mean of class, relationship and property F1);
- the current app's machinery that is not part of the interviewer: YAML import and merge, the export, context compaction, the note on relationships dropped for a missing endpoint class (#83), the narration-count check (#157), the connect flow.

So the v1 arm is the v1.0 interviewer as a model sees it (instructions, tools, tool feedback), run inside the current app. It is not the v1.0 application. The article says so.

## Runs

- **v1 arm** (`run-paired-stages.mjs --block=v1-same-model`, into `v1-same-model/runs/`): brick-hvac, iof-maintenance, iof-supply-chain, fibo-loans run-01..05 (20 interviews), plus itops run-01..03 (3 interviews). Interleaved by run index (run-01 of all five domains first), so a stopped block still covers every domain.
- **Final arm, top-up** (`--block=final --runs=…`, the existing configuration unchanged, into `final-scores/runs/`): run-04 and run-05 on the same four development domains (8 interviews). Together with the existing run-01..03 (brick-hvac and fibo-loans from `default-change-187/treatment/`, see `final-scores/DESIGN.md`) the final arm has n = 5 per development domain and n = 3 on itops.
- Order: the v1 arm first, then the top-up. One interview at a time; no other block runs on the deployment meanwhile. ePO is not part of E1.
- Why 5: from the final arm's own run spread, the expected 95 % half-width of the primary difference is about ±5.7 composite points at 3 against 3 and about ±4.1 at 5 against 5; for relationship F1 about ±12.4 against ±8.7.
- The cost recorded is the harness figure (gpt-6-sol rate for every call). Expected total about 70 USD. The driver's budget guard is set high (1000 USD) and the cost of each block is reported.

**Interruptions and run ends (fixed now, the same for both arms):**
- An interview cut off by infrastructure (process failure, network failure, HTTP 429 exhausting its retries, `app_agent_errored_repeatedly`, `classifier_failing`, `leak_detected_after_retries`) is not a result. Its incomplete folder is moved to `failed-attempts/` (kept, not averaged) and the interview is rerun alone. This is recorded in `REPORT.md`. (Approved in advance by the owner for this experiment, 2026-11-04.)
- An interview that ends on its own behaviour or on a cap (`max_turns_reached`, `wallclock_timeout`, `cost_cap_reached`, `wasted_turns_no_tool_activity`, `interview_ended_incomplete`, `pleasantry_loop_detected`, `app_agent_produced_no_text_repeatedly`) is a result of its arm. It is scored on the model as it stood when it stopped (the run's `metrics.json`) and included; it is flagged in `REPORT.md`. Excluding such runs would favour whichever arm fails more often. A sensitivity line gives the primary estimate without them.
- A clean run is scored on snapshot A (the model at the interviewer's own wrap-up), as for every final-configuration result.

## Reported (`tests/evals/v1-same-model-report.mjs` → `REPORT.md`, `results.json`)

`results.json` uses the cell format of `../run-intervals/results.json` (`mean`, `min`, `max`, `values` per domain and metric), so `tools/gen_tables.py` can read it. Per arm and domain, as mean [min–max]: composite, class / relationship / property F1, precision and recall; turns, cost, stop reason; interviewer-first identifiers per 100 gold elements.

## Reading (fixed in advance)

**Primary:** the macro composite over the four development domains, final minus v1, as the difference of macro means:

  D = (1/4) Σ_d (mean_final,d − mean_v1,d).

Its 95 % interval is domain-stratified: Var(D) = (1/16) Σ_d (s²_final,d / n_final,d + s²_v1,d / n_v1,d), with Welch–Satterthwaite degrees of freedom, df = Var(D)² / Σ_d Σ_arm [(s²/n)/16]² / (n − 1), and t at 0.975 on df. This is the standard interval for a difference of stratified means. It treats the four domains as fixed strata, not as a sample of domains.

**Key secondary:** relationship F1, computed in the same way. This is the first paper's central finding (concepts recovered, structure not).

**Descriptive:** itops alone (3 against 3, plain Welch); the per-domain differences (plain Welch); class and property F1.

**Fixed reading, three outcomes, the same for the primary and the key secondary:**
- (a) lower bound > 0: "with the same models in every role, the second-generation interviewer scores X points higher [a, b]";
- (b) estimate > 0, interval includes 0: "X points higher on average; with 5 runs per arm the difference is within run-to-run spread [a, b]";
- (c) estimate ≤ 0: "no gain over the first-generation interviewer with the same models [a, b]".

The outcome decides wording only. It never removes a result from the article.

**Comparison cells:** the final arm is the `final` cells of `../run-intervals/results.json` (run-01..03, built from `../final-scores/`; brick-hvac and fibo-loans from `../default-change-187/treatment/`) plus the run-04 and run-05 top-up, each scored the same way (snapshot A, `snapshotRow` of `analyze-paired-stages.mjs`). The report checks that it reproduces the committed run-01..03 values exactly. `run-intervals/` and `final-scores/summary.json` are not changed.

## Follow-up block (separate design note)

The v1 arm on the held-out ePO domain has its own design note, committed before its runs: [`EPO-DESIGN.md`](EPO-DESIGN.md). Nothing above changes.

The interviewer × simulated-expert cell on itops (v1 arm with the gpt-4o-mini persona) has its own design note, committed before its runs: [`WEAK-EXPERT-ITOPS-DESIGN.md`](WEAK-EXPERT-ITOPS-DESIGN.md).
