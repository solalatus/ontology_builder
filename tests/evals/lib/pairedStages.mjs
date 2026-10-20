// PAIRED STAGES INSIDE ONE RUN (issue #182; the stages are #179 and #180)
//
// The interviewer runs the shipped prompt to its own wrap-up. Instead of
// ending the run there, the harness takes snapshot A, then injects two
// further stages into the same conversation as messages from the expert's
// side, and snapshots the model after each:
//
//   interview --A--> coverage sweep (#179), to a fixpoint --B--> naming pass (#180) --C--> end
//
// so each run yields the sweep effect (B - A), the naming effect (C - B) and
// both (C - A) as paired differences. The production prompt is untouched;
// the only app-side difference is the eval-only rename tool, offered during
// the naming pass alone (index.html, RENAME_ONTOLOGY_ELEMENTS_TOOL).
//
// A stage ends when the interviewer closes it with its ledger line (asked
// for in the stage text, and detected here without a model call), when the
// classifier says the interviewer has wrapped up, or when the stage's turn
// cap is reached (recorded as `capped`, so a truncated stage is never
// mistaken for a finished one).
//
// The stage texts are pre-registered: ontology_translation/results/
// paired-stages/DESIGN.md quotes them verbatim, and pairedStages.spec.mjs
// fails if the two drift apart. The sweep texts are version 2 (amendment 1
// in DESIGN.md, 2026-10-20): version 1 let the interviewer narrow each
// question to what the recorded questions need, and the sweep surfaced
// nothing.

export const STAGE_TEXTS = {
  en: {
    sweepFirst: [
      "Before we close, one more systematic pass, to catch what we have not talked about yet.",
      "",
      "Call get_graph_state first and treat it as the source of truth for what is already on the canvas. Then go through every class on the canvas, three to five classes per question, and ask me, for each one, what exists around it in our work: its subordinate parts or components; its states or lifecycle events; the actors or parties responsible for it; its inputs and outputs; related documents or agreements; measurements or characteristic values it carries; earlier or later stages of a workflow it belongs to; more specific or sibling kinds of the same thing; and which of the properties already confirmed on a sibling class also apply to it. Skip the categories that plainly do not fit a class.",
      "",
      "Ask these as open questions about what exists, not about what the agent needs: do not limit a question to what the recorded competency questions or actions require, and do not ask me to mention only what is needed. Only once I have answered, check each thing I named against the competency questions and actions, exactly as you would any other candidate, and add only what passes; nothing is added only because it was mentioned. Keep a running list of the candidates and close each one as added, declined (with the reason) or left open; none may silently disappear.",
      "",
      "When every class in this pass has been asked about and every candidate is closed, end that message with one line in exactly this form, and ask nothing further in it:",
      "COVERAGE LEDGER: surfaced=<number>; added=<number>; declined=<number>; open=<number>",
    ].join("\n"),
    sweepNext: (classes) => [
      `Thank you. These classes were added in that pass: ${classes.join(", ")}.`,
      "Please ask the same open questions about each of them, under the same rules, and close this pass with the same COVERAGE LEDGER line.",
    ].join("\n"),
    sweepCloseout: "The model has grown during this pass. Please run the Phase 3 check of jointly mentioned pairs and paths, and the Phase 10 checklist, once more over the whole model, then wrap up as you normally would.",
    naming: [
      "One last pass, on wording: I would like the model to use our own words.",
      "",
      "Call get_graph_state first. Then go through what is on the canvas, three to five items per question, relationships first, then properties, then classes:",
      "- for each relationship, ask me what we call this connection ourselves, in one verb phrase, and which way round we would say it;",
      "- for each property and each class, ask me whether that is what we would call it, or whether we have our own term for it.",
      "",
      "Record each answer with the rename_ontology_elements tool: a relationship takes my verb phrase, and if I state it the other way round it is turned round (reverse: true); a property or a class takes my term. Previous names of classes and relationships are kept as aliases automatically. Where I say the current name is already right, leave it as it is. Do not add or remove anything in this pass.",
      "",
      "When every relationship, property and class has been asked about, end that message with one line in exactly this form, and ask nothing further in it:",
      "NAMING LEDGER: relationships_renamed=<number>; relationships_redirected=<number>; properties_renamed=<number>; classes_renamed=<number>",
    ].join("\n"),
  },
  hu: {
    sweepFirst: [
      "Mielőtt lezárnánk, még egy módszeres kört szeretnék, hogy előkerüljön, amiről eddig nem beszéltünk.",
      "",
      "Először hívd meg a get_graph_state eszközt, és azt tekintsd mérvadónak abban, hogy mi van már a vásznon. Utána menj végig a vásznon lévő összes osztályon, kérdésenként három-öt osztállyal, és kérdezd meg tőlem mindegyikről, mi minden létezik körülötte a munkánkban: alárendelt részei vagy összetevői; állapotai vagy életciklus-eseményei; szereplői vagy felelősei; bemenetei és kimenetei; kapcsolódó dokumentumai vagy megállapodásai; mért vagy jellemző értékei, amelyeket hordoz; annak a munkafolyamatnak korábbi vagy későbbi szakaszai, amelyhez tartozik; ugyanannak a dolognak szűkebb vagy testvér fajtái; és hogy egy testvérosztályon már jóváhagyott tulajdonságok közül melyek érvényesek erre is. Hagyd ki azokat a szempontokat, amelyek egy osztályra nyilvánvalóan nem illenek.",
      "",
      "Ezeket nyitott kérdésként tedd fel arról, mi létezik, nem arról, mire van szüksége az ügynöknek: ne szűkítsd a kérdést arra, amit a rögzített kompetenciakérdések vagy műveletek megkövetelnek, és ne kérd, hogy csak a szükségeseket említsem. Csak miután válaszoltam, vesd össze mindazt, amit megneveztem, a kompetenciakérdésekkel és a műveletekkel, pontosan úgy, mint bármely más jelöltet, és csak azt vedd fel, ami ezen átmegy; semmi sem kerül be csak azért, mert szóba került. Vezess folyamatos listát a jelöltekről, és mindegyiket zárd le: felvéve, elutasítva (az indokkal) vagy nyitva hagyva; egyik sem tűnhet el szó nélkül.",
      "",
      "Amikor ebben a körben minden osztályról kérdeztél, és minden jelölt le van zárva, azt az üzenetet pontosan ilyen alakú sorral zárd, és abban már ne kérdezz semmit:",
      "COVERAGE LEDGER: surfaced=<szám>; added=<szám>; declined=<szám>; open=<szám>",
    ].join("\n"),
    sweepNext: (classes) => [
      `Köszönöm. Ebben a körben ezek az osztályok kerültek be: ${classes.join(", ")}.`,
      "Kérlek, ugyanezeket a nyitott kérdéseket tedd fel mindegyikről, ugyanazokkal a szabályokkal, és ezt a kört is ugyanazzal a COVERAGE LEDGER sorral zárd.",
    ].join("\n"),
    sweepCloseout: "A modell ebben a körben bővült. Kérlek, futtasd le még egyszer a teljes modellre a 3. fázis együtt említett párokra és utakra vonatkozó ellenőrzését és a 10. fázis ellenőrzőlistáját, majd zárd le úgy, ahogy szoktad.",
    naming: [
      "Egy utolsó kör a szóhasználatról: szeretném, ha a modell a mi saját szavainkat használná.",
      "",
      "Először hívd meg a get_graph_state eszközt. Utána menj végig azon, ami a vásznon van, kérdésenként három-öt elemmel, előbb a kapcsolatokon, aztán a tulajdonságokon, végül az osztályokon:",
      "- minden kapcsolatnál kérdezd meg, mi magunk hogyan nevezzük ezt a kapcsolatot, egyetlen igei kifejezéssel, és melyik irányból mondanánk;",
      "- minden tulajdonságnál és osztálynál kérdezd meg, hogy mi is így neveznénk-e, vagy van rá saját szavunk.",
      "",
      "Minden választ a rename_ontology_elements eszközzel rögzíts: a kapcsolat az én igei kifejezésemet kapja, és ha fordított irányból mondom, meg is fordul (reverse: true); a tulajdonság vagy az osztály az én szavamat kapja. Az osztályok és kapcsolatok korábbi neve automatikusan alternatív névként megmarad. Ahol azt mondom, hogy a mostani név már jó, hagyd úgy. Ebben a körben ne vegyél fel és ne törölj semmit.",
      "",
      "Amikor minden kapcsolatról, tulajdonságról és osztályról kérdeztél, azt az üzenetet pontosan ilyen alakú sorral zárd, és abban már ne kérdezz semmit:",
      "NAMING LEDGER: relationships_renamed=<szám>; relationships_redirected=<szám>; properties_renamed=<szám>; classes_renamed=<szám>",
    ].join("\n"),
  },
};

const LEDGER_PATTERNS = {
  coverage: /COVERAGE LEDGER:\s*([^\n]*)/i,
  naming: /NAMING LEDGER:\s*([^\n]*)/i,
};

/**
 * Parses a ledger line out of an interviewer message: `{ key: number }`, or
 * null when the message has no ledger. A value that is not a number (the
 * model wrote names, or "none") is kept as its text.
 */
export function parseLedger(kind, text) {
  const m = LEDGER_PATTERNS[kind] && String(text || "").match(LEDGER_PATTERNS[kind]);
  if (!m) return null;
  const out = {};
  for (const part of m[1].split(/[;,]/)) {
    const kv = part.match(/^\s*([a-z_]+)\s*=\s*(.*?)\s*$/i);
    if (!kv) continue;
    const value = kv[2].replace(/[`*.]+$/g, "").trim();
    out[kv[1].toLowerCase()] = /^\d+$/.test(value) ? Number(value) : value;
  }
  return out;
}

/** Class names in a domain YAML export (the `classes:` mapping's keys). */
export function classNamesOf(doc) {
  return doc && doc.classes && typeof doc.classes === "object" ? Object.keys(doc.classes) : [];
}

export const DEFAULT_STAGE_TURN_CAPS = { sweepRound: 45, sweepCloseout: 15, naming: 45 };

/**
 * The stage state machine runOntologyRecoveryConversation drives (its
 * `stageController` option). Everything that touches the page comes in as
 * a callback, so this is testable with no browser:
 *
 *   captureSnapshot(label, { turn, stage }) -> parsed YAML doc of the model at that moment
 *   readModel()                            -> parsed YAML doc of the model now
 *   setRenameTool(on)                      -> offers / withdraws the eval-only rename tool
 *   renameLog()                            -> the app's log of renames made (agentState.renameLog)
 */
export function createStageController({
  sweep = true,
  naming = true,
  sweepMaxRounds = 3,
  turnCaps = DEFAULT_STAGE_TURN_CAPS,
  lang = "en",
  captureSnapshot,
  readModel,
  setRenameTool = async () => {},
  renameLog = async () => [],
  log = () => {},
}) {
  const texts = STAGE_TEXTS[lang] || STAGE_TEXTS.en;
  const caps = { ...DEFAULT_STAGE_TURN_CAPS, ...turnCaps };
  let stage = "interview";
  let stageStartTurn = 0;
  let round = 0;
  let roundStartClasses = [];
  let sweepStartClasses = [];
  const events = [];
  const snapshots = [];
  const rounds = [];
  let namingLedger = null;
  let namingRenames = null;

  const record = (event) => { events.push(event); log(`[stages] ${JSON.stringify(event)}`); };

  async function snapshot(label, turn) {
    const doc = await captureSnapshot(label, { turn, stage });
    snapshots.push({ label, turn, stage, classCount: classNamesOf(doc).length });
    record({ type: "snapshot", label, turn });
    return doc;
  }

  function enter(next, turn, message, extra = {}) {
    stage = next;
    stageStartTurn = turn;
    record({ type: "stage_started", stage: next, turn, ...extra });
    return { message };
  }

  async function startNaming(turn) {
    await setRenameTool(true);
    return enter("naming", turn, texts.naming);
  }

  async function finishSweep(turn) {
    await snapshot("B", turn);
    if (naming) return startNaming(turn);
    return { stop: true, stoppedReason: "stages_complete" };
  }

  // The sweep's round just ended (ledger, wrap-up or cap): sweep the classes
  // it added, or stop at the fixpoint / the round limit.
  async function endSweepRound(turn, appText, how) {
    const doc = await readModel();
    const now = classNamesOf(doc);
    const added = now.filter((c) => !roundStartClasses.includes(c));
    rounds.push({ round, startTurn: stageStartTurn, endTurn: turn, endedBy: how, classesAdded: added, ledger: parseLedger("coverage", appText) });
    record({ type: "sweep_round_ended", round, turn, endedBy: how, classesAdded: added.length });
    if (added.length && round < sweepMaxRounds) {
      round++;
      roundStartClasses = now;
      return enter("sweep", turn, texts.sweepNext(added), { round });
    }
    const grew = now.some((c) => !sweepStartClasses.includes(c)) || rounds.some((r) => r.ledger && Number(r.ledger.added) > 0);
    if (grew) return enter("sweep_closeout", turn, texts.sweepCloseout);
    return finishSweep(turn);
  }

  async function endStage(turn, appText, how) {
    if (stage === "interview") {
      await snapshot("A", turn);
      if (sweep) {
        const doc = await readModel();
        sweepStartClasses = classNamesOf(doc);
        roundStartClasses = sweepStartClasses;
        round = 1;
        return enter("sweep", turn, texts.sweepFirst, { round });
      }
      if (naming) return startNaming(turn);
      return { stop: true, stoppedReason: "stages_complete" };
    }
    if (stage === "sweep") return endSweepRound(turn, appText, how);
    if (stage === "sweep_closeout") {
      record({ type: "sweep_closeout_ended", turn, endedBy: how });
      return finishSweep(turn);
    }
    if (stage === "naming") {
      namingLedger = parseLedger("naming", appText);
      namingRenames = await renameLog();
      record({ type: "naming_ended", turn, endedBy: how });
      await setRenameTool(false);
      await snapshot("C", turn);
      stage = "done";
      return { stop: true, stoppedReason: "stages_complete" };
    }
    return { stop: true, stoppedReason: "stages_complete" };
  }

  const ledgerKind = () => (stage === "sweep" ? "coverage" : stage === "naming" ? "naming" : null);
  const capFor = () => (stage === "sweep" ? caps.sweepRound : stage === "sweep_closeout" ? caps.sweepCloseout : stage === "naming" ? caps.naming : Infinity);

  return {
    get stage() { return stage; },
    get round() { return round; },

    // The classifier says the interviewer has wrapped up.
    async onInterviewerFinished({ turn, appText }) {
      const kind = ledgerKind();
      const how = kind && parseLedger(kind, appText) ? "ledger" : "finished";
      return endStage(turn, appText, how);
    },

    // Every other turn: a ledger line ends the stage without the classifier;
    // the stage's turn cap ends it as truncated. Otherwise null (carry on).
    async onTurnWithoutFinish({ turn, appText }) {
      const kind = ledgerKind();
      if (kind && parseLedger(kind, appText)) return endStage(turn, appText, "ledger");
      if (stage !== "interview" && turn - stageStartTurn >= capFor()) {
        record({ type: "stage_capped", stage, turn, cap: capFor() });
        return endStage(turn, appText, "capped");
      }
      return null;
    },

    summary() {
      const renames = Array.isArray(namingRenames) ? namingRenames.filter((r) => r.ok) : [];
      const count = (pred) => renames.filter(pred).length;
      return {
        enabled: { sweep, naming },
        sweepMaxRounds,
        turnCaps: caps,
        lang,
        finalStage: stage,
        snapshots,
        events,
        sweepRounds: rounds,
        sweepLedgerTotals: rounds.reduce((acc, r) => {
          for (const k of ["surfaced", "added", "declined", "open"]) {
            if (r.ledger && typeof r.ledger[k] === "number") acc[k] = (acc[k] || 0) + r.ledger[k];
          }
          return acc;
        }, {}),
        stagesCapped: events.filter((e) => e.type === "stage_capped").map((e) => e.stage),
        namingLedger,
        // Counted from what the app actually did, not from the ledger.
        namingRenames: namingRenames === null ? null : {
          relationshipsRenamed: count((r) => r.kind === "relationship"),
          relationshipsRedirected: count((r) => r.kind === "relationship" && r.reverse === true),
          propertiesRenamed: count((r) => r.kind === "property"),
          classesRenamed: count((r) => r.kind === "class"),
          failed: namingRenames.filter((r) => !r.ok).length,
        },
      };
    },
  };
}
