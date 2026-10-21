# Baselines at the shipped configuration: analysis

These are the readings of `REPORT.md`, which holds the generated tables. The pre-registration is `DESIGN.md`, including Amendment 1 and the note on the container restart.

**What was compared.** Three comparison conditions (`tests/evals/EXPERIMENT_BRIEF.md` §3) were run on all five domains, three runs each, against the final scores (`../final-scores/`). That is the shipped app on `gpt-6-sol` at default effort `high`, and it is called *interactive* below. Each condition varies one factor:

- **B1, one-shot:** one extraction call over the interactive run's own finished transcript.
- **B2, generic interviewer:** a fresh interview with a short generic prompt in place of the staged one.
- **B3, no commits:** a fresh interview with the staged prompt but no tools, and the model extracted from its transcript at the end with B1's prompt.

All 45 runs ended cleanly and every snapshot passed the offline-replay check. A separate rescore afterwards (`tests/evals/rescore-saved-run.mjs`) reproduces all 45 on composite, practical scope, semantic, rules F1 and actions F1.

## The result

| | Interactive | B1 one-shot | B2 generic interviewer | B3 no commits |
|---|---|---|---|---|
| **Composite, four published domains (macro)** | **0.781** | **0.786** | **0.353** | **0.688** |
| Composite, all five | 0.740 | 0.743 | 0.338 | 0.683 |
| Semantic, four published | 0.808 | 0.808 | 0.397 | 0.733 |
| Relationship F1, four published | 0.785 | 0.769 | 0.275 | 0.600 |
| Class F1, four published | 0.771 | 0.792 | 0.468 | 0.741 |
| Property F1, four published | 0.786 | 0.796 | 0.316 | 0.723 |
| **Pre-registered reading: interactive beats / level / baseline ahead** (5 domains) | — | 0 / 5 / 0 | **5 / 0 / 0** | **2 / 3 / 0** |
| Turns per run | 76–137 (mean 96) | none (one call) | 4–13 (mean 7) | 81–276 (mean 142) |
| Cost per run, USD | 2.24 | 0.15 | 0.28 | 2.77 |
| Minutes per run | 21 | 1 | 4 | 23 |

**Per domain**, composite:

| Domain | Interactive | B1 | B2 | B3 |
|---|---|---|---|---|
| fibo-loans | 0.680 ± 0.016 | 0.694 ± 0.038 | 0.355 ± 0.106 | 0.685 ± 0.009 |
| brick-hvac | 0.811 ± 0.096 | 0.840 ± 0.076 | 0.273 ± 0.085 | 0.666 ± 0.085 |
| iof-maintenance | 0.911 ± 0.033 | 0.893 ± 0.046 | 0.304 ± 0.064 | 0.722 ± 0.099 |
| iof-supply-chain | 0.721 ± 0.065 | 0.717 ± 0.066 | 0.482 ± 0.045 | 0.680 ± 0.019 |
| itops (unpublished) | 0.577 ± 0.099 | 0.572 ± 0.097 | 0.275 ± 0.048 | 0.662 ± 0.102 |

## Readings

**1. The staged interview method is what makes the result.** Interactive beats B2 on all five domains, by 0.24 to 0.61. The generic interviewer is told only to interview the expert and build a model. It records a first draft in bulk, asks a few questions, and declares itself done after 4 to 13 turns. Its relationship F1 is 0.275, against 0.785. Same model, same persona, same tools, same scorer: the prompt alone moves the published-domain composite from 0.353 to 0.781.

**2. Committing during the interview improves the conversation, mostly the relationships.** Interactive beats B3 on brick-hvac (+0.145) and iof-maintenance (+0.189) and is level on the other three domains. Relationship F1 shows it most clearly: 0.600 without commits, against 0.785 with them.

B3 is also the longer and dearer route: 142 turns on average against 96, and 2.77 USD against 2.24. Without a live model, the interviewer has no recorded state to check paths and consistency against. It keeps confirming in conversation, and the extraction at the end recovers fewer of the connections.

The one domain where B3 is higher is itops: 0.662 against 0.577, within the stdev, so *level* under the rule. There B3 ran the longest interviews, 165 to 276 turns, on the largest gold.

**3. B1 is level everywhere, and that does not make the live model unnecessary.** B1 reads the transcript of an interview that *did* commit. Since #187, the interviewer confirms each element by name as it records it, so the conversation itself documents the model. B1's score is within ±0.06 of the interview it read on 14 of 15 runs, and on itops run-01 it reproduced the model element for element.

The useful comparison is B1 against B3. Both use the same extraction prompt and effort. They differ only in whether the conversation they read was held with a live model:
- **B1, conversations with commits:** 0.786 on the published domains.
- **B3, conversations without commits:** 0.688.

So the live model's contribution is to the conversation, not to turning a conversation into a model. Given a conversation held the interactive way, extracting at the end is as good as the live canvas. Without one, it is not.

**4. Taken together, the series decomposes the method.** On the four published domains, macro composite:

| Step | Composite | Change |
|---|---|---|
| Generic interviewer (B2) | 0.353 | |
| Add the staged prompt, no commits (B3) | 0.688 | +0.34 |
| Add commits to a live model (interactive) | 0.781 | +0.09 |
| Convert at the end instead of live (B1) | 0.786 | +0.005 |

The steps are not strictly nested: B2 has tools and B3 does not. They are the closest single-factor comparisons the conditions allow.

## Deviations, all recorded in `DESIGN.md`

- **The stall detector (Amendment 1).** The first B3 run was stopped at turn 80 by a harness stall detector that ends any run going 80 turns without a tool call. Under B3 that is the condition itself, so the detector would have stopped every B3 run. It was switched off for runs offered no tools only, with a test. The stopped run had no outcome and its slot was re-run.
- **The container restart.** The machine restarted during B3 fibo-loans run-03, at turn 32. That run had no outcome either and was re-run.
- **Both excluded runs** are kept in `excluded/`. Their 1.64 USD is counted in the total.
- **Extraction effort.** The B1 and B3 extraction call ran at effort `high`, the interviewer's default. The original itops baselines sent none, on a different model.

## Cost and time

| | |
|---|---|
| This series | 49.55 USD: 47.92 for the 45 runs, 1.64 for the two excluded ones |
| Budget | 80 USD |
| Wall clock | 21:27 to 04:53 UTC, run one at a time |
| Whole programme on Azure since #182 | 126.03 USD: #182 42.84, #187 13.84, final scores 19.80, baselines 49.55 |

## Limits to state in a paper

- **One model and one simulated persona per domain.** No human experts.
- **Three runs per condition.** These detect differences of about 0.1. B3's two *beats* are 0.15 and 0.19; its three *levels* are within the noise.
- **B1 is generous by construction.** It inherits the interactive conversation, which since #187 names every element. B1 says nothing about a one-shot extraction from a conversation it did not inherit.
- **The B2 prompt is the pre-registered original from the gpt-5.5 baselines.** It is short and generic by design. A stronger generic prompt would narrow the gap, but would no longer be the pre-registered baseline (brief §4.6).
- **B4 (private scratch model) and B5 (a held-out domain) were not run.**
