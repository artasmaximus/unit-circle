// Pure quiz content for the Inverse trig topic: question generation, answer choices and
// explanations.
import {
  INV_NAME,
  PARTNER,
  RANGE,
  SPECIAL_VALUES,
  compose,
  otherAngle,
  partnerAt,
  principal,
  valueTex,
  type InvFn,
} from './math.ts';
import { angleTex, angleText, trigOf, type Unit } from '../../core/angles.ts';
import { SPECIAL } from '../../core/trig.ts';
import type { Rich } from '../../core/rich.ts';
import { pick, rnd, shuffle } from '../../core/random.ts';
import { m } from '../../core/rich.ts';

/**
 * The stretch of angles θ may come from, in degrees. `closed` says whether the top end is included
 * (an older saved question has no flag, so 180° and 360° count as open).
 */
export type Domain = { lo: number; hi: number; closed?: boolean };
/**
 * The question types:
 * - t1: arcsin(−1/2) = ?
 * - t2: arcsin(sin θ) = ? for a given θ in a stated domain
 * - t3: drag the control so that arccos(x) = 60°
 */
export type IQ =
  | { t: 1; fn: InvFn; v: number }
  | { t: 2; fn: InvFn; theta: number; dom: Domain }
  | { t: 3; fn: InvFn; ang: number };

const r = (x: number) => Math.round(x * 1e6) / 1e6;

export const DOMAINS: Domain[] = [
  { lo: 0, hi: 360, closed: false },
  { lo: -180, hi: 180, closed: false },
  { lo: 90, hi: 270, closed: true },
];
const isClosed = (d: Domain) => d.closed ?? !(d.hi === 360 || d.hi === 180);
/** The domain as a statement about θ, in the learner's unit: 0° ≤ θ < 360°, or 0 ≤ θ < 2π. */
export const domainTex = (d: Domain, u: Unit) =>
  `${angleTex(d.lo, u)}\\le\\theta${isClosed(d) ? '\\le' : '<'}${angleTex(d.hi, u)}`;
const inDomain = (d: Domain, a: number) =>
  a >= d.lo - 1e-9 && (isClosed(d) ? a <= d.hi + 1e-9 : a < d.hi - 1e-9);
/**
 * The special angles that sit in `d` (an angle and the same angle ± 360° count once, as whichever
 * lands inside).
 */
const anglesIn = (d: Domain) =>
  SPECIAL.flatMap((a) => [a - 360, a, a + 360]).filter((a) => inDomain(d, a));

export const FNS: InvFn[] = ['asin', 'acos', 'atan'];
/**
 * What each inverse's input is called, so the wording matches what the picture shows: sin is a
 * height (y), cos a distance across (x), tan a slope (m).
 */
export const VAR = { asin: 'y', acos: 'x', atan: 'm' } as const;
export const NOUN = { asin: 'y-value', acos: 'x-value', atan: 'slope m' } as const;
const AXIS = { asin: 'along the y-axis', acos: 'along the x-axis', atan: '' } as const;
const valuesOf = (fn: InvFn) => SPECIAL_VALUES[fn].map(([v]) => v);

/** A random question; `want` pins its function or its type (the Guide's exam steers with it). */
export function makeQ(want: { fn?: InvFn; t?: 1 | 2 | 3 } = {}): IQ {
  const fn = want.fn ?? pick(FNS),
    x = want.t === 1 ? 0 : want.t === 2 ? 0.5 : want.t === 3 ? 0.9 : Math.random();
  if (x < 0.45) return { t: 1, fn, v: pick(valuesOf(fn)) };
  if (x < 0.8) {
    const dom = pick(DOMAINS);
    const ok = anglesIn(dom).filter((a) => partnerAt(fn, a) !== null);
    return { t: 2, fn, theta: pick(ok), dom };
  }
  const { lo, hi, open } = RANGE[fn];
  const angs = SPECIAL.map((a) => (a > 180 ? a - 360 : a)).filter((a) =>
    open ? a > lo && a < hi : a >= lo && a <= hi,
  );
  return { t: 3, fn, ang: pick(angs) };
}

export const iqKey = (q: IQ) =>
  q.t === 1
    ? `1|${q.fn}|${r(q.v)}`
    : q.t === 2
      ? `2|${q.fn}|${q.theta}|${q.dom.lo}`
      : `3|${q.fn}|${q.ang}`;
/** The skill a question practises, for Practice's tally. */
export const skillOf = (q: IQ) =>
  q.t === 1
    ? 'evaluating an inverse'
    : q.t === 2
      ? 'compositions and domains'
      : 'placing the inverse';
export function pickQ(prev: IQ | null): IQ {
  let q: IQ,
    n = 0;
  do q = makeQ();
  while (prev && iqKey(q) === iqKey(prev) && n++ < 8);
  return q;
}

/** The answer a t1 / t2 question wants, in degrees. */
export const answerOf = (q: Extract<IQ, { t: 1 | 2 }>) =>
  r(q.t === 1 ? principal(q.fn, q.v) : compose(q.fn, q.theta)!);

/**
 * The right angle plus three tempting wrong ones: the other solution, the sign flip, the angle
 * itself.
 */
export function makeChoices(q: Extract<IQ, { t: 1 | 2 }>): number[] {
  const right = answerOf(q),
    seen = new Set([right]);
  const cands =
    q.t === 1
      ? [
          r(otherAngle(q.fn, right)),
          -right,
          r(90 - right),
          r(right + 180),
          r(-otherAngle(q.fn, right)),
        ]
      : [
          q.theta,
          r(otherAngle(q.fn, right)),
          -right,
          r(-q.theta),
          r(q.theta - 180),
          r(q.theta + 180),
        ];
  const wrong: number[] = [];
  const norm180 = (a: number) => (a > 180 ? a - 360 : a <= -180 ? a + 360 : a);
  for (const c of [...cands.map(norm180), ...shuffle(SPECIAL.map(norm180))])
    if (!seen.has(c)) {
      seen.add(c);
      wrong.push(c);
      if (wrong.length === 3) break;
    }
  return shuffle([right, ...wrong]);
}

/** The question's expression as LaTeX. */
export function qTex(q: IQ, u: Unit): string {
  const n = `\\${INV_NAME[q.fn]}`;
  if (q.t === 1) return `${n}\\left(${valueTex(q.fn, q.v)}\\right)`;
  if (q.t === 2) return `${n}\\left(${trigOf(`\\${PARTNER[q.fn]}`, q.theta, u)}\\right)`;
  return `${n}(${VAR[q.fn]})=${angleTex(q.ang, u)}`;
}

/** What the learner is asked to do, as running text. */
export function task(q: IQ, u: Unit): Rich {
  const N = m(`\\${INV_NAME[q.fn]}()`);
  if (q.t === 1)
    return [
      'Which angle does ',
      N,
      ` give for this ${NOUN[q.fn]}? Try angles on the circle to see each one's ${q.fn === 'atan' ? 'slope' : NOUN[q.fn]}. Remember, `,
      N,
      ' only gives angles in its range.',
    ];
  if (q.t === 2)
    return [
      'Here θ can be any angle with ',
      m(domainTex(q.dom, u)),
      '. What angle does ',
      N,
      ' give back? Move the point around the circle, or along either axis, to see its y-value and x-value.',
    ];
  return q.fn === 'atan'
    ? [
        'Drag the ray to the slope ',
        m('m'),
        ' that makes the answer ',
        m(angleTex(q.ang, u)),
        ', then press Check.',
      ]
    : [
        `Drag the handle ${AXIS[q.fn]} to the ${NOUN[q.fn]} `,
        m(VAR[q.fn]),
        ' that makes the answer ',
        m(angleTex(q.ang, u)),
        ', then press Check.',
      ];
}

export function hintMsg(q: IQ, u: Unit): Rich {
  const { lo, hi, open } = RANGE[q.fn];
  return [
    m(`\\${INV_NAME[q.fn]}()`),
    ` only gives angles from ${angleText(lo, u)} to ${angleText(hi, u)}${open ? ' (not the ends)' : ''}. The shaded half of the circle is that range.`,
  ];
}
export const hintTip = (q: IQ) =>
  `Shades the half of the circle that ${INV_NAME[q.fn]}() can answer from (its range).`;

/** Why the answer is right, as lines of running text. */
export function explain(q: IQ, u: Unit): Rich[] {
  const deg = (a: number) => angleTex(a, u);
  const trig = (a: number) => trigOf(P, a, u);
  const N = `\\${INV_NAME[q.fn]}`,
    P = `\\${PARTNER[q.fn]}`;
  const { lo, hi } = RANGE[q.fn];
  const range = [
    m(`${N}()`),
    ` only gives angles from ${angleText(lo, u)} to ${angleText(hi, u)}.`,
  ] as Rich;
  if (q.t === 3) {
    const v = valueTex(q.fn, partnerAt(q.fn, q.ang)!);
    return [
      [m(`${trig(q.ang)}=${v}`), `, so the ${NOUN[q.fn]} is `, m(`${VAR[q.fn]}=${v}`), '.'],
      range,
    ];
  }
  const right = answerOf(q),
    other = r(otherAngle(q.fn, right));
  if (q.t === 1) {
    return [
      range,
      [
        m(`${trig(right)}=${valueTex(q.fn, q.v)}`),
        ', and ',
        m(deg(right)),
        ' is in that range, so it is the answer.',
      ],
      [
        m(trig(other)),
        ' has the same value, but ',
        m(deg(other)),
        ' is outside the range, so ',
        m(`${N}()`),
        ' never gives it.',
      ],
    ];
  }
  const v = valueTex(q.fn, partnerAt(q.fn, q.theta)!);
  const lines: Rich[] = [[m(`${trig(q.theta)}=${v}`), '.'], range];
  lines.push(
    right === r(q.theta)
      ? [
          m(deg(q.theta)),
          ' is already in that range, so ',
          m(`${N}\\left(${trig(q.theta)}\\right)=${deg(right)}`),
          '.',
        ]
      : [
          m(deg(q.theta)),
          ' is outside the range. The angle in the range with the same value is ',
          m(deg(right)),
          ', so the answer is ',
          m(deg(right)),
          ', not ',
          m(deg(q.theta)),
          '.',
        ],
  );
  return lines;
}
