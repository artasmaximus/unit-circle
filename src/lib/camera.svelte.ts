// Maps world units (the unit circle has radius S) to screen pixels. The circle is centered in the part of
// the viewport the panel leaves free. pan and zoom are plain state, ready for gestures later.
import { Tween } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';
import { camera as T } from './tuning.ts';
import { reduce } from './transition.ts';
export const S = 150;
/** Radius (world) of the ring's degree labels; the hover ghost's label takes their place. */
export const LABEL_R = S + 31;

class Camera {
  vw = $state(typeof window === 'undefined' ? 1024 : innerWidth);
  vh = $state(typeof window === 'undefined' ? 768 : innerHeight);
  /** Pixels the panel covers: on the left (wide screens) or along the bottom (phones). Setting it glides the
   *  view to the new size, so the grid eases when the panel's content (and so its height) changes. */
  #inset = new Tween({ left: 0, bottom: 0 }, { duration: T.easeMs, easing: cubicOut });
  #placed = false;
  get inset() { return this.#inset.current; }
  set inset(v: { left: number; bottom: number }) {
    this.#inset.set(v, this.#placed && !reduce ? undefined : { duration: 0 });
    this.#placed = true;
  }
  zoom = $state(1);
  pan = $state({ x: 0, y: 0 });

  wide = $derived(this.vw >= 700 && this.vw >= this.vh);
  /** Phones draw strokes, dots and labels a little heavier so the figure reads at arm's length. */
  boost = $derived(this.wide ? 1 : 1.35);
  /** Text and chips grow less than strokes do: the figure has to fit them around the circle. */
  textBoost = $derived(this.wide ? 1 : 1.1);
  /** The uncovered part of the viewport, minus a gutter where the panel's blur fades out. */
  free = $derived.by(() => {
    const { left: l, bottom: b } = this.inset, left = l && l + (this.wide ? T.gutterWide : T.gutter), bottom = b && b + T.gutter / 2;
    return { x: left, y: 0, w: this.vw - left, h: this.vh - bottom };
  });
  /** World-unit box the drawing needs around the circle (ring labels, chips). Phones have less to spare, and the chips
   *  shuffle to wherever they fit, so the circle may take more of the screen there. */
  need = $derived(this.wide ? T.need : T.needNarrow);
  k = $derived(Math.min(T.fitMax, Math.max(T.fitMin, Math.min(this.free.w / this.need.w, this.free.h / this.need.h))) * this.zoom);
  /** On wide screens the circle sits a little left of center, so the controls in the top right have room. */
  ox = $derived(this.free.x + this.free.w / 2 + this.pan.x + (this.wide ? T.wideShift : 0));
  oy = $derived(this.free.y + this.free.h / 2 + this.pan.y);

  /** Zoom by `f` about a screen point, so the world under it stays put. */
  zoomAt = (px: number, py: number, f: number) => {
    const w = this.toWorld(px, py), base = { x: this.ox - this.pan.x, y: this.oy - this.pan.y };
    this.zoom = Math.min(T.zoomMax, Math.max(T.zoomMin, this.zoom * f));
    this.pan = { x: px - w.x * this.k - base.x, y: py - w.y * this.k - base.y };
  };
  panBy = (dx: number, dy: number) => { this.pan = { x: this.pan.x + dx, y: this.pan.y + dy }; };
  moved = $derived(this.zoom !== 1 || this.pan.x !== 0 || this.pan.y !== 0);
  reset = () => { this.zoom = 1; this.pan = { x: 0, y: 0 }; };
  toWorld = (px: number, py: number) => ({ x: (px - this.ox) / this.k, y: (py - this.oy) / this.k });
  toScreen = (x: number, y: number) => ({ x: this.ox + x * this.k, y: this.oy + y * this.k });
  /** The whole viewport, in world units (the grid fills it). */
  view = $derived({ x: -this.ox / this.k, y: -this.oy / this.k, w: this.vw / this.k, h: this.vh / this.k });
  /** The free area in world units (labels stay inside it). */
  freeWorld = $derived({
    x: (this.free.x - this.ox) / this.k, y: (this.free.y - this.oy) / this.k,
    w: this.free.w / this.k, h: this.free.h / this.k,
  });
}
export const camera = new Camera();
if (typeof window !== 'undefined')
  addEventListener('resize', () => { camera.vw = innerWidth; camera.vh = innerHeight; });
