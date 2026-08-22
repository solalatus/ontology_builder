# SUPERSEDED — pre-Finding-A-fix data, do not treat as current

This directory is a frozen, historical snapshot of the real 4-domain ×
3-replicate multi-domain elicitation benchmark run on 2026-08-21
(`brick-hvac`, `iof-maintenance`, `iof-supply-chain`, `fibo-loans`; see
`ontology_translation/TODO.md`'s 2026-08-21 Log entries for the original
run, and issue #133 for everything below).

**This data predates every fix in issue #133 and is known to be
leak-contaminated.** A post-hoc audit found the persona's own replies
verbatim-leaked raw ground-truth identifiers in several of these
transcripts (Finding A), inflating recovered-class and recovered-rule F1 by
roughly 12 and 4.5 points respectively at the macro level (see issue #133's
own body for the full leak-adjusted retroactive numbers, domain by domain).
A follow-up audit found 21 further defects (E1-E21) affecting scoring
correctness, harness robustness, and reporting rigor — most are fixed on
top of this same commit (see `TODO.md`'s 2026-08-22 Log entry for the full
list); a few are explicitly deferred and tracked separately.

**Why this is committed at all, given it's known-bad data**: issue #133's
own audit (E9) flagged that the entire benchmark output had always been
gitignored, so no real completed run was ever actually auditable in the
repo — not even the one the original #111/PR #132 report was based on.
Committing this snapshot here, explicitly marked superseded, makes the
original (contaminated) numbers independently verifiable against the real
transcripts that produced them, rather than only trusted from prose in
`TODO.md`.

**What changed since this snapshot was produced**: every fix listed in
`TODO.md`'s 2026-08-22 Log entry, most importantly the root-cause fix that
stops the persona's own context from ever containing a raw internal
identifier at all (item 1), the wrapper-prompt fixes (E11, E12, item 2),
and the runtime leak guard (E13, item 4). `summary.json`/`summary.md`/
`runs.csv`/`domain-comparison.csv` in this directory were regenerated with
the CURRENT (fixed) `summarize-multi-domain-benchmark.mjs` — so the
statistical safeguards added in this same pass (gold-support-n floors,
Pearson bootstrap CIs, the fixed 3-component `recoveryEffectiveness`) are
applied to the old per-run data, but the underlying per-run `metrics.json`
figures themselves are still the original, pre-fix, leak-contaminated
numbers. Do not read this directory's own headline figures as a validated
result — read them as "what the old run looked like, scored honestly by
the new reporting code."

**A fresh, corrected 12-run benchmark has not been executed yet** — issue
#133's own item 9, deliberately deferred until this fix pass is itself
independently audited. Once it has been, its output belongs at
`ontology_translation/results/multi-domain/` (the live path, empty as of
this commit), not here.
