// The shape of a Guide: an ordered list of steps. Each step says which features of the drawing are
// on, what to read, and what the learner has to do to go on. Content is plain data (each topic's
// guideSteps.ts), so it can be written and changed without touching the drawing or the screens.
import type { Rich } from '../core/rich.ts';

/**
 * What a step asks of the learner. `read` is just going on; `choice` is one question; `drag` is
 * putting the point at an angle (or at any of `also`); `exam` is the topic's final check.
 */
export type Task =
  | { kind: 'read' }
  | { kind: 'choice'; prompt: Rich; choices: string[]; answer: number; right: Rich; wrong: Rich }
  | {
      kind: 'drag';
      prompt: Rich;
      deg: number;
      tol: number;
      right: Rich;
      also?: number[];
      /** How to drag, when it is not the point round the circle (a value along an axis). */
      how?: Rich;
    }
  | { kind: 'exam' };

export type Step<F extends string = string> = {
  id: string;
  title: string;
  /** Paragraphs of running text (with typeset math where it needs it). */
  say: Rich[];
  /**
   * The parts of the drawing that are on for this step; the drawing animates each one in as it
   * appears and out as it goes.
   */
  features: F[];
  /** The step plays an animation, and offers a button to play it again. */
  replay?: boolean;
  task: Task;
};
