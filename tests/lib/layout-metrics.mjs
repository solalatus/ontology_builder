// Layout-quality metrics for the issue #64 ("Crowded graph layout")
// autolayout work — shared by tools/layout-bench.mjs (dev-only visual/
// exploratory bench) and tests/autolayout-quality.spec.mjs (permanent
// regression tests), so the two can never quietly drift apart. Pure
// functions over plain {nodes, edges} data pulled from window.__kg.state —
// no browser/canvas dependency, safe to import from either a page.evaluate
// result or straight into a Node test file.

function rectOverlapArea(a, b) {
  const xOverlap = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const yOverlap = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return xOverlap * yOverlap;
}

function orient(ax, ay, bx, by, cx, cy) {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

function onSegment(ax, ay, bx, by, px, py) {
  return Math.min(ax, bx) - 1e-9 <= px && px <= Math.max(ax, bx) + 1e-9 &&
    Math.min(ay, by) - 1e-9 <= py && py <= Math.max(ay, by) + 1e-9;
}

// Standard orientation-based segment intersection (proper + collinear
// touching cases). Endpoints are node *centers*, not the app's actual
// border-anchored edge geometry (index.html's edgeAnchors/edgeGeometry) --
// a deliberate simplification so this metric is cheap and, more importantly,
// applied identically to every algorithm version being compared. It's a
// relative signal across iterations/fixtures, not a claim about the exact
// pixel-level crossing count a user would see.
function segmentsIntersect(a1, a2, b1, b2) {
  const d1 = orient(b1.x, b1.y, b2.x, b2.y, a1.x, a1.y);
  const d2 = orient(b1.x, b1.y, b2.x, b2.y, a2.x, a2.y);
  const d3 = orient(a1.x, a1.y, a2.x, a2.y, b1.x, b1.y);
  const d4 = orient(a1.x, a1.y, a2.x, a2.y, b2.x, b2.y);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  if (d1 === 0 && onSegment(b1.x, b1.y, b2.x, b2.y, a1.x, a1.y)) return true;
  if (d2 === 0 && onSegment(b1.x, b1.y, b2.x, b2.y, a2.x, a2.y)) return true;
  if (d3 === 0 && onSegment(a1.x, a1.y, a2.x, a2.y, b1.x, b1.y)) return true;
  if (d4 === 0 && onSegment(a1.x, a1.y, a2.x, a2.y, b2.x, b2.y)) return true;
  return false;
}

function mean(xs) { return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0; }
function stdev(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

// nodes: [{id, x, y, w, h, label}], edges: [{id, source, target, relation, labelT}]
// (exactly the shape window.__kg.state.nodes/edges narrow down to — see
// tools/layout-bench.mjs's runOne() and tests/autolayout-quality.spec.mjs).
export function computeLayoutMetrics(nodes, edges) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const center = (n) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });

  // Node-box overlap
  let overlapPairs = 0, overlapArea = 0;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = rectOverlapArea(nodes[i], nodes[j]);
      if (a > 0) { overlapPairs++; overlapArea += a; }
    }
  }

  // Edge-crossing count (center-to-center proxy, see segmentsIntersect note)
  const segs = edges
    .map((e) => ({ e, a: byId.get(e.source), b: byId.get(e.target) }))
    .filter((s) => s.a && s.b);
  let crossings = 0;
  for (let i = 0; i < segs.length; i++) {
    for (let j = i + 1; j < segs.length; j++) {
      const s1 = segs[i], s2 = segs[j];
      const sharesEndpoint = [s1.e.source, s1.e.target].some((id) => id === s2.e.source || id === s2.e.target);
      if (sharesEndpoint) continue;
      if (segmentsIntersect(center(s1.a), center(s1.b), center(s2.a), center(s2.b))) crossings++;
    }
  }

  // Edge length stats (center-to-center)
  const lengths = segs.map((s) => Math.hypot(center(s.a).x - center(s.b).x, center(s.a).y - center(s.b).y));

  // Bounding box / density
  const minX = Math.min(...nodes.map((n) => n.x)), maxX = Math.max(...nodes.map((n) => n.x + n.w));
  const minY = Math.min(...nodes.map((n) => n.y)), maxY = Math.max(...nodes.map((n) => n.y + n.h));
  const bboxW = maxX - minX, bboxH = maxY - minY, bboxArea = bboxW * bboxH;
  const totalNodeArea = nodes.reduce((s, n) => s + n.w * n.h, 0);

  // Edge-label collision proxy: label sits at edge.labelT along the
  // source->target line (index.html's edgeGeometry, unbent case; iteration
  // 4's resolveEdgeLabelPositions sets labelT per edge, defaulting to the
  // plain midpoint -- 0.5 -- for any edge it hasn't touched), offset ~4px
  // above the line -- close enough for a position-based collision proxy. A
  // collision is either two edge-label points within LABEL_MIN_DIST of
  // each other, or a label point landing inside a third node's box (not
  // one of that edge's own endpoints).
  const LABEL_MIN_DIST = 40;
  const mids = segs.map((s) => {
    const t = s.e.labelT ?? 0.5;
    const ca = center(s.a), cb = center(s.b);
    return { x: ca.x + (cb.x - ca.x) * t, y: ca.y + (cb.y - ca.y) * t };
  });
  let labelLabelCollisions = 0;
  for (let i = 0; i < mids.length; i++) {
    for (let j = i + 1; j < mids.length; j++) {
      if (Math.hypot(mids[i].x - mids[j].x, mids[i].y - mids[j].y) < LABEL_MIN_DIST) labelLabelCollisions++;
    }
  }
  let labelNodeCollisions = 0;
  for (let i = 0; i < mids.length; i++) {
    const { e } = segs[i];
    for (const n of nodes) {
      if (n.id === e.source || n.id === e.target) continue;
      if (mids[i].x >= n.x && mids[i].x <= n.x + n.w && mids[i].y >= n.y && mids[i].y <= n.y + n.h) labelNodeCollisions++;
    }
  }

  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    nodeOverlap: { pairs: overlapPairs, totalArea: Math.round(overlapArea) },
    edgeCrossings: crossings,
    edgeLength: {
      mean: Math.round(mean(lengths)), stdev: Math.round(stdev(lengths)),
      min: lengths.length ? Math.round(Math.min(...lengths)) : 0,
      max: lengths.length ? Math.round(Math.max(...lengths)) : 0,
    },
    boundingBox: { w: Math.round(bboxW), h: Math.round(bboxH), area: Math.round(bboxArea) },
    density: bboxArea > 0 ? Number((totalNodeArea / bboxArea).toFixed(4)) : null,
    labelCollisions: { labelLabel: labelLabelCollisions, labelNode: labelNodeCollisions },
  };
}

// Pulls exactly the fields computeLayoutMetrics needs off window.__kg.state
// — call from inside a page.evaluate(). Kept here (not just inlined at
// every call site) so the node/edge field list stays in one place.
export function extractStateForMetrics() {
  return {
    nodes: window.__kg.state.nodes.map(({ id, x, y, w, h, label }) => ({ id, x, y, w, h, label })),
    edges: window.__kg.state.edges.map(({ id, source, target, relation, labelT }) => ({ id, source, target, relation, labelT })),
  };
}
