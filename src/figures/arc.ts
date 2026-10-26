// An arc of a circle between two angles, with an optional label just outside its middle. It draws
// an angle (θ from the x-axis, a reference angle back to the axis) as well as any curved edge.
import type { Ctx, Drawn, Look, Pt, Timing } from './figure.ts';
import { dashOf, polar } from './figure.ts';
import { Label } from './label.ts';

export type ArcProps = Look &
  Timing & {
    /** Angles in radians, counterclockwise, `from` < `to`. */
    from: number;
    to: number;
    /** Radius in world units. */
    r: number;
    center?: Pt;
    /** Written past the arc's middle, `gap` stroke units out, in the arc's color. */
    label?: { tex: string; size: number; gap: number; delay?: number };
  };

/** The SVG path of an arc (counterclockwise from `a0` to `a1`, radians). */
export function arcPath(a0: number, a1: number, r: number, c: Pt = [0, 0]) {
  const [x0, y0] = polar(a0, r, c),
    [x1, y1] = polar(a1, r, c);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 0 ${x1} ${y1}`;
}

export function Arc(key: string, p: ArcProps, ctx: Ctx): Drawn {
  const color = p.color ?? 'var(--fg)';
  const marks: Drawn['marks'] = [
    {
      kind: 'path',
      key,
      z: p.z,
      d: arcPath(p.from, p.to, p.r, p.center),
      color,
      width: (p.width ?? 1) * ctx.sw,
      dash: dashOf(p.dash, ctx.sw),
      round: p.round,
      opacity: p.opacity,
      enter: p.enter ?? 'draw',
      delay: p.delay,
      dur: p.dur,
    },
  ];
  if (p.label) {
    const at = polar((p.from + p.to) / 2, p.r + p.label.gap * ctx.sw, p.center);
    const l = Label(
      `${key}:label`,
      {
        tex: p.label.tex,
        size: p.label.size,
        at,
        color,
        back: true,
        z: 9,
        enter: 'fade',
        delay: p.label.delay,
      },
      ctx,
    );
    marks.push(...l.marks);
  }
  return { marks };
}
