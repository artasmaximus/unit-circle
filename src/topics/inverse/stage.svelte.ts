// What shows on the plane in Inverse trig, declared in one place. It is worked out from the mode, the
// Guide's step, the question being asked and the learner's own switch, so no mode has to remember to
// put things back as it found them: leave Practice and the answer is simply no longer a reason for
// the other angle to show. Positions (where the control and the free point sit) are still moved by
// the Guide and the questions as they begin; this says only what is drawn and what can be moved.
import { ui } from '../../core/app.svelte.ts';
import { norm } from '../../core/trig.ts';
import { inverseGuideRun } from './guide.svelte.ts';
import { SETUP } from './guideSetup.ts';
import { otherAngle } from './math.ts';
import { invExam, invQuiz } from './quiz.svelte.ts';
import type { Domain } from './quiz.ts';
import { inverse } from './state.svelte.ts';

export type Stage = {
  /** The answer: the ray, its arc and the point where it lands. */
  shown: boolean;
  /** The shaded range the function answers from. */
  band: boolean;
  /** The other angle with the same value. */
  other: boolean;
  /** An angle the question starts from, drawn as its own point. */
  given: number | null;
  /** The stretch of angles a composition question draws θ from. */
  domain: Domain | null;
  /** The control cannot be moved. */
  locked: boolean;
  /** A free point to work with stands in for the control. */
  probing: boolean;
};

/** The session in play: Practice, or the Guide's exam step. */
export const inverseSession = () =>
  ui.mode === 'practice'
    ? invQuiz
    : ui.mode === 'guide' && inverseGuideRun.step.task.kind === 'exam'
      ? invExam
      : null;

function declare(): Stage {
  const s = inverseSession();
  // a question: the answer is held back (an evaluate question hands over the circle to probe, and
  // the others keep the control or the value to themselves) until it is answered, or the hint asks
  // for the range
  if (s?.cur) {
    const q = s.cur,
      done = s.answered;
    return {
      shown: done || q.t === 1,
      band: done || s.hint,
      other: done,
      given: q.t === 2 ? q.theta : null,
      domain: q.t === 2 ? q.dom : null,
      locked: done,
      probing: q.t === 2 && !done,
    };
  }
  // a Guide step lays out its own plane
  const setup = ui.mode === 'guide' ? SETUP[inverseGuideRun.step.id] : undefined;
  if (setup) {
    const probing = setup.probe !== undefined;
    return {
      shown: !probing,
      band: setup.band,
      other: false,
      given: setup.given ?? null,
      domain: null,
      locked: probing,
      probing,
    };
  }
  // exploring: the whole figure, with the other angle where the learner switched it on
  return {
    shown: true,
    band: true,
    other: inverse.showOther,
    given: null,
    domain: null,
    locked: false,
    probing: false,
  };
}

class StageState {
  now = $derived(declare());
  /** Angles (degrees) whose ring label the drawing writes itself, so the ring leaves them out. */
  marked = $derived.by(() => {
    const s = this.now,
      out: number[] = [];
    if (s.shown && s.other) out.push(inverse.other);
    if (s.given !== null) out.push(s.given);
    // the preview is drawn only where it would change something, so it only claims labels then
    if (
      inverse.ghost !== null &&
      !inverse.dragging &&
      Math.abs(inverse.ghost - inverse.target) > 1e-3
    )
      out.push(inverse.ghost, otherAngle(inverse.fn, inverse.ghost));
    return out.map((a) => norm(a));
  });
}
export const stage = new StageState();
