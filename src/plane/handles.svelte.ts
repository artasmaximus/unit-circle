// Handles: the parts of the plane a pointer can grab. A handle says where it can be hit and what
// hovering, dragging, letting go and the arrow keys do. Layers register the handles they offer
// while they are mounted; the plane only finds the nearest one under the pointer and passes it the
// events, so it knows nothing about any topic.
import type { Pt } from '../figures/figure.ts';

/**
 * Where a handle can be hit, in world units: near a circle around the origin, near one of the
 * axes (out to `r` along it), or near a point.
 */
export type Hit =
  | { kind: 'ring'; r: number }
  | { kind: 'axis'; axis: 'x' | 'y'; r: number }
  | { kind: 'dot'; at: Pt; r: number };

/** How finely a handle should read the pointer at the current zoom. */
export type Aim = {
  /** How close (degrees) an angle must be to a special angle to snap to it. */
  angleRange: number;
  /** How close a value must be to a special value to snap to it. */
  valueRange: number;
  /** Rounds an angle to the step the zoom allows. */
  grain: (deg: number) => number;
};

export type Handle = {
  key: string;
  hit: Hit;
  /** The pointer is over it (with where), or has left it (null). Mouse only. */
  hover?(at: Pt | null, aim: Aim): void;
  /** A press on it; `drag` follows for the press itself and every move. */
  press?(): void;
  drag(at: Pt, aim: Aim): void;
  release?(): void;
  /** An arrow key: `dir` is ±1, `big` with Shift. */
  nudge?(dir: 1 | -1, big: boolean): void;
};

const sources = new Set<() => Handle[]>();

/**
 * Offer handles for as long as the calling component is mounted. `get` is read at every pointer
 * event, so it can depend on state (return none while the topic is not showing).
 */
export function useHandles(get: () => Handle[]) {
  $effect(() => {
    sources.add(get);
    return () => {
      sources.delete(get);
    };
  });
}

const all = () => [...sources].flatMap((get) => get());

/** How far (px) the pointer is from a handle's hit area, or null when it is outside `band`. */
function distance(h: Hit, at: Pt, k: number, band: number): number | null {
  const [x, y] = at;
  if (h.kind === 'ring') {
    const d = Math.abs(Math.hypot(x, y) - h.r) * k;
    return d <= band ? d : null;
  }
  if (h.kind === 'axis') {
    const across = Math.abs(h.axis === 'y' ? x : y) * k,
      along = Math.abs(h.axis === 'y' ? y : x) * k;
    return across <= band && along <= h.r * k + band ? across : null;
  }
  const d = Math.hypot(x - h.at[0], y - h.at[1]) * k;
  return d <= h.r * k + band ? d : null;
}

/** The handle nearest the pointer (`at` in world units, `k` px per world unit), if any. */
export function nearest(at: Pt, k: number, band: number): Handle | null {
  let best: Handle | null = null,
    bestD = Infinity;
  for (const h of all()) {
    const d = distance(h.hit, at, k, band);
    if (d !== null && d < bestD) {
      best = h;
      bestD = d;
    }
  }
  return best;
}

/** Pass an arrow key to the first handle that takes one; false when none does. */
export function nudge(dir: 1 | -1, big: boolean): boolean {
  const h = all().find((h) => h.nudge);
  h?.nudge!(dir, big);
  return !!h;
}
