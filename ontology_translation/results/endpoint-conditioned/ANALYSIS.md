# Endpoint-conditioned relationship recovery: analysis

Numbers from `REPORT.md`, primary reading (heuristic, full domain), means over 3 runs. Reading rules: `DESIGN.md`, amendment 1. That amendment replaced the original rule after the first output was seen.

## Script check against the first paper

First paper's runs, semantic policy, practical scope:

| Run | Eligible (here) | Eligible (published) | Recovered (here) | Recovered (published) |
|---|---|---|---|---|
| run-01 | 31 | 31 | 13 | 13 |
| run-02 | 24 | 24 | 14 | 14 |
| run-03 | 15 | 19 | 8 | 8 |

Runs 01 and 02 reproduce exactly. In run-03 the same 8 relationships are recovered, but 4 fewer are eligible. The current scorer matches fewer of that run's classes than the scorer of the time did. The published 42 % for run-03 becomes 53 % here.

## 1. The gap: relationship recall / class recall

| Generation | itops | 4 published, macro | Published domains below 1.0 |
|---|---|---|---|
| First paper | 0.25 | — | — |
| Aug–Sep (gpt-5.4) | 0.67 | 1.13 | brick-hvac 0.92 |
| Phase epic #152 (gpt-5.4) | 0.66 | 1.12 | brick-hvac 0.88, iof-maintenance 0.89 |
| Final (gpt-6-sol) | 0.88 | 1.20 | brick-hvac 0.78; iof-maintenance 1.00 |

- **On the published domains the gap is closed in the macro mean in every generation since the first paper.** Brick HVAC is the exception in every generation, and it is the densest published gold model (0.90 relationships per class).
- **On itops the gap narrowed sharply but did not close:** 0.25 → 0.88.
- So "the gap closes" holds on the published domains and does not hold in general. The article should say "narrows sharply, and closes on the published domains".

## 2. Where the remaining deficit comes from (conditional rate)

| Generation | itops | 4 published, macro |
|---|---|---|
| First paper | 32.6 % | — |
| Aug–Sep | 68.9 % | 84.6 % |
| Phase epic #152 | 67.9 % | 86.5 % |
| Final | 85.8 % | 89.7 % |

- **Relationship elicitation itself improved:** on itops, relationships between two recovered classes went from 32.6 % to 85.8 %.
- **Density check (amendment 1, rule 3):** at the final configuration the dense itops gold (85.8 %) is within 4 points of the sparse published macro (89.7 %). Once both endpoints are found, relationships are elicited at about the same rate whatever the density. The gold-density explanation therefore does not hold for the conditional measure.
- **The remaining raw gap on itops is endpoint gating:** only 49.7 % of the gold relationships have both endpoints recovered, in line with the class recall of 48.5 %. What holds back itops relationships at the final configuration is class recall on a 287-element domain.
- In the two gpt-5.4 generations the itops conditional rate (68–69 %) was well below the published macro rate (85–87 %). The density concern was real then and closed at the final configuration.

## 3. B3 (no live commits) at the final configuration

| | Interactive | B3 |
|---|---|---|
| Conditional rate, 4 published | 89.7 % | 80.5 % |
| Conditional rate, itops | 85.8 % | 78.3 % |
| Class recall, itops | 48.5 % | 67.2 % |
| Ratio, itops | 0.88 | 0.79 |

- **Live commits raise relationship elicitation among found classes, on both the published domains and itops.**
- B3's higher itops composite (0.662 against 0.577, `baselines-gpt6/REPORT.md`) comes from class recall, not from relationships. This is relevant to Feri's overfitting point. On itops, the final interview finds fewer classes than an uncommitted conversation, and that is where any overfitting would show.

## 4. Semantic reading

The semantic reading points the same way and sits higher. For the final configuration, the 4-published macro conditional rate is 98.0 %. The first paper's itops runs score 49.4 % under it.

## Consequences for the article

- **Wording:** "the concept-structure gap narrows sharply (ratio 0.25 → 0.88 on the original fixture) and closes on the published domains (macro 1.20)". Not "closes" in general. This supports title A over title B.
- **Answer to the gold-density concern:** report the conditional rate together with the ratio. Relationship elicitation once both classes are found rose from 32.6 % to 85.8 % on the original fixture. That is close to the published domains, so it is not a density artefact.
- **What remains:** the open problem is class recall on large domains, not relationship elicitation.
