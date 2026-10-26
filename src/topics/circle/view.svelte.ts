// The unit circle's view of the plane for the current frame: its layout (where everything sits,
// see layout.ts), and the faded preview of where a press on the ring would put the point. The
// layer draws from it, and the floating chips read its layout.
import { angleTex } from '../../core/angles.ts';
import { revealed, ui } from '../../core/app.svelte.ts';
import { camera, S } from '../../core/camera.svelte.ts';
import { point } from '../../core/point.svelte.ts';
import { progress } from '../../core/progress.svelte.ts';
import { SPECIAL, colorOf, norm, rad } from '../../core/trig.ts';
import { ringHover } from '../../plane/pointHandle.svelte.ts';
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
   * The preview sits exactly where the pointer aims near the ring (see
   * plane/pointHandle.svelte.ts); its label rides out to the ring label's own spot on a snap
   * angle, and takes that label's place there. None while dragging, or where the point already is.
   */
  ghost = $derived.by(() => {
    const g = ringHover.deg;
    if (g === null || ringHover.held || Math.abs(g - point.deg) < 0.5) return null;
    const a = rad(g),
      special = SPECIAL.includes(g);
    return {
      x: S * Math.cos(a),
      y: -S * Math.sin(a),
      deg: g,
      special,
      tex: angleTex(norm(g), progress.unit, camera.thetaDecimals),
      color: special && revealed() ? colorOf(g) : 'var(--muted)',
    };
  });
}
export const circleView = new CircleView();
