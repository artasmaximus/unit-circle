// The point on the unit circle, shared by every topic: where it is headed, and the spring that
// carries it there, with its dot size and the colored tail behind it.
import { norm, rad, snapDeg, specialOf, wrapPi } from './trig.ts';
import { reduce } from './transition.ts';
import * as T from './tuning.ts';

const TRAIL_MAX = T.point.trailMax;

/** The point on the circle. `target` is where it is headed; `ang` springs toward it (radians). */
class Point {
  target = $state(rad(45));
  ang = $state(rad(45));
  dotR = $state(7);
  /** Signed arc (radians) of the colored tail chasing the point. */
  tail = $state(0);
  /**
   * Degrees of the target, and the special angle it sits on (labels read exact the moment it
   * snaps).
   */
  deg = $derived(norm((this.target * 180) / Math.PI));
  hit = $derived(specialOf(this.deg));

  /**
   * Spring stiffness and damping: they ease off for bigger jumps, so a long swing takes longer, not
   * just goes faster.
   */
  #k = T.point.stiffness;
  #c = T.point.damping;
  #vel = 0;
  #dotV = 0;
  #raf = 0;
  #last = 0;
  #prevAng = rad(45);

  /** `range` is how close (degrees) a press must be to a special angle to snap to it. */
  set(deg: number, free = false, range?: number) {
    this.target = rad(norm(free ? deg : snapDeg(deg, range)));
    const slow = 1 + T.point.jumpSlowdown * (Math.abs(wrapPi(this.target - this.ang)) / Math.PI);
    this.#k = T.point.stiffness / slow ** 2;
    this.#c = T.point.damping / slow;
    this.#kick();
  }
  #kick() {
    if (reduce) {
      this.ang = this.target;
      this.dotR = this.hit !== undefined ? 7 : 4.5;
      return;
    }
    if (!this.#raf) {
      this.#last = performance.now();
      this.#raf = requestAnimationFrame(this.#step);
    }
  }
  #step = (now: number) => {
    const dt = Math.min(0.034, (now - this.#last) / 1000);
    this.#last = now;
    const rT = this.hit !== undefined ? 7 : 4.5,
      n = 3,
      h = dt / n;
    let ang = this.ang,
      dotR = this.dotR;
    for (let i = 0; i < n; i++) {
      this.#vel += (this.#k * wrapPi(this.target - ang) - this.#c * this.#vel) * h;
      ang += this.#vel * h;
      this.#dotV += (T.point.dotStiffness * (rT - dotR) - T.point.dotDamping * this.#dotV) * h;
      dotR += this.#dotV * h;
    }
    ang = ((ang % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    // the tail grows with the distance travelled and reels back in when the point stops
    const tail =
      Math.max(-TRAIL_MAX, Math.min(TRAIL_MAX, this.tail + wrapPi(ang - this.#prevAng))) *
      Math.exp(-dt * T.point.trailReel);
    this.#prevAng = ang;
    const settled =
      Math.abs(wrapPi(this.target - ang)) < 2e-4 &&
      Math.abs(this.#vel) < 2e-3 &&
      Math.abs(rT - dotR) < 0.02 &&
      Math.abs(this.#dotV) < 0.05;
    this.ang = settled ? this.target : ang;
    this.dotR = settled ? rT : dotR;
    this.tail = Math.abs(tail) > 0.006 ? tail : 0;
    if (settled) {
      this.#vel = this.#dotV = 0;
    }
    this.#raf = settled && !this.tail ? 0 : requestAnimationFrame(this.#step);
  };
}
export const point = new Point();
