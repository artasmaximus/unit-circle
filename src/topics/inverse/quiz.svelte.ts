// A run of Inverse trig questions and how each one sets up the plane. Practice is forgiving
// (hints, a saved best and a missed list); the Guide's exam is strict (no hints, ten in a row,
// with arcsin, arccos and arctan and a composition question among them). Question content itself
// is pure and lives in quiz.ts.
import { inverse } from './state.svelte.ts';
import { partnerAt, type InvFn } from './math.ts';
import { FNS, answerOf, iqKey, makeChoices, makeQ, pickQ, skillOf, type IQ } from './quiz.ts';
import { Session, type Adapter } from '../../practice/session.svelte.ts';
import { progress } from '../../core/progress.svelte.ts';
import { ui } from '../../core/app.svelte.ts';

/** How many in a row the exam wants. */
export const EXAM_STREAK = 10;
/** What the exam wants among its run: each function, and a composition question. */
export type Need = InvFn | 'compose';
export const EXAM_NEEDS: Need[] = [...FNS, 'compose'];
const needsOf = (q: IQ): Need[] => (q.t === 2 ? [q.fn, 'compose'] : [q.fn]);

/**
 * Move the plane to a question: the function, and where the control or the free point starts. What
 * shows meanwhile (the answer held back, the free point, what is given) is the stage's to say.
 */
function stage(q: IQ) {
  ui.highlight = [];
  inverse.switchTo(q.fn);
  // a composition question hands you a free point to work with: move it by the ring or either axis
  // and read what it shows
  if (q.t === 2) inverse.startProbe(q.theta);
  if (q.t === 2) inverse.setValue(partnerAt(q.fn, q.theta)!);
  else inverse.setValue(0);
}
/** Move the control to the answer. */
function reveal(q: IQ) {
  if (q.t === 1) inverse.setValue(q.v);
  if (q.t === 3) inverse.setAngle(q.ang);
  // the ring marks the answer's angle larger (in Practice)
  if (ui.mode === 'practice') ui.highlight = [wrap360(q.t === 3 ? q.ang : answerOf(q))];
}
const wrap360 = (deg: number) => ((deg % 360) + 360) % 360;

const adapter: Adapter<IQ, number> = {
  storageKey: 'ucq-inv',
  keyOf: iqKey,
  make: pickQ,
  skillOf,
  // the choices are angles in degrees, written in the learner's unit when drawn, so switching unit
  // mid-question just rewrites them
  choices: (q) => (q.t === 3 ? [] : makeChoices(q)),
  isRight: (q, deg) => q.t !== 3 && deg === answerOf(q),
  // type 3: is the control where the question asked?
  check: (q) => q.t === 3 && Math.abs(inverse.angle - q.ang) < 1.2,
  stage,
  reveal,
  exam: {
    streak: EXAM_STREAK,
    needs: EXAM_NEEDS,
    needsOf: needsOf,
    make: (need, cur) => {
      if (need) return need === 'compose' ? makeQ({ t: 2 }) : makeQ({ fn: need as InvFn });
      let q: IQ,
        k = 0;
      do q = makeQ();
      while (cur && iqKey(q) === iqKey(cur) && k++ < 8);
      return q;
    },
    onPass: () => progress.complete('inverse'),
  },
};
export type InvSession = Session<IQ, number>;

/** Practice, and the Guide's exam. */
export const invQuiz: InvSession = new Session(adapter);
export const invExam: InvSession = new Session(adapter, true);
