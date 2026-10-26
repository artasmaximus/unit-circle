// A run of Inverse trig questions and how each one sets up the plane. Practice is forgiving
// (hints, a saved best and a missed list); the Guide's exam is strict (no hints, ten in a row,
// with arcsin, arccos and arctan and a composition question among them). Question content itself
// is pure and lives in quiz.ts.
import { inverse } from './state.svelte.ts';
import { partnerAt, type InvFn } from './math.ts';
import { FNS, answerOf, iqKey, makeChoices, makeQ, pickQ, type IQ } from './quiz.ts';
import type { Rich } from '../../core/rich.ts';
import { progress } from '../../core/progress.svelte.ts';

const KEY = 'ucq-inv';
/** How many in a row the exam wants. */
export const EXAM_STREAK = 10;
/** What the exam wants among its run: each function, and a composition question. */
export type Need = InvFn | 'compose';
export const EXAM_NEEDS: Need[] = [...FNS, 'compose'];
const needsOf = (q: IQ): Need[] => (q.t === 2 ? [q.fn, 'compose'] : [q.fn]);

/** Lay the plane out for a question: the function, the value, what is given, the answer held back. */
function stage(q: IQ) {
  inverse.switchTo(q.fn);
  // an evaluate question hands you the circle to probe: you pick angles and read each one's value,
  // but nothing marks the answer. The other two keep the plane still or hold the answer back.
  inverse.showOther = false;
  inverse.showBand = false;
  inverse.shown = q.t === 1;
  inverse.locked = false;
  // a composition question hands you a free point to work with: move it by the ring or either axis
  // and read what it shows
  if (q.t === 2) inverse.startProbe(q.theta);
  else inverse.stopProbe();
  inverse.given = q.t === 2 ? q.theta : null;
  inverse.domain = q.t === 2 ? q.dom : null;
  if (q.t === 2) inverse.setValue(partnerAt(q.fn, q.theta)!);
  else inverse.setValue(0);
}
/** Show the answer, and keep the control still while it shows. */
function reveal(q: IQ) {
  inverse.shown = true;
  inverse.showOther = true;
  inverse.showBand = true;
  inverse.locked = true;
  inverse.stopProbe();
  if (q.t === 1) inverse.setValue(q.v);
  if (q.t === 3) inverse.setAngle(q.ang);
}

export class InvSession {
  readonly strict: boolean;
  streak = $state(0);
  best = $state(0);
  missed = $state<IQ[]>([]);
  cur = $state<IQ | null>(null);
  /**
   * The answer choices, as angles in degrees: they are written in the learner's unit when drawn, so
   * switching unit mid-question just rewrites them.
   */
  choices = $state<number[]>([]);
  answered = $state(false);
  picked = $state<number | null>(null);
  hint = $state(false);
  ok = $state(false);
  note = $state<Rich | string>('');
  /** What this run has answered correctly (the exam wants every need). */
  seen = $state<Need[]>([]);
  /** The exam is passed: enough in a row, with every need among them. */
  get passed() {
    return (
      this.strict && this.streak >= EXAM_STREAK && EXAM_NEEDS.every((n) => this.seen.includes(n))
    );
  }

  constructor(strict: boolean) {
    this.strict = strict;
    if (strict) return;
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s) {
        this.best = s.best | 0;
        this.missed = Array.isArray(s.missed) ? s.missed : [];
      }
    } catch {}
  }
  #save() {
    if (this.strict) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ best: this.best, missed: this.missed }));
    } catch {}
  }

  /** The exam's next question: steered to what the run still lacks once it is running short. */
  #next(): IQ {
    if (!this.strict) return pickQ(this.missed, this.cur);
    const lacking = EXAM_NEEDS.filter((n) => !this.seen.includes(n));
    if (lacking.length && EXAM_STREAK - this.streak <= lacking.length) {
      const n = lacking[0];
      return n === 'compose' ? makeQ({ t: 2 }) : makeQ({ fn: n });
    }
    let q: IQ,
      k = 0;
    do q = makeQ();
    while (this.cur && iqKey(q) === iqKey(this.cur) && k++ < 8);
    return q;
  }
  start(q: IQ = this.#next()) {
    this.cur = q;
    this.answered = false;
    this.hint = false;
    this.picked = null;
    this.note = '';
    this.choices = q.t === 3 ? [] : makeChoices(q);
    stage(q);
  }
  resume() {
    if (this.cur && !this.answered) stage(this.cur);
    else if (this.cur) reveal(this.cur);
  }
  useHint() {
    if (this.cur && !this.answered && !this.strict) {
      this.hint = true;
      inverse.showBand = true;
    }
  }
  answer(i: number) {
    const q = this.cur;
    if (!q || q.t === 3 || this.answered) return;
    this.picked = i;
    this.#finish(this.choices[i] === answerOf(q));
  }
  /** Type 3: is the control where the question asked? */
  check() {
    const q = this.cur;
    if (!q || q.t !== 3 || this.answered) return;
    this.#finish(Math.abs(inverse.angle - q.ang) < 1.2);
  }
  #finish(ok: boolean) {
    const q = this.cur!;
    this.answered = true;
    this.ok = ok;
    this.note = '';
    const at = this.missed.findIndex((m) => iqKey(m) === iqKey(q));
    if (ok) {
      if (!this.hint) {
        this.streak++;
        this.best = Math.max(this.best, this.streak);
        const add = needsOf(q).filter((n) => !this.seen.includes(n));
        if (add.length) this.seen = [...this.seen, ...add];
      }
      if (at >= 0) this.missed.splice(at, 1);
    } else {
      this.streak = 0;
      if (this.strict) this.seen = [];
      else if (at < 0) this.missed.push(q);
    }
    this.#save();
    reveal(q);
    if (this.passed) progress.complete('inverse');
  }
  /** Begin the exam run afresh (leaving and coming back does not keep a half-finished run). */
  reset() {
    this.streak = 0;
    this.seen = [];
    this.cur = null;
    this.answered = false;
  }
}

/** Practice, and the Guide's exam. */
export const invQuiz = new InvSession(false);
export const invExam = new InvSession(true);

/** Put the plane back as the exploration leaves it. */
export function explorePlane() {
  inverse.shown = true;
  inverse.showBand = true;
  inverse.locked = false;
  inverse.given = null;
  inverse.domain = null;
  inverse.stopProbe();
}
