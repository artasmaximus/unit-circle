// State for the Inverse trig Guide: which step, whether its task is done, and how each step sets
// up the plane (which function, where the control or the free point starts, whether the range is
// shaded). This module also registers the topic's hooks with core/app.svelte.ts, so a mode or topic
// switch knows what each mode means here.
import { inverseGuide } from './guideSteps.ts';
import { inverse } from './state.svelte.ts';
import { invExam, invQuiz } from './quiz.svelte.ts';
import type { Step } from '../../guide/guide.ts';
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

class InverseGuide {
  exam = invExam;
  stepIndex = $state(0);
  solved = $state(false);
  chosen = $state<number | null>(null);
  /** The steps are written in the learner's unit, so they are rebuilt when it changes. */
  steps = $derived<Step[]>(inverseGuide(progress.unit));
  step = $derived(this.steps[Math.min(this.stepIndex, this.steps.length - 1)]);
  canGo = $derived.by(() => {
    const t = this.step.task;
    return (
      t.kind === 'read' ||
      (t.kind === 'exam' ? this.exam.passed || !!progress.completed.inverse : this.solved)
    );
  });
  /** A drag step's target is reached: the free point's angle, or the control's. */
  atTarget = $derived.by(() => {
    const t = this.step.task;
    if (t.kind !== 'drag' || ui.mode !== 'guide' || ui.topic !== 'inverse') return false;
    const now = SETUP[this.step.id]?.probe !== undefined ? norm(inverse.probeTo) : inverse.target;
    return [t.deg, ...(t.also ?? [])].some((d) => apart(now, d) < t.tol);
  });

  goTo(i: number) {
    this.stepIndex = Math.max(0, Math.min(this.steps.length - 1, i));
    this.solved = false;
    this.chosen = null;
    progress.setStep('inverse', this.stepIndex);
    const id = this.step.id;
    if (this.step.task.kind === 'exam') {
      this.exam.reset();
      this.exam.start();
    } else if (SETUP[id]) stage(SETUP[id]);
  }
  next() {
    if (this.canGo) this.goTo(this.stepIndex + 1);
  }
  back() {
    this.goTo(this.stepIndex - 1);
  }
  choose(i: number) {
    const t = this.step.task;
    if (t.kind !== 'choice' || this.solved) return;
    this.chosen = i;
    if (i === t.answer) this.solved = true;
  }
}
export const inverseGuideRun = new InverseGuide();

// a drag step counts as done only while the point sits on its target, and goes back to undone when
// it is moved off
$effect.root(() => {
  $effect(() => {
    if (inverseGuideRun.step.task.kind === 'drag')
      inverseGuideRun.solved = inverseGuideRun.atTarget;
  });
});

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
    if (to === 'circle' && m === 'explore') point.set(norm(inverse.angleTo), true);
  },
};
