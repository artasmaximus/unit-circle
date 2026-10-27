// The unit circle's Practice and its Guide exam: a run of questions (see practice/session.svelte.ts)
// and how each question sets up the plane. Question content itself is pure and lives in quiz.ts.
import { angleTex } from '../../core/angles.ts';
import { ui } from '../../core/app.svelte.ts';
import { point } from '../../core/point.svelte.ts';
import { progress } from '../../core/progress.svelte.ts';
import { SPECIAL, rad, wrapPi, type Fn } from '../../core/trig.ts';
import { Session, type Adapter } from '../../practice/session.svelte.ts';
import { makeChoices, pickQ, qKey, skillOf, trigTexAnswer, type Question } from './quiz.ts';

/** How many in a row the exam wants, and the functions it wants among them. */
export const EXAM_STREAK = 10;
export const EXAM_FNS: Fn[] = ['sin', 'cos', 'tan'];
const rnd = (n: number) => Math.floor(Math.random() * n);

/**
 * Practice hides the answer on the plane until the question is answered; the exam only moves the
 * point to the answer.
 */
function adapter(strict: boolean): Adapter<Question, string> {
  return {
    storageKey: 'ucq',
    keyOf: qKey,
    make: pickQ,
    skillOf,
    choices: (q) => (q.t === 1 ? makeChoices(q) : []),
    isRight: (q, c) => q.t === 1 && c === trigTexAnswer(q),
    // type 2: is the point on one of the solutions?
    check: (q, s) => {
      if (q.t !== 2) return null;
      const d = point.deg,
        hit = q.sols.find((a) => Math.min(Math.abs(d - a), 360 - Math.abs(d - a)) < 1.2);
      if (hit === undefined) return false;
      if (s.found.includes(hit)) {
        s.note = 'You already found that one. Look for the other angle.';
        return null;
      }
      s.found.push(hit);
      ui.highlight = [...s.found];
      if (s.found.length === q.sols.length) return true;
      s.note = ['Yes, ', { m: angleTex(hit, progress.unit) }, '. Now find the other angle.'];
      return null;
    },
    stage: () => {
      if (!strict) ui.highlight = [];
    },
    // the point goes to the answer, and the ring marks it larger (both angles, for type 2)
    reveal: (q, ok, s) => {
      // a missed placing question: remember where the point was left before it moves
      if (q.t === 2 && !ok && !s.miss) {
        const left = point.deg,
          gap = (a: number) => Math.abs(wrapPi(rad(left) - rad(a))),
          todo = q.sols.filter((a) => !s.found.includes(a));
        s.miss = { from: left, to: todo.sort((a, b) => gap(a) - gap(b))[0] ?? q.sols[0] };
      }
      if (q.t === 1) {
        point.set(q.a, true);
        if (!strict) ui.highlight = [q.a];
      } else {
        ui.highlight = [...q.sols];
        point.set(q.sols.find((a) => !s.found.includes(a)) ?? q.sols[q.sols.length - 1], true);
      }
    },
    // the exam: exact values of sin, cos and tan at the special angles, ten in a row
    exam: {
      streak: EXAM_STREAK,
      needs: EXAM_FNS,
      needsOf: (q) => [q.fn],
      make: (need, cur) => {
        let q: Question,
          n = 0;
        do q = { t: 1, fn: (need as Fn) ?? EXAM_FNS[rnd(3)], a: SPECIAL[rnd(SPECIAL.length)] };
        while (cur && qKey(q) === qKey(cur) && n++ < 8);
        return q;
      },
      onPass: () => progress.complete('circle'),
    },
  };
}

export type QuizSession = Session<Question, string>;
export const quiz: QuizSession = new Session(adapter(false));
export const quizExam: QuizSession = new Session(adapter(true), true);
