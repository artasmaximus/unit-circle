// A number line along one of the plane's axes, from −r to r, with a dot and a small label at each
// marked value. The labels sit just left of a vertical line and just below a horizontal one.
//
// Part keys: `${key}` for the line, `${key}:tick:${k}` for dot k and `${key}:tick:label:${k}` for
// its label.
import type { Verb } from '../plane/marks.ts';
import type { Ctx, Drawn, Pt } from './figure.ts';
import { Label } from './label.ts';
import { Point } from './point.ts';
import { Segment } from './segment.ts';
import { DUR, STAGGER, after } from '../core/tuning.ts';

export type NumberLineProps = {
  axis: 'x' | 'y';
  /** World units from the middle to each end; a value v sits at v × r. */
  r: number;
  /** The marked values, each with its label as LaTeX. */
  values: readonly (readonly [number, string])[];
  color: string;
  /** How the line leaves, when not drawn back in. */
  exit?: Verb;
  /** How long the ticks take to leave (ms), when not the default. */
  tickExitDur?: number;
};

export function NumberLine(key: string, p: NumberLineProps, ctx: Ctx): Drawn {
  const y = p.axis === 'y',
    end = (v: number): Pt => (y ? [0, -v * p.r] : [v * p.r, 0]);
  const marks: Drawn['marks'] = [
    ...Segment(
      key,
      {
        from: end(y ? 1 : -1),
        to: end(y ? -1 : 1),
        color: p.color,
        width: 1.5,
        opacity: 0.55,
        z: 2,
        enter: 'draw',
        dur: DUR.draw,
        exit: p.exit,
      },
      ctx,
    ).marks,
  ];
  p.values.forEach(([v, tex], k) => {
    const [x, yy] = end(v);
    marks.push(
      ...Point(
        `${key}:tick:${k}`,
        {
          at: [x, yy],
          r: 2.2,
          fill: p.color,
          opacity: 0.8,
          z: 3,
          delay: after(1) + STAGGER.ticks * k,
          dur: DUR.quick,
          exitDur: p.tickExitDur,
        },
        ctx,
      ).marks,
      ...Label(
        `${key}:tick:label:${k}`,
        {
          tex,
          size: 8.5,
          at: y ? [-7 * ctx.sw, yy] : [x, 8 * ctx.sw],
          anchor: y ? [1, 0.5] : [0.5, 0],
          color: 'var(--muted)',
          z: 3,
          enter: 'fade',
          delay: after(2) + STAGGER.ticks * k,
          exitDur: p.tickExitDur,
        },
        ctx,
      ).marks,
    );
  });
  return { marks };
}
