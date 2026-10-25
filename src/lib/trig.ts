import { math } from './algebra.ts';
import { input } from './tuning.ts';

// Pure unit-circle math: special angles, exact values as LaTeX, angle parsing and snapping.
// Angles are in degrees unless a name says otherwise.

export const SPECIAL: number[] = [];
for (let q = 0; q < 360; q += 90) for (const r of [0, 30, 45, 60]) SPECIAL.push(q + r);

export const norm = (d: number) => ((d % 360) + 360) % 360;
export const rad = (d: number) => (d * Math.PI) / 180;
export const wrapPi = (v: number) => {
  v = (v + Math.PI) % (2 * Math.PI);
  if (v < 0) v += 2 * Math.PI;
  return v - Math.PI;
};

/** The special angle within 0.05° of d, if any. */
export const specialOf = (d: number) =>
  SPECIAL.find((a) => Math.abs(norm(d - a + 180) - 180) < 0.05);
/** Reference angle: distance to the nearest x-axis, 0..90. */
export const refOf = (a: number) => {
  const r = norm(a) % 180;
  return r > 90 ? 180 - r : r;
};
export const nearestSpecial = (d: number) => {
  let best = 0,
    bd = 1e9;
  for (const a of [...SPECIAL, 360])
    if (Math.abs(a - d) < bd) {
      bd = Math.abs(a - d);
      best = a;
    }
  return best % 360;
};
export const SNAP_RANGE = input.snapRange;
export function snapDeg(d: number, range = SNAP_RANGE) {
  d = norm(d);
  const s = nearestSpecial(d);
  return Math.abs(norm(d - s + 180) - 180) <= range ? s : d;
}

/**
 * Heat-map color for any angle: pure cos hue on the x-axis, pure sin hue on the y-axis, mixed
 * between.
 */
export const colorOf = (a: number) => {
  // cos² as the weight: 30° reads mostly blue, 45° half and half, 60° mostly magenta
  return `color-mix(in oklch, var(--cos) ${(Math.cos(rad(a)) ** 2 * 100).toFixed(1)}%, var(--sin))`;
};

const COS_E: Record<number, string> = {
  0: '1',
  30: '\\frac{\\sqrt{3}}{2}',
  45: '\\frac{1}{\\sqrt{2}}',
  60: '\\frac{1}{2}',
  90: '0',
};
const TAN_E: Record<number, string> = {
  0: '0',
  30: '\\frac{1}{\\sqrt{3}}',
  45: '1',
  60: '\\sqrt{3}',
};
// values stay un-rationalized (1/√2, not √2/2), so a reciprocal reads as the flip of its partner
const CSC_R: Record<string, string> = {
  '1': '1',
  '\\frac{\\sqrt{3}}{2}': '\\frac{2}{\\sqrt{3}}',
  '\\frac{1}{\\sqrt{2}}': '\\sqrt{2}',
  '\\frac{1}{2}': '2',
};
const COT_E: Record<number, string> = { 30: '\\sqrt{3}', 45: '1', 60: '\\frac{1}{\\sqrt{3}}' };
export const UNDEF = '\\text{undefined}';

export const dec = (v: number, d = 3) => {
  const r = Math.abs(v) < 5e-10 ? 0 : v;
  return (r < 0 ? '-' : '') + Math.abs(r).toFixed(d);
};

export type Fn = 'sin' | 'cos' | 'tan';

/** sin, cos or tan as LaTeX: exact at a special angle, a 3-place decimal elsewhere. */
export function trigTex(fn: Fn, deg: number): string {
  const c = Math.cos(rad(deg)),
    s = Math.sin(rad(deg)),
    hit = specialOf(deg);
  if (fn === 'tan' && Math.abs(c) < 0.02) return UNDEF;
  const v = fn === 'cos' ? c : fn === 'sin' ? s : s / c;
  if (hit === undefined) return dec(v);
  const ref = refOf(hit);
  const mag = fn === 'cos' ? COS_E[ref] : fn === 'sin' ? COS_E[90 - ref] : TAN_E[ref];
  if (mag === '0') return '0';
  return (v < -1e-9 ? '-' : '') + mag;
}

export type Recip = 'csc' | 'sec' | 'cot';
/** csc, sec or cot at deg: the substituted fraction and the result, both LaTeX. */
export function recipTex(kind: Recip, deg: number): { sub: string; r: string } {
  const c = Math.cos(rad(deg)),
    s = Math.sin(rad(deg)),
    hit = specialOf(deg);
  const cT = trigTex('cos', deg),
    sT = trigTex('sin', deg);
  if (kind === 'cot') {
    let r: string;
    if (hit !== undefined) {
      const ref = refOf(hit);
      r = ref === 0 ? UNDEF : ref === 90 ? '0' : (c * s < 0 ? '-' : '') + COT_E[ref];
    } else r = Math.abs(s) < 0.02 ? UNDEF : dec(c / s);
    return { sub: `\\frac{${cT}}{${sT}}`, r };
  }
  const base = kind === 'csc' ? s : c;
  let r: string;
  if (hit !== undefined) {
    const ref = refOf(hit),
      mag = kind === 'csc' ? COS_E[90 - ref] : COS_E[ref];
    r = mag === '0' ? UNDEF : (base < -1e-9 ? '-' : '') + CSC_R[mag];
  } else r = Math.abs(base) < 0.02 ? UNDEF : dec(1 / base);
  return { sub: `\\frac{1}{${kind === 'csc' ? sT : cT}}`, r };
}

/**
 * "135", "135°", "pi/6", "2π/3", "0.5 rad" → degrees, or null. Anything with π is radians; a bare
 * number is degrees, or radians when `plain` says so.
 */
export function parseAngle(t: string, plain: 'deg' | 'rad' = 'deg'): number | null {
  t = t.trim().replace(/°/g, ' deg').replace(/π/g, 'pi');
  if (!t) return null;
  try {
    const v = math.evaluate(/pi/i.test(t) ? t.replace(/rad/gi, '') : t);
    const bare = !/pi|deg|rad/i.test(t);
    const d =
      typeof v === 'number'
        ? /pi/i.test(t) || (bare && plain === 'rad')
          ? (v * 180) / Math.PI
          : v
        : v?.toNumber?.('deg');
    return Number.isFinite(d) ? d : null;
  } catch {
    return null;
  }
}
