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
export function maxWeightBipartiteMatching(edges) {
  const positiveEdges = edges.filter((e) => e.weight > 0);
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
