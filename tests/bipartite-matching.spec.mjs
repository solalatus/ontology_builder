import { test } from "node:test";
import assert from "node:assert/strict";
import { maxWeightBipartiteMatching } from "./evals/lib/bipartiteMatching.mjs";

// Fast, deterministic unit tests for the from-scratch Hungarian-algorithm
// utility that fixes the class-matching/semantic-judge many-to-one bug (see
// bipartiteMatching.mjs's own header comment, and recoveryMetrics.mjs's
// matchClasses() / llmMatcher.mjs's computeSemanticRecoveryMetrics() for the
// two call sites this was built for).

test("an empty edge list returns no matches", () => {
  assert.deepEqual(maxWeightBipartiteMatching([]), []);
});

test("a single positive-weight edge is matched", () => {
  const result = maxWeightBipartiteMatching([{ left: "a", right: "x", weight: 0.7 }]);
  assert.deepEqual(result, [{ left: "a", right: "x", weight: 0.7 }]);
});

test("zero and negative weight edges are dropped, never matched", () => {
  const result = maxWeightBipartiteMatching([
    { left: "a", right: "x", weight: 0 },
    { left: "a", right: "y", weight: -0.3 },
  ]);
  assert.deepEqual(result, []);
});

test("disjoint edges (no shared left/right ids) are all matched independently", () => {
  const result = maxWeightBipartiteMatching([
    { left: "a", right: "x", weight: 0.6 },
    { left: "b", right: "y", weight: 0.9 },
    { left: "c", right: "z", weight: 0.65 },
  ]);
  const byLeft = new Map(result.map((r) => [r.left, r.right]));
  assert.equal(byLeft.size, 3);
  assert.equal(byLeft.get("a"), "x");
  assert.equal(byLeft.get("b"), "y");
  assert.equal(byLeft.get("c"), "z");
});

// The reviewer's exact reported scenario: one recovered node's aliases
// Jaccard-overlap two different gold classes ("IncidentCommander" matching
// both "incidentCommander" and "majorIncident"). Before the fix, both gold
// classes counted that single node as a match, inflating recall without
// inflating precision. A correct one-to-one assignment must pick exactly one
// of the two gold classes for that node -- the higher-weight one -- and
// leave the other gold class unmatched (not silently rescued by some other
// node, since none exists in this fixture).
test("one recovered node overlapping two gold classes is assigned to only the better-scoring one", () => {
  const result = maxWeightBipartiteMatching([
    { left: "incidentCommander", right: "n7", weight: 0.62 },
    { left: "majorIncident", right: "n7", weight: 0.83 },
  ]);
  assert.equal(result.length, 1, "only one of the two gold classes may claim node n7");
  assert.deepEqual(result[0], { left: "majorIncident", right: "n7", weight: 0.83 });
});

// Mirrors the reviewer's other two audited examples in one graph: three gold
// classes all with a candidate edge to the same recovered node, plus two of
// them also having a second, distinct candidate.
test("a node claimed by three gold classes goes to the best one; the others fall back to their own distinct candidates", () => {
  const result = maxWeightBipartiteMatching([
    { left: "serviceOwner", right: "nA", weight: 0.7 },
    { left: "businessOwner", right: "nA", weight: 0.6 },
    { left: "businessService", right: "nA", weight: 0.95 },
    { left: "serviceOwner", right: "nB", weight: 0.65 },
    { left: "businessOwner", right: "nC", weight: 0.61 },
  ]);
  const byLeft = new Map(result.map((r) => [r.left, r.right]));
  assert.equal(byLeft.size, 3, "every gold class should still be matched, just not all to the same node");
  assert.equal(byLeft.get("businessService"), "nA", "the highest-weight claimant keeps the contested node");
  assert.equal(byLeft.get("serviceOwner"), "nB", "displaced from nA, falls back to its own distinct candidate");
  assert.equal(byLeft.get("businessOwner"), "nC", "displaced from nA, falls back to its own distinct candidate");
});

// A right-side id can be genuinely ambiguous too (multiple recovered nodes
// both plausibly matching one gold class) -- only one may be chosen.
test("one gold class claimed by two recovered nodes is assigned to only the better-scoring one", () => {
  const result = maxWeightBipartiteMatching([
    { left: "incident", right: "n1", weight: 0.68 },
    { left: "incident", right: "n2", weight: 0.72 },
  ]);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], { left: "incident", right: "n2", weight: 0.72 });
});

// Unweighted matches (every edge weight 1, as the semantic-judge call site
// uses since a judge verdict is binary MATCH/NO MATCH) should still resolve
// to a valid one-to-one assignment maximizing the number of matches, not
// just picking arbitrarily and leaving a resolvable conflict unresolved.
test("uniform-weight edges (binary judge verdicts) still produce a valid maximum one-to-one assignment", () => {
  const result = maxWeightBipartiteMatching([
    { left: "g1", right: "r1", weight: 1 },
    { left: "g2", right: "r1", weight: 1 },
    { left: "g2", right: "r2", weight: 1 },
  ]);
  const byLeft = new Map(result.map((r) => [r.left, r.right]));
  assert.equal(byLeft.size, 2, "both gold items should end up matched via the augmenting reassignment");
  assert.equal(byLeft.get("g1"), "r1");
  assert.equal(byLeft.get("g2"), "r2");
});

// A slightly larger, denser graph to exercise the augmenting-path search
// beyond the trivial 2-3 node cases above, with a known-optimal total.
test("a denser graph resolves to the global maximum-weight assignment, not a greedy local one", () => {
  // Greedy-by-descending-weight would grab (a,x)=0.9 first, forcing b to
  // (b,y)=0.5 for a total of 1.4. The true optimum swaps to (a,y)=0.8 and
  // (b,x)=0.85 for 1.65.
  const result = maxWeightBipartiteMatching([
    { left: "a", right: "x", weight: 0.9 },
    { left: "a", right: "y", weight: 0.8 },
    { left: "b", right: "x", weight: 0.85 },
    { left: "b", right: "y", weight: 0.5 },
  ]);
  const total = result.reduce((sum, r) => sum + r.weight, 0);
  assert.ok(Math.abs(total - 1.65) < 1e-9, `expected total weight 1.65, got ${total}`);
  const byLeft = new Map(result.map((r) => [r.left, r.right]));
  assert.equal(byLeft.get("a"), "y");
  assert.equal(byLeft.get("b"), "x");
});

test("duplicate edges for the same left/right pair keep the higher weight", () => {
  const result = maxWeightBipartiteMatching([
    { left: "a", right: "x", weight: 0.4 },
    { left: "a", right: "x", weight: 0.7 },
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].weight, 0.7);
});
