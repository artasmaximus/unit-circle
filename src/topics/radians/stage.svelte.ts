// What shows on the plane in Radians, declared in one place. It is worked out from the mode, the
// Guide's step and the question being asked, so the ring's labels, the angle readout and the
// drawing's features all follow the same rule: while a question is open nothing may give the answer
// away, and once it is answered everything comes back.
import { ui } from '../../core/app.svelte.ts';
import type { Feature } from './features.ts';
import { radians } from './state.svelte.ts';

const ALL: ReadonlySet<Feature> = new Set(['ray', 'pi', 'slices', 'readout']);
/** What a question leaves on: the shaded pieces, but none of their names or the ring's labels. */
const ASKING: ReadonlySet<Feature> = new Set(['ray', 'slices']);

export type Stage = {
  /** The features of the drawing that are on. */
  features: ReadonlySet<Feature>;
  /** The unit the ring's labels use. */
  unit: 'deg' | 'rad';
  /** The ring writes its labels. */
  labels: boolean;
  /** The angle readout in the plane's corner. */
  readout: boolean;
};

/** The session in play: Practice, or the Guide's exam step. */
export const radiansSession = () =>
  ui.mode === 'practice'
    ? radians.practice
    : ui.mode === 'guide' && radians.step.task.kind === 'exam'
      ? radians.exam
      : null;

function declare(): Stage {
  const s = radiansSession();
  if (s?.cur) {
    // open: only what the question leaves on; answered: the whole figure, as in Explore
    const open = !s.answered;
    const features = open ? (ui.mode === 'guide' ? new Set(radians.step.features) : ASKING) : ALL;
    return { features, unit: features.has('pi') ? 'rad' : 'deg', labels: !open, readout: !open };
  }
  // the Guide brings the drawing in one feature at a time; Explore shows it all
  const features = ui.mode === 'guide' ? new Set(radians.step.features) : ALL;
  return { features, unit: features.has('pi') ? 'rad' : 'deg', labels: true, readout: true };
}

class StageState {
  now = $derived(declare());
}
export const stage = new StageState();
