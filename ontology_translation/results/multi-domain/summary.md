# Multi-domain elicitation benchmark -- cross-domain report

Generated 2026-09-01T18:01:26.683Z. Domains: brick-hvac, iof-maintenance, iof-supply-chain, fibo-loans. Replicates: run-01, run-02, run-03 (3/domain).

## Macro statistics (equal weight per domain, per #111's own methodology)

| Metric | Macro mean F1 | Macro stdev (dispersion) | Domains | Gold support (Σ ground-truth elements, floor n≥10) |
|---|---|---|---|---|
| Classes (full domain) | 0.681 | 0.058 | 4 | 169 |
| Relationships (full domain) | 0.609 | 0.039 | 4 | 109 |
| Properties (full domain) | 0.646 | 0.186 | 4 | 99 |
| Composite recovery effectiveness (full) | 0.645 | 0.054 | 4 | n/a (composite) |
| Classes (practical scope) | 0.750 | 0.043 | 4 | 169 |
| Composite recovery effectiveness (scoped) | 0.638 | 0.118 | 4 | n/a (composite) |
| Rules | 0.660 | 0.111 | 4 | 26 |
| Actions (identification) | 0.876 | 0.114 | 4 | 20 |

## Methodology notes

**Practical-scope calibration is not the same rule for every dimension.** A class enters practical scope when its label or an alias appears as a whole phrase in the domain's own competency-question/action corpus; a property enters practical scope only when *every* content word of its own label appears *somewhere* in that same corpus (a more forgiving test, since natural competency questions never contain a "has X"-style predicate label verbatim). The two are not directly comparable measures of the same thing -- see `tests/evals/README.md`'s "Full domain vs. practical scope" section for the full reasoning and the fixture-level numbers that motivated the difference.

## Per-domain results (mean +/- stdev across replicates; gold n = ground-truth element count that dimension's recall/precision was computed against)

| Domain | Replicates | Classes F1 (gold n) | Relationships F1 (gold n) | Properties F1 (gold n) | Recovery effectiveness | Rules F1 (gold n) | Actions F1 (gold n) |
|---|---|---|---|---|---|---|---|
| brick-hvac | 3 | 0.766 ± 0.039 (n=39) | 0.570 ± 0.072 (n=35) | 0.521 ± 0.198 (n=42) | 0.619 ± 0.063 | 0.574 (**n=7**) | 0.724 (**n=5**) |
| iof-maintenance | 3 | 0.670 ± 0.085 (n=20) | 0.583 ± 0.075 (n=13) | 0.731 ± 0.278 (**n=5**) | 0.661 ± 0.144 | 0.668 (**n=7**) | 1 (**n=5**) |
| iof-supply-chain | 3 | 0.644 ± 0.013 (n=53) | 0.627 ± 0.151 (n=30) | 0.867 ± 0.115 (**n=3**) | 0.713 ± 0.064 | 0.813 (**n=5**) | 0.889 (**n=5**) |
| fibo-loans | 3 | 0.645 ± 0.077 (n=57) | 0.653 ± 0.064 (n=31) | 0.466 ± 0.046 (n=49) | 0.588 ± 0.012 | 0.583 (**n=7**) | 0.893 (**n=5**) |

## Semantic (LLM-judged) scoring (n = replicates whose semantic judging actually succeeded, out of replicates attempted)

| Domain | Classes F1 | Relationships F1 | Properties F1 |
|---|---|---|---|
| brick-hvac | 0.775 ± 0.051 (n=3/3) | 0.774 ± 0.007 (n=3/3) | 0.533 ± 0.201 (n=3/3) |
| iof-maintenance | 0.670 ± 0.085 (n=3/3) | 0.583 ± 0.075 (n=3/3) | 0.731 ± 0.278 (n=3/3) |
| iof-supply-chain | 0.652 ± 0.010 (n=3/3) | 0.725 ± 0.102 (n=3/3) | 0.867 ± 0.115 (n=3/3) |
| fibo-loans | 0.660 ± 0.090 (n=3/3) | 0.719 ± 0.036 (n=3/3) | 0.466 ± 0.046 (n=3/3) |

## Translation-quality context (issue #103's own evaluation, alongside elicitation)

Elicitation error observed below is not the same as translation error: a domain that translated poorly going in cannot
recover perfectly no matter how good the interview is. See each domain's own `translation-evaluation.json` for full detail.

| Domain | Hard gates OK | Structural validity | Provenance coverage | Reverse coverage | Translation stability F1 | CQ support rate |
|---|---|---|---|---|---|---|
| brick-hvac | true | true | 1 | 1 | 0.776 | 0.900 |
| iof-maintenance | true | true | 1 | 1 | 0.646 | 1 |
| iof-supply-chain | true | true | 1 | 1 | 0.429 | 0.900 |
| fibo-loans | true | true | 1 | 1 | 0.763 | 1 |

## Cross-domain analyses

**Which ontology elements are consistently recovered?** Ranked by macro mean F1 minus dispersion (rewards both high and stable recovery):
- actionsIdentificationF1: mean 0.876, stdev 0.114
- classesFullF1: mean 0.681, stdev 0.058
- relationshipsFullF1: mean 0.609, stdev 0.039
- rulesF1: mean 0.660, stdev 0.111
- propertiesFullF1: mean 0.646, stdev 0.186

**Are relationships systematically harder than classes?** mixed -- harder in 3/4 domains.
- brick-hvac: relationships F1 − classes F1 = -0.195
- iof-maintenance: relationships F1 − classes F1 = -0.087
- iof-supply-chain: relationships F1 − classes F1 = -0.017
- fibo-loans: relationships F1 − classes F1 = 0.008

**Are properties systematically under-elicited?** mixed -- under-elicited in 2/4 domains (comparing property recall to class recall).
- brick-hvac: property recall 0.373 vs class recall 0.632
- iof-maintenance: property recall 0.667 vs class recall 0.533
- iof-supply-chain: property recall 0.778 vs class recall 0.478
- fibo-loans: property recall 0.320 vs class recall 0.485

**Does domain abstraction level affect recovery?** Abstraction level has no numeric proxy in this benchmark's own metrics -- reading the per-domain F1s in domain-comparison.csv against each domain's known character (brick-hvac: concrete physical equipment graph; iof-maintenance/iof-supply-chain: process- and event-centric industrial ontologies; fibo-loans: abstract financial/regulatory concepts) is left to the reader rather than asserted here.

**Does ontology size affect recovery?** Pearson r = -0.66 (n=4, 95% CI [-1, 1.00]) -- r=-0.66, but n=4 is below this report's own floor of 5 for a directional conclusion -- not stated as a verdict.
- brick-hvac: 128 total ground-truth elements, recovery effectiveness 0.619
- iof-maintenance: 50 total ground-truth elements, recovery effectiveness 0.661
- iof-supply-chain: 96 total ground-truth elements, recovery effectiveness 0.713
- fibo-loans: 149 total ground-truth elements, recovery effectiveness 0.588

**Does translation stability correlate with elicitation score?** Pearson r = -0.95 (n=4, 95% CI [-1.00, 1]) -- r=-0.95, but n=4 is below this report's own floor of 5 for a directional conclusion -- not stated as a verdict.

**Do interviewer changes improve all domains or only IT Ops?** Not applicable to this run -- every domain and replicate used the same single interviewer model/deployment. Answering this question requires a follow-up run holding domains fixed and varying the interviewer model, which is out of scope for this pass.

## Reproducibility

- brick-hvac/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 43 turns, stopped=app_agent_appears_finished, 555s wall-clock, 4146490 tokens
- brick-hvac/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 46 turns, stopped=app_agent_appears_finished, 1016s wall-clock, 4114632 tokens
- brick-hvac/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 44 turns, stopped=app_agent_appears_finished, 878s wall-clock, 3738496 tokens
- iof-maintenance/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 73 turns, stopped=app_agent_appears_finished, 723s wall-clock, 7383704 tokens
- iof-maintenance/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 50 turns, stopped=app_agent_appears_finished, 1244s wall-clock, 3846219 tokens
- iof-maintenance/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 45 turns, stopped=app_agent_appears_finished, 457s wall-clock, 3251947 tokens
- iof-supply-chain/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 48 turns, stopped=app_agent_appears_finished, 1262s wall-clock, 3914556 tokens
- iof-supply-chain/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 63 turns, stopped=pleasantry_loop_detected, 1291s wall-clock, 3472593 tokens
- iof-supply-chain/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 87 turns, stopped=app_agent_appears_finished, 1692s wall-clock, 11019152 tokens
- fibo-loans/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 64 turns, stopped=app_agent_appears_finished, 1317s wall-clock, 9232753 tokens
- fibo-loans/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 60 turns, stopped=app_agent_appears_finished, 651s wall-clock, 4937998 tokens
- fibo-loans/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 56 turns, stopped=app_agent_appears_finished, 1109s wall-clock, 5789296 tokens

See `runs.csv` for every individual run's full metric set (not aggregated away), and `domain-comparison.csv` for the per-domain table above in machine-readable form.
