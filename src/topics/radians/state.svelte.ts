// State for the Radians topic: the Guide (which step, whether its task is done), the Practice and
// exam sessions, and which features of the drawing are on. Like the other topics it registers with
// core/app.svelte.ts what a mode or topic switch means for it.
import { RADIANS_GUIDE } from './guideSteps.ts';
import type { Step } from '../../guide/guide.ts';
import { type Feature } from './features.ts';
import { R_TYPES, makeRQ, pickRQ, rChoices, rqKey, type RQ } from './quiz.ts';
import { progress } from '../../core/progress.svelte.ts';
import { point } from '../../core/point.svelte.ts';
import { topicHooks, ui, type Mode } from '../../core/app.svelte.ts';
import { wrapPi, rad } from '../../core/trig.ts';

const ALL = new Set<Feature>(['ray', 'pi', 'slices', 'readout']);
/**
 * Practice keeps the shaded pieces but none of their names or the ring's labels, so no question can
 * be read off the ring.
 */
const PRACTICE = new Set<Feature>(['ray', 'slices']);

/** How many in a row the exam wants. */
export const EXAM_STREAK = 10;
const KEY = 'ucq-rad';

/**
 * A run of Radians questions. Practice is forgiving (hints, a saved best and a missed list); the
 * exam is strict (no hints, ten in a row with every type seen).
 */
export class Session {
  readonly strict: boolean;
  streak = $state(0);
  best = $state(0);
  missed = $state<RQ[]>([]);
  cur = $state<RQ | null>(null);
  /**
   * For the two conversion types: the choices as numbers (degrees), written in the right unit when
   * drawn.
   */
  choices = $state<number[]>([]);
  answered = $state(false);
  picked = $state<number | null>(null);
  hint = $state(false);
  ok = $state(false);
  /** The question types answered correctly in this run (the exam wants every type). */
  seen = $state<number[]>([]);
  /** The exam is passed: enough in a row, every type among them. */
  get passed() {
    return this.strict && this.streak >= EXAM_STREAK && R_TYPES.every((t) => this.seen.includes(t));
  }

  constructor(strict: boolean) {
    this.strict = strict;
    if (!strict) {
      try {
        const s = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (s) {
          this.best = s.best | 0;
          this.missed = Array.isArray(s.missed) ? s.missed : [];
        }
      } catch {}
    }
  }
  #save() {
    if (!this.strict) {
      try {
        localStorage.setItem(KEY, JSON.stringify({ best: this.best, missed: this.missed }));
      } catch {}
    }
  }

  /**
   * The next type the exam still needs, so a run of ten cannot go without one (the last questions
   * are steered to what is missing).
   */
  #needed(): RQ | null {
    if (!this.strict) return null;
    const left = EXAM_STREAK - this.streak,
      lacking = R_TYPES.filter((t) => !this.seen.includes(t));
    if (!lacking.length || left > lacking.length) return null;
    const t = lacking[0],
      q = makeRQ();
    return { t, deg: q.deg };
  }
  start(q: RQ | null = null) {
    const next = q ?? this.#needed() ?? (this.strict ? makeRQ() : pickRQ(this.missed, this.cur));
    this.cur = next;
    this.answered = false;
    this.picked = null;
    this.hint = false;
    this.choices = next.t === 3 ? [] : rChoices(next as RQ & { t: 1 | 2 });
    // a placing question starts with the point out of the way, so the angle is not already there
    if (next.t === 3) point.set(next.deg > 180 ? 20 : 340, true);
  }
  useHint() {
    if (this.cur && !this.answered && !this.strict) this.hint = true;
  }
  answer(i: number) {
    const q = this.cur;
    if (!q || q.t === 3 || this.answered) return;
    this.picked = i;
    this.#finish(this.choices[i] === q.deg);
  }
  /** Placing: is the point at the angle? */
  check() {
    const q = this.cur;
    if (!q || q.t !== 3 || this.answered) return;
    this.#finish(Math.abs(wrapPi(rad(point.deg) - rad(q.deg))) < rad(1.5));
  }
  #finish(ok: boolean) {
    const q = this.cur!;
    this.answered = true;
    this.ok = ok;
    const at = this.missed.findIndex((m) => rqKey(m) === rqKey(q));
    if (ok) {
      if (!this.hint) {
        this.streak++;
        this.best = Math.max(this.best, this.streak);
        if (!this.seen.includes(q.t)) this.seen = [...this.seen, q.t];
      }
      if (at >= 0) this.missed.splice(at, 1);
    } else {
      this.streak = 0;
      if (this.strict) this.seen = [];
      if (!this.strict && at < 0) this.missed.push(q);
    }
    this.#save();
    point.set(q.deg, true);
    if (this.passed) progress.complete('radians');
  }
  /** Begin the exam run afresh (leaving and coming back does not keep a half-finished run). */
  reset() {
    this.streak = 0;
    this.seen = [];
    this.cur = null;
    this.answered = false;
  }
}

class Radians {
  practice = new Session(false);
  exam = new Session(true);
  /** Which Guide step the learner is on, and whether its task is done. */
  stepIndex = $state(0);
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
topicHooks.radians = {
  mode: apply,
  enter: (m) => {
    // a topic that has not been completed opens in its Guide; after that it opens in whichever mode
    // was last used
    ui.mode = !progress.completed.radians ? 'guide' : m === 'guide' ? 'explore' : m;
    apply(ui.mode);
  },
};
