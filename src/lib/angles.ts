// How an angle is written, in degrees or radians. Pure: the unit comes in as an argument, so the same code serves the plane's labels,
// the quizzes and the panels, and each caller passes the learner's current unit.
//
// Radians read as exact multiples of π (π/6, 5π/3) at the angles that have one, written on one line so they take little room;
// between those they are decimals. Degrees keep the app's zoom-based precision, and radian decimals carry two more places, since a
// radian is a much bigger step than a degree.

export type Unit = 'deg' | 'rad';

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const round = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;
const clean = (v: number) => (Object.is(v, -0) || v === 0 ? 0 : v);

/** `deg` as a multiple of π in lowest terms ([2, 3] is 2π/3), when it is a multiple of 30° or 45°; otherwise null. */
export function piFraction(deg: number): [number, number] | null {
  for (const q of [1, 2, 3, 4, 6]) {
    const p = Math.round((deg * q) / 180);
    if (Math.abs(deg - (p * 180) / q) < 1e-6) { const g = gcd(p, q) || 1; return [p / g, q / g]; }
  }
  return null;
}

/** p/q of π as LaTeX on one line, however p and q came about (they need not be in lowest terms; 6π/5 and 5π/12 are fine). */
export function piTex(p: number, q: number): string {
  if (p === 0) return '0';
  const g = gcd(p, q) || 1, n = Math.abs(p / g), d = q / g;
  return `${p < 0 ? '-' : ''}${n === 1 ? '' : n}\\pi${d === 1 ? '' : `/${d}`}`;
}

/** An angle as LaTeX. `decimals` is the degree precision (0 to 3), which also sets how many places a decimal radian gets. */
export function angleTex(deg: number, u: Unit, decimals = 0): string {
  if (u === 'deg') return `${clean(round(deg, decimals))}^\\circ`;
  const f = piFraction(deg);
  if (f) return piTex(f[0], f[1]);
  return `${clean(round((deg * Math.PI) / 180, decimals + 2))}\\text{ rad}`;
}

/** The same as plain text, for tooltips and sentences ("5π/6", "30°", "1.05 rad"). */
export function angleText(deg: number, u: Unit, decimals = 0): string {
  if (u === 'deg') return `${clean(round(deg, decimals))}°`;
  const f = piFraction(deg);
  if (f) {
    const [p, q] = f, n = Math.abs(p);
    if (p === 0) return '0';
    return `${p < 0 ? '−' : ''}${n === 1 ? '' : n}π${q === 1 ? '' : `/${q}`}`;
  }
  return `${clean(round((deg * Math.PI) / 180, decimals + 2))} rad`;
}

/** A trig function of an angle as LaTeX: `\sin 210^\circ` in degrees, `\sin\left(7\pi/6\right)` in radians, where the brackets keep the slash readable. */
export const trigOf = (name: string, deg: number, u: Unit, decimals = 0) =>
  u === 'deg' ? `${name}\\ ${angleTex(deg, u, decimals)}` : `${name}\\left(${angleTex(deg, u, decimals)}\\right)`;

/** The text an angle box starts from when it is edited: no unit mark, since the box shows it beside the text. */
export function angleField(deg: number, u: Unit, decimals = 0): string {
  if (u === 'deg') return String(clean(round(deg, decimals)));
  const t = angleText(deg, u, decimals);
  return t.replace(' rad', '').replace('−', '-');
}
