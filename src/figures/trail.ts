// A fading tail along a circle behind a moving point: `steps` short pieces from `length` radians
// back up to the point at `head`, each thicker and more opaque than the last, each in the color
// `color` gives for its angle. It is drawn as one mark, however many pieces.
import type { Ctx, Drawn, Timing } from './figure.ts';
import { timing } from './figure.ts';

export type TrailProps = Timing & {
  r: number;
  /** Where the point is, and how far back (signed, radians) the tail reaches. */
  head: number;
  length: number;
  steps: number;
  color: (a: number) => string;
  z?: number;
};

export function Trail(key: string, p: TrailProps, ctx: Ctx): Drawn {
  if (!p.length) return { marks: [] };
  const segs = Array.from({ length: p.steps }, (_, i) => {
    const u0 = i / p.steps,
      u1 = (i + 1) / p.steps,
      a0 = p.head - p.length * (1 - u0),
      a1 = p.head - p.length * (1 - u1);
    return {
      x1: p.r * Math.cos(a0),
      y1: -p.r * Math.sin(a0),
      x2: p.r * Math.cos(a1),
      y2: -p.r * Math.sin(a1),
      color: p.color(a1),
      width: (0.8 + 3.4 * u1) * ctx.sw,
      opacity: 0.9 * Math.pow(u1, 1.3),
    };
  });
  return { marks: [{ kind: 'segments', key, z: p.z, segs, ...timing(p) }] };
}
