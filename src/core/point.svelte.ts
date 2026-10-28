// The point on the unit circle, shared by every topic: where it is headed, and the spring that
// carries it there (see swing.svelte.ts), with its dot size.
import { deg, norm, rad, snapDeg, specialOf } from './trig.ts';
import { reduce } from './transition.ts';
import { Swing } from './swing.svelte.ts';
import * as T from './tuning.ts';

/** The point on the circle. `target` is where it is headed; `ang` springs toward it (radians). */
class Point {
  #swing = new Swing(rad(45), true, (dt) => this.#grow(dt));
  dotR = $state(7);
  target = $derived(this.#swing.target);
  ang = $derived(this.#swing.ang);
  /** Signed arc (radians) of the colored tail chasing the point. */
  tail = $derived(this.#swing.tail);
  /**
   * Degrees of the target, and the special angle it sits on (labels read exact the moment it
   * snaps).
   */
  deg = $derived(norm(deg(this.target)));
  hit = $derived(specialOf(this.deg));

  #dotV = 0;

  /** `range` is how close (degrees) a press must be to a special angle to snap to it. */
  set(deg: number, free = false, range?: number) {
    this.#swing.aim(rad(norm(free ? deg : snapDeg(deg, range))));
    if (reduce) this.dotR = this.hit !== undefined ? 7 : 4.5;
  }
  /** The dot grows on a special angle and shrinks off it; says whether it is still moving. */
  #grow(dt: number): boolean {
    const rT: number = this.hit !== undefined ? 7 : 4.5,
      n = 3,
      h = dt / n;
    let dotR = this.dotR;
    for (let i = 0; i < n; i++) {
      this.#dotV += (T.point.dotStiffness * (rT - dotR) - T.point.dotDamping * this.#dotV) * h;
      dotR += this.#dotV * h;
    }
    const settled = Math.abs(rT - dotR) < 0.02 && Math.abs(this.#dotV) < 0.05;
    this.dotR = settled ? rT : dotR;
    if (settled) this.#dotV = 0;
    return !settled;
  }
}
export const point = new Point();
