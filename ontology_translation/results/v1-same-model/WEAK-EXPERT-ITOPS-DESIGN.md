# Interviewer × simulated expert on itops, the missing cell (B1): design note

Committed before the first paid call of this block (2026-11-06, Berlin time; the commit time is the record). No interview of this cell has run.

## Why

The persona ablation (`../persona-ablation/`) splits the itops gain since the first paper into an expert share (87.5 %) and an interviewer share (12.5 %). That split depends on the order of comparison and mixes interviewer models: the first paper's runs used gpt-5.5 as interviewer. The co-author's review asked for a complete 2×2 with the same interviewer model. Three cells exist, all on itops, gpt-6-sol as interviewer, classifier and judge, 3 runs each:

| | gpt-6-sol expert | gpt-4o-mini expert |
|---|---|---|
| v2 interviewer (final) | A: `final-scores/runs/*/itops` | B: `persona-ablation/runs/*/itops` |
| v1 interviewer (E1 arm) | C: `v1-same-model/runs/run-0[1-3]/itops` | **D: this block** |

## Runs

- **3 interviews, itops** (`run-paired-stages.mjs --block=v1-4omini-itops`), into `weak-expert-itops/run-0X/itops/`.
- Exactly the E1 v1 arm (v1.0 prompt and its two tools, no repair loop, relay audit) with one change, the persona-ablation change: `ONTOLOGY_EVAL_PERSONA_MODEL=gpt-4o-mini` (deployment `gpt-4o-mini`). Caps as everywhere: 120 min, 300 turns, 600 s per app turn, 30 USD per run.
- One interview at a time; no other block on the deployment.
- Cost accounting: the harness prices every call at the gpt-6-sol rate (upper bound for the persona calls).
- Interruptions and run ends: as in `DESIGN.md` here.

## Reported (`tests/evals/v1-same-model-report.mjs`, `../t-intervals/`)

Cell D per run and as mean [min–max] (composite, class / relationship / property F1, heuristic, full domain; semantic composite as sensitivity), and, for composite and relationship F1, each with a 95 % Welch interval (linear combination of the four cell means, Welch–Satterthwaite df):
- interviewer effect with the strong expert, A − C, and with the weak expert, B − D;
- expert effect with the v2 interviewer, A − B, and with the v1 interviewer, C − D;
- main effects: interviewer ((A − C) + (B − D)) / 2 and expert ((A − B) + (C − D)) / 2;
- interaction (A − B) − (C − D).

## Reading (fixed in advance)

- The article replaces the 87.5 % / 12.5 % split with these effects and intervals. The first paper's runs stay in Table III as history, not as a cell of the 2×2.
- Each effect is worded by the three outcomes of `DESIGN.md` (lower bound > 0: "higher"; estimate > 0 with an interval including 0: "higher on average, within run-to-run spread"; estimate ≤ 0: "no gain").
- **Interaction:** interval excluding 0 → "the effect of the interviewer depends on the strength of the simulated expert"; otherwise "no interaction is shown".
- With 3 runs per cell these intervals describe the runs, not a population.
