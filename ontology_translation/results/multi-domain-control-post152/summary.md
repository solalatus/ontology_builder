# Multi-domain elicitation benchmark -- cross-domain report

Generated 2026-09-03T08:17:14.689Z. Domains: itops. Replicates: run-01, run-02, run-03 (3/domain).

## Macro statistics (equal weight per domain, per #111's own methodology)

| Metric | Macro mean F1 | Macro stdev (dispersion) | Domains | Gold support (Σ ground-truth elements, floor n≥10) |
|---|---|---|---|---|
| Classes (full domain) | 0.779 |  | 1 | 68 |
| Relationships (full domain) | 0.557 |  | 1 | 108 |
| Properties (full domain) | 0.548 |  | 1 | 111 |
| Composite recovery effectiveness (full) | 0.628 |  | 1 | n/a (composite) |
| Classes (practical scope) | 0.649 |  | 1 | 68 |
| Composite recovery effectiveness (scoped) | 0.553 |  | 1 | n/a (composite) |
| Rules | 0.467 |  | 1 | 11 |
| Actions (identification) | 1 |  | 1 | 11 |

## Methodology notes

**Practical-scope calibration is not the same rule for every dimension.** A class enters practical scope when its label or an alias appears as a whole phrase in the domain's own competency-question/action corpus; a property enters practical scope only when *every* content word of its own label appears *somewhere* in that same corpus (a more forgiving test, since natural competency questions never contain a "has X"-style predicate label verbatim). The two are not directly comparable measures of the same thing -- see `tests/evals/README.md`'s "Full domain vs. practical scope" section for the full reasoning and the fixture-level numbers that motivated the difference.

## Per-domain results (mean +/- stdev across replicates; gold n = ground-truth element count that dimension's recall/precision was computed against)

| Domain | Replicates | Classes F1 (gold n) | Relationships F1 (gold n) | Properties F1 (gold n) | Recovery effectiveness | Rules F1 (gold n) | Actions F1 (gold n) |
|---|---|---|---|---|---|---|---|
| itops | 3 | 0.779 ± 0.024 (n=68) | 0.557 ± 0.069 (n=108) | 0.548 ± 0.159 (n=111) | 0.628 ± 0.054 | 0.467 (n=11) | 1 (n=11) |

## Semantic (LLM-judged) scoring (n = replicates whose semantic judging actually succeeded, out of replicates attempted)

| Domain | Classes F1 | Relationships F1 | Properties F1 |
|---|---|---|---|
| itops | 0.785 ± 0.029 (n=3/3) | 0.592 ± 0.040 (n=3/3) | 0.558 ± 0.143 (n=3/3) |

## Translation-quality context (issue #103's own evaluation, alongside elicitation)

Elicitation error observed below is not the same as translation error: a domain that translated poorly going in cannot
recover perfectly no matter how good the interview is. See each domain's own `translation-evaluation.json` for full detail.

| Domain | Hard gates OK | Structural validity | Provenance coverage | Reverse coverage | Translation stability F1 | CQ support rate |
|---|---|---|---|---|---|---|
| itops |  |  |  |  |  |  |

## Cross-domain analyses

**Which ontology elements are consistently recovered?** Ranked by macro mean F1 minus dispersion (rewards both high and stable recovery):
- actionsIdentificationF1: mean 1, stdev 
- classesFullF1: mean 0.779, stdev 
- relationshipsFullF1: mean 0.557, stdev 
- propertiesFullF1: mean 0.548, stdev 
- rulesF1: mean 0.467, stdev 

**Are relationships systematically harder than classes?** yes, in every domain.
- itops: relationships F1 − classes F1 = -0.222

**Are properties systematically under-elicited?** yes, in every domain (comparing property recall to class recall).
- itops: property recall 0.408 vs class recall 0.642

**Does domain abstraction level affect recovery?** Abstraction level has no numeric proxy in this benchmark's own metrics -- reading the per-domain F1s in domain-comparison.csv against each domain's known character (brick-hvac: concrete physical equipment graph; iof-maintenance/iof-supply-chain: process- and event-centric industrial ontologies; fibo-loans: abstract financial/regulatory concepts) is left to the reader rather than asserted here.

**Does ontology size affect recovery?** Pearson r =  (n=1, 95% CI n/a) -- not enough domains for a meaningful correlation (n=1).
- itops: 309 total ground-truth elements, recovery effectiveness 0.628

**Does translation stability correlate with elicitation score?** Pearson r =  (n=0, 95% CI n/a) -- not enough domains for a meaningful correlation (n=0).

**Do interviewer changes improve all domains or only IT Ops?** Not applicable to this run -- every domain and replicate used the same single interviewer model/deployment. Answering this question requires a follow-up run holding domains fixed and varying the interviewer model, which is out of scope for this pass.

## Reproducibility

- itops/run-01: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 95 turns, stopped=app_agent_appears_finished, 2079s wall-clock, 31492457 tokens
- itops/run-02: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 92 turns, stopped=app_agent_appears_finished, 2183s wall-clock, 29578002 tokens
- itops/run-03: model `gpt-5.4` (persona `gpt-5.4`, classifier `gpt-5.4`), 131 turns, stopped=app_agent_appears_finished, 1975s wall-clock, 15741187 tokens

See `runs.csv` for every individual run's full metric set (not aggregated away), and `domain-comparison.csv` for the per-domain table above in machine-readable form.
