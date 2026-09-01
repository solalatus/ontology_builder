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
//
// All four weights deliberately kept below issue #141's own
// HIGH_CONFIDENCE_LOCK_THRESHOLD (0.9) -- this test is about the plain
// Hungarian core finding the true global optimum among genuinely comparable,
// ambiguous candidates (see maxWeightBipartiteMatching(0), an unthresholded
// weight-1 4-item single-solve case with the same shape), not about the
// high-confidence-lock phase issue #141 added on top of it. The original
// version of this test used 0.9 for the top edge, which is no longer a
// case where the plain Hungarian core exclusively decides the outcome (0.9
// clears the lock threshold and gets solved separately, on purpose) --
// rescaled proportionally so the exact same "greedy grabs the top edge and
// loses" shape is preserved without exercising a different feature by
// accident.
test("a denser graph resolves to the global maximum-weight assignment, not a greedy local one", () => {
  // Greedy-by-descending-weight would grab (a,x)=0.7 first, forcing b to
  // (b,y)=0.3 for a total of 1.0. The true optimum swaps to (a,y)=0.6 and
  // (b,x)=0.65 for 1.25.
  const result = maxWeightBipartiteMatching([
    { left: "a", right: "x", weight: 0.7 },
    { left: "a", right: "y", weight: 0.6 },
    { left: "b", right: "x", weight: 0.65 },
    { left: "b", right: "y", weight: 0.3 },
  ]);
  const total = result.reduce((sum, r) => sum + r.weight, 0);
  assert.ok(Math.abs(total - 1.25) < 1e-9, `expected total weight 1.25, got ${total}`);
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

// --- issue #141: a near-exact match must never be sacrificed to enable two
// mediocre matches elsewhere ------------------------------------------------
//
// Minimal repro of the exact shape found on real fibo-loans data (see
// ontology_translation/TODO.md's dated entry, and heuristic-matches.json
// from run-01/fibo-loans before the fix): gold class `g1` (the real
// `InterestPaymentTerms`) has a near-perfect candidate (`n1`, the real
// recovered `InterestPaymentTerms` node, weight ~1.0) -- but `n1` is ALSO a
// coincidental partial match for a second, unrelated gold class `g2` (the
// real `InterestPayment` event class, weight 0.667), and `g1` itself has its
// own coincidental partial match to a decoy node `n2` (the real orphaned
// `InterestTerms` stub, weight 0.667). `g2` has no other real candidate at
// all. Before this fix, plain sum-maximization preferred trading g1 down to
// its decoy (0.667) so g2 could claim the real node instead (0.667 + 0.667 =
// 1.334), over the objectively correct g1<->n1 (1.0) with g2 correctly left
// unmatched (1.0) -- because 1.334 > 1.0 under pure sum maximization, even
// though it is the wrong pairing: a real, well-modeled node was traded away
// from its true gold match purely to let an unrelated, poorly-modeled gold
// class claim it instead.
test("a near-exact match is never sacrificed to enable two mediocre matches elsewhere (issue #141)", () => {
  const result = maxWeightBipartiteMatching([
    { left: "g1", right: "n1", weight: 1.0 },
    { left: "g1", right: "n2", weight: 0.667 },
    { left: "g2", right: "n1", weight: 0.667 },
  ]);
  const byLeft = new Map(result.map((r) => [r.left, r.right]));
  assert.equal(byLeft.get("g1"), "n1", "the near-exact match must win n1, not be traded down to its decoy");
  assert.equal(byLeft.has("g2"), false, "g2 has no genuine candidate and must be left correctly unmatched, not credited with a stolen n1");
});

// The same shape, mirrored: two near-exact-adjacent gold classes both have a
// coincidental partial match to EACH OTHER's true node -- confirms the fix
// isn't specific to one side having a decoy, it holds when both do.
test("two near-exact matches that also coincidentally overlap each other's true node both resolve correctly", () => {
  const result = maxWeightBipartiteMatching([
    { left: "g1", right: "n1", weight: 1.0 },
    { left: "g2", right: "n2", weight: 0.95 },
    { left: "g1", right: "n2", weight: 0.667 },
    { left: "g2", right: "n1", weight: 0.667 },
  ]);
  const byLeft = new Map(result.map((r) => [r.left, r.right]));
  assert.equal(byLeft.get("g1"), "n1");
  assert.equal(byLeft.get("g2"), "n2");
});

// Two independent instances of the issue #141 shape in one graph, sharing no
// nodes -- confirms the fix generalizes past a single locked pair.
test("multiple independent near-exact matches all survive simultaneously", () => {
  const result = maxWeightBipartiteMatching([
    { left: "g1", right: "n1", weight: 0.95 },
    { left: "g1", right: "n2", weight: 0.5 },
    { left: "g2", right: "n1", weight: 0.5 },
    { left: "g3", right: "n3", weight: 0.92 },
    { left: "g3", right: "n4", weight: 0.6 },
    { left: "g4", right: "n3", weight: 0.6 },
  ]);
  const byLeft = new Map(result.map((r) => [r.left, r.right]));
  assert.equal(byLeft.get("g1"), "n1");
  assert.equal(byLeft.get("g3"), "n3");
  assert.equal(byLeft.has("g2"), false);
  assert.equal(byLeft.has("g4"), false);
});

// A genuinely ambiguous case (no candidate anywhere near the lock
// threshold) must still resolve to the true global sum-maximizing
// assignment -- issue #141's fix changes which edges compete against which,
// it does not turn the whole algorithm into first-match-wins.
test("below the lock threshold, sum-maximization still applies exactly as before", () => {
  const result = maxWeightBipartiteMatching([
    { left: "g1", right: "n1", weight: 0.6 },
    { left: "g1", right: "n2", weight: 0.5 },
    { left: "g2", right: "n1", weight: 0.55 },
    { left: "g2", right: "n2", weight: 0.2 },
  ]);
  const total = result.reduce((sum, r) => sum + r.weight, 0);
  // g1->n2 (0.5) + g2->n1 (0.55) = 1.05, beating the naive-greedy g1->n1
  // (0.6) + g2->n2 (0.2) = 0.8.
  assert.ok(Math.abs(total - 1.05) < 1e-9, `expected total weight 1.05, got ${total}`);
});
