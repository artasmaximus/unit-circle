// How each of the Inverse trig Guide's steps lays out the plane: which function, where the control
// or the free point starts, whether the range is shaded. Plain data, read by the Guide (to move
// things into place) and by the stage (to say what shows).
import type { InvFn } from './math.ts';

/**
 * How a step lays out the plane. `probe` puts the free point at an angle (and leaves the control
 * out); otherwise the control shows for `fn`, starting at `angle`. A drag step is checked against
 * whichever of the two it moves.
 */
export type Setup = { fn: InvFn; band: boolean; probe?: number; given?: number; angle?: number };
export const SETUP: Record<string, Setup> = {
  'two-angles': { fn: 'asin', band: false, probe: 30 },
  ranges: { fn: 'asin', band: true, angle: 30 },
  arcsin: { fn: 'asin', band: true, angle: 30 },
  arccos: { fn: 'acos', band: true, angle: 60 },
  arctan: { fn: 'atan', band: true, angle: 0 },
  trap: { fn: 'asin', band: true, probe: 150, given: 150 },
};
