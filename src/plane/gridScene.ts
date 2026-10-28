// The graph paper under every topic: a line every 0.2, a stronger one every 1, the axes, and ticks
// on the axes inside the circle (see figures/graphPaper.ts).
import { S } from '../core/camera.svelte.ts';
import { GraphPaper } from '../figures/graphPaper.ts';
import type { Mark } from './marks.ts';

export type GridInput = {
  /**
   * The window to cover in world units (see gridWindow.ts), the zoom (px per world unit), the phone
   * line-width boost, and whether this is a wide screen.
   */
  view: { x: number; y: number; w: number; h: number };
  k: number;
  boost: number;
  wide: boolean;
};

export function gridScene(g: GridInput): Mark[] {
  return GraphPaper(
    'grid',
    { view: g.view, step: S / 5, major: 5, ticks: 5, dotR: (g.wide ? 1 : 0.6) / g.k, px: g.boost },
    { sw: 1, lb: 1 },
  ).marks;
}
