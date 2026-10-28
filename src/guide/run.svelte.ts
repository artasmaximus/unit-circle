// The state every topic's Guide shares: which step, whether its task is done, and how to go on or
// back. A topic subclasses it with its id, its steps, its exam, whether the point sits at a drag
// step's target, and what arriving at a step does to the plane.
import { progress, type GuideTopic } from '../core/progress.svelte.ts';
import type { Step } from './guide.ts';

/** The exam a Guide ends with: a Practice session that has to be passed. */
type Exam = { passed: boolean; reset(): void; start(): void };

export abstract class GuideState<F extends string = string> {
  abstract readonly topic: GuideTopic;
  abstract readonly exam: Exam;
  /** The steps; a topic that writes them in the learner's unit derives them from it. */
  abstract readonly steps: Step<F>[];
  /** The point is where a drag step asks for it. */
  abstract readonly atTarget: boolean;
  /** Set the plane up for a step the learner has just arrived at. */
  protected abstract enter(step: Step<F>): void;

  stepIndex = $state(0);
  solved = $state(false);
  /** A choice task: the choice picked last, to show how it went. */
  chosen = $state<number | null>(null);
  get step() {
    return this.steps[Math.min(this.stepIndex, this.steps.length - 1)];
  }
  /** Whether the step's task lets the learner go on. */
  canGo = $derived.by(() => {
    const t = this.step.task;
    return (
      t.kind === 'read' ||
      (t.kind === 'exam' ? this.exam.passed || !!progress.completed[this.topic] : this.solved)
    );
  });

  goTo(i: number) {
    this.stepIndex = Math.max(0, Math.min(this.steps.length - 1, i));
    this.solved = false;
    this.chosen = null;
    progress.setStep(this.topic, this.stepIndex);
    if (this.step.task.kind === 'exam') {
      this.exam.reset();
      this.exam.start();
    } else this.enter(this.step);
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

/**
 * A drag step counts as done only while the point sits on its target, and goes back to undone when
 * it is moved off.
 */
export function trackDrag(run: GuideState) {
  $effect.root(() => {
    $effect(() => {
      if (run.step.task.kind === 'drag') run.solved = run.atTarget;
    });
  });
}
