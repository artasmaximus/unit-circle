// The Radians scene, built once and shared by the layer's two mounts (under the ring's dots, and
// on top of them), each of which keeps its own half.
import { camera } from '../../core/camera.svelte.ts';
import { radians } from './state.svelte.ts';
import { stage } from './stage.svelte.ts';
import { radiansScene } from './scene.ts';
import { point } from '../../core/point.svelte.ts';
import { ui } from '../../core/app.svelte.ts';
import { NO_MARKS } from '../../plane/marks.ts';

const halves = $derived.by(() => {
  if (ui.topic !== 'radians') return { under: NO_MARKS, over: NO_MARKS };
  const all = radiansScene({
    active: true,
    features: stage.now.features,
    ang: point.ang,
    tail: point.tail,
    plays: radians.plays,
    target: point.target,
    sw: camera.stroke,
    lb: camera.labelBoost,
  });
  return {
    under: all.filter((m) => (m.z ?? 5) <= 3),
    over: all.filter((m) => (m.z ?? 5) > 3),
  };
});

/** The part drawn beneath the ring's dots (the shading), or the rest, which sits on top of them. */
export const radiansMarks = (under: boolean) => (under ? halves.under : halves.over);
