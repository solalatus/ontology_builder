// THE POST-NORMALIZATION CONDITION REGISTRY
//
// One place that says which normalizer prompt each condition ran, so the runner,
// the judge and the analysis all agree without any of them hardcoding a version.
// Adding a condition is adding a row here and a frozen prompt module beside it;
// no existing row is ever edited, because an edited row would silently
// re-describe results already reported against it (EXPERIMENT_BRIEF.md §4.6).
import {
  POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V1, NORMALIZER_PROMPT_SHA256, NORMALIZER_PROMPT_VERSION,
} from "./normalizerPromptV1.mjs";
import {
  POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V2, NORMALIZER_PROMPT_SHA256_V2, NORMALIZER_PROMPT_VERSION_V2,
} from "./normalizerPromptV2.mjs";

// The anchor interviewer ran on gpt-5.5-2026-04-23, which is not reachable on
// the endpoint these conditions were executed against. Both use gpt-5.4, the
// nearest available *predecessor* -- deliberately not a successor, so that a
// positive result cannot be raw capability (POST_NORMALIZATION.md §2). v2 must
// keep the same model as v1 or the two are not comparable: the single factor
// varied between them is the two added constraints, nothing else.
export const DEFAULT_NORMALIZER_MODEL = "gpt-5.4";

export const CONDITIONS = {
  "post-normalization-v1": {
    name: "post-normalization-v1",
    promptVersion: NORMALIZER_PROMPT_VERSION,
    systemPrompt: POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V1,
    promptSha256: NORMALIZER_PROMPT_SHA256,
    defaultModel: DEFAULT_NORMALIZER_MODEL,
  },
  "post-normalization-v2": {
    name: "post-normalization-v2",
    promptVersion: NORMALIZER_PROMPT_VERSION_V2,
    systemPrompt: POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V2,
    promptSha256: NORMALIZER_PROMPT_SHA256_V2,
    defaultModel: DEFAULT_NORMALIZER_MODEL,
  },
};

export const DEFAULT_CONDITION = "post-normalization-v1";

export function resolveCondition(name = DEFAULT_CONDITION) {
  const condition = CONDITIONS[name];
  if (!condition) {
    throw new Error(`unknown condition ${JSON.stringify(name)} -- known: ${Object.keys(CONDITIONS).join(", ")}`);
  }
  return condition;
}

// `--condition=<name>` out of a raw argv slice, with the run ids left over.
export function parseConditionArgs(args) {
  const flag = args.find((a) => a.startsWith("--condition="));
  return {
    condition: resolveCondition(flag ? flag.split("=")[1] : DEFAULT_CONDITION),
    runIds: args.filter((a) => !a.startsWith("--")),
  };
}
