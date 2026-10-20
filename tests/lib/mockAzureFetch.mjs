// A stand-in Azure OpenAI resource for dry runs of the benchmark runner
// (issue #182): preloaded with `node --import`, it answers every fetch to
// MOCK_AZURE_ENDPOINT in-process, so the real runner -- connect flow, relay,
// Responses fallback, stages, snapshots, scoring, provenance -- runs end to
// end with no key and no network. The interviewer is scripted
// (scriptedInterviewer.mjs); the persona, classifier, reviewer and judge get
// short canned answers. Anything not addressed to the mock goes to the real
// fetch untouched.
//
//   MOCK_AZURE_ENDPOINT=https://mock-resource.openai.azure.com \
//   node --import ./tests/lib/mockAzureFetch.mjs tests/evals/run-multi-domain-benchmark.mjs ...
//
// Like the real deployment, the first tool-carrying Chat Completions call is
// refused ("Function tools with reasoning_effort are not supported"), and
// the classifier's temperature:0 is refused, so both fallbacks are exercised.
import {
  scriptedInterviewer, asChatCompletion, asResponse, lastFromChatBody, lastFromResponsesBody,
} from "./scriptedInterviewer.mjs";

const ENDPOINT = (process.env.MOCK_AZURE_ENDPOINT || "").replace(/\/+$/, "");
const DEPLOYMENT = process.env.MOCK_AZURE_DEPLOYMENT || "gpt-6-sol";

if (ENDPOINT) {
  const realFetch = globalThis.fetch;
  const interviewer = scriptedInterviewer();
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  const harnessUsage = { prompt_tokens: 400, completion_tokens: 20, total_tokens: 420, prompt_tokens_details: { cached_tokens: 0 } };
  const harnessReply = (text) => json(200, { id: "h", object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content: text }, finish_reason: "stop" }], usage: harnessUsage });

  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (!url.startsWith(ENDPOINT)) return realFetch(input, init);
    const pathPart = url.slice(ENDPOINT.length);
    const body = init.body ? JSON.parse(init.body) : null;

    if (pathPart.startsWith("/openai/deployments?")) {
      return json(200, { object: "list", data: [{ id: DEPLOYMENT, model: `${DEPLOYMENT}-2026-09-22`, status: "succeeded", created_at: 1 }] });
    }
    if (pathPart.startsWith("/openai/v1/responses")) return json(200, asResponse(interviewer.next(lastFromResponsesBody(body))));
    if (/^\/openai\/deployments\/[^/]+\/chat\/completions/.test(pathPart)) {
      if (body.tools) {
        return json(400, { error: { message: "Function tools with reasoning_effort are not supported for this model in /v1/chat/completions. To use function tools, use /v1/responses or set reasoning_effort to 'none'.", code: "unsupported_parameter" } });
      }
      const system = String((body.messages[0] && body.messages[0].content) || "");
      if (/You judge a single message/.test(system)) {
        if ("temperature" in body) return json(400, { error: { message: "Unsupported value: 'temperature' does not support 0 with this model. Only the default (1) value is supported.", param: "temperature" } });
        const judged = String(body.messages[1].content).split("MESSAGE TO JUDGE:\n").pop();
        return harnessReply(JSON.stringify({ phase: "final wrap-up", finished: /is complete/.test(judged) }));
      }
      if (/reviewing a transcript/i.test(system)) return harnessReply("No errors or noteworthy events (mock review).");
      // The persona answers anything else addressed to it as a conversation;
      // a judge prompt (one system + one user message, not a conversation)
      // gets an answer it cannot parse, so the run falls back to heuristic
      // scoring the way it does when a real judge call fails.
      if (body.messages.length > 2 || /Hidden-ground-truth rule/.test(system)) return harnessReply("Yes, that is right, and there is nothing more to add there.");
      return harnessReply("(mock judge: no verdict)");
    }
    return json(404, { error: { message: `mock Azure: no route for ${pathPart}` } });
  };
}
