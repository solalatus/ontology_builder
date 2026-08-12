// POST-INTERVIEW STRUCTURAL NORMALIZER -- FROZEN PROMPT v2 (issue #75, REPORT.md §7)
//
// v2 exists because v1 failed run-03 for two diagnosed, mechanical reasons --
// neither of them "the model was careless", both of them gaps in what v1 told
// it (see results/baselines/post-normalization-v1/REPORT.md §4):
//
//   (a) v1 permits a reachability repair to be made in a rule's natural-language
//       text. v1 correctly diagnosed that three run-03 rules referenced Incident
//       facts from actions whose input class could not reach them, then "fixed"
//       it by rewording the conditions to say "the related Incident ...", which
//       makes the rule assert navigation the graph does not support. Every one
//       of the four blind verdicts caught this independently.
//   (b) v1 gives no precedence rule for a conflict between the one-edge-per-
//       connection profile rule and a relationship the expert explicitly
//       confirmed. v1 removed MonitoringSystem -> generates -> Alert as an
//       inverse duplicate -- defensible under the profile, and this repository's
//       own validator flags that exact pair -- but the transcript shows the
//       expert confirming it. v1 also did not apply the rule consistently: two
//       comparable pairs in run-01 and one in run-02 were left untouched.
//
// SINGLE FACTOR VARIED, MECHANICALLY ENFORCED. v2 is not a rewrite. It is
// constructed at import time by inserting exactly two constraints into v1's own
// CONSTRAINTS list; every other byte -- role, evidence boundary, the eight-
// category audit, the objective, the output grammar and the manifest shape -- is
// v1's, because it is literally v1's string. tests/post-normalization.spec.mjs
// asserts that the line-level difference between the two prompts is exactly the
// inserted block, so "v2 = v1 + these two rules" is a checkable property rather
// than a claim in a comment.
//
// FROZEN, on the same terms as v1: a further version is a v3 constant in a new
// module and a new condition directory, never an edit here.
import { POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V1, sha256 } from "./normalizerPromptV1.mjs";

// The anchor is v1's own tie-break line, which stays last in the list: these two
// rules constrain *how* a correction may be made, so they belong before "prefer
// no change", not after it.
const ANCHOR = "- Prefer no change over a speculative change.";

export const V2_ADDED_CONSTRAINTS = `- Repair an action-input reachability problem by changing the graph -- add the
  missing relationship, or reverse an existing one -- never by rewording a rule.
  A rule condition may only refer to information the modeled relationships can
  actually reach from that action's input class; phrasing a condition as "the
  related X" does not create the path it presumes. If the transcript does not
  justify the relationship change, leave both the rule and the graph unchanged.
- Where the one-directed-relationship-per-connection rule conflicts with a
  relationship the expert explicitly confirmed, keep the expert's relationship
  and change nothing. A relationship the expert confirmed is not an inverse
  duplicate to be removed; their confirmation outranks the profile's preference.`;

function buildV2() {
  if (!POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V1.includes(ANCHOR)) {
    throw new Error("v1 prompt no longer contains the v2 insertion anchor -- v2 cannot be derived from it");
  }
  return POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V1.replace(ANCHOR, `${V2_ADDED_CONSTRAINTS}\n${ANCHOR}`);
}

export const POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V2 = buildV2();
export const NORMALIZER_PROMPT_VERSION_V2 = "v2";
export const NORMALIZER_PROMPT_SHA256_V2 = sha256(POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V2);
