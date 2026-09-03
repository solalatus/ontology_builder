# Multi-domain elicitation benchmark -- cross-domain report

Generated 2026-09-03T08:17:14.621Z. Domains: brick-hvac, fibo-loans, iof-maintenance, iof-supply-chain. Replicates: run-01, run-02, run-03 (3/domain).

## Macro statistics (equal weight per domain, per #111's own methodology)

| Metric | Macro mean F1 | Macro stdev (dispersion) | Domains | Gold support (Σ ground-truth elements, floor n≥10) |
|---|---|---|---|---|
| Classes (full domain) | 0.757 | 0.083 | 4 | 169 |
| Relationships (full domain) | 0.711 | 0.081 | 4 | 109 |
| Properties (full domain) | 0.504 | 0.036 | 4 | 99 |
| Composite recovery effectiveness (full) | 0.657 | 0.016 | 4 | n/a (composite) |
| Classes (practical scope) | 0.774 | 0.079 | 4 | 169 |
| Composite recovery effectiveness (scoped) | 0.638 | 0.057 | 4 | n/a (composite) |
| Rules | 0.658 | 0.053 | 4 | 26 |
| Actions (identification) | 0.803 | 0.190 | 4 | 20 |

## Methodology notes

**Practical-scope calibration is not the same rule for every dimension.** A class enters practical scope when its label or an alias appears as a whole phrase in the domain's own competency-question/action corpus; a property enters practical scope only when *every* content word of its own label appears *somewhere* in that same corpus (a more forgiving test, since natural competency questions never contain a "has X"-style predicate label verbatim). The two are not directly comparable measures of the same thing -- see `tests/evals/README.md`'s "Full domain vs. practical scope" section for the full reasoning and the fixture-level numbers that motivated the difference.

## Per-domain results (mean +/- stdev across replicates; gold n = ground-truth element count that dimension's recall/precision was computed against)

| Domain | Replicates | Classes F1 (gold n) | Relationships F1 (gold n) | Properties F1 (gold n) | Recovery effectiveness | Rules F1 (gold n) | Actions F1 (gold n) |
|---|---|---|---|---|---|---|---|
| brick-hvac | 3 | 0.847 ± 0.098 (n=39) | 0.691 ± 0.221 (n=35) | 0.468 ± 0.281 (n=42) | 0.669 ± 0.123 | 0.730 (**n=7**) | 0.544 (**n=5**) |
| fibo-loans | 3 | 0.687 ± 0.011 (n=57) | 0.792 ± 0.022 (n=31) | 0.542 ± 0.092 (n=49) | 0.674 ± 0.034 | 0.644 (**n=7**) | 1 (**n=5**) |
| iof-maintenance | 3 | 0.808 ± 0.075 (n=20) | 0.606 ± 0.058 (n=13) | 0.528 ± 0.411 (**n=5**) | 0.647 ± 0.142 | 0.602 (**n=7**) | 0.856 (**n=5**) |
| iof-supply-chain | 3 | 0.685 ± 0.034 (n=53) | 0.754 ± 0.058 (n=30) | 0.479 ± 0.332 (**n=3**) | 0.640 ± 0.112 | 0.653 (**n=5**) | 0.812 (**n=5**) |

## Semantic (LLM-judged) scoring (n = replicates whose semantic judging actually succeeded, out of replicates attempted)

| Domain | Classes F1 | Relationships F1 | Properties F1 |
|---|---|---|---|
| brick-hvac | 0.847 ± 0.098 (n=3/3) | 0.830 ± 0.073 (n=3/3) | 0.566 ± 0.151 (n=3/3) |
| fibo-loans | 0.694 ± 0.023 (n=3/3) | 0.792 ± 0.022 (n=3/3) | 0.552 ± 0.086 (n=3/3) |
| iof-maintenance | 0.808 ± 0.075 (n=3/3) | 0.673 ± 0.124 (n=3/3) | 0.583 ± 0.382 (n=3/3) |
| iof-supply-chain | 0.701 ± 0.037 (n=3/3) | 0.798 ± 0.015 (n=3/3) | 0.479 ± 0.332 (n=3/3) |

## Translation-quality context (issue #103's own evaluation, alongside elicitation)

Elicitation error observed below is not the same as translation error: a domain that translated poorly going in cannot
recover perfectly no matter how good the interview is. See each domain's own `translation-evaluation.json` for full detail.

| Domain | Hard gates OK | Structural validity | Provenance coverage | Reverse coverage | Translation stability F1 | CQ support rate |
|---|---|---|---|---|---|---|
| brick-hvac | true | true | 1 | 1 | 0.776 | 0.900 |
| fibo-loans | true | true | 1 | 1 | 0.763 | 1 |
| iof-maintenance | true | true | 1 | 1 | 0.646 | 1 |
| iof-supply-chain | true | true | 1 | 1 | 0.429 | 0.900 |

## Cross-domain analyses

**Which ontology elements are consistently recovered?** Ranked by macro mean F1 minus dispersion (rewards both high and stable recovery):
- classesFullF1: mean 0.757, stdev 0.083
- relationshipsFullF1: mean 0.711, stdev 0.081
- actionsIdentificationF1: mean 0.803, stdev 0.190
- rulesF1: mean 0.658, stdev 0.053
- propertiesFullF1: mean 0.504, stdev 0.036

**Are relationships systematically harder than classes?** mixed -- harder in 2/4 domains.
- brick-hvac: relationships F1 − classes F1 = -0.156
- fibo-loans: relationships F1 − classes F1 = 0.105
- iof-maintenance: relationships F1 − classes F1 = -0.202
- iof-supply-chain: relationships F1 − classes F1 = 0.069

**Are properties systematically under-elicited?** mixed -- under-elicited in 3/4 domains (comparing property recall to class recall).
- brick-hvac: property recall 0.349 vs class recall 0.744
- fibo-loans: property recall 0.395 vs class recall 0.526
- iof-maintenance: property recall 0.533 vs class recall 0.717
- iof-supply-chain: property recall 0.667 vs class recall 0.528

**Does domain abstraction level affect recovery?** Abstraction level has no numeric proxy in this benchmark's own metrics -- reading the per-domain F1s in domain-comparison.csv against each domain's known character (brick-hvac: concrete physical equipment graph; iof-maintenance/iof-supply-chain: process- and event-centric industrial ontologies; fibo-loans: abstract financial/regulatory concepts) is left to the reader rather than asserted here.

**Does ontology size affect recovery?** Pearson r = 0.80 (n=4, 95% CI [-1, 1]) -- r=0.80, but n=4 is below this report's own floor of 5 for a directional conclusion -- not stated as a verdict.
- brick-hvac: 128 total ground-truth elements, recovery effectiveness 0.669
- fibo-loans: 149 total ground-truth elements, recovery effectiveness 0.674
- iof-maintenance: 50 total ground-truth elements, recovery effectiveness 0.647
- iof-supply-chain: 96 total ground-truth elements, recovery effectiveness 0.640

**Does translation stability correlate with elicitation score?** Pearson r = 0.91 (n=4, 95% CI [-1, 1.00]) -- r=0.91, but n=4 is below this report's own floor of 5 for a directional conclusion -- not stated as a verdict.

**Do interviewer changes improve all domains or only IT Ops?** Not applicable to this run -- every domain and replicate used the same single interviewer model/deployment. Answering this question requires a follow-up run holding domains fixed and varying the interviewer model, which is out of scope for this pass.

## Reproducibility

- brick-hvac/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 61 turns, stopped=app_agent_appears_finished, 904s wall-clock, 7826803 tokens
- brick-hvac/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 81 turns, stopped=app_agent_appears_finished, 1559s wall-clock, 7698262 tokens
- brick-hvac/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 63 turns, stopped=app_agent_appears_finished, 1044s wall-clock, 9668557 tokens
- fibo-loans/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 77 turns, stopped=app_agent_appears_finished, 1245s wall-clock, 7331582 tokens
- fibo-loans/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 61 turns, stopped=app_agent_appears_finished, 1485s wall-clock, 11362076 tokens
- fibo-loans/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 62 turns, stopped=app_agent_appears_finished, 1158s wall-clock, 6156632 tokens
- iof-maintenance/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 55 turns, stopped=app_agent_appears_finished, 811s wall-clock, 3977630 tokens
- iof-maintenance/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 65 turns, stopped=app_agent_appears_finished, 1373s wall-clock, 3828041 tokens
- iof-maintenance/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 48 turns, stopped=app_agent_appears_finished, 739s wall-clock, 4715861 tokens
- iof-supply-chain/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 81 turns, stopped=app_agent_appears_finished, 1493s wall-clock, 11083733 tokens
- iof-supply-chain/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 57 turns, stopped=app_agent_appears_finished, 1191s wall-clock, 9837463 tokens
- iof-supply-chain/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 93 turns, stopped=app_agent_appears_finished, 1373s wall-clock, 10463812 tokens

See `runs.csv` for every individual run's full metric set (not aggregated away), and `domain-comparison.csv` for the per-domain table above in machine-readable form.
