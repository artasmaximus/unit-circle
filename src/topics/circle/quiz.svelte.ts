// The unit circle's Practice: the streak, the best run, missed questions, and the question being
// answered. Question content itself is pure and lives in quiz.ts.
import { angleTex } from '../../core/angles.ts';
import { ui, withPen } from '../../core/app.svelte.ts';
import { point } from '../../core/point.svelte.ts';
import { progress } from '../../core/progress.svelte.ts';
import type { Rich } from '../../core/rich.ts';
import { makeChoices, pickQ, qKey, trigTexAnswer, type Question } from './quiz.ts';

type Saved = { best: number; missed: Question[] };
function load(): Saved {
  try {
    const s = JSON.parse(localStorage.getItem('ucq') || 'null');
    if (s) return { best: s.best | 0, missed: Array.isArray(s.missed) ? s.missed : [] };
  } catch {}
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

  constructor() {
    const s = load();
    this.best = s.best;
    this.missed = s.missed;
  }
  #save() {
    try {
      localStorage.setItem('ucq', JSON.stringify({ best: this.best, missed: this.missed }));
    } catch {}
  }

  start(q: Question = pickQ(this.missed, this.cur)) {
    this.cur = q;
    this.answered = false;
    this.found = [];
    this.hint = false;
    this.picked = null;
    this.note = '';
    this.choices = q.t === 1 ? makeChoices(q) : [];
    withPen(() => {
      ui.highlight = [];
      ui.revealed = false;
    });
  }
  useHint() {
    if (this.cur && !this.answered) this.hint = true;
  }
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
    const d = point.deg,
      hit = q.sols.find((s) => Math.min(Math.abs(d - s), 360 - Math.abs(d - s)) < 1.2);
    if (hit === undefined) return this.#finish(false);
    if (this.found.includes(hit)) {
      this.note = 'You already found that one. Look for the other angle.';
      return;
    }
    this.found.push(hit);
    ui.highlight = [...this.found];
    if (this.found.length === q.sols.length) this.#finish(true);
    else this.note = ['Yes, ', { m: angleTex(hit, progress.unit) }, '. Now find the other angle.'];
  }
  #finish(ok: boolean) {
    const q = this.cur!;
    this.answered = true;
    this.ok = ok;
    this.note = '';
    const at = this.missed.findIndex((m) => qKey(m) === qKey(q));
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
    if (q.t === 1) point.set(q.a, true);
    else {
      ui.highlight = [...q.sols];
      point.set(q.sols.find((s) => !this.found.includes(s)) ?? q.sols[q.sols.length - 1], true);
    }
    withPen(() => (ui.revealed = true));
  }
}
export const quiz = new Quiz();
