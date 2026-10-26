// The Inverse trig quiz: streak, missed questions, the current question and how it sets up the
// plane. Question content itself is pure and lives in quiz.ts.
import { inverse } from './state.svelte.ts';
import { partnerAt } from './math.ts';
import { answerOf, iqKey, makeChoices, pickQ, type IQ } from './quiz.ts';
import type { Rich } from '../circle/quiz.ts';
import { point, topicHooks, ui, type Mode } from '../../core/state.svelte.ts';

const KEY = 'ucq-inv';
function load(): { best: number; missed: IQ[] } {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s) return { best: s.best | 0, missed: Array.isArray(s.missed) ? s.missed : [] };
  } catch {}
  return { best: 0, missed: [] };
}

class InvQuiz {
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

  constructor() {
    const s = load();
    this.best = s.best;
    this.missed = s.missed;
  }
  #save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ best: this.best, missed: this.missed }));
    } catch {}
  }

  /**
   * Lay the plane out for a question: the function, the value, what is given, and the answer held
   * back.
   */
  #stage(q: IQ) {
    inverse.switchTo(q.fn);
    // an evaluate question hands you the circle to probe: you pick angles and read each one's
    // value, but nothing marks the answer. The other two keep the plane still or hold the answer
    // back.
    inverse.showOther = false;
    inverse.showBand = false;
    inverse.shown = q.t === 1;
    inverse.locked = false;
    // a composition question hands you a free point to work with: move it by the ring or either
    // axis and read what it shows
    if (q.t === 2) inverse.startProbe(q.theta);
    else inverse.stopProbe();
    inverse.given = q.t === 2 ? q.theta : null;
    inverse.domain = q.t === 2 ? q.dom : null;
    if (q.t === 2) inverse.setValue(partnerAt(q.fn, q.theta)!);
    else inverse.setValue(0);
  }
  /** Put the plane back as the exploration leaves it. */
  explorePlane() {
    inverse.shown = true;
    inverse.showBand = true;
    inverse.locked = false;
    inverse.given = null;
    inverse.domain = null;
    inverse.stopProbe();
  }
  start(q: IQ = pickQ(this.missed, this.cur)) {
    this.cur = q;
    this.answered = false;
    this.hint = false;
    this.picked = null;
    this.note = '';
    this.choices = q.t === 3 ? [] : makeChoices(q);
    this.#stage(q);
  }
  resume() {
    if (this.cur && !this.answered) this.#stage(this.cur);
    else if (this.cur) this.#reveal(this.cur);
  }
  useHint() {
    if (this.cur && !this.answered) {
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
  #reveal(q: IQ) {
    inverse.shown = true;
    inverse.showOther = true;
    inverse.showBand = true;
    inverse.locked = true;
    inverse.stopProbe();
    if (q.t === 1) inverse.setValue(q.v);
    if (q.t === 3) inverse.setAngle(q.ang);
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
      }
      if (at >= 0) this.missed.splice(at, 1);
    } else {
      this.streak = 0;
      if (at < 0) this.missed.push(q);
    }
    this.#save();
    this.#reveal(q);
  }
}
export const invQuiz = new InvQuiz();

// what switching to this topic, or switching mode inside it, does to the plane
function apply(m: Mode) {
  ui.revealed = true;
  ui.highlight = [];
  if (m !== 'practice') return invQuiz.explorePlane();
  if (!invQuiz.cur || invQuiz.answered) invQuiz.start();
  else invQuiz.resume();
}
// arriving in the exploration, the control takes on the unit circle's angle and slides to where it
// lives here
topicHooks.inverse = {
  mode: apply,
  enter: (m) => {
    if (m !== 'practice') inverse.adopt(point.deg);
    apply(m);
  },
};
