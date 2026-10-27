// The unit circle's view of the plane for the current frame: its layout (where everything sits,
// see layout.ts), and where the Practice hint's coordinates go. The layer draws from it, and the
// floating chips read its layout.
import { camera } from '../../core/camera.svelte.ts';
import { point } from '../../core/point.svelte.ts';
import { progress } from '../../core/progress.svelte.ts';
import { preview } from '../../plane/pointHandle.svelte.ts';
import { buildLayout } from './layout.ts';
import { stage } from './stage.svelte.ts';
import { circleUi } from './ui.svelte.ts';

class CircleView {
  #memo = { b: -1 };
  layout = $derived(
    buildLayout({
      ang: point.ang,
      hit: point.hit,
      dotR: point.dotR,
      tail: point.tail,
      revealed: stage.now.revealed,
      mirror: circleUi.mirror,
      mirrorOnly: stage.now.mirrorOnly,
      showCoords: stage.now.coords,
      slopeOpen: circleUi.slopeOpen,
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
  hintAt = $derived(stage.now.hinting ? preview.deg : null);
}
export const circleView = new CircleView();
