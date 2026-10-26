// What every figure shares. A figure is a self-contained piece of a drawing (a labelled arc, a
// brace, a right triangle) that knows nothing about topics: it takes a key, its own options and
// the plane's drawing context, and gives back keyed marks (see plane/marks.ts). Scenes compose
// figures; MarkLayer animates the marks.
//
// Keys: the figure's main mark takes the key it is given, and any other parts add a suffix
// (`ug:ref` is the arc, `ug:ref:label` its label), so two figures on one plane never collide.
import type { Mark, Verb } from '../plane/marks.ts';

export type Pt = [number, number];

/** What the plane tells every figure about the current frame. */
export type Ctx = {
  /** Stroke scale for the current zoom: widths and gaps are multiplied by it. */
  sw: number;
  /** Label scale for the current zoom: font sizes are multiplied by it. */
  lb: number;
};

/** What a figure gives back: its marks, plus any measurements a scene needs to place the next one. */
export type Drawn<Extra = {}> = { marks: Mark[] } & Extra;

/** How a stroke looks. Widths are in stroke units (scaled by `ctx.sw`). */
export type Look = {
  color?: string;
  width?: number;
  /** `true` is the standard dash; a pair is [dash, gap] in stroke units. */
  dash?: boolean | [number, number];
  round?: boolean;
  opacity?: number;
  z?: number;
};

/** When and how a figure's marks arrive and leave (milliseconds). */
export type Timing = {
  enter?: Verb;
  /** How it leaves, when not the same verb run backwards. */
  exit?: Verb;
  delay?: number;
  dur?: number;
  exitDelay?: number;
  exitDur?: number;
};

/** A figure's timing, copied onto a mark. */
export const timing = (p: Timing) => ({
  enter: p.enter,
  exit: p.exit,
  delay: p.delay,
  dur: p.dur,
  exitDelay: p.exitDelay,
  exitDur: p.exitDur,
});

/** A look's dash in world units, or none. */
export const dashOf = (dash: Look['dash'], sw: number): [number, number] | undefined =>
  dash === true ? [3 * sw, 5 * sw] : dash ? [dash[0] * sw, dash[1] * sw] : undefined;

/** A point at angle `a` (radians, counterclockwise) and radius `r` from `c` (y points down). */
export const polar = (a: number, r: number, c: Pt = [0, 0]): Pt => [
  c[0] + r * Math.cos(a),
  c[1] - r * Math.sin(a),
];
