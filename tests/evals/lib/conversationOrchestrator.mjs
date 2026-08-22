import fs from "node:fs";
import yaml from "js-yaml";
import { CHAT_URL, forwardToRealOpenAi, sendChatMessage, RATE_LIMIT_MAX_ATTEMPTS, rateLimitBackoffMs, sleepMs, isInsufficientQuotaError } from "../../lib/liveOpenAi.mjs";
import { createPersonaAgent, OPENING_LINE } from "./personaAgent.mjs";
import { buildLeakCandidateSet, findLeakedIdentifiers } from "./leakDetector.mjs";

const CLASSIFIER_URL = "https://api.openai.com/v1/chat/completions";

// Issue #133/Finding B (external audit): gpt-5.4 consistently outputs the
// curly typographic apostrophe (’, "'") in real prose, never the
// straight ASCII one ("'") -- confirmed empirically, "You're welcome."
// (straight) never appears in any real transcript this eval has produced,
// "You're welcome." (curly) appears constantly. Every regex below that
// matches an apostrophe'd word ("you're", "if you'd") was written with only
// the straight form, so it silently never matched real output. Root-caused
// via one specific incident: iof-maintenance/run-03 finished cleanly at
// turn 40, then spent turns 41-200 (159 turns, 79.5% of the run) in a dead
// "That covers it well, thank you." / "You're welcome." loop because
// looksLikePureAcknowledgment never recognized the app agent's own
// "You're welcome." as a stock closing phrase. Normalizing both curly-quote
// characters to straight before every pattern test here (once, centrally)
// is more robust than hand-editing each pattern's own character class.
function normalizeQuotes(text) {
  return text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
}

// Issue #133/E4 (external audit): index.html appends a "system"-role
// transcript note on a rate limit, an unrecoverable context-length overflow
// (after compaction was attempted and still failed), a tool-round-limit
// stop, or a generic API error (agentChatErrorText/t("agentToolTooManyRounds")
// in index.html) -- but this orchestrator only ever looked for
// role === "assistant" on each turn, so a real API error surfaced
// identically to the app agent simply having nothing to say: silently, with
// no count anywhere. Classifies exactly the English strings index.html's own
// translation table produces for each kind, so a real error is
// distinguishable from a genuinely quiet turn instead of being folded into
// the same "app_agent_produced_no_text_repeatedly" stop reason.
const APP_ERROR_PATTERNS = {
  rateLimit: /rate limit reached/i,
  insufficientQuota: /out of quota/i,
  contextLength: /conversation is too long/i,
  network: /could not reach the .* api/i,
  authFailed: /rejected the api key/i,
  toolRoundLimit: /tried to use its tools too many times/i,
  generic: /something went wrong contacting the agent/i,
};
export function classifyAppSystemNote(text) {
  for (const [kind, re] of Object.entries(APP_ERROR_PATTERNS)) {
    if (re.test(text)) return kind;
  }
  return null;
}

// Deterministic pre-filter, checked before ever calling the LLM classifier
// below. First live run of this eval (see helper_agent_todo.md's Log) found
// a real false positive: the interviewer's own system prompt has it recap
// and ask for confirmation at the end of *each* of its 10 phases
// (helper_agent_plan.md §4.3's INTERVIEW PROCESS), and a Phase-1-only recap
// was misread as the whole interview being done. That was "fixed" by
// telling the LLM classifier about all 10 phases explicitly -- but a later
// run found the *same* failure mode again, on a message that literally
// opened with "**Phase 3 recap — relationships captured:**" and closed by
// asking to move into the next phase: about as textbook a mid-interview
// checkpoint as exists, and the instructed classifier still said YES. A
// cheap, low-token-budget model apparently can't reliably tell a phase
// recap's rhetorical shape (bulleted summary + "please confirm") from a
// real final wrap-up's, no matter how the instructions are worded.
//
// This catches the interviewer's own consistent "Phase N recap" / "Phase N
// is confirmed complete" phrasing (N 0-8, never 9 -- phase 9 is the real
// final pass and must still reach the LLM call) with plain regex, and
// short-circuits straight to "not finished" without spending an API call at
// all. It only ever forces NO, never YES, so it can only make the
// classifier less trigger-happy than before, never more.
const EARLY_PHASE_CHECKPOINT_PATTERNS = [
  /\bphase\s*[0-8]\b[^\n]{0,40}\brecap\b/i,
  /\brecap\b[^\n]{0,40}\bphase\s*[0-8]\b/i,
  /\bphase\s*[0-8]\b[^\n]{0,60}\bconfirmed\s+complete\b/i,
];
export function looksLikeEarlyPhaseCheckpoint(text) {
  return EARLY_PHASE_CHECKPOINT_PATTERNS.some((re) => re.test(text));
}

// Third deterministic pre-filter, and the same failure class as the first:
// the LLM classifier being fooled by rhetorical shape. Issue #94's first
// gpt-5.4 batch found ALL SIX interviews stopped on a message that recapped
// the model so far and then ASKED THE EXPERT WHETHER TO CONTINUE -- in one
// case naming the domain areas still unmodelled ("continue into additional
// scope you mentioned earlier such as emergency changes, communications,
// reviews, or regulatory-reporting workflows?"). The classifier read the
// recap and said YES; the offer sitting right next to it says the interview
// is manifestly not over.
//
// An interview is not finished while the interviewer is still asking whether
// to do more work. The published anchor runs confirm the distinction is real
// rather than invented here: all three end on a flat terminal statement with
// no question mark at all ("No blocking gaps found. The ontology is now
// usable...", "...is ready for use in the tool.", "The ontology is complete
// for the questions and actions you gave."), so this filter would never have
// fired on them -- the anchor set is unaffected by the defect and by the fix.
//
// Requires BOTH a question mark and an explicit offer of further work, so a
// genuine final summary that happens to contain a rhetorical question is not
// caught. Like the phase-recap filter, it only ever forces NO, never YES.
const CONTINUATION_OFFER_PATTERNS = [
  /\b(would you like|do you want|shall i|should i|want me to|if you(?:'d| would| wish to)? ?(?:like|want)?)\b[^?]{0,160}?\b(continue|carry on|keep going|proceed|move (?:on|to)|go on|expand|extend|add more|next phase|further|fix|clean ?up|refine|tackle|work on)\b/i,
  /\bstop here\b[^?]{0,120}?\bor\b[^?]{0,120}?\b(continue|carry on|keep going|proceed|expand|extend)\b/i,
  /\b(the )?next step (can|could|would) be\b/i,
  /\bnext i can do\b/i,
];
export function looksLikeContinuationOffer(text) {
  if (!text) return false;
  if (!text.includes("?")) return false; // a final summary states; it does not ask
  const normalized = normalizeQuotes(text);
  return CONTINUATION_OFFER_PATTERNS.some((re) => re.test(normalized));
}

// Second, independent safety net -- catches the actual failure mode a real
// run hit (helper_agent_todo.md's dated Log entry: 160+ turns of pure
// "Thank you" / "You're welcome" / "Take care" after the interview had
// already, explicitly finished), and unlike appearsFinished() below it
// needs no API call and can never be fooled by a model (classifier or
// interviewer) misjudging content -- it only looks at shape. A message
// this short, with no question mark (i.e. not inviting more conversation),
// that opens with a stock closing phrase, is a pure acknowledgment with no
// new domain content -- regardless of whether it's actually the "finished"
// message or just small talk. Two of these in a row from the app agent
// means the conversation has gone idle either way, so the loop below stops
// on the second one rather than trusting appearsFinished() to eventually
// catch up. This can only shorten a run that has already stopped producing
// content, never cut off a real answer (a real answer is either longer, or
// asks something back).
const PURE_ACKNOWLEDGMENT_PATTERN = /^\s*(thanks|thank you|you'?re welcome|take care|sounds (good|great)|great(,| -)? thanks|glad (to|i could) help|my pleasure|no problem|appreciate it|have a (great|good|nice) (day|one)|goodbye|bye( for now)?)\b/i;
export function looksLikePureAcknowledgment(text) {
  if (!text) return false;
  const trimmed = normalizeQuotes(text.trim());
  if (!trimmed) return false;
  if (trimmed.split(/\s+/).length > 25) return false; // real content runs longer than a closing line
  if (trimmed.includes("?")) return false; // a question means the conversation is still active
  return PURE_ACKNOWLEDGMENT_PATTERN.test(trimmed);
}

// Cheap, separate real call asking whether the interviewer's latest message
// reads like it believes the *entire* elicitation is wrapped up -- this is
// what lets a run stop well before the turn cap instead of always running
// to the limit. Kept as its own tiny classification call (not reused from
// the persona or app agent) so it can use a model chosen independently of
// either conversational role -- see ontology-recovery.eval.spec.mjs, which
// now defaults it to the same real, live-picked "standard tier" model the
// interviewer itself connected with (not a fixed cheap one), after the
// classifier default (gpt-4o-mini) proved to be part of what made the
// false-positive above hard to instruction-away: a more capable model is
// less prone to being fooled by rhetorical shape alone. Also given a little
// more room to reason before answering (a one-sentence phase identification
// on its own line, then the verdict on the line after) rather than forcing
// an immediate 2-token guess.
//
// Deliberately does NOT set `temperature` or `max_tokens` -- a live run
// with a reasoning-tier interviewer model (e.g. a real "gpt-5.5-..." pick)
// found `max_tokens` rejected outright ("Unsupported parameter: 'max_tokens'
// is not supported with this model. Use 'max_completion_tokens' instead."),
// and the resulting HTTP 400 was silently swallowed by the old code below
// (data.choices undefined -> answer "" -> always "not finished"), so the
// run never stopped and just looped polite goodbyes for 160+ turns after
// the interviewer had explicitly finished. index.html's own
// callAgentChatRaw() never sets these either, for the same reason: it's the
// one request shape confirmed to work across every model family this app
// might connect with, standard and reasoning-tier alike. A `res.ok`/
// `data.error` check now also makes any *future* incompatibility a loud,
// immediate test failure instead of a silent multi-hour hang.
// The classifier's prompt and verdict parsing, in one place so the OpenAI path
// below and any injected provider (issue #85 runs on Azure) ask exactly the
// same question and read the answer exactly the same way. Two copies of this
// would drift, and a classifier that drifts between arms would put a
// difference into the comparison that has nothing to do with the treatment.
export function classifierMessages(text) {
  return [
    { role: "system", content: "You judge a single message from an AI conducting a domain-modeling interview, which " +
              "runs through 10 numbered phases: 0 orientation, 1 real questions/actions, 2 classes, " +
              "3 relationships, 4 decision properties, 5 language/aliases, 6 constraints, 7 rules, 8 actions, " +
              "9 final validation pass (competency-question check, final checklist). It recaps and asks for " +
              "confirmation at the end of EVERY phase, not just the last one -- a recap of phase 1, 2, 3, etc. " +
              "asking to proceed to the next phase is completely normal mid-interview behavior, not completion. " +
              "First, on one line, name which phase (0-9) this message's content most resembles, or say " +
              "'final wrap-up' if it's phase 9 or equivalent. Then, on the next line by itself, answer with " +
              "exactly one word, YES or NO: does this specific message indicate the *entire* 10-phase " +
              "interview is finished (this is the phase-9-equivalent final wrap-up, referencing a completed " +
              "model as a whole, not just one earlier phase's recap)? Default to NO whenever the message reads " +
              "like an earlier phase's checkpoint rather than a true final summary." },
    { role: "user", content: text },
  ];
}

// The model answers on two lines: a phase name, then YES or NO alone.
export function classifierVerdict(answer) {
  const lines = String(answer || "").trim().split("\n").map((l) => l.trim()).filter(Boolean);
  return /^\s*yes/i.test(lines[lines.length - 1] || "");
}

export async function appearsFinished(text, { apiKey, model, chat = null }) {
  if (looksLikeEarlyPhaseCheckpoint(text)) return false;
  if (looksLikeContinuationOffer(text)) return false;
  // Same injection point as personaAgent's: issue #85 runs against Azure,
  // where the fixed api.openai.com URL and Bearer header below are wrong.
  // The deterministic pre-filter above still runs either way.
  //
  // Issue #133/E16 (external audit): a classifier call that ultimately fails
  // (an empty reply twice in a row, an exhausted-retries HTTP error) used to
  // throw and take the *entire* run down with it -- hours of a real,
  // otherwise-healthy interview lost to one failed "is this finished?"
  // check. Degraded to "not finished" instead: the conservative direction
  // (the run keeps going rather than ending prematurely), consistent with
  // this function's own deterministic pre-filters above, which likewise
  // only ever force NO, never YES.
  if (chat) {
    try {
      const { text: verdict } = await chat(classifierMessages(text));
      return classifierVerdict(verdict);
    } catch (err) {
      console.log(`  appearsFinished: classifier call failed (${String((err && err.message) || err)}), defaulting to "not finished"`);
      return false;
    }
  }
  let res, data;
  // Retries a transient 429 with backoff, same as every other real API call
  // site (index.html, the relay, personaAgent.mjs) -- this classifier call
  // had no retry at all until a real run hit a rate limit here mid-eval.
  // insufficient_quota is still never retried.
  try {
    for (let attempt = 1; attempt <= RATE_LIMIT_MAX_ATTEMPTS; attempt++) {
      res = await fetch(CLASSIFIER_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: classifierMessages(text),
        }),
      });
      data = await res.json();
      if (res.ok && !data.error) break;
      const isRetryableRateLimit = res.status === 429 && !isInsufficientQuotaError(data) && attempt < RATE_LIMIT_MAX_ATTEMPTS;
      if (isRetryableRateLimit) {
        await sleepMs(rateLimitBackoffMs(attempt));
        continue;
      }
      throw new Error(`appearsFinished classifier call failed (HTTP ${res.status}, model "${model}"): ${(data.error && data.error.message) || "unknown error"}`);
    }
  } catch (err) {
    console.log(`  appearsFinished: classifier call failed (${String((err && err.message) || err)}), defaulting to "not finished"`);
    return false;
  }
  return classifierVerdict((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "");
}

// Pure, unit-testable tagging step: given a slice of raw apiMessages
// entries (window.__kg.agent.state.apiMessages -- the exact {role, content,
// tool_calls?} objects the app pushes for every real API request/response,
// see index.html's sendAgentChatMessage) newly added during one turn, tags
// each with that turn number for reportGenerator.mjs's raw transparency
// log. Kept separate from the page.evaluate() call site below so this
// mapping is testable without a live browser.
export function tagApiMessagesWithTurn(apiMessages, turn) {
  return apiMessages.map((m) => ({ turn, ...m }));
}

// Runs the full simulated interview: alternates the real app agent (driven
// through `page`, already connected via connectAgentLive) and the persona
// agent (personaAgent.mjs), starting from the persona's own scripted
// opening line. Stops on whichever comes first: the app agent appearing to
// consider the interview finished (appearsFinished, an LLM call, backed by
// looksLikeEarlyPhaseCheckpoint's deterministic pre-filter), two
// consecutive content-free pleasantries from the app agent
// (looksLikePureAcknowledgment, a second and independent safety net that
// needs no API call and cannot be fooled the way a classifier model can),
// the turn cap, or the wallclock budget -- see the file's own module doc in
// tests/evals/README.md for the full rationale.
//
// onProgress(snapshot), if given, fires several times per turn -- most
// importantly *before* the one call that's actually slow (sendChatMessage,
// which waits on a real, possibly-tool-calling API round-trip with no
// intermediate feedback of its own) rather than only after. That ordering
// is the whole point: a run that hangs or times out inside sendChatMessage
// previously left nothing to inspect at all (the real per-turn arrays only
// existed as function-local variables, never returned until the very end,
// so an exception thrown mid-loop discarded them) -- exactly what happened
// investigating a real timeout while testing this fix (helper_agent_todo.md's
// dated Log entry). The eval spec's own onProgress callback re-uses
// writeConversationLog/writeToolCallLog to keep the same two results files
// live and auditable turn-by-turn during a run, not just written once at
// the end -- "every_turn_started" is specifically what survives a hang,
// showing which turn was in flight and how long ago it started.
export async function runOntologyRecoveryConversation({
  page,
  apiKey,
  personaModel = "gpt-4o-mini",
  classifierModel = "gpt-4o-mini",
  maxTurns = 100,
  wallClockMs = 45 * 60 * 1000,
  onProgress,
  // How the app's outgoing chat call reaches a real provider. Defaults to the
  // OpenAI relay every existing caller uses; issue #85's runner passes an
  // Azure one, because the model family this repository's anchors were
  // produced on is not reachable on OpenAI from that environment. Nothing else
  // about the loop is provider-aware.
  installRelay = (p) => forwardToRealOpenAi(p, CHAT_URL),
  // The harness's own two model calls -- the simulated expert and the
  // "is this interview finished?" classifier. They are separate from the relay
  // above, which only carries the *app's* traffic; these are Node-side calls
  // that would otherwise go straight to api.openai.com with a Bearer header.
  // Injected together so an eval cannot end up with the persona on one
  // provider and the classifier on another.
  chat = null,
  // Issue #104: any domain's own persona.md + reference.domain.yaml can be
  // substituted for itops's persona-eszter.md + MTSR fixture (personaAgent.
  // mjs's own defaults), and its own derived opening line used instead of
  // the hand-authored OPENING_LINE constant. All four default to itops's
  // existing values, so every existing caller (which never passes these) is
  // completely unaffected.
  personaPath,
  groundTruthText,
  groundTruthFilename,
  groundTruthFormat,
  openingLine = OPENING_LINE,
}) {
  const persona = createPersonaAgent({
    apiKey, model: personaModel, chat: chat ? (m) => chat(m, personaModel) : null,
    personaPath, groundTruthText, groundTruthFilename, groundTruthFormat,
  });
  const chatResponses = installRelay(page);
  const log = [{ turn: 0, speaker: "persona", text: openingLine }];
  const rawApiLog = [];

  // Issue #133/E13 item 4 (external audit): a runtime hard-reject +
  // bounded-retry guard, on top of the root-cause fix above (item 1,
  // groundTruthFormat: "domain-yaml") and the wrapper-prompt fix (E11) --
  // defense in depth, not a replacement for either. Built only when there is
  // a `.domain.yaml`-shaped ground truth to build a candidate set from
  // (leakDetector.mjs's collectRawIdentifiers assumes that schema); itops's
  // own MTSR-format default has no equivalent guard yet and is unaffected.
  const leakCandidates = (() => {
    if (groundTruthFormat !== "domain-yaml" || !groundTruthText) return null;
    let doc;
    try { doc = yaml.load(groundTruthText); } catch { return null; }
    if (!doc || typeof doc !== "object") return null;
    const briefText = personaPath ? (() => { try { return fs.readFileSync(personaPath, "utf8"); } catch { return ""; } })() : "";
    return buildLeakCandidateSet(doc, briefText);
  })();
  const MAX_LEAK_RETRY_ATTEMPTS = 2; // total attempts = 1 original + this many regenerations
  const leakEvents = []; // { turn, attempt, identifiers, resolved } -- for provenance/transparency, mirrors errorCounts

  // Regenerates the persona's last reply up to MAX_LEAK_RETRY_ATTEMPTS times
  // when it verbatim-leaks a raw ground-truth identifier. Pops the leaking
  // exchange from the persona's own running context before each retry, so a
  // retry is a genuinely fresh attempt at the same question rather than the
  // model seeing its own rejected answer sitting uncorrected in its history.
  // On exhaustion, returns the last (still-leaking) reply with `exhausted:
  // true` -- the caller aborts the run rather than silently forwarding it,
  // per the strategy this issue was opened to implement ("a hard reject, and
  // a special re-generation loop", not silent patching of the leaked text).
  async function personaReplyWithLeakGuard(incomingText, turn) {
    let reply = await persona.reply(incomingText);
    if (!leakCandidates) return { reply, leaked: [] };
    const eventsThisTurn = [];
    for (let attempt = 1; attempt <= MAX_LEAK_RETRY_ATTEMPTS + 1; attempt++) {
      const leaked = findLeakedIdentifiers(reply.text, leakCandidates);
      if (!leaked.length) {
        for (const ev of eventsThisTurn) ev.resolved = true; // a later attempt on this same turn came back clean
        return { reply, leaked: [] };
      }
      const event = { turn, attempt, identifiers: leaked, resolved: false };
      eventsThisTurn.push(event);
      leakEvents.push(event);
      emitProgress(`leak_detected_attempt_${attempt}`, turn);
      if (attempt > MAX_LEAK_RETRY_ATTEMPTS) return { reply, leaked, exhausted: true };
      persona.messages.pop(); // the leaking assistant reply
      persona.messages.pop(); // its paired user turn
      reply = await persona.reply(incomingText);
    }
    return { reply, leaked: findLeakedIdentifiers(reply.text, leakCandidates) };
  }

  const startedAt = Date.now();
  let incomingForApp = openingLine;
  let stoppedReason = "max_turns_reached";
  let consecutiveEmptyAppTurns = 0;
  let consecutiveErrorTurns = 0;
  let consecutivePureAcknowledgmentTurns = 0;
  let consecutivePersonaAcknowledgmentTurns = 0; // issue #133/E12
  let turnsUsed = 0;
  const errorCounts = {}; // issue #133/E4: kind -> occurrence count, across the whole run
  let compactionEvents = 0;

  // Never let a progress-reporting failure (a bad file write, a full disk)
  // take down the real conversation it's only reporting on.
  const emitProgress = (phase, turn) => {
    if (!onProgress) return;
    try {
      onProgress({ phase, turn, turnsUsed, durationMs: Date.now() - startedAt, log: [...log], rawApiLog: [...rawApiLog] });
    } catch (err) { /* reporting must be best-effort, never fatal */ }
  };

  for (let turn = 1; turn <= maxTurns; turn++) {
    if (Date.now() - startedAt > wallClockMs) { stoppedReason = "wallclock_timeout"; break; }
    turnsUsed = turn;

    // Fires before the one call in this loop with no progress feedback of
    // its own -- see this function's own header comment for why that
    // ordering (not "after") is what makes this useful during a hang.
    emitProgress("turn_started", turn);

    const transcriptBefore = await page.evaluate(() => window.__kg.agent.state.transcript.length);
    const apiMessagesBefore = await page.evaluate(() => window.__kg.agent.state.apiMessages.length);
    await sendChatMessage(page, incomingForApp, { timeout: 90000 });
    const transcriptAfter = await page.evaluate(() => window.__kg.agent.state.transcript);
    const newEntries = transcriptAfter.slice(transcriptBefore);
    for (const entry of newEntries) log.push({ turn, speaker: `app-${entry.role}`, text: entry.text });

    // Raw API-level transparency: the exact tool_calls arguments and tool
    // result content, independent of the human-readable transcript notes
    // above -- see reportGenerator.mjs's writeToolCallLog. A compaction
    // (compactAgentHistory) can shrink apiMessages instead of only
    // appending to it; slicing from the pre-turn length still captures
    // every message pushed *during* this turn correctly, it just can't see
    // older turns' entries a later compaction folded away -- acceptable,
    // since compaction only replaces already-logged history, it doesn't
    // change what this turn itself sent/received.
    const apiMessagesAfter = await page.evaluate(() => window.__kg.agent.state.apiMessages);
    // A compaction (compactAgentHistory) shrinks apiMessages instead of only
    // appending to it -- the one place that's directly observable from here,
    // since a successful compaction leaves no transcript note of its own
    // (issue #133/E4: previously invisible to every operational stat).
    if (apiMessagesAfter.length < apiMessagesBefore) compactionEvents++;
    const newApiMessages = apiMessagesAfter.length >= apiMessagesBefore ? apiMessagesAfter.slice(apiMessagesBefore) : apiMessagesAfter;
    rawApiLog.push(...tagApiMessagesWithTurn(newApiMessages, turn));
    emitProgress("app_turn_complete", turn); // sendChatMessage returned -- this turn's real content just landed in log/rawApiLog

    const lastAssistant = [...newEntries].reverse().find((m) => m.role === "assistant");
    const appText = lastAssistant && lastAssistant.text ? lastAssistant.text.trim() : "";
    const errorNote = newEntries.find((e) => e.role === "system" && classifyAppSystemNote(e.text));
    if (errorNote) errorCounts[classifyAppSystemNote(errorNote.text)] = (errorCounts[classifyAppSystemNote(errorNote.text)] || 0) + 1;

    if (!appText) {
      if (errorNote) {
        // A real API error, not the app agent simply having nothing to say
        // (issue #133/E4) -- counted and stopped on separately so the run's
        // own stoppedReason names what actually happened.
        consecutiveErrorTurns++;
        consecutiveEmptyAppTurns = 0;
        if (consecutiveErrorTurns >= 3) { stoppedReason = "app_agent_errored_repeatedly"; break; }
      } else {
        consecutiveErrorTurns = 0;
        consecutiveEmptyAppTurns++;
        if (consecutiveEmptyAppTurns >= 3) { stoppedReason = "app_agent_produced_no_text_repeatedly"; break; }
      }
      incomingForApp = "(continuing) Please go ahead and ask your next question.";
      continue;
    }
    consecutiveEmptyAppTurns = 0;
    consecutiveErrorTurns = 0;

    if (looksLikePureAcknowledgment(appText)) {
      consecutivePureAcknowledgmentTurns++;
      if (consecutivePureAcknowledgmentTurns >= 2) {
        stoppedReason = "pleasantry_loop_detected";
        break;
      }
    } else {
      consecutivePureAcknowledgmentTurns = 0;
    }

    if (Date.now() - startedAt > wallClockMs) { stoppedReason = "wallclock_timeout"; break; }
    if (await appearsFinished(appText, { apiKey, model: classifierModel, chat: chat ? (m) => chat(m, classifierModel) : null })) {
      stoppedReason = "app_agent_appears_finished";
      break;
    }

    const { reply: personaReply, leaked, exhausted } = await personaReplyWithLeakGuard(appText, turn);
    if (exhausted) {
      // Abort-and-flag, never silent patching: the last reply still leaks a
      // raw ground-truth identifier after every retry was exhausted. Do NOT
      // forward it to the app -- a leaked identifier reaching the
      // interviewer would inflate recovery accuracy on a question the
      // interview never actually earned the answer to (this issue's whole
      // reason for existing). The leak is recorded in the log for
      // transparency instead of the reply text itself.
      log.push({ turn, speaker: "persona", text: `[leak guard: reply withheld after ${MAX_LEAK_RETRY_ATTEMPTS + 1} attempts, still contained: ${leaked.join(", ")}]` });
      stoppedReason = "leak_detected_after_retries";
      break;
    }
    log.push({ turn, speaker: "persona", text: personaReply.text });
    incomingForApp = personaReply.text;
    emitProgress("persona_turn_complete", turn);

    // Issue #133/E12 (external audit): looksLikePureAcknowledgment was only
    // ever checked against the *interviewer's* text -- a real 159-turn dead
    // loop (iof-maintenance/run-03) was two-sided ("That covers it well,
    // thank you." / "You're welcome.", back and forth), and the persona's
    // own wrapper-scripted closing line was never checked at all. The
    // app-side check above remains the primary tripwire (it fires first,
    // before the persona is even asked to reply); this is the same
    // detector applied to the other half of the loop, as a second,
    // independent one -- a scenario where the app's own phrasing varies
    // enough to dodge the pattern each turn, but the persona is still just
    // repeating its scripted sign-off, is now caught too.
    if (looksLikePureAcknowledgment(personaReply.text)) {
      consecutivePersonaAcknowledgmentTurns++;
      if (consecutivePersonaAcknowledgmentTurns >= 2) { stoppedReason = "pleasantry_loop_detected"; break; }
    } else {
      consecutivePersonaAcknowledgmentTurns = 0;
    }
  }

  emitProgress(stoppedReason, turnsUsed);

  return {
    log,
    turnsUsed,
    stoppedReason,
    durationMs: Date.now() - startedAt,
    chatResponses, // raw real API responses for the app agent's side, for operational metrics
    rawApiLog, // exact tool_calls arguments + tool result content per turn, for reportGenerator.mjs's transparency log
    errorCounts, // issue #133/E4: {rateLimit, insufficientQuota, contextLength, network, authFailed, toolRoundLimit, generic} -> occurrence count
    compactionEvents, // issue #133/E4: how many turns compacted the app agent's own conversation history
    leakEvents, // issue #133/E13 item 4: [{turn, attempt, identifiers, resolved}] -- every raw-identifier leak the runtime guard caught, retried, or (if resolved stays false) exhausted retries on
  };
}
