// All app state in one place. Components read it and call its methods; nothing else holds state.
import { Tween } from 'svelte/motion';
import { SPECIAL, norm, rad, snapDeg, specialOf, wrapPi } from './trig.ts';
import { makeChoices, pickQ, qKey, trigTexAnswer, type Question, type Rich } from './quiz.ts';
import { apply, atom, num, solvedForm, type Eq, type Op } from './algebra.ts';
import { angleTex } from './angles.ts';
import { inverse } from './inverse.svelte.ts';
import { progress } from './progress.svelte.ts';
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
  /** Degrees of the target, and the special angle it sits on (labels read exact the moment it snaps). */
  deg = $derived(norm((this.target * 180) / Math.PI));
  hit = $derived(specialOf(this.deg));

  /** Spring stiffness and damping: they ease off for bigger jumps, so a long swing takes longer, not just goes faster. */
  #k = T.point.stiffness; #c = T.point.damping;
  #vel = 0; #dotV = 0; #raf = 0; #last = 0; #prevAng = rad(45);

  /** `range` is how close (degrees) a press must be to a special angle to snap to it. */
  set(deg: number, free = false, range?: number) {
    this.target = rad(norm(free ? deg : snapDeg(deg, range)));
    const slow = 1 + T.point.jumpSlowdown * (Math.abs(wrapPi(this.target - this.ang)) / Math.PI);
    this.#k = T.point.stiffness / slow ** 2; this.#c = T.point.damping / slow;
    this.#kick();
  }
  #kick() {
    if (reduce) { this.ang = this.target; this.dotR = this.hit !== undefined ? 7 : 4.5; return; }
    if (!this.#raf) { this.#last = performance.now(); this.#raf = requestAnimationFrame(this.#step); }
  }
  #step = (now: number) => {
    const dt = Math.min(0.034, (now - this.#last) / 1000);
    this.#last = now;
    const rT = this.hit !== undefined ? 7 : 4.5, n = 3, h = dt / n;
    let ang = this.ang, dotR = this.dotR;
    for (let i = 0; i < n; i++) {
      this.#vel += (this.#k * wrapPi(this.target - ang) - this.#c * this.#vel) * h; ang += this.#vel * h;
      this.#dotV += (T.point.dotStiffness * (rT - dotR) - T.point.dotDamping * this.#dotV) * h; dotR += this.#dotV * h;
    }
    ang = ((ang % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    // the tail grows with the distance travelled and reels back in when the point stops
    const tail = Math.max(-TRAIL_MAX, Math.min(TRAIL_MAX, this.tail + wrapPi(ang - this.#prevAng))) * Math.exp(-dt * T.point.trailReel);
    this.#prevAng = ang;
    const settled = Math.abs(wrapPi(this.target - ang)) < 2e-4 && Math.abs(this.#vel) < 2e-3 && Math.abs(rT - dotR) < 0.02 && Math.abs(this.#dotV) < 0.05;
    this.ang = settled ? this.target : ang;
    this.dotR = settled ? rT : dotR;
    this.tail = Math.abs(tail) > 0.006 ? tail : 0;
    if (settled) { this.#vel = this.#dotV = 0; }
    this.#raf = settled && !this.tail ? 0 : requestAnimationFrame(this.#step);
  };
}
export const point = new Point();

/** The snap angle the pointer is aiming at: its ring label is drawn by the hover ghost, so the ring skips it. */
export const aim = $state<{ deg: number | null }>({ deg: null });

export type Topic = 'circle' | 'inverse' | 'radians';
/** How a topic is being used: Guide is the guided path (only some topics have one), Explore is free play, Practice is questions. */
export type Mode = 'guide' | 'explore' | 'practice';
/** The topics that have a Guide. */
export const guideTopics: ReadonlySet<Topic> = new Set<Topic>(['radians', 'circle']);
export const ui = $state({
  /** The concept on the plane, picked in the tab bar. */
  topic: 'circle' as Topic,
  /** A learner who has not finished the unit circle's Guide starts in it. */
  mode: (progress.completed.circle ? 'practice' : 'guide') as Mode,
  mirror: false,
  /** In Practice, answers stay hidden until the question is answered. */
  revealed: true,
  slopeOpen: false,
  /** Snap points drawn larger: the angles found in Practice. */
  highlight: [] as number[],
});
/** Whether answers (colors, values, labels) may show. */
export const revealed = () => ui.mode !== 'practice' || ui.revealed;

/* ---------- the pen motion ---------- */
// One motion drives every reaction to a mode switch or a reveal: the segmented control's thumb and the
// dots on the ring read the same progress value, so they move as one. Like a ballpoint pen's click it
// leans back first, then snaps through with a small overshoot and settles.
const LEAN = T.pen.lean, OVER = T.pen.over;
const easeIn = (t: number) => t * t * t, easeOut = (t: number) => 1 - (1 - t) ** 3;
export function penEase(t: number) {
  if (t < 0.28) return -LEAN * easeIn(t / 0.28) ** 0.6;
  if (t < 0.72) return -LEAN + (1 + OVER + LEAN) * easeOut((t - 0.28) / 0.44);
  return 1 + OVER - OVER * easeOut((t - 0.72) / 0.28);
}
export const PEN_MS = reduce ? 0 : T.pen.ms;
export const pen = new Tween(1, { duration: PEN_MS, easing: penEase });
/** The same motion's plain clock (0 → 1, linear), for things that run their own timing inside it. */
export const penClock = new Tween(1, { duration: PEN_MS });
/** Whether answers showed before the latest pen motion; the dots keep that look until it is halfway through. */
export const penFrom = $state({ revealed: true });
/** Run `change`, and start the pen motion if it switched the mode or what is revealed. */
function withPen(change: () => void) {
  const before = revealed(), mode = ui.mode;
  change();
  if (revealed() !== before || ui.mode !== mode) {
    penFrom.revealed = before;
    pen.set(0, { duration: 0 }).then(() => (pen.target = 1));
    penClock.set(0, { duration: 0 }).then(() => (penClock.target = 1));
  }
}

/* ---------- quiz ---------- */
type Saved = { best: number; missed: Question[] };
function load(): Saved {
  try { const s = JSON.parse(localStorage.getItem('ucq') || 'null'); if (s) return { best: s.best | 0, missed: Array.isArray(s.missed) ? s.missed : [] }; } catch {}
  return { best: 0, missed: [] };
}
class Quiz {
  streak = $state(0);
  best = $state(0);
  missed = $state<Question[]>([]);
  cur = $state<Question | null>(null);
  choices = $state<string[]>([]);
  answered = $state(false);
  /** Choice the learner picked (type 1), for marking it wrong. */
  picked = $state<number | null>(null);
  found = $state<number[]>([]);
  hint = $state(false);
  ok = $state(false);
  /** Short message in the action row (progress on type 2, "already found that one"). */
  note = $state<Rich | string>('');

  constructor() { const s = load(); this.best = s.best; this.missed = s.missed; }
  #save() { try { localStorage.setItem('ucq', JSON.stringify({ best: this.best, missed: this.missed })); } catch {} }

  start(q: Question = pickQ(this.missed, this.cur)) {
    this.cur = q; this.answered = false; this.found = []; this.hint = false; this.picked = null; this.note = '';
    this.choices = q.t === 1 ? makeChoices(q) : [];
    withPen(() => { ui.highlight = []; ui.revealed = false; });
  }
  useHint() { if (this.cur && !this.answered) this.hint = true; }
  answer(i: number) {
    const q = this.cur;
    if (!q || q.t !== 1 || this.answered) return;
    this.picked = i;
    this.#finish(this.choices[i] === trigTexAnswer(q));
  }
  /** Type 2: is the point on one of the solutions? */
  check() {
    const q = this.cur;
    if (!q || q.t !== 2 || this.answered) return;
    const d = point.deg, hit = q.sols.find((s) => Math.min(Math.abs(d - s), 360 - Math.abs(d - s)) < 1.2);
    if (hit === undefined) return this.#finish(false);
    if (this.found.includes(hit)) { this.note = 'You already found that one. Look for the other angle.'; return; }
    this.found.push(hit); ui.highlight = [...this.found];
    if (this.found.length === q.sols.length) this.#finish(true);
    else this.note = ['Yes, ', { m: angleTex(hit, progress.unit) }, '. Now find the other angle.'];
  }
  #finish(ok: boolean) {
    const q = this.cur!;
    this.answered = true; this.ok = ok; this.note = '';
    const at = this.missed.findIndex((m) => qKey(m) === qKey(q));
    if (ok) { if (!this.hint) { this.streak++; this.best = Math.max(this.best, this.streak); } if (at >= 0) this.missed.splice(at, 1); }
    else { this.streak = 0; if (at < 0) this.missed.push(q); }
    this.#save();
    if (q.t === 1) point.set(q.a, true);
    else { ui.highlight = [...q.sols]; point.set(q.sols.find((s) => !this.found.includes(s)) ?? q.sols[q.sols.length - 1], true); }
    withPen(() => (ui.revealed = true));
  }
}
export const quiz = new Quiz();

/** Topics other than the unit circle keep their state in their own modules, and register here what a mode or topic switch means for them. */
export const topicHooks: Partial<Record<Topic, { mode(m: Mode): void; enter(m: Mode): void }>> = {};

export function setTopic(t: Topic) {
  if (ui.topic === t) return;
  const from = ui.topic;
  // leaving inverse trig in the exploration, the unit circle's point takes the control's angle and slides to it
  if (t === 'circle' && from === 'inverse' && ui.mode === 'explore') point.set(norm(inverse.angleTo), true);
  withPen(() => {
    ui.topic = t; ui.slopeOpen = false; ui.highlight = [];
    // a topic without a Guide cannot be in Guide mode
    if (ui.mode === 'guide' && !guideTopics.has(t)) ui.mode = 'explore';
    const hook = topicHooks[t];
    if (hook) return hook.enter(ui.mode);
    if (ui.mode === 'practice') { if (!quiz.cur || quiz.answered) quiz.start(); else ui.revealed = quiz.answered; }
    else ui.revealed = true;
  });
}

export function setMode(m: Mode) {
  if (m === 'guide' && !guideTopics.has(ui.topic)) return;
  withPen(() => {
    ui.mode = m;
    const hook = topicHooks[ui.topic];
    if (hook) return hook.mode(m);
    if (m === 'practice') { if (!quiz.cur || quiz.answered) quiz.start(); else ui.revealed = quiz.answered; }
    else { ui.highlight = []; ui.revealed = true; solver.close(); }
  });
}

/* ---------- equation solver ("interactive demo") ---------- */
// A problem like csc θ = 2: rewrite it with operations until sin, cos or tan stands alone,
// then find both angles on the circle.
export type RecipKey = 'csc' | 'sec' | 'cot';
type Step = { eq: Eq; label: string };
const RECIP_FN = { csc: 'sin', sec: 'cos', cot: 'tan' } as const;

function makeProblem(k: RecipKey, prev?: number): Eq {
  const fn = RECIP_FN[k];
  const pool = SPECIAL.filter((a) => {
    const v = fnValue(fn, a);
    if (!Number.isFinite(v) || Math.abs(v) < 1e-9) return false;
    return SPECIAL.filter((b) => Math.abs(fnValue(fn, b) - v) < 1e-9).length === 2 && (prev === undefined || Math.abs(1 / v - prev) > 1e-9);
  });
  const a = pool[Math.floor(Math.random() * pool.length)];
  return { l: atom(k), r: num(1 / fnValue(fn, a)) };
}
const fnValue = (fn: 'sin' | 'cos' | 'tan', a: number) => {
  const c = Math.cos(rad(a)), s = Math.sin(rad(a));
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
  sols = $derived(this.target ? SPECIAL.filter((a) => Math.abs(fnValue(this.target!.fn, a) - this.target!.v) < 1e-9) : []);
  done = $derived(this.sols.length > 0 && this.found.length === this.sols.length);

  start(k: RecipKey) {
    this.key = k; this.open = true;
    this.#load(makeProblem(k));
  }
  next() { this.#load(makeProblem(this.key, (this.steps[0]?.eq.r as { v?: number })?.v)); }
  #load(eq: Eq) { this.steps = [{ eq, label: 'Solve' }]; this.found = []; this.note = ''; ui.highlight = []; }
  close() { this.open = false; ui.highlight = []; }
  apply(op: Op, label: string) {
    if (!this.current || this.target) return;
    this.steps.push({ eq: apply(this.current, op), label });
  }
  undo() { if (this.steps.length > 1) { this.steps.pop(); this.found = []; this.note = ''; ui.highlight = []; } }
  /** Is the point on one of the angles? */
  check() {
    if (!this.target || this.done) return;
    const d = point.deg, hit = this.sols.find((s) => Math.min(Math.abs(d - s), 360 - Math.abs(d - s)) < 1.2);
    if (hit === undefined) { this.note = 'Not there. Look where the value matches.'; return; }
    if (this.found.includes(hit)) { this.note = 'Already found. Look for the other angle.'; return; }
    this.found.push(hit); ui.highlight = [...this.found];
    this.note = this.done ? '' : ["Yes, ", { m: angleTex(hit, progress.unit) }, ". One more."];
  }
}
export const solver = new Solver();
