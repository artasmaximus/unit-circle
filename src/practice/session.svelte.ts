// One run of questions, for every topic: the streak, the best run, the missed list, the question
// being answered and what the learner picked. Practice is forgiving (hints, a saved best, a missed
// list); the Guide's exam is strict (no hints, a set number in a row with every kind of question
// among them). A topic supplies an adapter, which is everything that differs: what its questions
// are, how an answer is judged, and what a question does to the plane.
import type { Rich } from '../core/rich.ts';

export type Adapter<Q, C> = {
  /** Where the best run and the missed list are saved (Practice only). */
  storageKey: string;
  /** Identifies a question, so a missed one is not listed twice. */
  keyOf(q: Q): string;
  /** The next Practice question: sometimes one that was missed, never the one showing. */
  make(missed: Q[], cur: Q | null): Q;
  /** The answer choices for a question; none means it is answered by placing the point. */
  choices(q: Q): C[];
  isRight(q: Q, choice: C): boolean;
  /**
   * Judge a placing question. `true` and `false` end it; `null` means it goes on (the adapter may
   * set a `note` or record what was `found`).
   */
  check?(q: Q, s: Session<Q, C>): boolean | null;
  /** Set the plane up for a question, and show what the question gave away or hid. */
  stage?(q: Q, s: Session<Q, C>): void;
  /** Show the answer. */
  reveal?(q: Q, ok: boolean, s: Session<Q, C>): void;
  onHint?(q: Q): void;
  /** What the exam wants: how many in a row, and which kinds of question among them. */
  exam?: {
    streak: number;
    needs: string[];
    needsOf(q: Q): string[];
    /** An exam question, for a kind it still needs (or any kind, with null). */
    make(need: string | null, cur: Q | null): Q;
    onPass(): void;
  };
};

export class Session<Q, C> {
  readonly strict: boolean;
  streak = $state(0);
  best = $state(0);
  missed = $state<Q[]>([]);
  cur = $state<Q | null>(null);
  choices = $state<C[]>([]);
  answered = $state(false);
  picked = $state<number | null>(null);
  hint = $state(false);
  ok = $state(false);
  /** A short message in the action row ("already found that one"). */
  note = $state<Rich | string>('');
  /** For a question with several answers to place: the ones found so far. */
  found = $state<number[]>([]);
  /** The kinds of question answered right in this run (the exam wants them all). */
  seen = $state<string[]>([]);
  readonly #a: Adapter<Q, C>;

  /** The exam is passed: enough in a row, every kind of question among them. */
  get passed() {
    const e = this.#a.exam;
    return (
      !!e && this.strict && this.streak >= e.streak && e.needs.every((n) => this.seen.includes(n))
    );
  }
  /** What the exam wants among its run, for the checklist. */
  get needs() {
    return this.#a.exam?.needs ?? [];
  }
  get examStreak() {
    return this.#a.exam?.streak ?? 0;
  }

  constructor(adapter: Adapter<Q, C>, strict = false) {
    this.#a = adapter;
    this.strict = strict;
    if (strict) return;
    try {
      const s = JSON.parse(localStorage.getItem(adapter.storageKey) || 'null');
      if (s) {
        this.best = s.best | 0;
        this.missed = Array.isArray(s.missed) ? s.missed : [];
      }
    } catch {}
  }
  #save() {
    if (this.strict) return;
    try {
      localStorage.setItem(
        this.#a.storageKey,
        JSON.stringify({ best: this.best, missed: this.missed }),
      );
    } catch {}
  }

  /** The next question. The exam steers its last questions to a kind the run has not had yet. */
  #next(): Q {
    const e = this.#a.exam;
    if (!this.strict || !e) return this.#a.make(this.missed, this.cur);
    const lacking = e.needs.filter((n) => !this.seen.includes(n));
    const steer = lacking.length > 0 && e.streak - this.streak <= lacking.length;
    return e.make(steer ? lacking[0] : null, this.cur);
  }
  start(q: Q = this.#next()) {
    this.cur = q;
    this.answered = false;
    this.hint = false;
    this.picked = null;
    this.note = '';
    this.found = [];
    this.choices = this.#a.choices(q);
    this.#a.stage?.(q, this);
  }
  /** Come back to a question already on screen: set the plane as it was. */
  resume() {
    if (!this.cur) return;
    if (this.answered) this.#a.reveal?.(this.cur, this.ok, this);
    else this.#a.stage?.(this.cur, this);
  }
  useHint() {
    if (!this.cur || this.answered || this.strict) return;
    this.hint = true;
    this.#a.onHint?.(this.cur);
  }
  isRight(choice: C) {
    return !!this.cur && this.#a.isRight(this.cur, choice);
  }
  answer(i: number) {
    const q = this.cur;
    if (!q || this.answered || !this.choices.length) return;
    this.picked = i;
    this.#finish(this.#a.isRight(q, this.choices[i]));
  }
  /** A placing question: is the point where it asks? */
  check() {
    const q = this.cur;
    if (!q || this.answered || this.choices.length) return;
    const r = this.#a.check?.(q, this);
    if (r !== null && r !== undefined) this.#finish(r);
  }
  #finish(ok: boolean) {
    const q = this.cur!,
      a = this.#a;
    this.answered = true;
    this.ok = ok;
    this.note = '';
    const at = this.missed.findIndex((m) => a.keyOf(m) === a.keyOf(q));
    if (ok) {
      if (!this.hint) {
        this.streak++;
        this.best = Math.max(this.best, this.streak);
        const add = (a.exam?.needsOf(q) ?? []).filter((n) => !this.seen.includes(n));
        if (add.length) this.seen = [...this.seen, ...add];
      }
      if (at >= 0) this.missed.splice(at, 1);
    } else {
      this.streak = 0;
      if (this.strict) this.seen = [];
      else if (at < 0) this.missed.push(q);
    }
    this.#save();
    a.reveal?.(q, ok, this);
    if (this.passed) a.exam!.onPass();
  }
  /** Begin the exam run afresh (leaving and coming back does not keep a half-finished run). */
  reset() {
    this.streak = 0;
    this.seen = [];
    this.cur = null;
    this.answered = false;
  }
}
