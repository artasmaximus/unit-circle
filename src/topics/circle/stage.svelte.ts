// What shows on the plane in the unit circle, declared in one place: which figure is drawn (the
// Guide's, which brings its parts in a step at a time, or the whole circle of Explore and Practice),
// whether the answers show, and what Practice's hint has opened. Worked out from the mode and the
// question being asked, so the two layers and the floating chips all read the same thing.
import { revealed, ui } from '../../core/app.svelte.ts';
import type { Fn } from '../../core/trig.ts';
import { quiz, quizExam } from './quiz.svelte.ts';
import { unitGuide } from './guide.svelte.ts';

export type Stage = {
  /** The Guide's figure is drawn; otherwise the whole circle. */
  guide: boolean;
  /** Answers (colors, values, labels) may show: no question is open. */
  revealed: boolean;
  /** An open question about one function draws only that function's mirror. */
  mirrorOnly: Fn | null;
  /** The point's coordinates are written beside it. */
  coords: boolean;
  /** The hint is open on a question still unanswered: it works at the spot being aimed at. */
  hinting: boolean;
};

/** The session in play: Practice, or the Guide's exam step. */
export const circleSession = () =>
  ui.mode === 'practice'
    ? quiz
    : ui.mode === 'guide' && unitGuide.step.task.kind === 'exam'
      ? quizExam
      : null;

function declare(): Stage {
  const open = !revealed();
  const hint = ui.mode === 'practice' && quiz.hint;
  return {
    guide: ui.mode === 'guide',
    revealed: !open,
    mirrorOnly: ui.mode === 'practice' && quiz.cur ? quiz.cur.fn : null,
    coords: !open || hint,
    hinting: open && hint,
  };
}

class StageState {
  now = $derived(declare());
}
export const stage = new StageState();
