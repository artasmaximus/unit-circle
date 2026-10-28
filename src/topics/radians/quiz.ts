// Pure question content for the Radians topic: converting between degrees and radians, and placing
// the point at an angle given in radians. These questions name their own unit, so they ignore the
// learner's unit setting: the unit is the thing being learned.
import { angleTex, piFraction, piTex } from '../../core/angles.ts';
import type { Rich } from '../../core/rich.ts';
import { SPECIAL } from '../../core/trig.ts';
import { pick, rnd, shuffle } from '../../core/random.ts';
import { m } from '../../core/rich.ts';

/**
 * The question types:
 * - t1: 150° → choose the radians
 * - t2: 5π/6 → choose the degrees
 * - t3: put the point at an angle given in radians
 */
export type RQ = { t: 1 | 2 | 3; deg: number };
export const R_TYPES = [1, 2, 3] as const;

/** The angles asked about: the special angles, past zero. */
export const R_ANGLES = SPECIAL.filter((a) => a > 0);

export const makeRQ = (): RQ => ({ t: pick(R_TYPES), deg: pick(R_ANGLES) });
export const rqKey = (q: RQ) => `${q.t}|${q.deg}`;
export const rSkillOf = (q: RQ) =>
  q.t === 1
    ? 'degrees to radians'
    : q.t === 2
      ? 'radians to degrees'
      : 'placing an angle in radians';
export function pickRQ(prev: RQ | null): RQ {
  let q: RQ,
    n = 0;
  do q = makeRQ();
  while (prev && rqKey(q) === rqKey(prev) && n++ < 8);
  return q;
}

/**
 * The right answer plus three that come from real slips: flipping the ratio, halving, doubling, and
 * a neighbouring special angle.
 */
export function rChoices(q: RQ & { t: 1 | 2 }): number[] {
  const right = q.deg,
    seen = new Set([right]),
    wrong: number[] = [];
  // the answer as a fraction of π: 150° is 5/6, so flipping it gives 6/5 of π (216°), and so on
  const flip = 32400 / right,
    cands = [
      flip,
      right / 2,
      right * 2,
      right + 30,
      right - 30,
      right + 45,
      right - 45,
      ...shuffle([...R_ANGLES]),
    ];
  for (const c of cands) {
    const v = Math.round(c * 1000) / 1000;
    if (Number.isInteger(v) && v > 0 && v <= 720 && !seen.has(v)) {
      seen.add(v);
      wrong.push(v);
      if (wrong.length === 3) break;
    }
  }
  return shuffle([right, ...wrong]);
}

/** A choice as LaTeX: radians for a conversion to radians, degrees for a conversion to degrees. */
export const rChoiceTex = (q: RQ, deg: number) => (q.t === 1 ? piTex(deg, 180) : `${deg}^\\circ`);
export const rPromptTex = (q: RQ) =>
  q.t === 1
    ? `${q.deg}^\\circ=\\ ?\\text{ rad}`
    : q.t === 2
      ? `${angleTex(q.deg, 'rad')}\\text{ rad}=\\ ?^\\circ`
      : `\\theta=${angleTex(q.deg, 'rad')}`;
export const rLabel = (q: RQ) =>
  q.t === 3 ? 'Place the point' : q.t === 1 ? 'Convert to radians' : 'Convert to degrees';

export function rTask(q: RQ): Rich {
  if (q.t === 1)
    return [
      'Convert ',
      m(`${q.deg}^\\circ`),
      ' to radians. Remember: a half turn is ',
      m('180^\\circ=\\pi'),
      ' radians.',
    ];
  if (q.t === 2)
    return [
      'Convert ',
      m(angleTex(q.deg, 'rad')),
      ' radians to degrees. Remember: ',
      m('\\pi'),
      ' radians is a half turn, ',
      m('180^\\circ'),
      '.',
    ];
  return [
    'Move the point to the angle ',
    m(angleTex(q.deg, 'rad')),
    ' radians, measured from the right-hand side, then press Check.',
  ];
}
export const rHintTip = () =>
  'A half turn is 180°, which is π radians. To go from degrees to radians multiply by π/180. To go back, multiply by 180/π.';
export function rHintMsg(): Rich {
  return [
    'Hint: a half turn is ',
    m('180^\\circ=\\pi'),
    ' radians. Degrees to radians: multiply by ',
    m('\\pi/180'),
    '. Radians to degrees: multiply by ',
    m('180/\\pi'),
    '.',
  ];
}

/** Why the answer is right, as lines of running text. */
export function rExplain(q: RQ): Rich[] {
  const f = piFraction(q.deg),
    rad = angleTex(q.deg, 'rad');
  const part = f ? `${f[0] === 1 ? '' : f[0]}/${f[1]}` : '';
  if (q.t === 1)
    return [
      [m(`${q.deg}\\times\\pi/180=${rad}`), '.'],
      [`${q.deg}° is ${q.deg}/180 of a half turn, so it is that fraction of `, m('\\pi'), '.'],
    ];
  if (q.t === 2)
    return [
      [m(`${rad}\\times180/\\pi=${q.deg}^\\circ`), '.'],
      [
        'Replace ',
        m('\\pi'),
        ' with a half turn, ',
        m('180^\\circ'),
        `, and take ${f && f[1] > 1 ? `${part} of it` : 'it as it is'}.`,
      ],
    ];
  return [
    [m(rad), ` radians is ${q.deg}° around from the right-hand side.`],
    ['A full turn is ', m('2\\pi'), ' radians, so ', m(rad), ' is that fraction of the way round.'],
  ];
}
