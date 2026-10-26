// State for the Radians topic: the Guide (which step, whether its task is done), the Practice and
// exam sessions, and which features of the drawing are on. Like the other topics it registers with
// core/app.svelte.ts what a mode or topic switch means for it.
import { RADIANS_GUIDE } from './guideSteps.ts';
import type { Step } from '../../guide/guide.ts';
import { type Feature } from './features.ts';
import { R_TYPES, makeRQ, pickRQ, rChoices, rqKey, type RQ } from './quiz.ts';
import { Session as PracticeSession, type Adapter } from '../../practice/session.svelte.ts';
import { progress } from '../../core/progress.svelte.ts';
import { point } from '../../core/point.svelte.ts';
import { ui, type Mode, type TopicHooks } from '../../core/app.svelte.ts';
import { wrapPi, rad } from '../../core/trig.ts';

const ALL = new Set<Feature>(['ray', 'pi', 'slices', 'readout']);
/**
 * Practice keeps the shaded pieces but none of their names or the ring's labels, so no question can
 * be read off the ring.
 */
const PRACTICE = new Set<Feature>(['ray', 'slices']);

/** How many in a row the exam wants. */
export const EXAM_STREAK = 10;

/** Practice and the exam: a run of Radians questions (see practice/session.svelte.ts). */
const adapter: Adapter<RQ, number> = {
  storageKey: 'ucq-rad',
  keyOf: rqKey,
  make: pickRQ,
  // for the two conversion types, the choices are degrees, written in the right unit when drawn
  choices: (q) => (q.t === 3 ? [] : rChoices(q as RQ & { t: 1 | 2 })),
  isRight: (q, deg) => deg === q.deg,
  // placing: is the point at the angle?
  check: (q) => Math.abs(wrapPi(rad(point.deg) - rad(q.deg))) < rad(1.5),
  // a placing question starts with the point out of the way, so the angle is not already there
  stage: (q) => {
    if (q.t === 3) point.set(q.deg > 180 ? 20 : 340, true);
  },
  reveal: (q) => point.set(q.deg, true),
  exam: {
    streak: EXAM_STREAK,
    needs: R_TYPES.map(String),
    needsOf: (q) => [String(q.t)],
    make: (need) => {
      const q = makeRQ();
      return need ? { t: +need as RQ['t'], deg: q.deg } : q;
    },
    onPass: () => progress.complete('radians'),
  },
};
export type Session = PracticeSession<RQ, number>;

class Radians {
  practice: Session = new PracticeSession(adapter);
  exam: Session = new PracticeSession(adapter, true);
  /** Which Guide step the learner is on, and whether its task is done. */
  stepIndex = $state(0);
  /** How many times a step's animation has been replayed; keys its marks so they draw again. */
  plays = $state(0);
  replay() {
    this.plays++;
  }
  solved = $state(false);
  /** A choice task: the choice picked last, to show how it went. */
  chosen = $state<number | null>(null);
  steps: Step<Feature>[] = RADIANS_GUIDE;
  step = $derived(this.steps[Math.min(this.stepIndex, this.steps.length - 1)]);
  /** Whether the exam step's task is satisfied. */
  examPassed = $derived(this.exam.passed);
  /** The features of the drawing that are on right now, which depend on the mode. */
  features = $derived.by<ReadonlySet<Feature>>(() =>
    ui.mode === 'guide' ? new Set(this.step.features) : ui.mode === 'practice' ? PRACTICE : ALL,
  );
  /**
   * The unit the ring's labels use: the Guide brings in π labels at its own pace, and Explore shows
   * them.
   */
  ringUnit = $derived<'deg' | 'rad'>(this.features.has('pi') ? 'rad' : 'deg');
  /**
   * Whether a question is being asked, in Practice or in the Guide's exam: nothing on the plane may
   * then give the answer away.
   */
  asking = $derived(
    ui.mode === 'practice' || (ui.mode === 'guide' && this.step.task.kind === 'exam'),
  );
  /**
   * Whether the ring's labels show at all: not while asking, where they would give the answers
   * away.
   */
  ringLabels = $derived(!this.asking);

  /** Whether the step's task lets the learner go on. */
  canGo = $derived.by(() => {
    const t = this.step.task;
    return (
      t.kind === 'read' ||
      (t.kind === 'exam' ? this.exam.passed || !!progress.completed.radians : this.solved)
    );
  });
  /** The point is at the angle a drag task asks for. */
  atTarget = $derived.by(() => {
    const t = this.step.task;
    return t.kind === 'drag' && Math.abs(wrapPi(rad(point.deg) - rad(t.deg))) < rad(t.tol);
  });

  goTo(i: number) {
    this.stepIndex = Math.max(0, Math.min(this.steps.length - 1, i));
    this.solved = false;
    this.chosen = null;
    progress.setStep('radians', this.stepIndex);
    const t = this.step.task;
    if (t.kind === 'exam') {
      this.exam.reset();
      this.exam.start();
    }
    // a drag step starts with the point away from its target
    if (t.kind === 'drag' && Math.abs(wrapPi(rad(point.deg) - rad(t.deg))) < rad(t.tol * 2))
      point.set(t.deg > 180 ? 20 : 340, true);
  }
  next() {
    if (this.canGo) this.goTo(this.stepIndex + 1);
  }
  back() {
    this.goTo(this.stepIndex - 1);
  }
  /** A choice task: pick one. */
  choose(i: number) {
    const t = this.step.task;
    if (t.kind !== 'choice' || this.solved) return;
    this.chosen = i;
    if (i === t.answer) this.solved = true;
  }
}
export const radians = new Radians();

// a drag step counts as done only while the point sits on its target, and goes back to undone when
// it is moved off
$effect.root(() => {
  $effect(() => {
    if (radians.step.task.kind === 'drag') radians.solved = radians.atTarget;
  });
});

function apply(m: Mode) {
  ui.revealed = true;
  ui.highlight = [];
  if (m === 'guide') radians.goTo(Math.min(progress.step.radians ?? 0, radians.steps.length - 1));
  else if (m === 'practice' && (!radians.practice.cur || radians.practice.answered))
    radians.practice.start();
}
export const radiansHooks: TopicHooks = { mode: apply };
