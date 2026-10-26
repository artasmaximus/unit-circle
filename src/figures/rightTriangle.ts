// A right triangle: a soft fill, the right-angle mark, and for each side an optional line and a
// brace on its outer side. Tick marks can say that the two legs are equal.
//
// Vertices: `start` is the acute corner the base leaves from, `corner` is the right angle, and
// `apex` is the top of the upright leg. Sides are `base` (start → corner), `upright` (corner →
// apex) and `hyp` (start → apex). Part keys add the side's name: `tri:upright`, `tri:base:brace`.
import type { Ctx, Drawn, Look, Pt, Timing } from './figure.ts';
import { Brace } from './brace.ts';
import { Polygon } from './polygon.ts';
import { Segment } from './segment.ts';

export type SideName = 'base' | 'upright' | 'hyp';
export type Side = {
  /** Draw the side itself. */
  line?: Look & Timing;
  /** A brace on the side's outer edge (away from the third vertex). */
  brace?: Look & Timing;
};

export type RightTriangleProps = {
  start: Pt;
  corner: Pt;
  apex: Pt;
  /** The soft fill inside it. */
  fill?: { color: string; opacity: number; z?: number } & Timing;
  /**
   * The small square at the right angle, `size` stroke units, left off when a leg is shorter than
   * `minLeg` (world units).
   */
  rightAngle?: Look & Timing & { size: number; minLeg: number };
  sides?: Partial<Record<SideName, Side>>;
  /**
   * A tick across the middle of each leg, saying the legs are equal. The upright's tick follows the
   * base's by 100 ms.
   */
  equal?: Look & Timing & { size: number };
};

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const unit = ([x, y]: Pt): Pt => {
  const L = Math.hypot(x, y);
  return L ? [x / L, y / L] : [0, 0];
};
/** The unit normal of a→b that points away from `other`. */
const outward = (a: Pt, b: Pt, other: Pt): Pt => {
  const [ux, uy] = unit(sub(b, a)),
    n: Pt = [-uy, ux],
    [ox, oy] = sub(other, a);
  return n[0] * ox + n[1] * oy > 0 ? [-n[0], -n[1]] : n;
};
/**
 * A unit normal of a→b, turned so its larger component is positive (ticks always draw the same
 * way).
 */
const across = (a: Pt, b: Pt): Pt => {
  const [ux, uy] = unit(sub(b, a)),
    n: Pt = [-uy, ux];
  return Math.abs(n[0]) >= Math.abs(n[1])
    ? n[0] < 0
      ? [-n[0], -n[1]]
      : n
    : n[1] < 0
      ? [-n[0], -n[1]]
      : n;
};

/**
 * `reach` is how far each side's brace goes out from it (0 for none), for placing labels past it.
 */
export function RightTriangle(
  key: string,
  p: RightTriangleProps,
  ctx: Ctx,
): Drawn<{ reach: Record<SideName, number> }> {
  const { start, corner, apex } = p,
    marks: Drawn['marks'] = [],
    reach: Record<SideName, number> = { base: 0, upright: 0, hyp: 0 };
  const ends: Record<SideName, [Pt, Pt, Pt]> = {
    base: [start, corner, apex],
    upright: [corner, apex, start],
    hyp: [start, apex, corner],
  };

  if (p.fill) {
    const { color, ...rest } = p.fill;
    marks.push(
      ...Polygon(key, { points: [start, corner, apex], noStroke: true, fill: color, ...rest }, ctx)
        .marks,
    );
  }
  if (p.rightAngle) {
    const { size, minLeg, ...look } = p.rightAngle;
    const toStart = sub(start, corner),
      toApex = sub(apex, corner);
    if (Math.hypot(...toStart) > minLeg && Math.hypot(...toApex) > minLeg) {
      const q = size * ctx.sw,
        [bx, by] = unit(toStart),
        [ux, uy] = unit(toApex),
        [cx, cy] = corner;
      const points: Pt[] = [
        [cx + bx * q, cy + by * q],
        [cx + bx * q + ux * q, cy + by * q + uy * q],
        [cx + ux * q, cy + uy * q],
      ];
      marks.push(...Polygon(`${key}:right`, { points, open: true, ...look }, ctx).marks);
    }
  }
  for (const name of ['upright', 'base', 'hyp'] as const) {
    const side = p.sides?.[name];
    if (!side?.line) continue;
    const [a, b] = ends[name];
    marks.push(...Segment(`${key}:${name}`, { from: a, to: b, ...side.line }, ctx).marks);
  }
  if (p.equal) {
    const { size, delay = 0, ...look } = p.equal,
      t = size * ctx.sw;
    (['base', 'upright'] as const).forEach((name, k) => {
      const [a, b] = ends[name],
        [nx, ny] = across(a, b),
        m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      marks.push(
        ...Segment(
          `${key}:${name}:tick`,
          {
            from: [m[0] - nx * t, m[1] - ny * t],
            to: [m[0] + nx * t, m[1] + ny * t],
            ...look,
            delay: delay + 100 * k,
          },
          ctx,
        ).marks,
      );
    });
  }
  for (const name of ['upright', 'base', 'hyp'] as const) {
    const side = p.sides?.[name];
    if (!side?.brace) continue;
    const [a, b, other] = ends[name],
      b2 = Brace(
        `${key}:${name}:brace`,
        { from: a, to: b, side: outward(a, b, other), ...side.brace },
        ctx,
      );
    marks.push(...b2.marks);
    reach[name] = b2.reach;
  }
  return { marks, reach };
}
