import { test } from "node:test";
import assert from "node:assert/strict";
import { tQuantile, welch, stratifiedWelch, welchDiffOfDiffs, threeOutcome } from "./evals/lib/welch.mjs";

// Revision 1, S1 (results/t-intervals/DESIGN.md): the Welch t-intervals the
// article reports. Reference values from standard t tables and by hand.

test("t quantiles match the tables", () => {
  for (const [df, q] of [[1, 12.7062], [2, 4.3027], [4, 2.7764], [10, 2.2281], [30, 2.0423]]) assert.ok(Math.abs(tQuantile(0.975, df) - q) < 1e-3, `df ${df}`);
});

test("plain Welch: estimate, standard error and Satterthwaite df", () => {
  const x = welch([0.267, 0.346, 0.271], [0.258, 0.292, 0.213]);
  assert.ok(Math.abs(x.estimate - 0.040333) < 1e-6);
  assert.ok(Math.abs(x.se - 0.0344028) < 1e-6);
  assert.ok(Math.abs(x.df - 3.94737) < 1e-4);
  assert.ok(Math.abs(x.hi - x.estimate - x.t * x.se) < 1e-12);
});

test("stratified Welch with one stratum is plain Welch; equal strata shrink the variance by K", () => {
  const a = [1, 2, 4], b = [0, 1, 1];
  assert.deepEqual(stratifiedWelch([{ a, b }]), welch(a, b));
  const two = stratifiedWelch([{ a, b }, { a, b }]);
  assert.ok(Math.abs(two.se - welch(a, b).se / Math.SQRT2) < 1e-12);
  assert.ok(Math.abs(two.df - 2 * welch(a, b).df) < 1e-9);
});

test("difference of differences and the three-outcome reading", () => {
  const x = welchDiffOfDiffs([5, 6, 7], [1, 2, 3], [3, 4, 5], [1, 2, 3]);
  assert.equal(x.estimate, 2);
  assert.equal(threeOutcome({ estimate: 2, lo: 0.1, hi: 4 }), "a");
  assert.equal(threeOutcome({ estimate: 2, lo: -0.1, hi: 4 }), "b");
  assert.equal(threeOutcome({ estimate: 0, lo: -1, hi: 1 }), "c");
});

test("linear combination: weights +1/-1 reproduce plain Welch; the 2x2 interaction is the difference of differences", async () => {
  const { welchLinear } = await import("./evals/lib/welch.mjs");
  const a = [1, 2, 4], b = [0, 1, 1], c = [3, 4, 5], d = [1, 2, 3];
  const x = welchLinear([{ values: a, w: 1 }, { values: b, w: -1 }]), y = welch(a, b);
  assert.ok(Math.abs(x.estimate - y.estimate) < 1e-12 && Math.abs(x.se - y.se) < 1e-12 && Math.abs(x.df - y.df) < 1e-9);
  const i = welchLinear([{ values: a, w: 1 }, { values: b, w: -1 }, { values: c, w: -1 }, { values: d, w: 1 }]);
  const dd = welchDiffOfDiffs(a, b, c, d);
  assert.ok(Math.abs(i.estimate - dd.estimate) < 1e-12 && Math.abs(i.se - dd.se) < 1e-12);
});
