// The plane's drawing model. A feature describes what should be on the plane as a list of keyed
// marks; it never tracks whether a mark is arriving or leaving. The mark layer (MarkLayer.svelte)
// keeps each mark alive while it leaves, and plays the verb the mark declares: a line draws on and
// retracts, a dot pops in and shrinks away, a label fades or shoots off. Marks can wait for each
// other with delays, which is how a feature says "this line, then this point, then that ray".
import type { Rect } from '../core/tex.svelte.ts';
import { DUR } from '../core/tuning.ts';
import { clamp01 } from '../core/num.ts';

/** Typeset math with its box on the plane (world units). */
export type Label = { latex: string; size: number; rect: Rect; color: string };

/**
 * How a mark arrives and leaves: `draw` grows a line or path from its start, `pop` grows a dot or
 * label with a little overshoot, `fade` is opacity, `shoot` fades while blurring and sliding off.
 */
export type Verb = 'draw' | 'pop' | 'fade' | 'shoot';

type Base = {
  /**
   * Stable identity: the same key next frame is the same mark (it moves), a new key is a new mark
   * (it enters), a missing key is a mark that leaves.
   */
  key: string;
  /** Stacking order, low to high. */
  z?: number;
  enter?: Verb;
  exit?: Verb;
  /** Milliseconds, for arriving and for leaving: how long to wait first, and how long it takes. */
  delay?: number;
  dur?: number;
  exitDelay?: number;
  exitDur?: number;
  /** A constant opacity on top of the verb's. */
  opacity?: number;
  /**
   * How a `pop` runs: the curve from progress to size (it may overshoot), and the progress below
   * which the mark is still fading in.
   */
  curve?: (p: number) => number;
  fadeBy?: number;
  /** How hard a `draw` eases out (1 is linear). */
  power?: number;
};
export type LineMark = Base & {
  kind: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  dash?: [number, number];
  offset?: number;
  round?: boolean;
};
export type PathMark = Base & {
  kind: 'path';
  d: string;
  color: string;
  width: number;
  fill?: string;
  round?: boolean;
  join?: boolean;
  /** Only this leading share (0 to 1) of the path is drawn, for a wash that sweeps along it. */
  part?: number;
  /** Draw from both ends toward the middle instead of from the start (a brace). */
  symmetric?: boolean;
  /**
   * An SVG transform for the path, and a function that gives the path for a pop progress (an arc
   * that swells out).
   */
  transform?: string;
  at?: (e: number) => string;
  dash?: [number, number];
  /** The width is on-screen pixels whatever the zoom (the grid's lines). */
  fixed?: boolean;
};
/** Many short lines drawn as one mark (the trail), each with its own color, width and opacity. */
export type SegmentsMark = Base & {
  kind: 'segments';
  segs: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    width: number;
    opacity: number;
  }[];
};
export type DotMark = Base & {
  kind: 'dot';
  x: number;
  y: number;
  r: number;
  fill: string;
  stroke?: string;
  width?: number;
  /** Milliseconds a change of radius glides over (a hover growing the dot); 0 for none. */
  glide?: number;
};
export type LabelMark = Base & {
  kind: 'label';
  label: Label;
  /** For a `pop`: the share of the progress it waits out before it starts to grow. */
  popFrom?: number;
  /** A soft panel behind it, padded by this much (world units); 0 for none. */
  back?: number;
  /** Which way (world units) a `shoot` exit carries it. */
  shoot?: [number, number];
};
/**
 * A pizza slice: the wedge between two angles (radians, counterclockwise from the right), pulled in
 * from its edges by `gap` (and short of the circle by `rim`), so neighbouring slices stay apart by
 * a constant width. A slice that stays moves its edges by gliding (`glide` ms); one that arrives
 * grows out from its first edge and one that leaves folds back into it.
 */
export type SliceMark = Base & {
  kind: 'slice';
  a0: number;
  a1: number;
  r: number;
  gap: number;
  fill: string;
  glide?: number;
  /**
   * How far each side is pulled in, where it differs from `gap`: the first edge, the last edge and
   * the rim (a slice at the end of a row keeps the same gap from the axis, the ray and the circle
   * as from its neighbour).
   */
  edge0?: number;
  edge1?: number;
  rim?: number;
};
/**
 * A repeating field of dots, drawn as one pattern fill so it costs the same at any zoom: a dot at
 * each half-step point that is not a line crossing.
 */
export type DotGridMark = Base & {
  kind: 'dotgrid';
  step: number;
  r: number;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
};
export type Mark =
  LineMark | PathMark | DotMark | LabelMark | SegmentsMark | DotGridMark | SliceMark;

/** Defaults a mark inherits unless it says otherwise. */
export const DEFAULTS = {
  enter: 'fade',
  delay: 0,
  dur: DUR.base,
  exitDelay: 0,
  exitDur: DUR.quick,
  z: 5,
} as const;

/** How a line draws: quick off the mark, slow into the end. `power` is 1 for linear. */
export const drawCurve = (p: number, power = 4) => 1 - (1 - clamp01(p)) ** power;
/** Grows 0 → 1 with a little overshoot, for a dot that pops in. */
export const popCurve = (u: number) => 1 + 2.7 * (u - 1) ** 3 + 1.7 * (u - 1) ** 2;

/**
 * The verb in force: arriving uses `enter`, leaving uses `exit` (which defaults to the same verb,
 * run backwards).
 */
export const verbFor = (m: Mark, leaving: boolean): Verb =>
  leaving ? (m.exit ?? m.enter ?? DEFAULTS.enter) : (m.enter ?? DEFAULTS.enter);

/** What a layer hands the plane while it has nothing to draw; one shared list, so nothing re-runs. */
export const NO_MARKS: Mark[] = [];
