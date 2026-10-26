// The graph paper as keyed marks (see marks.ts): a field of dots, minor and major lines, the axes
// and their ticks. Lines of one kind are one path, so the cost is the same however far you zoom
// out. Widths are on-screen pixels, whatever the zoom.
import { S } from '../core/camera.svelte.ts';
import type { Mark } from './marks.ts';

export type GridInput = {
  /**
   * The viewport in world units, the zoom (px per world unit), the phone line-width boost, and
   * whether this is a wide screen.
   */
  view: { x: number; y: number; w: number; h: number };
  k: number;
  boost: number;
  wide: boolean;
};

const STEP = S / 5;
const range = (lo: number, hi: number) => {
  const out: number[] = [];
  for (let i = Math.floor(lo / STEP); i <= Math.ceil(hi / STEP); i++) out.push(i);
  return out;
};

export function gridScene(g: GridInput): Mark[] {
  const { view: v, boost } = g,
    cols = range(v.x, v.x + v.w),
    rows = range(v.y, v.y + v.h);
  const lines = (major: boolean) => {
    let d = '';
    for (const i of cols) if (i && (i % 5 === 0) === major) d += `M${i * STEP} ${v.y}V${v.y + v.h}`;
    for (const i of rows) if (i && (i % 5 === 0) === major) d += `M${v.x} ${i * STEP}H${v.x + v.w}`;
    return d;
  };
  // ticks on the axes inside the circle: full ones every 0.2, shorter ones between
  let ticks = '',
    half = '';
  for (const i of [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5])
    ticks += `M${i * STEP} -3.5V3.5M-3.5 ${i * STEP}H3.5`;
  for (const i of [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4])
    half += `M${(i + 0.5) * STEP} -2.2V2.2M-2.2 ${(i + 0.5) * STEP}H2.2`;
  const px = { fixed: true, enter: 'fade', dur: 600 } as const;
  return [
    {
      kind: 'dotgrid',
      key: 'grid:dots',
      z: 0,
      step: STEP,
      r: (g.wide ? 1 : 0.6) / g.k,
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
      kind: 'path',
      key: 'grid:minor',
      z: 1,
      d: lines(false),
      color: 'var(--line)',
      width: 0.75 * boost,
      opacity: 0.55,
      ...px,
    },
    {
      kind: 'path',
      key: 'grid:major',
      z: 1,
      d: lines(true),
      color: 'var(--line)',
      width: 0.75 * boost,
      ...px,
    },
    {
      kind: 'path',
      key: 'grid:axes',
      z: 2,
      d: `M${v.x} 0H${v.x + v.w}M0 ${v.y}V${v.y + v.h}`,
      color: 'var(--muted)',
      width: 1 * boost,
      opacity: 0.45,
      ...px,
    },
    {
      kind: 'path',
      key: 'grid:ticks',
      z: 2,
      d: ticks,
      color: 'var(--muted)',
      width: 1 * boost,
      ...px,
    },
    {
      kind: 'path',
      key: 'grid:ticks:half',
      z: 2,
      d: half,
      color: 'var(--muted)',
      width: 1 * boost,
      ...px,
    },
  ];
}
