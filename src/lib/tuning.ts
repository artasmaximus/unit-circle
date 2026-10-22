// Every number worth tweaking for how the app feels, in one place: motion, interaction, layout. Colors live in app.css.
// Times are in seconds unless the name says ms; lengths are px unless the name says world (the circle has radius 150 world units).

/** The point's own spring and the trail behind it (state.svelte.ts). */
export const point = {
  /** Spring toward the target angle: stiffness and damping, for a short hop. */
  stiffness: 900, damping: 50,
  /** Bigger jumps ease off: a half-turn takes (1 + this)× as long as a nudge. */
  jumpSlowdown: 2.34,
  /** The dot's own size spring (grows on a snap angle). */
  dotStiffness: 999, dotDamping: 31,
  /** Longest arc (radians) the colored tail may reach, and how fast it reels back in (per second). */
  trailMax: 1.5, trailReel: 3.6,
};

/** The pen-click motion that drives a mode switch (state.svelte.ts). */
export const pen = {
  ms: 460,
  /** How far it leans back first, and how far it overshoots (fractions of the full move). */
  lean: 0.08, over: 0.04,
};

/** How the figure reacts during a mode switch, as windows [from, to] of the switch's 0 → 1 clock (Figure.svelte). */
export const figure = {
  arcWash: [0, 0.5] as [number, number], rayWash: [0.5, 1] as [number, number], braceDraw: [0.15, 0.85] as [number, number],
  refLabel: [0.4, 1] as [number, number],
  /** The x / y labels bounce away from their braces and back by this much (px) over [0, bobEnd], then recolor. */
  bob: 8, bobEnd: 0.6,
  /** Mirror mode draws its reflected lines on (and takes them back) over this long (ms). */
  mirrorMs: 400,
  /** How hard the line eases out as it draws: 1 is linear, 3 a cubic ease-out, higher lunges out and settles slowly. */
  mirrorEase: 5,
  /** The line takes this share of the run (the dot pops in as it lands, and takes the rest). */
  mirrorLineShare: 0.5,
  /** A leg shows its brace once it is this long on screen (px): the cosine leg, then the sine leg. */
  braceMinPx: [42, 34] as [number, number],
  /** A brace and its label leaving (the brace undraws, the label blurs away): duration, and how far (world) the label shoots. */
  legExitMs: 180, legShoot: 8,
  /** The reference angle is fully opaque once its pop reaches this fraction, and fades below it. */
  refFadeBy: 0.7,
  /** The reference angle's spring: seconds to settle, natural frequency (rad/s), damping ratio (lower = bouncier). */
  refSettle: 0.55, refFreq: 22, refDamping: 0.9,
};

/** Pressing, hovering and zooming on the plane (Plane.svelte). */
export const input = {
  /** How close (px) to the circle a press must be to grab the point. */
  grabBand: 24,
  /** Zoom per wheel pixel, and for pinch-on-trackpad (ctrl + wheel). */
  wheelZoom: 0.0015, pinchZoom: 0.01,
  /** Hover growth of a snap dot aimed at, and the ring's pulse during a mode switch (Ring.svelte). */
  aimGrow: 1.6, pulseShare: 0.4, pulseGrow: 0.25,
  /** Degrees within which a press or drag snaps to a special angle (trig.ts). */
  snapRange: 3,
};

/** Where the circle sits and how big it is (camera.svelte.ts). */
export const camera = {
  /** World-unit box the drawing needs around the circle, on wide screens and on phones. */
  need: { w: 410, h: 400 }, needNarrow: { w: 400, h: 380 },
  /** Smallest and largest automatic circle scale, and the zoom a user may reach on top of it. */
  fitMin: 0.55, fitMax: 2.6, zoomMin: 0.3, zoomMax: 16,
  /** Width (px) kept clear beside the panel: where its blur fades, on phones and on wide screens. */
  gutter: 48, gutterWide: 16,
  /** Wide screens nudge the circle this far (px) left of center. */
  wideShift: -24,
  /** How long the view takes to ease to a new panel size. */
  easeMs: 380,
  /** How the drawing responds when you zoom in or out. 1 = scales with the circle, 0 = keeps its on-screen size, below 0 shrinks
   *  on screen as you zoom in. `strokeZoom` covers line widths, dash lengths, dots and brace size; `textZoom` the labels on the plane. */
  strokeZoom: 0.15, textZoom: 0,
  /** The angle is whole degrees at the default zoom, then reads (and drags) to 1, 2 and 3 decimals once the zoom reaches
   *  these. The snap range shrinks with zoom too. */
  decimalsAtZoom: [2, 5, 10],
};

/** The point's tag and the floating chips (scene.ts). */
export const tag = {
  /** The coordinates are centered in a nominal box of this size (px) that sits this far (px) out along θ. */
  w: 120, h: 56, gap: 20,
  /** Chip text size in px; chips keep their size on screen whatever the zoom. */
  chipFont: 13,
  /** The reference-angle label: text size and its distance (world) from the origin, which sets how much room it has beside the arcs. */
  refFont: 11, refRadius: 56,
};

/** The panel (Panel.svelte). */
export const panel = {
  /** A view enters (rises in) and exits (flies up): px, ms and delay. */
  enter: { y: 10, ms: 280, delay: 140 }, exit: { y: -10, ms: 180 },
  /** On phones the plane re-fits to the panel this long (ms) after a view change settles. */
  settleMs: 450,
  /** Room (px) the circle leaves along the bottom on wide screens, for the tab bar floating there. */
  tabBarRoom: 64,
  /** Progressive blur layers [blur px, solid up to %, gone by %], strongest first. */
  blur: [[6, 62, 80], [4, 70, 87], [2, 78, 93], [1, 86, 100]] as [number, number, number][],
};
