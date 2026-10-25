// Pure quiz content: question generation, answer choices, explanations and hint text.
import { angleText, angleTex, trigOf, type Unit } from './angles.ts';
import { SPECIAL, refOf, trigTex, UNDEF, type Fn } from './trig.ts';

/**
 * The question types:
 * - t1: "sin 210° = ?" with four exact values
 * - t2: "cos θ = −√3/2", find both angles by moving the point
 */
export type Question = { t: 1; fn: Fn; a: number } | { t: 2; fn: Fn; val: string; sols: number[] };

/** Running text with inline math: plain strings, and { m } parts that are typeset. */
export type Rich = (string | { m: string })[];
const m = (t: string) => ({ m: t });

export const FN_TEX: Record<Fn, string> = { sin: '\\sin', cos: '\\cos', tan: '\\tan' };
const QN = ['I', 'II', 'III', 'IV'];
const rnd = (n: number) => Math.floor(Math.random() * n);
const shuffle = <T>(arr: T[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
const flipSign = (t: string) =>
  t === '0' || t.startsWith('\\text') ? t : t[0] === '-' ? t.slice(1) : '-' + t;

/** The exact value a type-1 question asks for. */
export const trigTexAnswer = (q: Extract<Question, { t: 1 }>) => trigTex(q.fn, q.a);

export const qKey = (q: Question) => (q.t === 1 ? `1|${q.fn}|${q.a}` : `2|${q.fn}|${q.val}`);
export const qTex = (q: Question, u: Unit) =>
  q.t === 1 ? trigOf(FN_TEX[q.fn], q.a, u) : `${FN_TEX[q.fn]}\\theta=${q.val}`;

export function makeQ(): Question {
  const fn = (['sin', 'cos', 'tan'] as const)[rnd(3)];
  if (Math.random() < 0.6) return { t: 1, fn, a: SPECIAL[rnd(SPECIAL.length)] };
  for (let i = 0; i < 60; i++) {
    const val = trigTex(fn, SPECIAL[rnd(SPECIAL.length)]);
    if (val === UNDEF) continue;
    const sols = SPECIAL.filter((b) => trigTex(fn, b) === val);
    if (sols.length === 2) return { t: 2, fn, val, sols };
  }
  return { t: 1, fn, a: SPECIAL[rnd(SPECIAL.length)] };
}

/** A new question, sometimes one from the missed list, never the same as `prev`. */
export function pickQ(missed: Question[], prev: Question | null): Question {
  if (missed.length && Math.random() < 0.4) return missed[rnd(missed.length)];
  let q: Question,
    n = 0;
  do q = makeQ();
  while (prev && qKey(q) === qKey(prev) && n++ < 8);
  return q;
}

const MAGS_SC = ['\\frac{1}{2}', '\\frac{1}{\\sqrt{2}}', '\\frac{\\sqrt{3}}{2}', '1', '0'];
const MAGS_T = ['\\frac{1}{\\sqrt{3}}', '1', '\\sqrt{3}', '0', UNDEF];
/**
 * The right value plus three plausible wrong ones (sign flip, the other function, random
 * magnitudes).
 */
export function makeChoices(q: Extract<Question, { t: 1 }>): string[] {
  const right = trigTex(q.fn, q.a),
    seen = new Set([right]);
  const cands = [flipSign(right), trigTex(q.fn === 'sin' ? 'cos' : 'sin', q.a)];
  const pool = q.fn === 'tan' ? MAGS_T : MAGS_SC;
  for (let i = 0; i < 30; i++) {
    const v = pool[rnd(pool.length)];
    cands.push(v === '0' || v.startsWith('\\text') || Math.random() < 0.5 ? v : '-' + v);
  }
  const wrong: string[] = [];
  for (const c of cands)
    if (!seen.has(c)) {
      seen.add(c);
      wrong.push(c);
      if (wrong.length === 3) break;
    }
  return shuffle([right, ...wrong]);
}

/** Why the answer is right, as lines of running text. */
export function explain(q: Question, u: Unit): Rich[] {
  const FN = FN_TEX[q.fn],
    POS = { sin: [1, 2], cos: [1, 4], tan: [1, 3] }[q.fn];
  if (q.t === 1) {
    const a = q.a,
      v = trigTex(q.fn, a);
    if (a % 90 === 0) {
      const cx = trigTex('cos', a),
        sx = trigTex('sin', a);
      return [
        [
          'On the axis, the point at ',
          m(angleTex(a, u)),
          ' is ',
          m(`\\left(${cx},\\ ${sx}\\right)`),
          '.',
        ],
        [
          m(
            q.fn === 'tan'
              ? `${trigOf('\\tan', a, u)}=\\frac{y}{x}=\\frac{${sx}}{${cx}}=${v}`
              : `${trigOf(FN, a, u)}=${q.fn === 'sin' ? 'y' : 'x'}=${v}`,
          ),
        ],
      ];
    }
    const quad = Math.floor(a / 90),
      ref = refOf(a),
      neg = v[0] === '-';
    return [
      [
        `Quadrant ${QN[quad]}, reference angle `,
        m(angleTex(ref, u)),
        `. ${q.fn} is ${neg ? 'negative' : 'positive'} here.`,
      ],
      [m(`${trigOf(FN, a, u)}=${neg ? '-' : ''}${trigOf(FN, ref, u)}=${v}`)],
    ];
  }
  const angles: Rich = q.sols.flatMap((x, i) =>
    i ? [' and ', m(angleTex(x, u))] : [m(`\\theta=${angleTex(x, u)}`)],
  );
  if (q.val === '0') return [[`${q.fn} is zero where the point sits on an axis.`], angles];
  const ref = refOf(q.sols[0]),
    neg = q.val[0] === '-';
  const qs = [0, 1, 2, 3]
    .filter((i) => POS.includes(i + 1) === !neg)
    .map((i) => QN[i])
    .join(' and ');
  return [
    [
      'Reference angle ',
      m(angleTex(ref, u)),
      `. ${q.fn} is ${neg ? 'negative' : 'positive'} in quadrants ${qs}.`,
    ],
    angles,
  ];
}

export function task(q: Question, u: Unit): Rich {
  return q.t === 1
    ? [
        'What is ',
        m(trigOf(FN_TEX[q.fn], q.a, u)),
        '? Choose the exact value below. You can drag the point to ',
        m(angleTex(q.a, u)),
        ' to picture it.',
      ]
    : [
        'Move the point to an angle where ',
        m(`${FN_TEX[q.fn]}\\theta`),
        ' equals the value above, then press Check. Two angles between ',
        m(angleTex(0, u)),
        ' and ',
        m(angleTex(360, u)),
        ' work, so find both, one at a time.',
      ];
}

// A hint shows the (cos θ, sin θ) label next to the point; it never moves the point.
// A hinted answer doesn't add to the streak, though a wrong answer still resets it.
const HINT_TAIL = " A hint means this question won't add to your streak.";
export function hintTip(q: Question, u: Unit): string {
  const sin = q.fn === 'sin';
  if (q.fn === 'tan')
    return (
      (q.t === 1
        ? "Shows the point's coordinates (cos θ, sin θ). It won't move the point, so drag it to the angle and work out tan θ (sin θ ÷ cos θ) yourself."
        : 'Shows the coordinates (cos θ, sin θ) next to the point as you move it, so you can work out tan θ (sin θ ÷ cos θ) and match the value.') +
      HINT_TAIL
    );
  return (
    (q.t === 1
      ? `Shows the point's coordinates (cos θ, sin θ). It won't move the point, so drag it to ${angleText(q.a, u)} yourself. ${sin ? 'sin θ is the y-coordinate.' : 'cos θ is the x-coordinate.'}`
      : `Shows the coordinates (cos θ, sin θ) next to the point, so you can watch the ${sin ? 'y' : 'x'}-coordinate as you move it.`) +
    HINT_TAIL
  );
}
export function hintMsg(q: Question, u: Unit): Rich {
  const sin = q.fn === 'sin',
    xy = m('(\\cos\\theta,\\ \\sin\\theta)');
  if (q.fn === 'tan')
    return q.t === 1
      ? [
          'Hint: the label shows the coordinates ',
          xy,
          ' of the point. Move it to ',
          m(angleTex(q.a, u)),
          ' and use them to work out ',
          m('\\tan\\theta'),
          '.',
        ]
      : [
          'Hint: the label shows the coordinates ',
          xy,
          ' of the point. Move the point and use them to work out ',
          m('\\tan\\theta'),
          ' until it matches the value.',
        ];
  return q.t === 1
    ? [
        'Hint: the label shows the coordinates ',
        xy,
        ' of the point. Move it to ',
        m(angleTex(q.a, u)),
        ', then read ',
        m(sin ? '\\sin\\theta' : '\\cos\\theta'),
        ` as the ${sin ? 'y' : 'x'}-coordinate.`,
      ]
    : [
        'Hint: the coordinates ',
        xy,
        ` follow the point. Move it until the ${sin ? 'y' : 'x'}-coordinate matches the value in the question.`,
      ];
}
