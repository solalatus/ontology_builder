// Maximum-weight bipartite matching (classic O(n^3) Hungarian/Kuhn-Munkres
// algorithm), built to fix a real measurement bug: recoveryMetrics.mjs's
// matchClasses() used to let one recovered node satisfy multiple gold
// classes at once (recall counted every gold class a node's aliases
// Jaccard-overlapped; precision deduped per node), silently inflating class
// recall without inflating precision. llmMatcher.mjs's semantic-judge
// aggregation had the identical asymmetry one level up: nothing stopped two
// different REFERENCE lines from independently picking the same CANDIDATE.
// Both are fixed by routing their candidate pairs through this shared
// one-to-one assignment step instead of accepting every threshold-passing
// pair directly. See recoveryMetrics.mjs's matchClasses() and
// llmMatcher.mjs's computeSemanticRecoveryMetrics() for the call sites.
//
// Problem sizes here are tens of items (gold classes/relationships x
// recovered nodes/edges), so a straightforward exact O(n^3) algorithm is
// more than fast enough -- nothing reusable already existed in this repo or
// its dependencies (confirmed: package.json has no matching/optimization
// library), so this is a small from-scratch utility, not a wrapper.

// Standard O(n^3) primal-dual Hungarian algorithm for the minimum-cost
// perfect-matching assignment problem on a square cost matrix (1-indexed
// internally, the conventional formulation for this algorithm). Returns
// assignment[i] = the column matched to row i (0-indexed).
function hungarianMinCost(cost) {
  const n = cost.length;
  const INF = Infinity;
  const u = new Array(n + 1).fill(0);
  const v = new Array(n + 1).fill(0);
  const p = new Array(n + 1).fill(0); // p[j] = row currently assigned to column j
  const way = new Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array(n + 1).fill(INF);
    const used = new Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = INF;
      let j1 = -1;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
        else { minv[j] -= delta; }
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }

  const assignment = new Array(n).fill(-1);
  for (let j = 1; j <= n; j++) {
    if (p[j] > 0) assignment[p[j] - 1] = j - 1;
  }
  return assignment;
}

// edges: [{ left, right, weight }], left/right arbitrary string ids, weight
// > 0 (edges with weight <= 0 are dropped -- they're not real candidate
// matches, same as "never a threshold-passing pair" upstream). Returns the
// subset of edges maximizing total weight subject to each left id and each
// right id being used at most once. Passing weight: 1 for every edge (as
// the semantic-judge call site does, since a judge verdict is binary MATCH/
// NO MATCH, not a graded score) reduces this to plain maximum-cardinality
// bipartite matching.
//
// Exact solve for one bipartite subproblem -- the whole original body of
// this module before issue #141's two-phase fix (see maxWeightBipartiteMatching
// below), extracted unchanged so both phases run through the identical,
// already-tested Hungarian core rather than a second implementation.
function solveExactAssignment(positiveEdges) {
  if (!positiveEdges.length) return [];

  const lefts = [...new Set(positiveEdges.map((e) => e.left))];
  const rights = [...new Set(positiveEdges.map((e) => e.right))];
  const leftIndex = new Map(lefts.map((l, i) => [l, i]));
  const rightIndex = new Map(rights.map((r, i) => [r, i]));

  const weight = lefts.map(() => new Array(rights.length).fill(0));
  for (const e of positiveEdges) {
    const li = leftIndex.get(e.left);
    const ri = rightIndex.get(e.right);
    weight[li][ri] = Math.max(weight[li][ri], e.weight);
  }

  // Pad to a square matrix with the larger side; padded cells and genuine
  // non-edges are both weight 0 (cost 0), so the algorithm never prefers
  // pairing two real items at weight 0 over leaving each matched to its own
  // padding counterpart -- real weight-0 pairs are filtered out below
  // regardless of which side of that tie the algorithm happens to land on.
  const n = Math.max(lefts.length, rights.length);
  const cost = [];
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      const w = (i < lefts.length && j < rights.length) ? weight[i][j] : 0;
      row.push(-w); // minimize cost == maximize weight
    }
    cost.push(row);
  }

  const assignment = hungarianMinCost(cost);
  const result = [];
  for (let i = 0; i < lefts.length; i++) {
    const j = assignment[i];
    if (j >= 0 && j < rights.length && weight[i][j] > 0) {
      result.push({ left: lefts[i], right: rights[j], weight: weight[i][j] });
    }
  }
  return result;
}

// Issue #141: plain maximum-*total*-weight assignment is provably not the
// same objective as "each gold element gets its single best available
// match," and the two diverge with real, demonstrated consequences when the
// recovered side contains a duplicate/near-duplicate pair for one concept.
// Confirmed on real fibo-loans data: gold class `InterestPaymentTerms` has a
// near-perfect (~1.0) candidate match to a recovered node also literally
// named `InterestPaymentTerms`, but the plain sum-maximizing assignment gave
// that node to a different, unrelated gold class instead (weight ~0.667),
// and sent `InterestPaymentTerms` to an empty decoy stub (also ~0.667) --
// because 0.667 + 0.667 (two mediocre matches) beats 1.0 + 0 (one excellent
// match, with the other gold class correctly left unmatched) under pure sum
// maximization, even though the sum-maximizing choice is the objectively
// wrong pairing. This is a real algorithmic defect, not a wording/threshold
// tuning issue: the Hungarian solver is working correctly for the objective
// it was given, but that objective is wrong for a benchmark whose job is
// "does each gold element have a genuinely correct match."
//
// Fix: a high-confidence pair (weight >= HIGH_CONFIDENCE_LOCK_THRESHOLD,
// meaning "essentially an exact name/alias match") is locked in during a
// first solve restricted to only the high-confidence edges, before the
// remaining, genuinely ambiguous edges are handed to a second, independent
// solve over what's left. This makes an unambiguous near-exact match
// un-stealable by a coincidental partial overlap elsewhere, while leaving
// the existing sum-maximizing behavior completely intact for the ambiguous
// cases it was always meant for (two candidates each partially, genuinely
// plausible, with no clearly-best option). Both phases route through the
// exact same, already-tested Hungarian core (solveExactAssignment above) --
// this is a change to which edges compete against which, not a new or
// approximate algorithm, and it never weakens the existing one-to-one
// guarantee (see this module's own top-of-file comment for why that
// guarantee itself was added).
//
// 0.9 was picked, not tuned: every real "coincidental partial overlap" false
// positive found in the issue #141 audit scored 0.667 or lower (2-of-3 or
// fewer shared tokens), while every genuine match it needed to protect was a
// same-or-near-identical name at ~1.0 -- there is no evidence yet of a real
// case needing a value between the two, so the round, clearly-labeled
// threshold was kept rather than fitted to a specific decimal.
const HIGH_CONFIDENCE_LOCK_THRESHOLD = 0.9;

export function maxWeightBipartiteMatching(edges) {
  const positiveEdges = edges.filter((e) => e.weight > 0);
  if (!positiveEdges.length) return [];

  const highConfidence = positiveEdges.filter((e) => e.weight >= HIGH_CONFIDENCE_LOCK_THRESHOLD);
  const locked = solveExactAssignment(highConfidence);
  const lockedLefts = new Set(locked.map((e) => e.left));
  const lockedRights = new Set(locked.map((e) => e.right));
  const remaining = positiveEdges.filter((e) => !lockedLefts.has(e.left) && !lockedRights.has(e.right));
  return [...locked, ...solveExactAssignment(remaining)];
}
