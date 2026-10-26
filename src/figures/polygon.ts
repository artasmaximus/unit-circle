// A shape through a list of points: closed and optionally filled (a triangle), or open (a
// right-angle mark).
import type { Ctx, Drawn, Look, Pt, Timing } from './figure.ts';
import { dashOf, timing } from './figure.ts';

export type PolygonProps = Look &
  Timing & {
    points: Pt[];
    /** Closed by default. */
    open?: boolean;
    fill?: string;
    /** No outline, only the fill. */
    noStroke?: boolean;
  };

export function Polygon(key: string, p: PolygonProps, ctx: Ctx): Drawn {
  const d = `M ${p.points.map(([x, y]) => `${x} ${y}`).join(' L ')}${p.open ? '' : ' Z'}`;
  return {
    marks: [
      {
        kind: 'path',
        key,
        z: p.z,
        d,
        color: p.noStroke ? 'none' : (p.color ?? 'var(--fg)'),
        width: p.noStroke ? 0 : (p.width ?? 1) * ctx.sw,
        dash: dashOf(p.dash, ctx.sw),
        round: p.round,
        fill: p.fill,
        opacity: p.opacity,
        ...timing(p),
      },
    ],
  };
}
