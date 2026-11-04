# Licence note: epo-ordering

The source files in `source/` (`eOrdering.ttl`, `eOrdering_restrictions.ttl`)
are unmodified copies of the eOrdering module of the **eProcurement Ontology
(ePO) v5.2.0**, published by the Publications Office of the European Union
(https://github.com/OP-TED/ePO, tag `v5.2.0`).

Notice embedded in both files (`dcterms:license`):

> © European Union, 2014. Unless otherwise noted, the reuse of the Ontology is
> authorised under the European Union Public Licence v1.2 (https://eupl.eu/).

The repository's SPDX licence identifier is `EUPL-1.2`. Full licence text:
https://eupl.eu/1.2/en/

The files in this folder derived from that source (`reference.domain.yaml`,
`translation.json`, `persona.md`, the evaluation and spot-check files) are a
translation of the ePO eOrdering module into this project's `.domain.yaml`
format. Attribution: eProcurement Ontology (ePO) v5.2.0, eOrdering module,
© European Union, Publications Office of the European Union.

## Licence of this folder and of the ePO run outputs (decided 2026-11-04)

The rest of this repository is MIT-licensed (`LICENSE`). This folder is the
exception:

- `source/` keeps its original notice and licence: EUPL-1.2, © European Union.
- The derived files in this folder (`reference.domain.yaml`,
  `translation.json`, `translation-evaluation.json`, `translation-report.md`,
  `persona.md`, `manual-spot-check.*`, `source-manifest.yaml`, this note) are
  a translation of the ePO eOrdering module. They are distributed under the
  **EUPL-1.2**, the licence of the work they derive from, with the attribution
  above. SPDX: `EUPL-1.2`.
- The recovered models and transcripts under
  `ontology_translation/results/epo-heldout/` reproduce the same vocabulary.
  They carry the same licence and attribution; see the README in that folder.
- The MIT licence of the tool, the pipeline and the evaluation code is not
  affected. EUPL-1.2 covers only these ePO-derived files.

Changes against the source: the module was translated by an LLM-assisted
pipeline (gpt-5.4) into this project's `.domain.yaml` format, and repaired in
two rounds. The process is documented in `translation-report.md` and
`manual-spot-check.md`.
