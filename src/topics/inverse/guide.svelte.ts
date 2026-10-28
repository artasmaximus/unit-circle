// State for the Inverse trig Guide: which step, whether its task is done, and how each step sets
// up the plane (which function, where the control or the free point starts, whether the range is
// shaded). This module also registers the topic's hooks with core/app.svelte.ts, so a mode or topic
// switch knows what each mode means here.
import { inverseGuide } from './guideSteps.ts';
import { inverse } from './state.svelte.ts';
import { invExam, invQuiz } from './quiz.svelte.ts';
import type { Step } from '../../guide/guide.ts';
import { GuideState, trackDrag } from '../../guide/run.svelte.ts';
import { progress } from '../../core/progress.svelte.ts';
import { point } from '../../core/point.svelte.ts';
import { ui, type Mode, type TopicHooks } from '../../core/app.svelte.ts';
import { norm, rad, wrapPi } from '../../core/trig.ts';
import { SETUP, type Setup } from './guideSetup.ts';

/** Move the plane to a step: the function, and where the control or the free point starts. */
function stage(s: Setup) {
  inverse.switchTo(s.fn);
  if (s.probe !== undefined) inverse.startProbe(s.probe);
  else inverse.setAngle(s.angle ?? 0);
}

/** How far (degrees) `a` is from `b` round the circle. */
const apart = (a: number, b: number) => Math.abs(wrapPi(rad(a) - rad(b))) * (180 / Math.PI);

class InverseGuide extends GuideState {
  topic = 'inverse';
  exam = invExam;
  /** The steps are written in the learner's unit, so they are rebuilt when it changes. */
  steps = $derived<Step[]>(inverseGuide(progress.unit));
  /** A drag step's target is reached: the free point's angle, or the control's. */
  atTarget = $derived.by(() => {
    const t = this.step.task;
    if (t.kind !== 'drag' || ui.mode !== 'guide' || ui.topic !== 'inverse') return false;
    const now = SETUP[this.step.id]?.probe !== undefined ? norm(inverse.probeTo) : inverse.target;
    return [t.deg, ...(t.also ?? [])].some((d) => apart(now, d) < t.tol);
  });
  protected enter({ id }: Step) {
    if (SETUP[id]) stage(SETUP[id]);
  }
}
export const inverseGuideRun = new InverseGuide();
trackDrag(inverseGuideRun);

// what switching to this topic, or switching mode inside it, does to the plane
function apply(m: Mode) {
  ui.highlight = [];
  if (m === 'guide')
    return inverseGuideRun.goTo(
      Math.min(progress.step.inverse ?? 0, inverseGuideRun.steps.length - 1),
    );
  if (m !== 'practice') return;
  if (!invQuiz.cur || invQuiz.answered) invQuiz.start();
  else invQuiz.resume();
}
export const inverseHooks: TopicHooks = {
  mode: apply,
  // arriving in the exploration, the control takes on the unit circle's angle and slides to where
  // it lives here
  enter: (m) => {
    if (m === 'explore') inverse.adopt(point.deg);
  },
  // leaving the exploration for the unit circle, its point takes the control's angle and slides to it
  leave: (to, m) => {
    if (to === 'circle' && m === 'explore') point.set(norm(inverse.target), true);
  },
};
