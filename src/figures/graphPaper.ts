// Graph paper over a window of the plane: a field of dots, minor lines every `step` and major ones
// every `major` steps, the two axes, and ticks on the axes out to `ticks` steps (full ticks on the
// steps, short ones halfway). Lines of one kind are one path, so it costs the same however far
// you zoom out, and line widths are on-screen pixels whatever the zoom.
//
// Part keys: `${key}:dots`, `${key}:minor`, `${key}:major`, `${key}:axes`, `${key}:ticks` and
// `${key}:ticks:half`.
import type { Ctx, Drawn } from './figure.ts';

export type GraphPaperProps = {
  /** The window to cover, in world units. */
  view: { x: number; y: number; w: number; h: number };
  step: number;
  major: number;
  ticks: number;
  /** Dot radius in world units, and the width of a line in px. */
  dotR: number;
  px: number;
};

export function GraphPaper(key: string, p: GraphPaperProps, _ctx: Ctx): Drawn {
  const { view: v, step, px: w } = p;
  const range = (lo: number, hi: number) => {
    const out: number[] = [];
    for (let i = Math.floor(lo / step); i <= Math.ceil(hi / step); i++) out.push(i);
    return out;
  };
  const cols = range(v.x, v.x + v.w),
    rows = range(v.y, v.y + v.h);
  const lines = (major: boolean) => {
    let d = '';
    for (const i of cols)
      if (i && (i % p.major === 0) === major) d += `M${i * step} ${v.y}V${v.y + v.h}`;
    for (const i of rows)
      if (i && (i % p.major === 0) === major) d += `M${v.x} ${i * step}H${v.x + v.w}`;
    return d;
  };
  let ticks = '',
    half = '';
  for (let i = -p.ticks; i <= p.ticks; i++) {
    if (i) ticks += `M${i * step} -3.5V3.5M-3.5 ${i * step}H3.5`;
    if (i < p.ticks) half += `M${(i + 0.5) * step} -2.2V2.2M-2.2 ${(i + 0.5) * step}H2.2`;
  }
  const fixed = { kind: 'path', fixed: true, enter: 'fade', dur: 600 } as const;
  return {
    marks: [
      {
        kind: 'dotgrid',
        key: `${key}:dots`,
        z: 0,
        step,
        r: p.dotR,
        color: 'var(--muted)',
        opacity: 0.3,
        x: v.x,
        y: v.y,
        w: v.w,
        h: v.h,
        enter: 'fade',
        dur: 600,
      },
      {
        ...fixed,
        key: `${key}:minor`,
        z: 1,
        d: lines(false),
        color: 'var(--line)',
        width: 0.75 * w,
        opacity: 0.55,
      },
      {
        ...fixed,
        key: `${key}:major`,
        z: 1,
        d: lines(true),
        color: 'var(--line)',
        width: 0.75 * w,
      },
      {
        ...fixed,
        key: `${key}:axes`,
        z: 2,
        d: `M${v.x} 0H${v.x + v.w}M0 ${v.y}V${v.y + v.h}`,
        color: 'var(--muted)',
        width: 1 * w,
        opacity: 0.45,
      },
      { ...fixed, key: `${key}:ticks`, z: 2, d: ticks, color: 'var(--muted)', width: 1 * w },
      { ...fixed, key: `${key}:ticks:half`, z: 2, d: half, color: 'var(--muted)', width: 1 * w },
    ],
  };
}
