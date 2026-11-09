# Worked example: from source ontology to score

One element traced through the whole evaluation: the relationship **FailureEvent initiates FailedState** in the IOF Maintenance domain, in the final-configuration interview `ontology_translation/results/final-scores/runs/run-01/iof-maintenance/` (gpt-6-sol in every role). Every excerpt below is copied from the committed files named with it.

## 1. Source ontology

`ontology_translation/domains/iof-maintenance/source/Maintenance.rdf` (Industrial Ontologies Foundry, Release_202602, MIT; checksum in `source/PROVENANCE.yaml`), lines 172–180:

```xml
<owl:Class rdf:about="&iof-constr;FailureEvent">
    <rdfs:subClassOf rdf:resource="&iof-constr;Event"/>
    <rdfs:subClassOf>
        <owl:Restriction>
            <owl:onProperty rdf:resource="&iof-constr;initiates"/>
            <owl:someValuesFrom rdf:resource="&iof-constr;FailedState"/>
        </owl:Restriction>
    </rdfs:subClassOf>
    <rdfs:label xml:lang="en-US">failure event</rdfs:label>
```

## 2. Reference model (agent-facing YAML)

The translation pipeline (`ontology_translation/`) turns the restriction into a relationship and records where it came from. `domains/iof-maintenance/reference.domain.yaml`:

```yaml
classes:
  FailedState:
    meaning: A state in which an item is unable to perform a required function due
      to a failure event.
  FailureEvent:
    meaning: An event that causes an item to lose its ability to perform a required
      function.
    aliases:
    - failure
relationships:
- name: initiates
  from: FailureEvent
  to: FailedState
  meaning: A failure event begins a failed state.
```

Its source mapping, `domains/iof-maintenance/translation.json`, `mappings[25]`:

```json
{
 "target_path": "relationships[0]",
 "source_iris": ["…/construct/FailureEvent", "…/construct/FailedState", "…/construct/initiates"],
 "source_evidence": "FailureEvent is defined as an event that \"initiates\" some FailedState, and there is a restriction on initiates some FailedState.",
 "confidence": "high"
}
```

The simulated expert is briefed from this reference without its identifiers (`domains/iof-maintenance/persona.md`); a runtime guard stops it from reciting raw identifiers.

## 3. Interview

`conversation-log.md` of the run, turn 9 (the interviewer proposes classes, the simulated expert answers):

> **Interviewer:** … For the state, event, and cause questions, I propose **Asset** (the equipment whose state we check), **Failure Event** (what began a failed state), and **Failure Process** (what led to degradation or failure). Does the agent need to identify or connect each of those separately …?
>
> **Simulated expert:** Yes—we need to keep those three separate. … A failure event begins a **failed state**. A failure process is the change that leads to a **degraded or failed state**. So if a pump is running below acceptable capacity, we can investigate the process behind that degradation without claiming a failure event has already made it unable to do its job.

Turn 25, the interviewer commits the relationship to the live model (`tool-calls.md`):

```json
{"yaml": "relationships:\n  - name: initiates\n    from: FailureEvent\n    to: FailedState\n    meaning: A failure event begins the particular failed state being investigated."}
```

## 4. Recovered model and scoring

Snapshot A, the model at the interviewer's own wrap-up (`snapshots/A/recovered-model.yaml`), holds the classes `FailureEvent` and `FailedState` and the edge `initiates: FailureEvent → FailedState`.

The heuristic scorer matches gold to recovered elements one to one (`heuristic-matches.json`): classes `FailureEvent → n2` and `FailedState → n15`, relationship `rel_0 (initiates) → e1`, direction forward. A relationship counts only if both of its classes are matched, as here.

Scores of this run (`snapshots/A/metrics.json`, heuristic, full domain): class F1 92.3 %, relationship F1 92.3 %, property F1 100.0 %, composite (mean of the three) 94.9 %. Rules and actions are scored separately and are not part of the composite.

Every number in the article is reproduced from these stored files by offline rescoring (`tests/evals/rescore-saved-run.mjs`), without API calls.
