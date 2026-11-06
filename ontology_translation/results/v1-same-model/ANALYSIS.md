# First-generation interviewer with the same models (E1): analysis

Numbers from `REPORT.md` (heuristic, full domain; 95 % Welch t-intervals, macro domain-stratified). gpt-6-sol in every role in both arms; 5 interviews per development domain and arm, 3 on itops. All 23 v1 interviews and all 8 top-up interviews ended `stages_complete`; every run is scored on snapshot A.

## Readings fixed in DESIGN.md

- **Primary**, macro composite over the four development domains, final − v1: **+8.6 points [+3.5, +13.7]** (final 77.6 %, v1 69.0 %). Outcome (a): "with the same models in every role, the second-generation interviewer scores 8.6 points higher [+3.5, +13.7]".
- **Key secondary**, macro relationship F1: **+17.3 points [+7.0, +27.5]** (76.7 against 59.5 %). Outcome (a).

## Descriptive

- The gain is in structure: macro class F1 differs by +2.0 [−2.6, +6.6], property F1 by +6.5 [−1.4, +14.4]. The second-generation interviewer recovers about as many classes as the first, and many more of the relationships between them. This is the first paper's gap (concepts recovered, structure not), now measured with the same models.
- Per domain (composite): Brick +16.0 [+1.3, +30.8], IOF Maintenance +10.1 [−0.5, +20.8], IOF Supply Chain +6.8 [−1.1, +14.7], FIBO +1.3 [−11.2, +13.9]. Relationship F1 is higher on all four.
- **itops** (the unpublished control, 3 against 3): composite −2.9 [−23.5, +17.7], relationship F1 −1.4 [−22.6, +19.9]. No gain on the original fixture. Together with the persona ablation, the itops improvement since the first paper goes with the models, not with the interviewer: with the first-generation interviewer held fixed, moving to gpt-6-sol in every role raises the itops composite from 25.4 (first paper's runs) to 60.6 % (+35.1 [+19.3, +51.0], `t-intervals/`), more than the final interviewer reaches there.
- The final arm's macro composite at 5 runs is 77.6 % (78.1 % at the 3 runs of `final-scores/`).

## What the v1 arm is, and what it is not

The v1.0 prompt and its two tools, without the repair loop, inside the current app and harness (DESIGN.md, "The two arms"). The relay audit in each `provenance.json` shows, for every v1 interview, that every tool-carrying request carried the v1.0 prompt and exactly the two v1 tools (0 violations in 23 interviews). `tool-calls.md` records the app's own message history, so the "Skipped" note of a second commit in a turn appears there in the current app's wording, which names `remove_ontology_elements`; the request the model received carried v1.0's wording instead (`relayAudit.skipNotesRewritten` counts the rewrites, once per request that resent the note). The current app's export lists an empty `competency_questions:` key that v1.0 did not have.

## Interruptions, cost, duration

- One interruption: a container restart cut itops run-01 off at turn 111 (2026-11-04, about 23:07 Berlin time, 2.42 USD). It is kept in `failed-attempts/`, not averaged, and was rerun alone, as DESIGN.md fixes. No resume from a checkpoint was possible (the runner restarts an interview from scratch).
- HTTP 429 rate limits occurred during itops interviews and were absorbed by the relay's backoff; no run failed on them.
- v1 arm: 43.59 USD harness cost under this directory (including the interrupted attempt), 2026-11-04 21:45 to 2026-11-05 04:56 Berlin time (7 h 11 min, including about 1 min lost to the restart and the rerun of itops run-01).
- Final top-up (8 interviews in `final-scores/runs/run-04`, `run-05`): 16.29 USD, 04:56 to 07:20 Berlin time (2 h 24 min).
- Smoke run of the v1 arm (2 turns): 0.04 USD.

## Held-out domain (`EPO-DESIGN.md`)

Three v1 interviews on epo-ordering (2026-11-06, 10:16–10:58 Berlin time, all `stages_complete`, relay audit 0 violations, 4.86 USD), compared with the three committed interactive ePO runs of the final interviewer; both rescored (heuristic, full domain).

| Arm | Composite | Class F1 | Relationship F1 |
|---|---|---|---|
| v1, same models | 89.4 [83.9–92.2] | 97.9 | 78.8 |
| final | 96.8 [93.6–100.0] | 98.6 | 98.6 |

- **Reading fixed in EPO-DESIGN.md:** composite, final − v1: **+7.4 [−2.4, +17.2]** (plain Welch, df 3.5) → outcome **(b)**: "7.4 points higher on the held-out domain; with 3 runs per arm the difference is within run-to-run spread".
- Relationship F1 (descriptive): +19.8 [−1.0, +40.7]; class F1 is level. The same pattern as on the development domains: the generations differ in structure, not in concepts.
- The final interviewer is at 96.8 %, near the ceiling, as stated in advance.

## Interviewer × simulated expert on itops (`WEAK-EXPERT-ITOPS-DESIGN.md`)

Cell D (v1 interviewer, gpt-4o-mini persona, gpt-6-sol elsewhere): 3 interviews, 2026-11-06 16:57–18:23 Berlin time, all `stages_complete`, relay audit 0 violations, 11.53 USD (harness figure, upper bound for the persona calls). Composite 23.2 [17.3–29.0], relationship F1 6.8 [4.6–10.5].

| | gpt-6-sol expert | gpt-4o-mini expert |
|---|---|---|
| v2 interviewer | A 57.7 | B 29.4 |
| v1 interviewer | C 60.6 | D 23.2 |

Readings fixed in the design note (composite; Welch, linear combinations of the four cell means):
- **Expert main effect** +32.8 [+22.6, +43.0] → (a): with the stronger expert the result is higher.
- **Interviewer main effect** +1.7 [−8.5, +11.9] → (b): higher on average, within run-to-run spread.
- **Interaction** −9.2 [−29.6, +11.3] → no interaction is shown.
- Simple effects: interviewer with the strong expert −2.9 [−23.5, +17.7], with the weak expert +6.3 [−5.8, +18.3]; expert with v2 +28.2 [+7.4, +49.1], with v1 +37.4 [+21.5, +53.3].
- Relationship F1 (descriptive): expert main effect +46.8 [+36.4, +57.1]; interviewer main effect +5.5 [−4.9, +15.8]; interviewer with the weak expert +12.3 [+3.6, +21.0].

These effects replace the 87.5 % / 12.5 % split of the persona ablation in the article.
