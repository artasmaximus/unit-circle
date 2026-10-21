// All app state in one place. Components read it and call its methods; nothing else holds state.
import { norm, rad, snapDeg, specialOf, wrapPi } from './trig.ts';
import { makeChoices, pickQ, qKey, trigTexAnswer, type Question } from './quiz.ts';
import { DEFINITIONS, apply, type Eq, type Op } from './algebra.ts';

const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const TRAIL_MAX = 1.5;

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

  #vel = 0; #dotV = 0; #raf = 0; #last = 0; #prevAng = rad(45);

  set(deg: number, free = false) {
    this.target = rad(norm(free ? deg : snapDeg(deg)));
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
      this.#vel += (700 * wrapPi(this.target - ang) - 41 * this.#vel) * h; ang += this.#vel * h;
      this.#dotV += (800 * (rT - dotR) - 40 * this.#dotV) * h; dotR += this.#dotV * h;
    }
    ang = ((ang % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    // the tail grows with the distance travelled and reels back in when the point stops
    const tail = Math.max(-TRAIL_MAX, Math.min(TRAIL_MAX, this.tail + wrapPi(ang - this.#prevAng))) * Math.exp(-dt * 3.6);
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

export const ui = $state({
  mode: 'quiz' as 'explore' | 'quiz',
  mirror: false,
  /** In a quiz, answers stay hidden until the question is answered. */
  revealed: true,
  slopeOpen: false,
  /** Snap points drawn larger: the angles found in a quiz. */
  highlight: [] as number[],
});
/** Whether answers (colors, values, labels) may show. */
export const revealed = () => ui.mode !== 'quiz' || ui.revealed;

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
  note = $state<string | (string | { m: string })[]>('');

  constructor() { const s = load(); this.best = s.best; this.missed = s.missed; }
  #save() { try { localStorage.setItem('ucq', JSON.stringify({ best: this.best, missed: this.missed })); } catch {} }

  start(q: Question = pickQ(this.missed, this.cur)) {
    this.cur = q; this.answered = false; this.found = []; this.hint = false; this.picked = null; this.note = '';
    this.choices = q.t === 1 ? makeChoices(q) : [];
    ui.highlight = []; ui.revealed = false;
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
    else this.note = ['Yes, ', { m: `${hit}^\\circ` }, '. Now find the other angle.'];
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
    ui.revealed = true;
  }
}
export const quiz = new Quiz();

export function setMode(m: 'explore' | 'quiz') {
  ui.mode = m;
  if (m === 'quiz') { if (!quiz.cur || quiz.answered) quiz.start(); else ui.revealed = quiz.answered; }
  else { ui.highlight = []; ui.revealed = true; workshop.open = false; }
}

/* ---------- equation workshop ---------- */
export type RecipKey = 'csc' | 'sec' | 'cot';
type Step = { eq: Eq; label: string };
class Workshop {
  open = $state(false);
  key = $state<RecipKey>('csc');
  hard = $state(false);
  /** Steps per function, each starting from its definition. */
  steps = $state<Record<RecipKey, Step[]>>({
    csc: [{ eq: DEFINITIONS.csc, label: 'Definition' }],
    sec: [{ eq: DEFINITIONS.sec, label: 'Definition' }],
    cot: [{ eq: DEFINITIONS.cot, label: 'Definition' }],
  });
  current = $derived(this.steps[this.key].at(-1)!);

  show(k: RecipKey) { this.key = k; this.open = true; }
  do(op: Op, label: string) {
    const list = this.steps[this.key];
    list.push({ eq: apply(list.at(-1)!.eq, op), label });
    if (list.length > 14) list.splice(1, 1);
  }
  undo() { const l = this.steps[this.key]; if (l.length > 1) l.pop(); }
  reset() { this.steps[this.key].splice(1); }
}
export const workshop = new Workshop();
