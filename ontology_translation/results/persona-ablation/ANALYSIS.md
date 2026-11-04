# Persona ablation: analysis

Numbers from `REPORT.md` (heuristic, full domain, all arms rescored with the current scorer, 3 runs per arm, 95 % bootstrap over runs).

## Main result

With the first paper's persona model (gpt-4o-mini), the final interviewer gains little over the first paper:

| Metric | First paper | Ablation | Final |
|---|---|---|---|
| Composite | 25.4 | 29.4 | 57.7 |
| Relationship F1 | 10.8 | 19.1 | 59.0 |

- Ablation − first paper:
  - composite +4.0 pp [−1.3, 9.3], not clear of zero;
  - relationship F1 +8.3 pp [2.9, 13.8], clear of zero;
  - property F1 +0.2 pp.
- Final − ablation:
  - composite +28.2 pp [17.2, 37.3];
  - relationship F1 +39.9 pp [29.2, 49.3].
- By the reading fixed in DESIGN.md, about 87 % of the itops composite gain (83 % of the relationship-F1 gain) goes with the change of persona model. About 13 % (17 %) remains with the interviewer, prompt and tools.

**Consequence for the article.** The itops improvement from the first paper to the final configuration cannot be attributed mainly to the interviewer. Most of it coincides with the stronger simulated expert. The interviewer changes give a small composite gain at the weak persona and a clear but modest relationship gain. The article must say this plainly.

Two caveats limit the attribution in both directions. First, the persona text also differs from the first paper's (`persona-eszter.md` vs the converted `domains/itops/persona.md` plus wrapper). Second, the final interviewer was developed against the strong persona and may rely on it, so the ablation can understate what the interviewer would do with a weak but real expert.

## Rubber-stamping concern (Amendment 1)

**Fixed rule: not supported.** Of the three conditions:
- interviewer-first share of matches higher than in the final runs: **false**;
- confirm-only share at least 10 pp higher: **false**;
- relationship precision no higher: **true**.

The realistic reading is mixed. The rule should not be quoted as "ruled out".

- **The vocabulary comes from the persona.** The interviewer introduced first 0 of 53–57 named gold terms in every ablation run, against 1–10 in the final runs. A separate check showed that only 2–9 of the persona-credited terms per run had first been said in plain words by the interviewer, so the result is not an echo artefact.
- **The weak persona confirms more.** 22.8 % of its turns in the class and relationship window are confirm-only, against 13.7 % in the final runs. The difference is +9.1 pp, just under the 10 pp bar, and the per-run range is wide: 12.9–31.8 %.
- **It corrects much less.** Relationship precision is 36.8 %, against 97.2 % in the final runs. Property precision is 46.7 % against 89.5 %, and class precision 77.2 % against 100 %. The weak persona lets wrong commitments stand far more often.
- **Reading:** the weak persona does not take its terms from the interviewer. It is, however, a weaker check on what the interviewer commits. That fits the concern in a narrower form: it accepts rather than corrects.
- **Limit of check 3:** gpt-4o-mini writes long replies (about 228 words per turn in the first paper). The under-25-words branch rarely fires, so a long reply that only agrees is not caught. The share is a lower bound for agreement-only turns.

## Disclosures

- Amendments 1 and 1a were committed before any ablation artefact was opened.
- At 11:40 Berlin time, while checking the block log for status, one score line of run-02 (composite 0.346) was seen by accident. No analysis choice was made after that.
- The first paper's interviewer-first figures use that run's own stored `heuristic-matches.json` (old scorer). The scores above are rescored.
