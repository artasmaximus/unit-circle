// A fat tick across an axis: marks a chosen value on a number line, standing out from the thin
// ticks of the marked values. `axis` is the axis it sits on, so it runs across it.
import type { Ctx, Drawn, Pt, Timing } from './figure.ts';
import { timing } from './figure.ts';
import { Segment } from './segment.ts';

export type TickProps = Timing & {
  at: Pt;
  axis: 'x' | 'y';
  color: string;
  /** Half its length, in stroke units. */
  half?: number;
  /** Its thickness, in stroke units. */
  width?: number;
  opacity?: number;
  z?: number;
};

export function Tick(key: string, p: TickProps, ctx: Ctx): Drawn {
  const h = (p.half ?? 6.5) * ctx.sw,
    [x, y] = p.at;
  return Segment(
    key,
    {
      from: p.axis === 'y' ? [x - h, y] : [x, y - h],
      to: p.axis === 'y' ? [x + h, y] : [x, y + h],
      color: p.color,
      width: p.width ?? 5,
      round: true,
      opacity: p.opacity,
      z: p.z,
      ...timing(p),
      enter: p.enter ?? 'draw',
    },
    ctx,
  );
}
