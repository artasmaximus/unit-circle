// The spring that carries an angle to where it is headed, and the colored tail it drags behind it.
// The unit circle's point, the Inverse trig control and its probe all move with one of these, so
// an angle feels the same on every topic.
import { wrapPi } from './trig.ts';
import { reduce } from './transition.ts';
import * as T from './tuning.ts';

const TRAIL_MAX = T.point.trailMax;

/**
 * An angle (radians) that springs toward `target`. Stiffness and damping ease off for bigger
 * jumps, so a long swing takes longer, not just goes faster. With `wrap` the angle is on a circle
 * and goes the short way round; without it, it is a plain number and goes straight there.
 */
export class Swing {
  target = $state(0);
  ang = $state(0);
  /** Signed arc (radians) of the colored tail chasing the angle. */
  tail = $state(0);

  #wrap: boolean;
  /**
   * Something else that moves with the angle (the dot's size): called each frame with the elapsed
   * seconds, and says whether it is still moving.
   */
  #also: ((dt: number) => boolean) | undefined;
  #k = T.point.stiffness;
  #c = T.point.damping;
  #vel = 0;
  #raf = 0;
  #last = 0;
  #prev: number;

  constructor(start: number, wrap = true, also?: (dt: number) => boolean) {
    this.target = this.ang = this.#prev = start;
    this.#wrap = wrap;
    this.#also = also;
  }

  #diff(a: number, b: number) {
    return this.#wrap ? wrapPi(a - b) : a - b;
  }

  /** Head for `to`; `norm` is the turn that counts as a long jump (a half-turn for a circle). */
  aim(to: number, norm = Math.PI) {
    this.target = to;
    const slow = 1 + T.point.jumpSlowdown * Math.min(1, Math.abs(this.#diff(to, this.ang)) / norm);
    this.#k = T.point.stiffness / slow ** 2;
    this.#c = T.point.damping / slow;
    this.kick();
  }
  /** Be at `to` straight away, with no tail. */
  place(to: number) {
    this.target = this.ang = this.#prev = to;
    this.#vel = this.tail = 0;
  }
  kick() {
    if (reduce) {
      this.ang = this.target;
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
    const n = 3,
      h = dt / n;
    let ang = this.ang;
    for (let i = 0; i < n; i++) {
      this.#vel += (this.#k * this.#diff(this.target, ang) - this.#c * this.#vel) * h;
      ang += this.#vel * h;
    }
    if (this.#wrap) ang = ((ang % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    // the tail grows with the distance travelled and reels back in when the angle stops
    const tail =
      Math.max(-TRAIL_MAX, Math.min(TRAIL_MAX, this.tail + this.#diff(ang, this.#prev))) *
      Math.exp(-dt * T.point.trailReel);
    this.#prev = ang;
    const moving = this.#also?.(dt) ?? false;
    const settled = Math.abs(this.#diff(this.target, ang)) < 2e-4 && Math.abs(this.#vel) < 2e-3;
    this.ang = settled ? this.target : ang;
    this.tail = Math.abs(tail) > 0.006 ? tail : 0;
    if (settled) this.#vel = 0;
    this.#raf = settled && !moving && !this.tail ? 0 : requestAnimationFrame(this.#step);
  };
}
