// The arc that shows an angle turning from `from` (the positive x-axis unless given) to `to`, at
// radius `r` from the origin, with an optional open arrowhead whose tip sits on the end. By default
// it turns the short way (clockwise when `to` is behind `from`); `ccw` makes it always turn
// counterclockwise, the long way round if it has to.
//
// Part keys: `${key}` for the arc and `${key}:head` for the arrowhead.
import type { Ctx, Drawn, Look, Pt, Timing } from './figure.ts';
import { polar, timing } from './figure.ts';

export type AngleArcProps = Look &
  Timing & {
    /** Where it starts and ends, in radians. */
    from?: number;
    to: number;
    r: number;
    ccw?: boolean;
    /** Only this leading share (0 to 1) of the arc is drawn, for a color washing along it. */
    part?: number;
    /** For a `pop`: the radius it swells out from, so it grows out of a smaller arc. */
    swell?: number;
    /** The arrowhead, left off on arcs that turn less than `min` (or at least `max`) radians. */
    head?: Timing & { min: number; max?: number; color?: string; round?: boolean };
  };

const TAU = 2 * Math.PI;
/** An angle difference brought into (−π, π]. */
const wrap = (x: number) => x - TAU * Math.ceil((x - Math.PI) / TAU);

export function AngleArc(key: string, p: AngleArcProps, ctx: Ctx): Drawn {
  const { sw } = ctx,
    from = p.from ?? 0,
    color = p.color ?? 'var(--fg)',
    width = (p.width ?? 1) * sw;
  const turn = p.ccw ? (((p.to - from) % TAU) + TAU) % TAU : wrap(p.to - from),
    large = Math.abs(turn) > Math.PI ? 1 : 0,
    sweep = turn >= 0 ? 0 : 1;
  const path = (r: number) => {
    const [x0, y0] = polar(from, r),
      [x1, y1] = polar(p.to, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`;
  };
  const swell = p.swell;
  const marks: Drawn['marks'] = [
    {
      kind: 'path',
      key,
      z: p.z,
      d: path(p.r),
      at: swell === undefined ? undefined : (e: number) => path(swell + (p.r - swell) * e),
      color,
      width,
      round: p.round,
      opacity: p.opacity,
      part: p.part,
      ...timing(p),
      enter: p.enter ?? 'draw',
    },
  ];
  const h = p.head;
  if (h && Math.abs(turn) >= h.min && (h.max === undefined || Math.abs(turn) < h.max)) {
    const [ax, ay]: Pt = polar(p.to, p.r),
      sgn = turn >= 0 ? 1 : -1,
      tx = -Math.sin(p.to) * sgn,
      ty = -Math.cos(p.to) * sgn,
      L = 4.6 * sw,
      W = 2.6 * sw;
    marks.push({
      kind: 'path',
      key: `${key}:head`,
      z: p.z,
      d: `M ${ax - tx * L - ty * W} ${ay - ty * L + tx * W} L ${ax} ${ay} L ${ax - tx * L + ty * W} ${ay - ty * L - tx * W}`,
      color: h.color ?? color,
      width,
      round: h.round,
      join: true,
      ...timing(h),
      enter: h.enter ?? 'fade',
    });
  }
  return { marks };
}
