// Typeset math placed on the plane, anchored at a point.
import { texRect, type Rect } from '../core/tex.svelte.ts';
import type { Label as LabelData, LabelMark } from '../plane/marks.ts';
import type { Ctx, Drawn, Pt, Timing } from './figure.ts';

export type LabelProps = Timing & {
  tex: string;
  /** Font size before the zoom's label scale. */
  size: number;
  at: Pt;
  color: string;
  /** Which point of the label's box sits on `at`: [0, 0] is its top left, [0.5, 0.5] its middle. */
  anchor?: Pt;
  /** A soft panel behind it, so it reads over lines and the grid. */
  back?: boolean;
  z?: number;
};

/** The label's data alone, for callers that need its box before deciding where it goes. */
export function labelData(p: LabelProps, ctx: Ctx): LabelData | null {
  const size = p.size * ctx.lb,
    [ax, ay] = p.anchor ?? [0.5, 0.5];
  const rect = texRect(p.tex, size, p.at[0], p.at[1], ax, ay);
  return rect && { latex: p.tex, size, rect, color: p.color };
}

/** `rect` is the label's box, or null while MathJax is not ready (and then nothing is drawn). */
export function Label(key: string, p: LabelProps, ctx: Ctx): Drawn<{ rect: Rect | null }> {
  const label = labelData(p, ctx);
  if (!label) return { marks: [], rect: null };
  const mark: LabelMark = {
    kind: 'label',
    key,
    label,
    z: p.z,
    back: p.back ? ctx.lb : undefined,
    enter: p.enter,
    delay: p.delay,
    dur: p.dur,
  };
  return { marks: [mark], rect: label.rect };
}
