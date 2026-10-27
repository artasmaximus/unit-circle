// A miss on the ring: a hollow dot where the point was left, and a dashed arc along the ring (the
// short way round) to where it should have been.
import type { Ctx, Drawn } from './figure.ts';
import { polar } from './figure.ts';
import { Arc } from './arc.ts';
import { Point } from './point.ts';
import { DUR, after } from '../core/tuning.ts';

export type MissProps = {
  /** Angles in radians. */
  from: number;
  to: number;
  /** The ring's radius in world units. */
  r: number;
  color?: string;
};

export function Miss(key: string, p: MissProps, ctx: Ctx): Drawn {
  const color = p.color ?? 'var(--bad)';
  const d = Math.atan2(Math.sin(p.to - p.from), Math.cos(p.to - p.from));
  const a0 = d > 0 ? p.from : p.from + d;
  return {
    marks: [
      ...Arc(
        `${key}:arc`,
        {
          from: a0,
          to: a0 + Math.abs(d),
          r: p.r,
          color,
          width: 2.5,
          dash: [4, 5],
          z: 3,
          delay: after(2),
          dur: DUR.draw,
        },
        ctx,
      ).marks,
      ...Point(
        `${key}:from`,
        {
          at: polar(p.from, p.r),
          r: 5.5,
          fill: 'var(--bg)',
          stroke: color,
          width: 2,
          z: 4,
          delay: after(1),
        },
        ctx,
      ).marks,
    ],
  };
}
