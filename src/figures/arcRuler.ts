// A ruler bent along a circle: a dot every `step` radians from angle 0, each numbered just inside
// the circle. Dots up to `upTo` are filled in, so the ruler counts how far an angle reaches. With
// `step` 1 the dots are one radius apart along the edge, which is what a radian is.
//
// The dots pop in one after another and leave in reverse. Part keys: `${key}:${k}` for dot k
// (from 1) and `${key}:label:${k}` for its number.
import type { Ctx, Drawn } from './figure.ts';
import { polar } from './figure.ts';
import { Label } from './label.ts';
import { Point } from './point.ts';

export type ArcRulerProps = {
  r: number;
  step: number;
  count: number;
  /** Dots at or below this angle (radians) are filled in. */
  upTo: number;
  color: string;
  /** Where the numbers sit, as a share of `r`. */
  labelAt: number;
  /** When the first dot arrives, and the gap before each next one (ms). */
  delay: number;
  every: number;
};

export function ArcRuler(key: string, p: ArcRulerProps, ctx: Ctx): Drawn {
  const marks: Drawn['marks'] = [];
  for (let k = 1; k <= p.count; k++) {
    const a = k * p.step,
      reached = p.upTo >= a - 1e-9,
      delay = p.delay + p.every * (k - 1);
    marks.push(
      ...Point(
        `${key}:${k}`,
        {
          at: polar(a, p.r),
          r: 4.2,
          fill: reached ? p.color : 'var(--bg)',
          stroke: p.color,
          width: 1.75,
          z: 6,
          delay,
          dur: 320,
          exitDelay: 40 * (p.count - k),
          exitDur: 160,
        },
        ctx,
      ).marks,
      ...Label(
        `${key}:label:${k}`,
        {
          tex: String(k),
          size: 10,
          at: polar(a, p.r * p.labelAt),
          color: p.color,
          opacity: reached ? 1 : 0.7,
          z: 8,
          enter: 'fade',
          delay: delay + 60,
          exitDur: 120,
        },
        ctx,
      ).marks,
    );
  }
  return { marks };
}
