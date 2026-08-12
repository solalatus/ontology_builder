# Aborted first judge batch (harness bug, kept on purpose)

These are the raw replies from the **first** execution of
`judge-post-normalization.mjs`. It aborted after four calls: the fourth reply
(`gpt-5.1-run-01-reversed.md`) is a well-formed verdict object inside an
**unterminated** ```json fence, which `parseJudgeVerdict()` could not read at
the time, and the script then threw and lost the batch.

Two things were changed in response, both to the harness and neither to the
judge prompt, the models, the blinding, or the two ontologies being compared:

1. `parseJudgeVerdict()` now also accepts an unterminated fence and a bare
   braced object (regression-tested in `tests/post-normalization.spec.mjs`).
2. An unreadable reply is recorded in `judgments.json` under `parseFailures`
   and the batch continues, exiting non-zero at the end instead of throwing
   away the verdicts already paid for.

The batch was then re-run from scratch, and `../judgments.json` plus `../raw/`
come entirely from that second, complete execution. This directory is kept
rather than deleted for the same reason
`results/baselines/b2-generic-interviewer/trial-01-INVALID-dict-relationships-bug/`
is kept: the correction should be visible rather than merely asserted
(`EXPERIMENT_BRIEF.md` §4.6).

For the record, the four verdicts this aborted attempt produced were:

| run | judge | order | verdict |
|---|---|---|---|
| run-01 | gpt-5.6-sol | primary | normalized (medium) |
| run-01 | gpt-5.6-sol | reversed | tie (high) |
| run-01 | gpt-5.1 | primary | normalized (high) |
| run-01 | gpt-5.1 | reversed | original (high) — the unreadable one, read by hand from the raw file |

They are **not** used in the reported analysis, which uses only the complete
second batch. They are listed here so that re-running the judge cannot be
mistaken for having quietly discarded an unfavourable first result.
