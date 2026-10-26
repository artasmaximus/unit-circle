// A filled slice of a circle between two angles, from its center out to radius `r`.
import type { Ctx, Drawn, Pt, Timing } from './figure.ts';
import { polar } from './figure.ts';

export type SectorProps = Timing & {
  /** Angles in radians, counterclockwise. */
  from: number;
  to: number;
  r: number;
  fill: string;
  center?: Pt;
  opacity?: number;
  z?: number;
};

export function Sector(key: string, p: SectorProps, _ctx: Ctx): Drawn {
  const c = p.center ?? [0, 0],
    [x0, y0] = polar(p.from, p.r, c),
    [x1, y1] = polar(p.to, p.r, c),
    large = p.to - p.from > Math.PI ? 1 : 0;
  return {
    marks: [
      {
        kind: 'path',
        key,
        z: p.z,
        d: `M ${c[0]} ${c[1]} L ${x0} ${y0} A ${p.r} ${p.r} 0 ${large} 0 ${x1} ${y1} Z`,
        color: 'none',
        width: 0,
        fill: p.fill,
        opacity: p.opacity,
        enter: p.enter,
        delay: p.delay,
        dur: p.dur,
      },
    ],
  };
}
