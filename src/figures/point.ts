// A dot at a point, optionally ringed.
import type { Ctx, Drawn, Pt, Timing } from './figure.ts';
import { timing } from './figure.ts';

export type PointProps = Timing & {
  at: Pt;
  /** Radius in stroke units. */
  r: number;
  fill: string;
  /** A ring around it, `width` stroke units wide. */
  stroke?: string;
  width?: number;
  opacity?: number;
  z?: number;
};

export function Point(key: string, p: PointProps, ctx: Ctx): Drawn {
  return {
    marks: [
      {
        kind: 'dot',
        key,
        z: p.z,
        x: p.at[0],
        y: p.at[1],
        r: p.r * ctx.sw,
        fill: p.fill,
        stroke: p.stroke,
        width: p.width === undefined ? undefined : p.width * ctx.sw,
        opacity: p.opacity,
        ...timing(p),
        enter: p.enter ?? 'pop',
      },
    ],
  };
}
