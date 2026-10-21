// Maps world units (the unit circle has radius S) to screen pixels. The circle is centered in the part of
// the viewport the panel leaves free. pan and zoom are plain state, ready for gestures later.
export const S = 150;
/** World-unit box the drawing needs around the circle: ring labels, chips. */
const NEED = { w: 440, h: 400 };
const GUTTER = 48;

class Camera {
  vw = $state(typeof window === 'undefined' ? 1024 : innerWidth);
  vh = $state(typeof window === 'undefined' ? 768 : innerHeight);
  /** Pixels the panel covers: on the left (wide screens) or along the bottom (phones). */
  inset = $state({ left: 0, bottom: 0 });
  zoom = $state(1);
  pan = $state({ x: 0, y: 0 });

  wide = $derived(this.vw >= 700 && this.vw >= this.vh);
  /** The uncovered part of the viewport, minus a gutter where the panel's blur fades out. */
  free = $derived.by(() => {
    const left = this.inset.left && this.inset.left + GUTTER, bottom = this.inset.bottom && this.inset.bottom + GUTTER / 2;
    return { x: left, y: 0, w: this.vw - left, h: this.vh - bottom };
  });
  k = $derived(Math.min(2.6, Math.max(0.55, Math.min(this.free.w / NEED.w, this.free.h / NEED.h))) * this.zoom);
  ox = $derived(this.free.x + this.free.w / 2 + this.pan.x);
  oy = $derived(this.free.y + this.free.h / 2 + this.pan.y);

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
