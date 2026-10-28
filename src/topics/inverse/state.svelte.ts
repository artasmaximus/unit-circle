// State for the Inverse trig topic; components read it and call its methods. One number drives
// everything: the principal angle in degrees (the answer). It is the angle of the ray, and it is
// what animates, so the ray sweeps when the value moves or the function changes. From it come the
// value being inverted (its sin, cos or tan, which is where the handle sits) and the other angle
// with the same value. Because it is a plain angle, it is the same quantity as the unit circle's
// point, so the two topics can hand it to each other.
import { RANGE, compose, otherAngle, partnerAt, principal, snapValue, type InvFn } from './math.ts';
import { Swing } from '../../core/swing.svelte.ts';
import { deg, norm, rad, snapDeg } from '../../core/trig.ts';

/**
 * Within this many degrees of straight up or down the ray counts as vertical, where the slope is
 * undefined.
 */
const POLE = 0.1;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

class Inverse {
  fn = $state<InvFn>('asin');
  /** The principal angle the control is headed for, and its animated stand-in. */
  target = $state(45);
  #ang = new Swing(rad(45), false);

  /** The answer: the principal angle in degrees. */
  angle = $derived(deg(this.#ang.ang));
  /** The colored tail (radians) the control drags behind it. */
  tail = $derived(this.#ang.tail);
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
  /** The other angle with the same value (outside the principal range). */
  other = $derived(otherAngle(this.fn, this.angle));
  /**
   * Where a press would send the control (the faded preview), as the principal angle; null when the
   * pointer is not where a press grabs.
   */
  ghost = $state<number | null>(null);
  /** A press is holding the control (the preview is hidden meanwhile). */
  dragging = $state(false);
  /**
   * A free point on the circle for a quiz that asks you to work something out (arcsin(sin θ)): you
   * can move it by the ring, the y-axis or the x-axis, and read its angle, y-value and x-value.
   * While it is there, the function's own control stays out of the way.
   */
  probeTo = $state(0);
  #probe = new Swing(0, false);
  probeAngle = $derived(deg(this.#probe.ang));
  probeTail = $derived(this.#probe.tail);
  /** Put the probe at an angle straight away. */
  startProbe(a: number) {
    this.probeTo = a;
    this.#probe.place(rad(a));
  }
  /** Slide the probe to an angle, going the short way round. */
  moveProbe(a: number) {
    const to = this.probeTo + norm(a - this.probeTo + 180) - 180;
    this.probeTo = to;
    this.#probe.aim(rad(to));
  }
  /** The learner's Other angle switch: it counts only while exploring (see stage.svelte.ts). */
  showOther = $state(false);

  /**
   * Aim the control at a principal angle (clamped to what the function answers); it springs there,
   * taking longer over a longer move.
   */
  setAngle(a: number) {
    const { lo, hi } = RANGE[this.fn];
    a = clamp(a, lo, hi);
    this.target = a;
    this.#ang.aim(rad(a));
  }
  /**
   * Aim the control at the value whose inverse is wanted (clamped to what the function accepts).
   */
  setValue(v: number) {
    this.setAngle(principal(this.fn, v));
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
      const a = snapDeg(grain(deg(Math.atan2(-wy, wx))), snap.angle),
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
  adopt(angle: number) {
    const a = compose(this.fn, angle);
    this.setAngle(a ?? (norm(angle + 90) < 180 ? 90 : -90));
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
    this.setAngle(a);
  }
}
export const inverse = new Inverse();
