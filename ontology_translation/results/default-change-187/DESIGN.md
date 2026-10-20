# Default change #187: design note (pre-registration)

Committed before the first paid run. This measures, as one change, what the owner decided on 2026-10-20 to ship:

1. **Naming at confirmation time (#187, from #180).** Phases 2, 3 and 4 of the shipped interviewer prompt now ask, in the same batch as each confirmation, for the expert's own term. For a relationship that means their verb and direction. The answer becomes the name, and the interviewer's wording is kept as an alias. An item already recorded under the interviewer's wording is renamed in place with `rename_ontology_elements`, which is now part of every interview's tool list.
2. **No stopping mid-interview (#188).** GROUND RULES: a farewell-sounding remark while later phases are unfinished is not a refusal to continue. The interviewer names the remaining phases and asks the next question.
3. **Default effort `high`** (owner's decision, overriding #181's measured "no gain from `high` at the interview stage").

The production prompt's golden hashes in `tests/agent-production-invariants.spec.mjs` change with this, as that file requires: a new treatment, measured before it is compared to anything.

## Arms

| Arm | What | Runs |
|---|---|---|
| Treatment | This branch's shipped app; no effort passed, so the app's default (`high`) runs. Interview only: snapshot A at the interviewer's own wrap-up, no stages | fibo-loans, brick-hvac × 3 = 6, new |
| Control | #182 block 1, snapshot A: the previous prompt at explicit `medium`, same model (`gpt-6-sol`), persona, wrapper, scorer and harness | reused, 6 |
| Context, not control | #182 block 1 snapshot C (old prompt plus the separate naming stage, `medium`); #182 block 2 snapshot A (old prompt, `high`) | reused |

**Why the control can be reused.** Since #182, the harness has gained one change, the #188 completion-classifier pre-filter. Checked against every committed wrap-up, it would have changed none of the control's snapshots. The persona wrapper is deliberately not changed, so the persona is identical across arms.

**Two factors at once.** The treatment changes the prompt and the effort together, because the owner asked for one measurement of the change as shipped. It answers "is the new default configuration at least as good as the old one, and does the naming gain carry into the prompt". It cannot separate the prompt's contribution from the effort's. #182 block 2 snapshot A (old prompt at `high`) is reported beside it as context for that question.

## Fixed for every run

The same settings as #182 (see `paired-stages/DESIGN.md`):

- **Model and caps:** `gpt-6-sol` on Azure; 120-minute wall clock; 300 turns; 600 s per app turn; 30 USD per-run cost cap.
- **Scoring:** snapshot A scored exactly as #182's snapshots, from its YAML export with its own judge verdicts and an offline-replay check.
- **Order:** runs go one at a time, alternating domain by domain.
- **Budget:** the driver (`tests/evals/run-paired-stages.mjs --block=187`) stops before starting a run once 60 USD are recorded under this directory.
- **Exclusion:** a run that hits any cap, or ends other than `stages_complete`, is reported and not averaged in, and the owner is asked before anything else is spent.

## Pass criteria (`tests/evals/analyze-default-change.mjs`)

All are computed per domain on the heuristic scorer, full domain, as means over clean runs. "Control sd" is the sample stdev of control snapshot A over its 3 replicates.

1. **Non-regression.** On both domains, the treatment's composite is at least the control mean minus the control sd, and so is its practical-scope composite.
2. **The naming gain carries into the prompt** (#180's criterion, against control A). On both domains, relationship F1 or property F1 rises by more than the control sd for that measure, and relationship precision is not down.
3. **No interview cut short (#188).** Every run ends `stages_complete` at a genuine wrap-up, and none ends `interview_ended_incomplete`.
4. **The shipped default is what ran.** Every run's provenance records effort `high`, and no run is over a cap.

**#187 and #188 close when these are met.** If any criterion is not met, the result is reported as such and the owner decides before merge.
