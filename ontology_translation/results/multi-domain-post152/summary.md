# Multi-domain elicitation benchmark -- cross-domain report

Generated 2026-09-02T19:38:19.339Z. Domains: brick-hvac, fibo-loans, iof-maintenance, iof-supply-chain. Replicates: run-01, run-02, run-03 (3/domain).

## Macro statistics (equal weight per domain, per #111's own methodology)

| Metric | Macro mean F1 | Macro stdev (dispersion) | Domains | Gold support (Σ ground-truth elements, floor n≥10) |
|---|---|---|---|---|
| Classes (full domain) | 0.724 | 0.107 | 4 | 169 |
| Relationships (full domain) | 0.682 | 0.108 | 4 | 109 |
| Properties (full domain) | 0.580 | 0.233 | 4 | 99 |
| Composite recovery effectiveness (full) | 0.662 | 0.108 | 4 | n/a (composite) |
| Classes (practical scope) | 0.760 | 0.066 | 4 | 169 |
| Composite recovery effectiveness (scoped) | 0.619 | 0.018 | 4 | n/a (composite) |
| Rules | 0.674 | 0.156 | 4 | 26 |
| Actions (identification) | 0.890 | 0.080 | 4 | 20 |

## Methodology notes

**Practical-scope calibration is not the same rule for every dimension.** A class enters practical scope when its label or an alias appears as a whole phrase in the domain's own competency-question/action corpus; a property enters practical scope only when *every* content word of its own label appears *somewhere* in that same corpus (a more forgiving test, since natural competency questions never contain a "has X"-style predicate label verbatim). The two are not directly comparable measures of the same thing -- see `tests/evals/README.md`'s "Full domain vs. practical scope" section for the full reasoning and the fixture-level numbers that motivated the difference.

## Per-domain results (mean +/- stdev across replicates; gold n = ground-truth element count that dimension's recall/precision was computed against)

| Domain | Replicates | Classes F1 (gold n) | Relationships F1 (gold n) | Properties F1 (gold n) | Recovery effectiveness | Rules F1 (gold n) | Actions F1 (gold n) |
|---|---|---|---|---|---|---|---|
| brick-hvac | 3 | 0.857 ± 0.053 (n=39) | 0.794 ± 0.037 (n=35) | 0.566 ± 0.105 (n=42) | 0.739 ± 0.042 | 0.737 (**n=7**) | 0.889 (**n=5**) |
| fibo-loans | 3 | 0.634 ± 0.050 (n=57) | 0.755 ± 0.141 (n=31) | 0.531 ± 0.149 (n=49) | 0.640 ± 0.059 | 0.764 (**n=7**) | 0.859 (**n=5**) |
| iof-maintenance | 3 | 0.763 ± 0.065 (n=20) | 0.598 ± 0.075 (n=13) | 0.893 ± 0.116 (**n=5**) | 0.751 ± 0.020 | 0.756 (**n=7**) | 1 (**n=5**) |
| iof-supply-chain | 3 | 0.641 ± 0.073 (n=53) | 0.583 ± 0.194 (n=30) | 0.330 ± 0.418 (**n=3**) | 0.518 ± 0.182 | 0.440 (**n=5**) | 0.812 (**n=5**) |

## Semantic (LLM-judged) scoring (n = replicates whose semantic judging actually succeeded, out of replicates attempted)

| Domain | Classes F1 | Relationships F1 | Properties F1 |
|---|---|---|---|
| brick-hvac | 0.857 ± 0.053 (n=3/3) | 0.882 ± 0.013 (n=3/3) | 0.566 ± 0.105 (n=3/3) |
| fibo-loans | 0.642 ± 0.049 (n=3/3) | 0.778 ± 0.129 (n=3/3) | 0.531 ± 0.149 (n=3/3) |
| iof-maintenance | 0.763 ± 0.065 (n=3/3) | 0.647 ± 0.033 (n=3/3) | 0.893 ± 0.116 (n=3/3) |
| iof-supply-chain | 0.665 ± 0.089 (n=3/3) | 0.621 ± 0.195 (n=3/3) | 0.330 ± 0.418 (n=3/3) |

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
- actionsIdentificationF1: mean 0.890, stdev 0.080
- classesFullF1: mean 0.724, stdev 0.107
- relationshipsFullF1: mean 0.682, stdev 0.108
- rulesF1: mean 0.674, stdev 0.156
- propertiesFullF1: mean 0.580, stdev 0.233

**Are relationships systematically harder than classes?** mixed -- harder in 3/4 domains.
- brick-hvac: relationships F1 − classes F1 = -0.063
- fibo-loans: relationships F1 − classes F1 = 0.121
- iof-maintenance: relationships F1 − classes F1 = -0.165
- iof-supply-chain: relationships F1 − classes F1 = -0.058

**Are properties systematically under-elicited?** mixed -- under-elicited in 3/4 domains (comparing property recall to class recall).
- brick-hvac: property recall 0.421 vs class recall 0.752
- fibo-loans: property recall 0.381 vs class recall 0.468
- iof-maintenance: property recall 1 vs class recall 0.650
- iof-supply-chain: property recall 0.444 vs class recall 0.484

**Does domain abstraction level affect recovery?** Abstraction level has no numeric proxy in this benchmark's own metrics -- reading the per-domain F1s in domain-comparison.csv against each domain's known character (brick-hvac: concrete physical equipment graph; iof-maintenance/iof-supply-chain: process- and event-centric industrial ontologies; fibo-loans: abstract financial/regulatory concepts) is left to the reader rather than asserted here.

**Does ontology size affect recovery?** Pearson r = -0.20 (n=4, 95% CI [-1.00, 1.00]) -- r=-0.20, but n=4 is below this report's own floor of 5 for a directional conclusion -- not stated as a verdict.
- brick-hvac: 128 total ground-truth elements, recovery effectiveness 0.739
- fibo-loans: 149 total ground-truth elements, recovery effectiveness 0.640
- iof-maintenance: 50 total ground-truth elements, recovery effectiveness 0.751
- iof-supply-chain: 96 total ground-truth elements, recovery effectiveness 0.518

**Does translation stability correlate with elicitation score?** Pearson r = 0.74 (n=4, 95% CI [-1.00, 1.00]) -- r=0.74, but n=4 is below this report's own floor of 5 for a directional conclusion -- not stated as a verdict.

**Do interviewer changes improve all domains or only IT Ops?** Not applicable to this run -- every domain and replicate used the same single interviewer model/deployment. Answering this question requires a follow-up run holding domains fixed and varying the interviewer model, which is out of scope for this pass.

## Reproducibility

- brick-hvac/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 55 turns, stopped=app_agent_appears_finished, 929s wall-clock, 4015309 tokens
- brick-hvac/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 55 turns, stopped=app_agent_appears_finished, 1066s wall-clock, 9171468 tokens
- brick-hvac/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 57 turns, stopped=app_agent_appears_finished, 785s wall-clock, 7334564 tokens
- fibo-loans/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 86 turns, stopped=app_agent_appears_finished, 1618s wall-clock, 15234411 tokens
- fibo-loans/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 53 turns, stopped=app_agent_appears_finished, 566s wall-clock, 3869993 tokens
- fibo-loans/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 65 turns, stopped=app_agent_appears_finished, 786s wall-clock, 4105694 tokens
- iof-maintenance/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 60 turns, stopped=app_agent_appears_finished, 757s wall-clock, 3304869 tokens
- iof-maintenance/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 61 turns, stopped=app_agent_appears_finished, 1023s wall-clock, 4994810 tokens
- iof-maintenance/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 64 turns, stopped=app_agent_appears_finished, 569s wall-clock, 2842505 tokens
- iof-supply-chain/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 69 turns, stopped=app_agent_appears_finished, 1152s wall-clock, 6071821 tokens
- iof-supply-chain/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 65 turns, stopped=app_agent_appears_finished, 1029s wall-clock, 7147947 tokens
- iof-supply-chain/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 55 turns, stopped=pleasantry_loop_detected, 505s wall-clock, 2442335 tokens

See `runs.csv` for every individual run's full metric set (not aggregated away), and `domain-comparison.csv` for the per-domain table above in machine-readable form.
