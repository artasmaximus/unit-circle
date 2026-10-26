// The arc that shows an angle turning from the positive x-axis to `to`, at radius `r` from the
// origin, with an optional open arrowhead whose tip sits on the end. By default it turns the short
// way (clockwise for a negative angle); `ccw` makes it always turn counterclockwise, the long way
// round if it has to.
//
// Part keys: `${key}` for the arc and `${key}:head` for the arrowhead.
import type { Ctx, Drawn, Look, Timing } from './figure.ts';
import { polar, timing } from './figure.ts';

export type AngleArcProps = Look &
  Timing & {
    /** Where it ends, in radians. */
    to: number;
    r: number;
    ccw?: boolean;
    /** The arrowhead, left off on arcs shorter than `min` radians. */
    head?: Timing & { min: number };
  };

export function AngleArc(key: string, p: AngleArcProps, ctx: Ctx): Drawn {
  const { sw } = ctx,
    color = p.color ?? 'var(--fg)',
    width = (p.width ?? 1) * sw,
    [ax, ay] = polar(p.to, p.r);
  const turn = p.ccw ? ((p.to % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) : p.to,
    large = Math.abs(turn) > Math.PI ? 1 : 0,
    sweep = turn >= 0 ? 0 : 1;
  const marks: Drawn['marks'] = [
    {
      kind: 'path',
      key,
      z: p.z,
      d: `M ${p.r} 0 A ${p.r} ${p.r} 0 ${large} ${sweep} ${ax} ${ay}`,
      color,
      width,
      opacity: p.opacity,
      ...timing(p),
      enter: p.enter ?? 'draw',
    },
  ];
  if (p.head && Math.abs(p.to) >= p.head.min) {
    const sgn = p.to >= 0 ? 1 : -1,
      tx = -Math.sin(p.to) * sgn,
      ty = -Math.cos(p.to) * sgn,
      L = 4.6 * sw,
      W = 2.6 * sw;
    marks.push({
      kind: 'path',
      key: `${key}:head`,
      z: p.z,
      d: `M ${ax - tx * L - ty * W} ${ay - ty * L + tx * W} L ${ax} ${ay} L ${ax - tx * L + ty * W} ${ay - ty * L - tx * W}`,
      color,
      width,
      join: true,
      ...timing(p.head),
      enter: p.head.enter ?? 'fade',
    });
  }
  return { marks };
}
