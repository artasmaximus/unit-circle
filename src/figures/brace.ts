// A curly brace beside a segment, saying "this whole length". It sits on the side the normal
// points to, and its tip points that way too.
import type { Ctx, Drawn, Look, Pt, Timing } from './figure.ts';

export type BraceProps = Look &
  Timing & {
    from: Pt;
    to: Pt;
    /** Which side it sits on: a unit vector away from the segment. */
    side: Pt;
    /** Shorter segments (in stroke units) get no brace. */
    minLen?: number;
  };

/**
 * The brace's geometry for segment (x1,y1)-(x2,y2), tip along the normal (nx,ny), or null when
 * the segment is shorter than `minLen` (world units). `sf` scales its depth and offset. The path
 * is drawn along the x-axis and placed by `transform`; `m + d` is how far out it reaches.
 */
export function braceShape(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  nx: number,
  ny: number,
  minLen: number,
  sf: number,
) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < minLen) return null;
  const ux = (x2 - x1) / L,
    uy = (y2 - y1) / L,
    d = Math.min(7 * sf, L / 6),
    m = 5 * sf,
    h = L / 2;
  return {
    d,
    m,
    path: `M 0 0 Q 0 ${-d / 2} ${d} ${-d / 2} H ${h - d} Q ${h} ${-d / 2} ${h} ${-d} Q ${h} ${-d / 2} ${h + d} ${-d / 2} H ${L - d} Q ${L} ${-d / 2} ${L} 0`,
    transform: `matrix(${ux} ${uy} ${-nx} ${-ny} ${x1 + nx * m} ${y1 + ny * m})`,
  };
}

/** `reach` is how far out from the segment the brace goes (0 when there is none). */
export function Brace(key: string, p: BraceProps, ctx: Ctx): Drawn<{ reach: number }> {
  const [x1, y1] = p.from,
    [x2, y2] = p.to,
    [nx, ny] = p.side;
  const b = braceShape(x1, y1, x2, y2, nx, ny, (p.minLen ?? 14) * ctx.sw, ctx.sw);
  if (!b) return { marks: [], reach: 0 };
  return {
    marks: [
      {
        kind: 'path',
        key,
        z: p.z,
        d: b.path,
        transform: b.transform,
        color: p.color ?? 'var(--fg)',
        width: (p.width ?? 1) * ctx.sw,
        round: true,
        join: true,
        symmetric: true,
        opacity: p.opacity,
        enter: p.enter ?? 'draw',
        delay: p.delay,
        dur: p.dur,
      },
    ],
    reach: b.m + b.d,
  };
}
