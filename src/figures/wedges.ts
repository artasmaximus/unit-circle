// An angle cut into equal wedges from angle 0: `n` pieces of `step` radians each, kept a constant
// gap apart (and pulled in from the axis, the last edge and the rim by `edge`). Wedges go by slot,
// so moving from one angle to another slides, grows, adds or removes pieces rather than redrawing
// them. Each piece can carry a small label.
//
// Part keys: `${key}:${j}` for piece j (from 0) and `${key}:label:${j}` for its label.
import type { Ctx, Drawn } from './figure.ts';
import { polar } from './figure.ts';
import { Label } from './label.ts';

export type WedgesProps = {
  n: number;
  step: number;
  r: number;
  fill: string;
  opacity: number;
  /** The gap between pieces, and from the axis, last edge and rim (stroke units). */
  gap: number;
  edge: number;
  /** A label in each piece, at `at` × r from the center. */
  labels?: { tex: string; size: number; at: number; color: string };
};

export function Wedges(key: string, p: WedgesProps, ctx: Ctx): Drawn {
  const { sw } = ctx,
    marks: Drawn['marks'] = [];
  for (let j = 0; j < p.n; j++) {
    marks.push({
      kind: 'slice',
      key: `${key}:${j}`,
      z: 2,
      a0: j * p.step,
      a1: (j + 1) * p.step,
      r: p.r,
      gap: p.gap * sw,
      edge0: j === 0 ? p.edge * sw : undefined,
      edge1: j === p.n - 1 ? p.edge * sw : undefined,
      rim: p.edge * sw,
      fill: p.fill,
      opacity: p.opacity,
      enter: 'fade',
      dur: 200,
      exitDur: 200,
    });
    if (p.labels) {
      const l = p.labels;
      marks.push(
        ...Label(
          `${key}:label:${j}`,
          {
            tex: l.tex,
            size: l.size,
            at: polar((j + 0.5) * p.step, p.r * l.at),
            color: l.color,
            z: 9,
            enter: 'fade',
            delay: 220,
            dur: 200,
            exitDur: 120,
          },
          ctx,
        ).marks,
      );
    }
  }
  return { marks };
}
