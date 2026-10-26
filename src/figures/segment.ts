// A straight line between two points.
import type { Ctx, Drawn, Look, Pt, Timing } from './figure.ts';
import { dashOf, timing } from './figure.ts';

export type SegmentProps = Look &
  Timing & {
    from: Pt;
    to: Pt;
    /** Where the dash pattern starts, in world units (a moving offset makes the dashes march). */
    dashOffset?: number;
  };

export function Segment(key: string, p: SegmentProps, ctx: Ctx): Drawn {
  return {
    marks: [
      {
        kind: 'line',
        key,
        z: p.z,
        x1: p.from[0],
        y1: p.from[1],
        x2: p.to[0],
        y2: p.to[1],
        color: p.color ?? 'var(--fg)',
        width: (p.width ?? 1) * ctx.sw,
        dash: dashOf(p.dash, ctx.sw),
        offset: p.dashOffset,
        round: p.round,
        opacity: p.opacity,
        ...timing(p),
      },
    ],
  };
}
