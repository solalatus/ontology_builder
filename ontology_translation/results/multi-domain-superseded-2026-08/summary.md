# Multi-domain elicitation benchmark -- cross-domain report

Generated 2026-08-22T13:51:46.620Z. Domains: brick-hvac, iof-maintenance, iof-supply-chain, fibo-loans. Replicates: run-01, run-02, run-03 (3/domain).

## Macro statistics (equal weight per domain, per #111's own methodology)

| Metric | Macro mean F1 | Macro stdev (dispersion) | Domains | Gold support (Σ ground-truth elements, floor n≥10) |
|---|---|---|---|---|
| Classes (full domain) | 0.736 | 0.053 | 4 | 169 |
| Relationships (full domain) | 0.735 | 0.050 | 4 | 109 |
| Properties (full domain) | 0.536 | 0.127 | 4 | 99 |
| Composite recovery effectiveness (full) | 0.695 | 0.051 | 4 | n/a (composite) |
| Classes (practical scope) | 0.799 | 0.065 | 4 | 169 |
| Composite recovery effectiveness (scoped) | 0.684 | 0.080 | 4 | n/a (composite) |
| Rules | 0.413 | 0.147 | 4 | 26 |
| Actions (identification) | 0.688 | 0.296 | 4 | 20 |

## Per-domain results (mean +/- stdev across replicates; gold n = ground-truth element count that dimension's recall/precision was computed against)

| Domain | Replicates | Classes F1 (gold n) | Relationships F1 (gold n) | Properties F1 (gold n) | Recovery effectiveness | Rules F1 (gold n) | Actions F1 (gold n) |
|---|---|---|---|---|---|---|---|
| brick-hvac | 3 | 0.775 ± 0.053 (n=39) | 0.687 ± 0.082 (n=35) | 0.380 ± 0.333 (n=42) | 0.670 ± 0.142 | 0.409 (**n=7**) | 0.296 (**n=5**) |
| iof-maintenance | 3 | 0.776 ± 0.020 (n=20) | 0.700 ± 0.105 (n=13) | 0.692 ± 0.206 (**n=5**) | 0.772 ± 0.046 | 0.519 (**n=7**) | 1 (**n=5**) |
| iof-supply-chain | 3 | 0.728 ± 0.018 (n=53) | 0.758 ± 0.102 (n=30) | 0.533 ± 0.462 (**n=3**) | 0.673 ± 0.159 | 0.206 (**n=5**) | 0.667 (**n=5**) |
| fibo-loans | 3 | 0.664 ± 0.009 (n=57) | 0.794 ± 0.110 (n=31) | 0.540 ± 0.047 (n=49) | 0.666 ± 0.027 | 0.516 (**n=7**) | 0.790 (**n=5**) |

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
- relationshipsFullF1: mean 0.735, stdev 0.050
- classesFullF1: mean 0.736, stdev 0.053
- propertiesFullF1: mean 0.536, stdev 0.127
- actionsIdentificationF1: mean 0.688, stdev 0.296
- rulesF1: mean 0.413, stdev 0.147

**Are relationships systematically harder than classes?** mixed -- harder in 2/4 domains.
- brick-hvac: relationships F1 − classes F1 = -0.087
- iof-maintenance: relationships F1 − classes F1 = -0.076
- iof-supply-chain: relationships F1 − classes F1 = 0.031
- fibo-loans: relationships F1 − classes F1 = 0.130

**Are properties systematically under-elicited?** mixed -- under-elicited in 3/4 domains (comparing property recall to class recall).
- brick-hvac: property recall 0.270 vs class recall 0.650
- iof-maintenance: property recall 0.733 vs class recall 0.667
- iof-supply-chain: property recall 0.444 vs class recall 0.572
- fibo-loans: property recall 0.381 vs class recall 0.503

**Does domain abstraction level affect recovery?** Abstraction level has no numeric proxy in this benchmark's own metrics -- reading the per-domain F1s in domain-comparison.csv against each domain's known character (brick-hvac: concrete physical equipment graph; iof-maintenance/iof-supply-chain: process- and event-centric industrial ontologies; fibo-loans: abstract financial/regulatory concepts) is left to the reader rather than asserted here.

**Does ontology size affect recovery?** Pearson r = -0.89 (n=4, 95% CI [-1.00, -0.83]) -- r=-0.89, but n=4 is below this report's own floor of 5 for a directional conclusion -- not stated as a verdict.
- brick-hvac: 128 total ground-truth elements, recovery effectiveness 0.670
- iof-maintenance: 50 total ground-truth elements, recovery effectiveness 0.772
- iof-supply-chain: 96 total ground-truth elements, recovery effectiveness 0.673
- fibo-loans: 149 total ground-truth elements, recovery effectiveness 0.666

**Does translation stability correlate with elicitation score?** Pearson r = -0.08 (n=4, 95% CI [-1.00, 1.00]) -- r=-0.08, but n=4 is below this report's own floor of 5 for a directional conclusion -- not stated as a verdict.

**Do interviewer changes improve all domains or only IT Ops?** Not applicable to this run -- every domain and replicate used the same single interviewer model/deployment. Answering this question requires a follow-up run holding domains fixed and varying the interviewer model, which is out of scope for this pass.

## Reproducibility

- brick-hvac/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 32 turns, stopped=app_agent_appears_finished, 621s wall-clock, 3411359 tokens
- brick-hvac/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 200 turns, stopped=max_turns_reached, 1397s wall-clock, 9697566 tokens
- brick-hvac/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 69 turns, stopped=app_agent_appears_finished, 779s wall-clock, 3752966 tokens
- iof-maintenance/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 62 turns, stopped=app_agent_appears_finished, 749s wall-clock, 4434355 tokens
- iof-maintenance/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 46 turns, stopped=app_agent_appears_finished, 645s wall-clock, 4360930 tokens
- iof-maintenance/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 200 turns, stopped=max_turns_reached, 1606s wall-clock, 15760386 tokens
- iof-supply-chain/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 56 turns, stopped=app_agent_appears_finished, 605s wall-clock, 2618090 tokens
- iof-supply-chain/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 75 turns, stopped=app_agent_appears_finished, 1047s wall-clock, 11150604 tokens
- iof-supply-chain/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 47 turns, stopped=app_agent_appears_finished, 695s wall-clock, 4734610 tokens
- fibo-loans/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 57 turns, stopped=app_agent_appears_finished, 900s wall-clock, 9648985 tokens
- fibo-loans/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 62 turns, stopped=app_agent_appears_finished, 849s wall-clock, 6146376 tokens
- fibo-loans/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 55 turns, stopped=app_agent_appears_finished, 782s wall-clock, 4719725 tokens

See `runs.csv` for every individual run's full metric set (not aggregated away), and `domain-comparison.csv` for the per-domain table above in machine-readable form.
