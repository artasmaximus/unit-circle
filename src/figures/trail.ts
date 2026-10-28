// A fading tail along a circle behind a moving point: `steps` short pieces from `length` radians
// back up to the point at `head`, each thicker and more opaque than the last, each in the color
// `color` gives for its angle. It is drawn as one mark, however many pieces. It follows the point
// frame by frame, so unless told otherwise it takes no time to arrive or leave.
import type { Ctx, Drawn, Timing } from './figure.ts';
import { FOLLOW, polar, timing } from './figure.ts';

export type TrailProps = Timing & {
  r: number;
  /** Where the point is, and how far back (signed, radians) the tail reaches. */
  head: number;
  length: number;
  /** How many pieces (28). */
  steps?: number;
  color: (a: number) => string;
  z?: number;
};

/** The fade of a trail's pieces, which depends only on how many there are. */
const ramps = new Map<number, { u: number; opacity: number }[]>();
const rampOf = (steps: number) => {
  let ramp = ramps.get(steps);
  if (!ramp)
    ramps.set(
      steps,
      (ramp = Array.from({ length: steps }, (_, i) => {
        const u = (i + 1) / steps;
        return { u, opacity: 0.9 * Math.pow(u, 1.3) };
      })),
    );
  return ramp;
};

export function Trail(key: string, p: TrailProps, ctx: Ctx): Drawn {
  if (!p.length) return { marks: [] };
  const steps = p.steps ?? 28,
    ramp = rampOf(steps);
  let [x1, y1] = polar(p.head - p.length, p.r);
  const segs = ramp.map(({ u, opacity }) => {
    const a1 = p.head - p.length * (1 - u),
      [x2, y2] = polar(a1, p.r),
      seg = { x1, y1, x2, y2, color: p.color(a1), width: (0.8 + 3.4 * u) * ctx.sw, opacity };
    [x1, y1] = [x2, y2];
    return seg;
  });
  return { marks: [{ kind: 'segments', key, z: p.z, segs, ...timing({ ...FOLLOW, ...p }) }] };
}
