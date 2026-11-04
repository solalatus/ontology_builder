# Held-out domain (ePO eOrdering): design note

Committed before the runs, and before any interview has seen the domain.

## Why

Every prompt change since the first paper was accepted on the four published domains, so they are development domains. A co-author's review read the itops pattern as possible overfitting to them:
- the final configuration is below the post-#152 generation on itops;
- B3 is level with or ahead of interactive there.

This domain was chosen and translated after the interviewer was frozen at `ready-for-application` (`2cb93e0`). Nothing in the app, prompt or scorer changes for it. It is the only held-out result.

## Domain

`ontology_translation/domains/epo-ordering/`:
- source: EU eProcurement Ontology v5.2.0, module eOrdering (EUPL-1.2), with `eOrdering_restrictions.ttl` as an extra source;
- translated with the same pipeline and model (gpt-5.4) as the other four;
- persona written from the accepted gold like the others.

Selection: `research/07_sixth_domain_shortlist.md` in the article planning folder. In short:
- a new ontology family;
- low to medium contamination risk;
- complete definitions;
- small size, relationship-dense.

## Runs

1. **Interactive, 3 runs** (`run-paired-stages.mjs --block=epo-interactive`): exactly the final-scores configuration.
2. **B3 no-commit, 3 runs** (`--block=epo-b3`): exactly the `baselines-gpt6` B3 condition.

Fixed settings:
- caps 120 min / 300 turns / 600 s per app turn;
- 30 USD per run for interactive, 10 USD for B3, as in `baselines-gpt6`;
- the driver stops once 30 USD are recorded under this directory;
- interactive runs first.

**Exclusion:** a run that ends uncleanly is reported and not averaged. The owner is asked before any re-run.

## Reported

For each arm, per run and as mean [min–max]:
- composite;
- class, relationship and property F1, recall and precision;
- rules and actions F1;
- the endpoint-conditioned rate and the relationship/class recall ratio;
- interviewer-first identifiers per 100 gold elements;
- cost, turns.

## Reading (fixed in advance)

1. **Generalisation:** the held-out interactive composite is compared with the 4-published macro (78.1 %) and with itops (57.7 %).
   - Inside the [min, max] range of the published domains' per-domain means (68.0 to 91.1): read as "transfers".
   - Below 57.7 % (the itops mean): read as "does not transfer".
   - Anything in between is reported as it is, without a label.
2. **Overfitting check:** if B3 is level with or ahead of interactive here as on itops (bootstrap interval of interactive − B3 including 0 or negative), the itops pattern is not specific to itops. Otherwise it is.
3. **Gap:** the relationship/class recall ratio and the conditional rate are read as in `../endpoint-conditioned/DESIGN.md`, amendment 1.

## Follow-up block (separate design note)

The weak-expert cell (gpt-4o-mini persona, interviewer frozen) has its own design note, committed before its runs: [`WEAK-EXPERT-DESIGN.md`](WEAK-EXPERT-DESIGN.md). Nothing above changes.
