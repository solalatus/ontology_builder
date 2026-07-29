import { CHAT_URL, forwardToRealOpenAi, sendChatMessage } from "../../lib/liveOpenAi.mjs";
import { createPersonaAgent, OPENING_LINE } from "./personaAgent.mjs";

const CLASSIFIER_URL = "https://api.openai.com/v1/chat/completions";

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
  const trimmed = text.trim();
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
async function appearsFinished(text, { apiKey, model }) {
  if (looksLikeEarlyPhaseCheckpoint(text)) return false;
  const res = await fetch(CLASSIFIER_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You judge a single message from an AI conducting a domain-modeling interview, which " +
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
            "like an earlier phase's checkpoint rather than a true final summary.",
        },
        { role: "user", content: text },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`appearsFinished classifier call failed (HTTP ${res.status}, model "${model}"): ${(data.error && data.error.message) || "unknown error"}`);
  }
  const answer = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
  const lines = answer.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  const verdictLine = lines[lines.length - 1] || "";
  return /^\s*yes/i.test(verdictLine);
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
}) {
  const persona = createPersonaAgent({ apiKey, model: personaModel });
  const chatResponses = forwardToRealOpenAi(page, CHAT_URL);
  const log = [{ turn: 0, speaker: "persona", text: OPENING_LINE }];
  const rawApiLog = [];

  const startedAt = Date.now();
  let incomingForApp = OPENING_LINE;
  let stoppedReason = "max_turns_reached";
  let consecutiveEmptyAppTurns = 0;
  let consecutivePureAcknowledgmentTurns = 0;
  let turnsUsed = 0;

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
    const newApiMessages = apiMessagesAfter.length >= apiMessagesBefore ? apiMessagesAfter.slice(apiMessagesBefore) : apiMessagesAfter;
    rawApiLog.push(...tagApiMessagesWithTurn(newApiMessages, turn));
    emitProgress("app_turn_complete", turn); // sendChatMessage returned -- this turn's real content just landed in log/rawApiLog

    const lastAssistant = [...newEntries].reverse().find((m) => m.role === "assistant");
    const appText = lastAssistant && lastAssistant.text ? lastAssistant.text.trim() : "";

    if (!appText) {
      consecutiveEmptyAppTurns++;
      if (consecutiveEmptyAppTurns >= 3) { stoppedReason = "app_agent_produced_no_text_repeatedly"; break; }
      incomingForApp = "(continuing) Please go ahead and ask your next question.";
      continue;
    }
    consecutiveEmptyAppTurns = 0;

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
    if (await appearsFinished(appText, { apiKey, model: classifierModel })) {
      stoppedReason = "app_agent_appears_finished";
      break;
    }

    const personaReply = await persona.reply(appText);
    log.push({ turn, speaker: "persona", text: personaReply.text });
    incomingForApp = personaReply.text;
    emitProgress("persona_turn_complete", turn);
  }

  emitProgress(stoppedReason, turnsUsed);

  return {
    log,
    turnsUsed,
    stoppedReason,
    durationMs: Date.now() - startedAt,
    chatResponses, // raw real API responses for the app agent's side, for operational metrics
    rawApiLog, // exact tool_calls arguments + tool result content per turn, for reportGenerator.mjs's transparency log
  };
}
