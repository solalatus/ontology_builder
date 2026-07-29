import { CHAT_URL, forwardToRealOpenAi, sendChatMessage } from "../../lib/liveOpenAi.mjs";
import { createPersonaAgent, OPENING_LINE } from "./personaAgent.mjs";

const CLASSIFIER_URL = "https://api.openai.com/v1/chat/completions";

// Cheap, separate real call asking whether the interviewer's latest message
// reads like it believes the *entire* elicitation is wrapped up -- this is
// what lets a run stop well before the turn cap instead of always running
// to the limit. Kept as its own tiny classification call (not reused from
// the persona or app agent) so it can use a fixed, cheap,
// deterministic-as-possible model regardless of what either conversational
// role is configured to use.
//
// First live run of this eval (see helper_agent_todo.md's Log) found a
// real false positive here: the interviewer's own system prompt has it
// recap and ask for confirmation at the end of *each* of its 10 phases
// (helper_agent_plan.md §4.3's INTERVIEW PROCESS), and a Phase-1-only recap
// ("Phase 1 has enough material... [recap]... ready to move on?") was
// misread as the whole interview being done, stopping the run after 17
// turns with zero classes ever modeled. The fix: tell the classifier about
// those phases explicitly and require the message to look like the *final*
// one (phase 9, or an equivalent competency-question/final-checklist pass),
// not just the end of an early phase.
async function appearsFinished(text, { apiKey, model }) {
  const res = await fetch(CLASSIFIER_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 2,
      messages: [
        {
          role: "system",
          content: "You judge a single message from an AI conducting a domain-modeling interview, which " +
            "runs through 10 numbered phases: 0 orientation, 1 real questions/actions, 2 classes, " +
            "3 relationships, 4 decision properties, 5 language/aliases, 6 constraints, 7 rules, 8 actions, " +
            "9 final validation pass (competency-question check, final checklist). It recaps and asks for " +
            "confirmation at the end of EVERY phase, not just the last one -- a recap of phase 1, 2, 3, etc. " +
            "asking to proceed to the next phase is completely normal mid-interview behavior, not completion. " +
            "Answer with exactly one word, YES or NO: does this specific message indicate the *entire* " +
            "10-phase interview is finished (this is the phase-9-equivalent final wrap-up, referencing a " +
            "completed model as a whole, not just one earlier phase's recap)? Default to NO whenever the " +
            "message reads like an earlier phase's checkpoint rather than a true final summary.",
        },
        { role: "user", content: text },
      ],
    }),
  });
  const data = await res.json();
  const answer = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
  return /^\s*yes/i.test(answer);
}

// Runs the full simulated interview: alternates the real app agent (driven
// through `page`, already connected via connectAgentLive) and the persona
// agent (personaAgent.mjs), starting from the persona's own scripted
// opening line. Stops on whichever comes first: the app agent appearing to
// consider the interview finished, the turn cap, or the wallclock budget --
// see the file's own module doc in tests/evals/README.md for the full
// rationale.
export async function runOntologyRecoveryConversation({
  page,
  apiKey,
  personaModel = "gpt-4o-mini",
  classifierModel = "gpt-4o-mini",
  maxTurns = 100,
  wallClockMs = 45 * 60 * 1000,
}) {
  const persona = createPersonaAgent({ apiKey, model: personaModel });
  const chatResponses = forwardToRealOpenAi(page, CHAT_URL);
  const log = [{ turn: 0, speaker: "persona", text: OPENING_LINE }];

  const startedAt = Date.now();
  let incomingForApp = OPENING_LINE;
  let stoppedReason = "max_turns_reached";
  let consecutiveEmptyAppTurns = 0;
  let turnsUsed = 0;

  for (let turn = 1; turn <= maxTurns; turn++) {
    if (Date.now() - startedAt > wallClockMs) { stoppedReason = "wallclock_timeout"; break; }
    turnsUsed = turn;

    const transcriptBefore = await page.evaluate(() => window.__kg.agent.state.transcript.length);
    await sendChatMessage(page, incomingForApp, { timeout: 90000 });
    const transcriptAfter = await page.evaluate(() => window.__kg.agent.state.transcript);
    const newEntries = transcriptAfter.slice(transcriptBefore);
    for (const entry of newEntries) log.push({ turn, speaker: `app-${entry.role}`, text: entry.text });

    const lastAssistant = [...newEntries].reverse().find((m) => m.role === "assistant");
    const appText = lastAssistant && lastAssistant.text ? lastAssistant.text.trim() : "";

    if (!appText) {
      consecutiveEmptyAppTurns++;
      if (consecutiveEmptyAppTurns >= 3) { stoppedReason = "app_agent_produced_no_text_repeatedly"; break; }
      incomingForApp = "(continuing) Please go ahead and ask your next question.";
      continue;
    }
    consecutiveEmptyAppTurns = 0;

    if (Date.now() - startedAt > wallClockMs) { stoppedReason = "wallclock_timeout"; break; }
    if (await appearsFinished(appText, { apiKey, model: classifierModel })) {
      stoppedReason = "app_agent_appears_finished";
      break;
    }

    const personaReply = await persona.reply(appText);
    log.push({ turn, speaker: "persona", text: personaReply.text });
    incomingForApp = personaReply.text;
  }

  return {
    log,
    turnsUsed,
    stoppedReason,
    durationMs: Date.now() - startedAt,
    chatResponses, // raw real API responses for the app agent's side, for operational metrics
  };
}
