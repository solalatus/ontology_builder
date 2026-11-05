# run-04 and run-05: the E1 top-up

`runs/run-04/` and `runs/run-05/` on brick-hvac, iof-maintenance, iof-supply-chain and fibo-loans are the top-up of the final arm for the same-model comparison of the two interviewer generations (`../v1-same-model/DESIGN.md`). They were run on 2026-11-05 with `run-paired-stages.mjs --block=final --runs=...`, the configuration of this directory unchanged, and all ended `stages_complete`.

They are not part of `summary.json` or `REPORT.md` here, which stay the record of the 3-run final scores the article's Tables II and IV report. `analyze-final-scores.mjs` reads every `run-*` folder, so rerunning it with `--write` would fold run-04/05 of the two IOF domains into those files; it was not rerun. The 5-run final arm is reported in `../v1-same-model/REPORT.md`.
