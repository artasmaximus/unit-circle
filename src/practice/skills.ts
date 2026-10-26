// The pure part of Practice's teaching: how many right and wrong answers each named skill has, which
// of several candidate questions to ask next, and which skills are weakest. Kept apart from the
// session so it can be tested without a browser.

/** Right and wrong answers recorded for one skill. */
export type Tally = { right: number; wrong: number };
export type Skills = Record<string, Tally>;

/** Questions in a Practice set. */
export const SET_SIZE = 10;
/** Once a skill has this many answers its tally is halved, so old mistakes fade. */
const FADE_AT = 30;

/** Saved skills read back safely: anything that is not a pair of counts is dropped. */
export function parseSkills(raw: unknown): Skills {
  const out: Skills = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [k, v] of Object.entries(raw)) {
    const t = v as Partial<Tally> | null;
    if (t && Number.isFinite(t.right) && Number.isFinite(t.wrong))
      out[k] = { right: Math.max(0, t.right! | 0), wrong: Math.max(0, t.wrong! | 0) };
  }
  return out;
}

/** Add one answer to a skill's tally. */
export function record(skills: Skills, name: string, ok: boolean) {
  const t = (skills[name] ??= { right: 0, wrong: 0 });
  if (ok) t.right++;
  else t.wrong++;
  if (t.right + t.wrong > FADE_AT) {
    t.right = Math.round(t.right / 2);
    t.wrong = Math.round(t.wrong / 2);
  }
}

/**
 * How much a skill needs practice, from 0 to 1: the share of its answers that were wrong, leaning
 * toward one half while there are few of them (a skill not yet tried is as uncertain as can be).
 */
export const need = (t?: Tally) => ((t?.wrong ?? 0) + 1) / ((t?.right ?? 0) + (t?.wrong ?? 0) + 2);

/** Even a well-known skill keeps this much weight, so it still comes up. */
const FLOOR = 0.1;

/** One of `cands`, weaker skills more likely. `rand` gives a number in [0, 1). */
export function pickByNeed<Q>(
  cands: Q[],
  skillOf: (q: Q) => string,
  skills: Skills,
  rand: () => number = Math.random,
): Q {
  const w = cands.map((q) => FLOOR + need(skills[skillOf(q)]));
  let r = rand() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < cands.length; i++) if ((r -= w[i]) < 0) return cands[i];
  return cands[cands.length - 1];
}

/** The skills with the lowest share right, among those with a wrong answer on record. */
export function weakest(skills: Skills, n: number): (Tally & { name: string })[] {
  const share = (t: Tally) => t.right / (t.right + t.wrong);
  return Object.entries(skills)
    .filter(([, t]) => t.wrong > 0)
    .map(([name, t]) => ({ name, ...t }))
    .sort((a, b) => share(a) - share(b) || b.wrong - a.wrong)
    .slice(0, n);
}

/** A question waiting to come back, once `due` questions have been asked. */
export type Later<Q> = { q: Q; due: number };

/** Take the first waiting question that is due. */
export function takeDue<Q>(later: Later<Q>[], asked: number): Q | null {
  const i = later.findIndex((l) => l.due <= asked);
  return i < 0 ? null : later.splice(i, 1)[0].q;
}
