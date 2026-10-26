// The handle that turns the shared point by its ring: press near the circle and the point follows
// the pointer round, snapping to special angles; the arrow keys turn it by 1° (15° with Shift).
// Topics that move the point this way register it. While the pointer hovers near the ring it keeps
// the angle a press would pick, so a topic can draw a preview there.
import { S } from '../core/camera.svelte.ts';
import { point } from '../core/point.svelte.ts';
import { SPECIAL, snapDeg } from '../core/trig.ts';
import type { Pt } from '../figures/figure.ts';
import type { Handle } from './handles.svelte.ts';

/** The pointer's angle around the origin, in degrees. */
export const angleOf = ([x, y]: Pt) => (Math.atan2(-y, x) * 180) / Math.PI;

/** The snapped angle the pointer is aiming at near the ring (null when it is not), and whether the point is held. */
export const ringHover = $state<{ deg: number | null; held: boolean }>({ deg: null, held: false });

/**
 * The snap angle being aimed at, when a press there would move the point: the ring grows that dot,
 * and leaves its label to the preview.
 */
export const aim = {
  get deg() {
    const d = ringHover.deg;
    return d !== null && !ringHover.held && SPECIAL.includes(d) && Math.abs(d - point.deg) >= 0.5
      ? d
      : null;
  },
};

export const pointHandle: Handle = {
  key: 'point',
  hit: { kind: 'ring', r: S },
  hover: (at, a) => (ringHover.deg = at ? snapDeg(a.grain(angleOf(at)), a.angleRange) : null),
  press: () => (ringHover.held = true),
  drag: (at, a) => point.set(a.grain(angleOf(at)), false, a.angleRange),
  release: () => (ringHover.held = false),
  nudge: (dir, big) => point.set(point.deg + dir * (big ? 15 : 1), true),
};
