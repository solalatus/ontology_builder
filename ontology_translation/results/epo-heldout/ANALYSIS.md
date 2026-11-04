# ePO eOrdering, held out: analysis

Numbers come from `REPORT.md`: heuristic, full domain unless stated, 3 runs per arm, 95 % bootstrap over runs. The interviewer was frozen: `index.html` is unchanged against `2cb93e0`, and the block env equals the final configuration. The domain folder checksums are unchanged since freezing (`infocom_ontology_article/run_logs/epo-ordering.frozen.sha256`).

## Results

| Metric | Interactive | B3 (same interview, no live commits) |
|---|---|---|
| Composite | 96.8 [93.6–100.0] | 74.9 [59.5–96.4] |
| Relationship F1 | 98.7 | 84.0 |
| Relationship precision / recall | 100.0 / 97.3 | 98.6 / 74.7 |
| Actions F1 (identification) | 100.0 | 0.0 |
| Composite, practical scope | 70.4 | 76.4 |

Interactive − B3:
- composite +21.9 pp [1.5, 37.3];
- relationship F1 +14.6 pp [4.8, 26.8].

## Readings fixed in DESIGN.md

1. **Generalisation:** 96.8 % is *above* the published range (68.0–91.1). The rule fixed in advance has no label for that case, so the result is reported as "above the published range", not as "transfers".
2. **Overfitting check:** interactive is clearly ahead of B3 (the interval excludes 0). So the itops pattern, where B3 was level with interactive, is specific to itops and does not recur on a held-out domain.
3. **Gap:** relationship/class recall ratio 1.00, conditional rate 100 %. On this domain, every relationship whose two classes were found was also recovered.

## Caveats (state with the number)

- **The simulated expert knows part of this public vocabulary.** Of the 14 multi-word gold class names that are absent from the persona briefing, the persona itself said 10–13 per interactive run. Examples: "originator information", "order response information", "delivery agreement". The interviewer introduced none of the identifiers first (0 per 100). So this is not interviewer prior knowledge; it is persona-model knowledge. The leak guard checks only raw identifiers, so it cannot see it. The same post-hoc count on the development domains (final runs, persona said / absent from briefing):
  - IOF Maintenance 96 %;
  - ePO 83 %;
  - IT ops 47 %;
  - Brick HVAC 41 %;
  - FIBO Loans 37 %;
  - IOF Supply Chain 22 %.

  The two highest counts belong to the two highest-scoring domains. This check was added after the runs and is disclosed as post hoc.
- **Size:** 88 gold elements, small like IOF Maintenance (38 elements, 91.1 %). Scores fall with domain size.
- **Practical scope reverses the arm order:** B3 76.4 vs interactive 70.4. The practical scope keeps 20 of 25 classes and 10 of 38 properties. The interactive arm recovers almost the whole domain, so its out-of-scope elements count as false positives there. Full domain is the comparable scope for the published 78.1 % and is the one reported first. The practical figures go into the table, not out of it.
- **Rules F1 is low in both arms** (14.3 / 11.9). Actions are identified perfectly in interactive and not at all in B3, where the action names differ from the gold.
- **B3 spread is wide** (59.5–96.4). With 3 runs, all of this is descriptive.

## Disclosures

- The first attempt of interactive run-02 failed on an HTTP 429 rate limit while two blocks ran in parallel. It is kept in `failed-attempts/`, not averaged, and was rerun alone with the owner's approval.
- The interactive composite was looked at after the interactive block ended and before B3 finished. No analysis choice was changed after that. The post-hoc persona check was added at that point and is labelled as such.

Bootstrap seeds: `tests/evals/run-intervals.mjs` repeats the two ePO differences with its own seed offset. It gives relationship F1 [4.8, 26.2] instead of [4.8, 26.8], and the composite interval is identical. The article quotes this report (`epo-heldout-report.mjs`).
