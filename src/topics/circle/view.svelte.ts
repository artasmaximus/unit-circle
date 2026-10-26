// The unit circle's view of the plane for the current frame: its layout (where everything sits,
// see layout.ts), and where the Practice hint's coordinates go. The layer draws from it, and the
// floating chips read its layout.
import { revealed, ui } from '../../core/app.svelte.ts';
import { camera } from '../../core/camera.svelte.ts';
import { point } from '../../core/point.svelte.ts';
import { progress } from '../../core/progress.svelte.ts';
import { preview } from '../../plane/pointHandle.svelte.ts';
import { buildLayout } from './layout.ts';
import { quiz } from './quiz.svelte.ts';

class CircleView {
  #memo = { b: -1 };
  layout = $derived(
    buildLayout({
      ang: point.ang,
      hit: point.hit,
      dotR: point.dotR,
      tail: point.tail,
      revealed: revealed(),
      mirror: ui.mirror,
      mirrorOnly: ui.mode === 'practice' && quiz.cur ? quiz.cur.fn : null,
      showCoords: revealed() || (ui.mode === 'practice' && quiz.hint),
      slopeOpen: ui.slopeOpen,
      k: camera.k,
      boost: camera.textBoost,
      labelBoost: camera.labelBoost,
      stroke: camera.stroke,
      unit: progress.unit,
      decimals: camera.thetaDecimals,
      bounds: camera.freeWorld,
      memo: this.#memo,
    }),
  );
  /**
   * Where a press would put the point, when Practice's hint is showing coordinates and the answer
   * is still hidden: the hint then works at the spot being aimed at too.
   */
  hintAt = $derived(ui.mode === 'practice' && quiz.hint && !ui.revealed ? preview.deg : null);
}
export const circleView = new CircleView();
