// State for the Inverse trig topic; components read it and call its methods. One number drives
// everything: the principal angle in degrees (the answer). It is the angle of the ray, and it is
// what animates, so the ray sweeps when the value moves or the function changes. From it come the
// value being inverted (its sin, cos or tan, which is where the handle sits) and the other angle
// with the same value. Because it is a plain angle, it is the same quantity as the unit circle's
// point, so the two topics can hand it to each other.
import { Tween } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';
import {
  INV_NAME,
  PARTNER,
  RANGE,
  compose,
  otherAngle,
  partnerAt,
  principal,
  snapValue,
  type InvFn,
} from './math.ts';
import { reduce } from '../../core/transition.ts';
import { norm, snapDeg } from '../../core/trig.ts';

/**
 * Within this many degrees of straight up or down the ray counts as vertical, where the slope is
 * undefined.
 */
const POLE = 0.1;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const SPAN = { asin: 180, acos: 180, atan: 180 } as const;

class Inverse {
  fn = $state<InvFn>('asin');
  /** The principal angle the control is headed for, and its animated stand-in. */
  target = $state(45);
  #ang = new Tween(45, { duration: 260, easing: cubicOut });

  /** The answer: the principal angle in degrees. */
  angle = $derived(this.#ang.current);
  /**
   * arctan's ray is vertical: its slope is undefined, and arctan never reaches 90° (it only gets
   * closer as the slope grows).
   */
  pole = $derived(this.fn === 'atan' && Math.abs(this.angle) > 90 - POLE);
  /** The value being inverted: the sin, cos or slope. */
  value = $derived(this.pole ? NaN : (partnerAt(this.fn, this.angle) ?? NaN));
  /**
   * The same, read from where the control is headed rather than where it is now, for text that
   * should not flicker through decimals mid-move.
   */
  poleTo = $derived(this.fn === 'atan' && Math.abs(this.target) > 90 - POLE);
  valueTo = $derived(this.poleTo ? NaN : (partnerAt(this.fn, this.target) ?? NaN));
  angleTo = $derived(this.target);
  /** The other angle with the same value (outside the principal range). */
  other = $derived(otherAngle(this.fn, this.angle));
  /**
   * Where a press would send the control (the faded preview), as the principal angle; null when the
   * pointer is not where a press grabs.
   */
  ghost = $state<number | null>(null);
  /**
   * Whether the answer (the ray, its arc and the point on the circle) is drawn. A quiz holds it
   * back until the question is answered.
   */
  shown = $state(true);
  /**
   * An angle the question starts from (a composition like arcsin(sin 210°)): drawn as its own point
   * on the circle.
   */
  given = $state<number | null>(null);
  /** A press is holding the control (the preview is hidden meanwhile). */
  dragging = $state(false);
  /**
   * Whether the shaded principal range is drawn (a quiz holds it back until the hint or the
   * answer).
   */
  showBand = $state(true);
  /**
   * A free point on the circle for a quiz that asks you to work something out (arcsin(sin θ)): you
   * can move it by the ring, the y-axis or the x-axis, and read its angle, y-value and x-value.
   * While it is there, the function's own control stays out of the way.
   */
  probe = $state<number | null>(null);
  #probe = new Tween(0, { duration: 260, easing: cubicOut });
  probeAngle = $derived(this.#probe.current);
  /** Put the probe at an angle straight away. */
  startProbe(a: number) {
    this.probe = a;
    this.#probe.set(a, { duration: 0 });
  }
  stopProbe() {
    this.probe = null;
  }
  /** Slide the probe to an angle, going the short way round. */
  moveProbe(a: number, ms?: number) {
    if (this.probe === null) return;
    const to = this.probe + ((((a - this.probe) % 360) + 540) % 360) - 180;
    this.probe = to;
    this.#probe.set(to, { duration: reduce ? 0 : (ms ?? 140) });
  }
  /** The control cannot be moved (a quiz that sets the value itself). */
  locked = $state(false);
  /** The stretch of angles a composition question draws θ from, marked on the ring. */
  domain = $state<{ lo: number; hi: number } | null>(null);
  /** Whether the other angle (the other crossing) is drawn along with the answer. */
  showOther = $state(false);
  /** Angles (degrees) whose ring label the drawing writes itself, so the ring leaves them out. */
  marked = $derived.by(() => {
    const out: number[] = [];
    if (this.shown && this.showOther) out.push(this.other);
    if (this.given !== null) out.push(this.given);
    // the preview is drawn only where it would change something, so it only claims labels then
    if (this.ghost !== null && !this.dragging && Math.abs(this.ghost - this.target) > 1e-3)
      out.push(this.ghost, otherAngle(this.fn, this.ghost));
    return out.map((a) => norm(a));
  });
  name = $derived(INV_NAME[this.fn]);
  partner = $derived(PARTNER[this.fn]);

  /**
   * Aim the control at a principal angle (clamped to what the function answers), taking longer over
   * a longer move.
   */
  setAngle(a: number, ms?: number) {
    const { lo, hi } = RANGE[this.fn];
    a = clamp(a, lo, hi);
    const dur = reduce
      ? 0
      : (ms ?? 110 + 340 * Math.min(1, Math.abs(a - this.target) / SPAN[this.fn]));
    this.target = a;
    this.#ang.set(a, { duration: dur });
  }
  /**
   * Aim the control at the value whose inverse is wanted (clamped to what the function accepts).
   */
  setValue(v: number, ms?: number) {
    this.setAngle(principal(this.fn, v), ms);
  }
  /**
   * The principal angle a point of the plane (world units, y down) stands for. Close to a special
   * value (or angle, for arctan) it snaps to it.
   */
  angleAt(
    wx: number,
    wy: number,
    S: number,
    snap: { value: number; angle: number },
    grain: (deg: number) => number = (d) => d,
  ): number {
    if (this.fn === 'atan') {
      const a = snapDeg(grain((Math.atan2(-wy, wx) * 180) / Math.PI), snap.angle),
        reduced = norm(a + 90) - 90; // into [-90, 270)
      return clamp(reduced > 90 ? reduced - 180 : reduced, -90, 90);
    }
    const v = this.fn === 'asin' ? -wy / S : wx / S;
    return principal(this.fn, snapValue(this.fn, clamp(v, -1, 1), snap.value));
  }
  setFromWorld(...args: Parameters<Inverse['angleAt']>) {
    this.setAngle(this.angleAt(...args));
  }
  /**
   * Take on an angle from outside (the unit circle's point), landing on this function's principal
   * angle for it, and slide there.
   */
  adopt(deg: number, ms = 450) {
    const a = compose(this.fn, deg);
    this.setAngle(a ?? (norm(deg + 90) < 180 ? 90 : -90), ms);
  }
  /**
   * Switch function, keeping the value across arcsin and arccos, and the angle into and out of
   * arctan; the ray sweeps to its new angle.
   */
  switchTo(fn: InvFn) {
    if (fn === this.fn) return;
    this.ghost = null;
    const old = this.fn,
      angle = this.angle,
      v = this.value;
    this.fn = fn;
    const a =
      fn === 'atan'
        ? old === 'acos' && angle > 90
          ? angle - 180
          : angle
        : old === 'atan'
          ? principal(fn, partnerAt(fn, angle) ?? 0)
          : principal(fn, v);
    this.setAngle(a, 450);
  }
}
export const inverse = new Inverse();
