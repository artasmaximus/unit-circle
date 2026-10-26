// The equation solver: a problem like csc θ = 2, rewritten with operations until sin, cos or tan
// stands alone, then both angles found on the circle.
import { angleTex } from '../core/angles.ts';
import { ui } from '../core/app.svelte.ts';
import { point } from '../core/point.svelte.ts';
import { progress } from '../core/progress.svelte.ts';
import type { Rich } from '../core/rich.ts';
import { SPECIAL, rad } from '../core/trig.ts';
import { apply, atom, num, solvedForm, type Eq, type Op } from './algebra.ts';

export type RecipKey = 'csc' | 'sec' | 'cot';
type Step = { eq: Eq; label: string };
const RECIP_FN = { csc: 'sin', sec: 'cos', cot: 'tan' } as const;

function makeProblem(k: RecipKey, prev?: number): Eq {
  const fn = RECIP_FN[k];
  const pool = SPECIAL.filter((a) => {
    const v = fnValue(fn, a);
    if (!Number.isFinite(v) || Math.abs(v) < 1e-9) return false;
    return (
      SPECIAL.filter((b) => Math.abs(fnValue(fn, b) - v) < 1e-9).length === 2 &&
      (prev === undefined || Math.abs(1 / v - prev) > 1e-9)
    );
  });
  const a = pool[Math.floor(Math.random() * pool.length)];
  return { l: atom(k), r: num(1 / fnValue(fn, a)) };
}
const fnValue = (fn: 'sin' | 'cos' | 'tan', a: number) => {
  const c = Math.cos(rad(a)),
    s = Math.sin(rad(a));
  return fn === 'sin' ? s : fn === 'cos' ? c : Math.abs(c) < 1e-9 ? NaN : s / c;
};

class Solver {
  open = $state(false);
  key = $state<RecipKey>('csc');
  steps = $state<Step[]>([]);
  found = $state<number[]>([]);
  note = $state<Rich | string>('');
  current = $derived(this.steps.at(-1)?.eq);
  /** Set once sin, cos or tan stands alone: the algebra is done and the circle takes over. */
  target = $derived(this.current ? solvedForm(this.current) : null);
  sols = $derived(
    this.target
      ? SPECIAL.filter((a) => Math.abs(fnValue(this.target!.fn, a) - this.target!.v) < 1e-9)
      : [],
  );
  done = $derived(this.sols.length > 0 && this.found.length === this.sols.length);

  start(k: RecipKey) {
    this.key = k;
    this.open = true;
    this.#load(makeProblem(k));
  }
  next() {
    this.#load(makeProblem(this.key, (this.steps[0]?.eq.r as { v?: number })?.v));
  }
  #load(eq: Eq) {
    this.steps = [{ eq, label: 'Solve' }];
    this.found = [];
    this.note = '';
    ui.highlight = [];
  }
  close() {
    this.open = false;
    ui.highlight = [];
  }
  apply(op: Op, label: string) {
    if (!this.current || this.target) return;
    this.steps.push({ eq: apply(this.current, op), label });
  }
  undo() {
    if (this.steps.length > 1) {
      this.steps.pop();
      this.found = [];
      this.note = '';
      ui.highlight = [];
    }
  }
  /** Is the point on one of the angles? */
  check() {
    if (!this.target || this.done) return;
    const d = point.deg,
      hit = this.sols.find((s) => Math.min(Math.abs(d - s), 360 - Math.abs(d - s)) < 1.2);
    if (hit === undefined) {
      this.note = 'Not there. Look where the value matches.';
      return;
    }
    if (this.found.includes(hit)) {
      this.note = 'Already found. Look for the other angle.';
      return;
    }
    this.found.push(hit);
    ui.highlight = [...this.found];
    this.note = this.done ? '' : ['Yes, ', { m: angleTex(hit, progress.unit) }, '. One more.'];
  }
}
export const solver = new Solver();
