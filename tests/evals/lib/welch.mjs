// WELCH t-INTERVALS (revision 1, S1; results/t-intervals/DESIGN.md)
//
// Plain Welch for a difference of two means, and the domain-stratified Welch
// interval for a difference of macro means over several domains:
//   D = (1/K) Σ_d (mean_a,d − mean_b,d)
//   Var(D) = (1/K²) Σ_d (s²_a,d / n_a,d + s²_b,d / n_b,d)
//   df = Var(D)² / Σ_d Σ_arm [(s²/n) / K²]² / (n − 1)        (Welch–Satterthwaite)
// and D ± t(0.975, df) · sqrt(Var(D)). The domains are fixed strata, not a
// sample of domains. The t quantile comes from the regularized incomplete
// beta function (Numerical Recipes' continued fraction), inverted by
// bisection; no dependency.

export const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
export function variance(xs) {
  if (xs.length < 2) return null;
  const m = mean(xs);
  return xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1);
}

function lnGamma(z) {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let x = z, y = z, tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (const ci of c) ser += ci / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}
function betacf(a, b, x) {
  const MAXIT = 300, EPS = 3e-14, FPMIN = 1e-300;
  let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}
function betai(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b;
}
/** Student t CDF with (real-valued) df. */
export function tCdf(t, df) {
  const x = df / (df + t * t);
  const tail = 0.5 * betai(df / 2, 0.5, x);
  return t >= 0 ? 1 - tail : tail;
}
/** Student t quantile, p in (0, 1). */
export function tQuantile(p, df) {
  if (!(df > 0)) return NaN;
  let lo = -1e3, hi = 1e3;
  for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (tCdf(mid, df) < p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

/**
 * Stratified Welch interval for (1/K) Σ_d (mean(a_d) − mean(b_d)).
 * strata: [{ a: [...values], b: [...values] }, ...] (K = strata.length).
 * Each arm needs at least 2 values per stratum.
 */
export function stratifiedWelch(strata, level = 0.95) {
  const K = strata.length;
  let est = 0, v = 0, denom = 0;
  for (const { a, b } of strata) {
    est += (mean(a) - mean(b)) / K;
    for (const xs of [a, b]) {
      const s2 = variance(xs);
      if (s2 === null) throw new Error("stratifiedWelch: each arm needs n >= 2 per stratum");
      const term = s2 / xs.length / (K * K);
      v += term;
      denom += (term * term) / (xs.length - 1);
    }
  }
  const se = Math.sqrt(v);
  const df = denom > 0 ? (v * v) / denom : Infinity;
  const t = df === Infinity ? 1.959963984540054 : tQuantile(1 - (1 - level) / 2, df);
  return { estimate: est, lo: est - t * se, hi: est + t * se, se, df, t, k: K };
}

/** Plain Welch interval for mean(a) − mean(b). */
export const welch = (a, b, level = 0.95) => stratifiedWelch([{ a, b }], level);

/** Welch interval for (mean(a1) − mean(b1)) − (mean(a2) − mean(b2)), e.g. a difference of drops. */
export function welchDiffOfDiffs(a1, b1, a2, b2, level = 0.95) {
  const parts = [a1, b1, a2, b2];
  const est = mean(a1) - mean(b1) - (mean(a2) - mean(b2));
  let v = 0, denom = 0;
  for (const xs of parts) { const term = variance(xs) / xs.length; v += term; denom += (term * term) / (xs.length - 1); }
  const df = (v * v) / denom, se = Math.sqrt(v), t = tQuantile(1 - (1 - level) / 2, df);
  return { estimate: est, lo: est - t * se, hi: est + t * se, se, df, t };
}

/** The fixed three-outcome reading of the E1 design (and S1's adjective rule). */
export function threeOutcome(iv) {
  if (iv.lo > 0) return "a";
  if (iv.estimate > 0) return "b";
  return "c";
}
