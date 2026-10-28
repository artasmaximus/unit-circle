// The unit circle's Practice and its Guide exam: a run of questions (see practice/session.svelte.ts)
// and how each question sets up the plane. Question content itself is pure and lives in quiz.ts.
import { angleTex } from '../../core/angles.ts';
import { ui } from '../../core/app.svelte.ts';
import { point } from '../../core/point.svelte.ts';
import { progress } from '../../core/progress.svelte.ts';
import { SPECIAL, angDist, type Fn } from '../../core/trig.ts';
import { EXAM_STREAK, Session, type Adapter } from '../../practice/session.svelte.ts';
import { makeChoices, pickQ, qKey, skillOf, trigTexAnswer, type Question } from './quiz.ts';
import { rnd } from '../../core/random.ts';

/** How many in a row the exam wants, and the functions it wants among them. */
export const EXAM_FNS: Fn[] = ['sin', 'cos', 'tan'];

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
        hit = q.sols.find((a) => angDist(d, a) < 1.2);
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
    reveal: (q, _ok, s) => {
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
