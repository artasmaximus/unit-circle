// The Radians scene, built once and shared by the layer's two mounts (under the ring's dots, and
// on top of them), each of which keeps its own half.
import { camera } from '../../core/camera.svelte.ts';
import { radians } from './state.svelte.ts';
import { stage } from './stage.svelte.ts';
import { radiansScene } from './scene.ts';
import { point } from '../../core/point.svelte.ts';
import { ui } from '../../core/app.svelte.ts';

const marks = $derived(
  radiansScene({
    active: ui.topic === 'radians',
    features: stage.now.features,
    ang: point.ang,
    tail: point.tail,
    plays: radians.plays,
    target: point.target,
    sw: camera.stroke,
    lb: camera.labelBoost,
  }),
);

/** The part drawn beneath the ring's dots (the shading), or the rest, which sits on top of them. */
export const radiansMarks = (under: boolean) => marks.filter((m) => (m.z ?? 5) <= 3 === under);
