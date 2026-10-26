// State for the Unit circle Guide: which step, whether its task is done, and its exam. Practice
// lives in quiz.svelte.ts. This module registers the topic's hooks with core/app.svelte.ts, so a
// mode or topic switch knows what each mode means here.
import { unitCircleGuide } from './guideSteps.ts';
import type { Step } from '../../guide/guide.ts';
import { progress } from '../../core/progress.svelte.ts';
import { makeChoices, trigTexAnswer, type Question } from './quiz.ts';
import { point } from '../../core/point.svelte.ts';
import { quiz } from './quiz.svelte.ts';
import { solver } from '../../solver/solver.svelte.ts';
import { topicHooks, ui, type Mode } from '../../core/app.svelte.ts';
import { SPECIAL, norm, rad, wrapPi, type Fn } from '../../core/trig.ts';
import type { Feature } from './features.ts';

/** How many in a row the exam wants, and the functions it wants among them. */
export const EXAM_STREAK = 10;
export const EXAM_FNS: Fn[] = ['sin', 'cos', 'tan'];
type ValueQ = Extract<Question, { t: 1 }>;

/**
 * The Guide's exam: exact values of sin, cos and tan at the special angles, ten in a row with no
 * hints and every function seen.
 */
export class Exam {
  streak = $state(0);
  cur = $state<ValueQ | null>(null);
  choices = $state<string[]>([]);
  answered = $state(false);
  picked = $state<number | null>(null);
  ok = $state(false);
  seen = $state<Fn[]>([]);
  get passed() {
    return this.streak >= EXAM_STREAK && EXAM_FNS.every((f) => this.seen.includes(f));
  }

  start() {
    // the last questions of a run are steered to a function it has not had yet
    const lacking = EXAM_FNS.filter((f) => !this.seen.includes(f)),
      steer = lacking.length && EXAM_STREAK - this.streak <= lacking.length;
    let q: ValueQ,
      n = 0;
    do
      q = {
        t: 1,
        fn: steer ? lacking[0] : EXAM_FNS[Math.floor(Math.random() * 3)],
        a: SPECIAL[Math.floor(Math.random() * SPECIAL.length)],
      };
    while (this.cur && q.fn === this.cur.fn && q.a === this.cur.a && n++ < 8);
    this.cur = q;
    this.choices = makeChoices(q);
    this.answered = false;
    this.picked = null;
  }
  answer(i: number) {
    const q = this.cur;
    if (!q || this.answered) return;
    this.picked = i;
    this.answered = true;
    this.ok = this.choices[i] === trigTexAnswer(q);
    if (this.ok) {
      this.streak++;
      if (!this.seen.includes(q.fn)) this.seen = [...this.seen, q.fn];
    } else {
      this.streak = 0;
      this.seen = [];
    }
    point.set(q.a, true);
    if (this.passed) progress.complete('circle');
  }
  reset() {
    this.streak = 0;
    this.seen = [];
    this.cur = null;
    this.answered = false;
  }
}

/** Is the point within `tol` degrees of `deg`? */
const near = (deg: number, tol: number) => Math.abs(wrapPi(rad(point.deg) - rad(deg))) < rad(tol);

class UnitGuide {
  exam = new Exam();
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
    ui.revealed = true;
    solver.close();
    unitGuide.goTo(progress.step.circle ?? 0);
  } else if (m === 'practice') {
    if (!quiz.cur || quiz.answered) quiz.start();
    else ui.revealed = quiz.answered;
  } else {
    ui.highlight = [];
    ui.revealed = true;
    solver.close();
  }
}
topicHooks.circle = {
  mode: apply,
  enter: (m) => {
    // like Radians: until its Guide is done the topic opens in it; after that, in whichever mode
    // was last used
    ui.mode = !progress.completed.circle ? 'guide' : m === 'guide' ? 'explore' : m;
    apply(ui.mode);
  },
};
// the app opens on the unit circle: a learner who has not finished its Guide starts there
if (ui.topic === 'circle' && ui.mode === 'guide') apply('guide');
