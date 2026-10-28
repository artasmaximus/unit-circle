// State for the Unit circle Guide: which step, whether its task is done, and its exam. Practice
// lives in quiz.svelte.ts. This module registers the topic's hooks with core/app.svelte.ts, so a
// mode or topic switch knows what each mode means here.
import { unitCircleGuide } from './guideSteps.ts';
import type { Step } from '../../guide/guide.ts';
import { GuideState, trackDrag } from '../../guide/run.svelte.ts';
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

class UnitGuide extends GuideState<Feature> {
  topic = 'circle';
  exam = quizExam;
  /** The steps are written in the learner's unit, so they are rebuilt when it changes. */
  steps = $derived<Step<Feature>[]>(unitCircleGuide(progress.unit));
  /**
   * The features of the drawing that are on: only the Guide draws them (Explore and Practice have
   * the full figure).
   */
  features = $derived<ReadonlySet<Feature>>(new Set(ui.mode === 'guide' ? this.step.features : []));
  atTarget = $derived.by(() => {
    const t = this.step.task;
    return t.kind === 'drag' && [t.deg, ...(t.also ?? [])].some((d) => near(d, t.tol));
  });
  protected enter({ task: t }: Step<Feature>) {
    // a drag step starts with the point away from its targets
    if (t.kind === 'drag' && [t.deg, ...(t.also ?? [])].some((d) => near(d, t.tol * 2)))
      point.set(norm(t.deg + 35), true);
  }
}
export const unitGuide = new UnitGuide();
trackDrag(unitGuide);

function apply(m: Mode) {
  if (m === 'practice') {
    if (!quiz.cur || quiz.answered) quiz.start();
    return;
  }
  ui.highlight = [];
  solver.close();
  if (m === 'guide') unitGuide.goTo(progress.step.circle ?? 0);
}
export const circleHooks: TopicHooks = {
  mode: apply,
  // the slope chip's open working does not follow the learner to another topic
  leave: () => (circleUi.slopeOpen = false),
};
