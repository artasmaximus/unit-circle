// Inverse trig on the unit circle, as pure math. Angles are in degrees. The inverses are functions
// only because each is cut down to one stretch of the circle where its partner never repeats (the
// "principal range"): arcsin keeps the right half, arccos the upper half, arctan the right half
// without its ends.
import { dec } from '../../core/trig.ts';

export type InvFn = 'asin' | 'acos' | 'atan';
/** The ordinary function each inverse undoes. */
export const PARTNER = { asin: 'sin', acos: 'cos', atan: 'tan' } as const;
export const INV_NAME = { asin: 'arcsin', acos: 'arccos', atan: 'arctan' } as const;
const DEG = 180 / Math.PI;

/** The angles each inverse returns, in degrees; `open` ends are never reached. */
export const RANGE = {
  asin: { lo: -90, hi: 90, open: false },
  acos: { lo: 0, hi: 180, open: false },
  atan: { lo: -90, hi: 90, open: true },
} as const;

/** arcsin, arccos or arctan of `v`, in degrees. `v` outside the domain is clamped to it. */
export function principal(fn: InvFn, v: number): number {
  if (fn === 'atan') return Math.atan(v) * DEG;
  const c = Math.max(-1, Math.min(1, v));
  return (fn === 'asin' ? Math.asin(c) : Math.acos(c)) * DEG;
}

/** The value of the partner function at `deg`; null where it is undefined (tan at 90° and 270°). */
export function partnerAt(fn: InvFn, deg: number): number | null {
  const r = (deg * Math.PI) / 180;
  if (fn === 'asin') return Math.sin(r);
  if (fn === 'acos') return Math.cos(r);
  return Math.abs(Math.cos(r)) < 1e-9 ? null : Math.tan(r);
}

/**
 * The other angle on the circle with the same partner value: 180° − θ for sin, −θ for cos, θ + 180°
 * for tan.
 */
export const otherAngle = (fn: InvFn, deg: number) =>
  fn === 'asin' ? 180 - deg : fn === 'acos' ? -deg : deg + 180;

/**
 * arcsin(sin θ), arccos(cos θ) or arctan(tan θ): the principal angle that has the same partner
 * value as θ. null if undefined.
 */
export function compose(fn: InvFn, deg: number): number | null {
  const v = partnerAt(fn, deg);
  return v === null ? null : principal(fn, v);
}

// ---- special values ----
const R2 = Math.SQRT2,
  R3 = Math.sqrt(3);
/**
 * The exact sin / cos values on the special angles, and the tan values (slopes), each with its
 * LaTeX (left un-rationalized).
 */
const SC: [number, string][] = [
  [0, '0'],
  [1 / 2, '\\frac{1}{2}'],
  [R2 / 2, '\\frac{1}{\\sqrt{2}}'],
  [R3 / 2, '\\frac{\\sqrt{3}}{2}'],
  [1, '1'],
];
const T: [number, string][] = [
  [0, '0'],
  [R3 / 3, '\\frac{1}{\\sqrt{3}}'],
  [1, '1'],
  [R3, '\\sqrt{3}'],
];
const SIGNED = (t: [number, string][]): [number, string][] => [
  ...t
    .slice(1)
    .reverse()
    .map(([v, s]): [number, string] => [-v, `-${s}`]),
  ...t,
];
export const SPECIAL_VALUES = { asin: SIGNED(SC), acos: SIGNED(SC), atan: SIGNED(T) } as const;

/** The special value nearest `v` when it is within `range`, else `v` itself. */
export function snapValue(fn: InvFn, v: number, range: number): number {
  let best = v,
    d = range;
  for (const [s] of SPECIAL_VALUES[fn])
    if (Math.abs(s - v) <= d) {
      best = s;
      d = Math.abs(s - v);
    }
  return best;
}

/** `v` as LaTeX: exact on a special value, else a 3-place decimal. */
export function valueTex(fn: InvFn, v: number): string {
  if (!Number.isFinite(v)) return '\\text{undef.}';
  for (const [s, tex] of SPECIAL_VALUES[fn]) if (Math.abs(s - v) < 1e-6) return tex;
  return dec(v);
}
