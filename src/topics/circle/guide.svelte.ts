// State for the Unit circle Guide: which step, whether its task is done, and its exam. Practice
// lives in quiz.svelte.ts. This module registers the topic's hooks with core/app.svelte.ts, so a
// mode or topic switch knows what each mode means here.
import { unitCircleGuide } from './guideSteps.ts';
import type { Step } from '../../guide/guide.ts';
import { progress } from '../../core/progress.svelte.ts';
import { point } from '../../core/point.svelte.ts';
import { quiz, quizExam } from './quiz.svelte.ts';
import { solver } from '../../solver/solver.svelte.ts';
import { ui, type Mode, type TopicHooks } from '../../core/app.svelte.ts';
import { circleUi } from './ui.svelte.ts';
import { norm, rad, wrapPi } from '../../core/trig.ts';
import type { Feature } from './features.ts';

/** Is the point within `tol` degrees of `deg`? */
const near = (deg: number, tol: number) => Math.abs(wrapPi(rad(point.deg) - rad(deg))) < rad(tol);

class UnitGuide {
  exam = quizExam;
  stepIndex = $state(0);
  solved = $state(false);
  chosen = $state<number | null>(null);
  /** The steps are written in the learner's unit, so they are rebuilt when it changes. */
  steps = $derived<Step<Feature>[]>(unitCircleGuide(progress.unit));
  step = $derived(this.steps[Math.min(this.stepIndex, this.steps.length - 1)]);
  /**
   * The features of the drawing that are on: only the Guide draws them (Explore and Practice have
   * the full figure).
   */
  features = $derived<ReadonlySet<Feature>>(new Set(ui.mode === 'guide' ? this.step.features : []));
  canGo = $derived.by(() => {
    const t = this.step.task;
    return (
      t.kind === 'read' ||
      (t.kind === 'exam' ? this.exam.passed || !!progress.completed.circle : this.solved)
    );
  });
  atTarget = $derived.by(() => {
    const t = this.step.task;
    return t.kind === 'drag' && [t.deg, ...(t.also ?? [])].some((d) => near(d, t.tol));
  });

  goTo(i: number) {
    this.stepIndex = Math.max(0, Math.min(this.steps.length - 1, i));
    this.solved = false;
    this.chosen = null;
    progress.setStep('circle', this.stepIndex);
    const t = this.step.task;
    if (t.kind === 'exam') {
      this.exam.reset();
      this.exam.start();
    }
    // a drag step starts with the point away from its targets
    if (t.kind === 'drag' && [t.deg, ...(t.also ?? [])].some((d) => near(d, t.tol * 2)))
      point.set(norm(t.deg + 35), true);
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
export const unitGuide = new UnitGuide();

// a drag step counts as done only while the point sits on its target, and goes back to undone when
// it is moved off
$effect.root(() => {
  $effect(() => {
    if (unitGuide.step.task.kind === 'drag') unitGuide.solved = unitGuide.atTarget;
  });
});

function apply(m: Mode) {
  if (m === 'guide') {
    ui.highlight = [];
    solver.close();
    unitGuide.goTo(progress.step.circle ?? 0);
  } else if (m === 'practice') {
    if (!quiz.cur || quiz.answered) quiz.start();
  } else {
    ui.highlight = [];
    solver.close();
  }
}
export const circleHooks: TopicHooks = {
  mode: apply,
  // the slope chip's open working does not follow the learner to another topic
  leave: () => (circleUi.slopeOpen = false),
};
