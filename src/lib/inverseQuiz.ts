// Pure quiz content for the Inverse trig topic: question generation, answer choices and explanations.
import { INV_NAME, PARTNER, RANGE, SPECIAL_VALUES, compose, otherAngle, partnerAt, principal, valueTex, type InvFn } from './inverse.ts';
import { SPECIAL } from './trig.ts';
import type { Rich } from './quiz.ts';

/** The stretch of angles θ may come from, in degrees (closed at both ends; the text says which ends are open). */
export type Domain = { lo: number; hi: number; tex: string };
/** t1: arcsin(−1/2) = ?   t2: arcsin(sin θ) = ? for a given θ in a stated domain   t3: drag the control so that arccos(x) = 60° */
export type IQ =
  | { t: 1; fn: InvFn; v: number }
  | { t: 2; fn: InvFn; theta: number; dom: Domain }
  | { t: 3; fn: InvFn; ang: number };

const rnd = (n: number) => Math.floor(Math.random() * n);
const pick = <T>(a: readonly T[]) => a[rnd(a.length)];
const shuffle = <T>(arr: T[]) => { for (let i = arr.length - 1; i > 0; i--) { const j = rnd(i + 1); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
const r = (x: number) => Math.round(x * 1e6) / 1e6;
const deg = (a: number) => `${r(a)}^\\circ`;
const m = (t: string) => ({ m: t });

export const DOMAINS: Domain[] = [
  { lo: 0, hi: 360, tex: '0^\\circ\\le\\theta<360^\\circ' },
  { lo: -180, hi: 180, tex: '-180^\\circ\\le\\theta<180^\\circ' },
  { lo: 90, hi: 270, tex: '90^\\circ\\le\\theta\\le270^\\circ' },
];
const inDomain = (d: Domain, a: number) => a >= d.lo - 1e-9 && (d.hi === 360 || d.hi === 180 ? a < d.hi - 1e-9 : a <= d.hi + 1e-9);
/** The special angles that sit in `d` (an angle and the same angle ± 360° count once, as whichever lands inside). */
const anglesIn = (d: Domain) => SPECIAL.flatMap((a) => [a - 360, a, a + 360]).filter((a) => inDomain(d, a));

export const FNS: InvFn[] = ['asin', 'acos', 'atan'];
const valuesOf = (fn: InvFn) => SPECIAL_VALUES[fn].map(([v]) => v);

export function makeQ(): IQ {
  const fn = pick(FNS), x = Math.random();
  if (x < 0.45) return { t: 1, fn, v: pick(valuesOf(fn)) };
  if (x < 0.8) {
    const dom = pick(DOMAINS);
    const ok = anglesIn(dom).filter((a) => partnerAt(fn, a) !== null);
    return { t: 2, fn, theta: pick(ok), dom };
  }
  const { lo, hi, open } = RANGE[fn];
  const angs = SPECIAL.map((a) => (a > 180 ? a - 360 : a)).filter((a) => (open ? a > lo && a < hi : a >= lo && a <= hi));
  return { t: 3, fn, ang: pick(angs) };
}

export const iqKey = (q: IQ) => (q.t === 1 ? `1|${q.fn}|${r(q.v)}` : q.t === 2 ? `2|${q.fn}|${q.theta}|${q.dom.lo}` : `3|${q.fn}|${q.ang}`);
export function pickQ(missed: IQ[], prev: IQ | null): IQ {
  if (missed.length && Math.random() < 0.4) return pick(missed);
  let q: IQ, n = 0;
  do q = makeQ(); while (prev && iqKey(q) === iqKey(prev) && n++ < 8);
  return q;
}

/** The answer a t1 / t2 question wants, in degrees. */
export const answerOf = (q: Extract<IQ, { t: 1 | 2 }>) => r(q.t === 1 ? principal(q.fn, q.v) : compose(q.fn, q.theta)!);

/** The right angle plus three tempting wrong ones: the other solution, the sign flip, the angle itself. */
export function makeChoices(q: Extract<IQ, { t: 1 | 2 }>): string[] {
  const right = answerOf(q), seen = new Set([right]);
  const cands = q.t === 1
    ? [r(otherAngle(q.fn, right)), -right, r(90 - right), r(right + 180), r(-otherAngle(q.fn, right))]
    : [q.theta, r(otherAngle(q.fn, right)), -right, r(-q.theta), r(q.theta - 180), r(q.theta + 180)];
  const wrong: number[] = [];
  const norm180 = (a: number) => (a > 180 ? a - 360 : a <= -180 ? a + 360 : a);
  for (const c of [...cands.map(norm180), ...shuffle(SPECIAL.map(norm180))]) if (!seen.has(c)) { seen.add(c); wrong.push(c); if (wrong.length === 3) break; }
  return shuffle([right, ...wrong]).map(deg);
}
export const answerTex = (q: Extract<IQ, { t: 1 | 2 }>) => deg(answerOf(q));

/** The question's expression as LaTeX. */
export function qTex(q: IQ): string {
  const n = `\\${INV_NAME[q.fn]}`;
  if (q.t === 1) return `${n}\\left(${valueTex(q.fn, q.v)}\\right)`;
  if (q.t === 2) return `${n}\\left(\\${PARTNER[q.fn]}\\ ${deg(q.theta)}\\right)`;
  return `${n}(x)=${deg(q.ang)}`;
}

/** What the learner is asked to do, as running text. */
export function task(q: IQ): Rich {
  const N = m(`\\${INV_NAME[q.fn]}()`);
  if (q.t === 1) return ['Which angle does ', N, ' give for this value? Try angles on the circle to see each one\'s value. Remember, ', N, ' only gives angles in its range.'];
  if (q.t === 2) return ['Here θ can be any angle with ', m(q.dom.tex), '. What angle does ', N, ' give back?'];
  return ['Drag ', q.fn === 'atan' ? 'the ray' : 'the handle', ' to the value ', m('x'), ' that makes the answer ', m(deg(q.ang)), ', then press Check.'];
}

export function hintMsg(q: IQ): Rich {
  const { lo, hi, open } = RANGE[q.fn];
  return [m(`\\${INV_NAME[q.fn]}()`), ` only gives angles from ${lo}° to ${hi}°${open ? ' (not the ends)' : ''}. The shaded half of the circle is that range.`];
}
export const hintTip = (q: IQ) => `Shades the half of the circle that ${INV_NAME[q.fn]}() can answer from (its range).`;

/** Why the answer is right, as lines of running text. */
export function explain(q: IQ): Rich[] {
  const N = `\\${INV_NAME[q.fn]}`, P = `\\${PARTNER[q.fn]}`;
  const { lo, hi } = RANGE[q.fn];
  const range = [m(`${N}()`), ` only gives angles from ${lo}° to ${hi}°.`] as Rich;
  if (q.t === 3) {
    const v = valueTex(q.fn, partnerAt(q.fn, q.ang)!);
    return [[m(`${P}\\ ${deg(q.ang)}=${v}`), ', so the value is ', m(v), '.'], range];
  }
  const right = answerOf(q), other = r(otherAngle(q.fn, right));
  if (q.t === 1) {
    return [
      range,
      [m(`${P}\\ ${deg(right)}=${valueTex(q.fn, q.v)}`), ', and ', m(deg(right)), ' is in that range, so it is the answer.'],
      [m(`${P}\\ ${deg(other)}`), ' has the same value, but ', m(deg(other)), ' is outside the range, so ', m(`${N}()`), ' never gives it.'],
    ];
  }
  const v = valueTex(q.fn, partnerAt(q.fn, q.theta)!);
  const lines: Rich[] = [[m(`${P}\\ ${deg(q.theta)}=${v}`), '.'], range];
  lines.push(right === r(q.theta)
    ? [m(deg(q.theta)), ' is already in that range, so ', m(`${N}\\left(${P}\\ ${deg(q.theta)}\\right)=${deg(right)}`), '.']
    : [m(deg(q.theta)), ' is outside the range. The angle in the range with the same value is ', m(deg(right)), ', so the answer is ', m(deg(right)), ', not ', m(deg(q.theta)), '.']);
  return lines;
}
