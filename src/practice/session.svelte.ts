// One run of questions, for every topic: the streak, the best run, the missed list, the question
// being answered and what the learner picked. Practice is forgiving and teaches: sets of ten with a
// summary, a tally per skill that steers the next question, a second try after a wrong answer, hints,
// a saved best and a missed list. The Guide's exam is strict (no hints, no second try, a set number
// in a row with every kind of question among them). A topic supplies an adapter, which is everything
// that differs: what its questions are, how an answer is judged, and what a question does to the plane.
//
// The rules of a Practice question, in one place:
// - right first time: the streak grows, and the question leaves the missed list;
// - right after a hint: the streak holds, and the question leaves the missed list;
// - wrong first time: the streak holds while the learner tries once more;
// - right on the second try: the streak holds and the missed list stays as it was;
// - wrong twice: the streak starts again, the answer shows, and the question joins the missed list
//   and comes back in a few questions.
// A skill is marked right for a first-time answer, and wrong for a miss or a second try; a hint
// leaves it alone.
import { withPen } from '../core/app.svelte.ts';
import type { Rich } from '../core/rich.ts';
import {
  SET_SIZE,
  parseSkills,
  pickByNeed,
  record,
  takeDue,
  weakest,
  type Later,
  type Skills,
} from './skills.ts';

/** How many candidate questions to draw from, to choose the next by what the learner needs. */
const CANDIDATES = 6;
/** The chance that the next question is a random one from the saved missed list. */
const MISSED_CHANCE = 0.15;
/** A missed question comes back after this many questions, give or take. */
const COMES_BACK = 3;
/** How the learner did on one question of a set. */
export type Result<Q> = { q: Q; skill: string; ok: boolean; retried: boolean };

export type Adapter<Q, C> = {
  /** Where the best run and the missed list are saved (Practice only). */
  storageKey: string;
  /** Identifies a question, so a missed one is not listed twice. */
  keyOf(q: Q): string;
  /** A new Practice question, never the one showing. */
  make(cur: Q | null): Q;
  /** The named skill a question practises ("reference angles"), shown in the summary. */
  skillOf(q: Q): string;
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
  /** Show the answer, and for a wrong one where the right answer lives on the plane. */
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
  /** Right and wrong answers per skill (Practice only). */
  skills = $state<Skills>({});
  /** The questions of the set so far, and whether its summary is showing. */
  round = $state<Result<Q>[]>([]);
  summary = $state(false);
  /** Wrong tries on the question showing: Practice gives one second try. */
  tries = $state(0);
  /** The choices tried and found wrong, by index. */
  wrongPicks = $state<number[]>([]);
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
  /** Missed questions on their way back, and how many questions have been asked. */
  #later: Later<Q>[] = [];
  #asked = 0;

  /** The set is complete: the next step is its summary. */
  get setFull() {
    return !this.strict && this.round.length >= SET_SIZE;
  }
  /** The question just answered was only right on the second try. */
  get retried() {
    return this.ok && this.tries > 0;
  }
  /** The second try is on: the question was wrong once and is still open. */
  get retrying() {
    return this.tries > 0 && !this.answered;
  }
  /** What the set's summary lists to go over: questions missed, or only got on a second try. */
  get review(): Result<Q>[] {
    const seen = new Set<string>();
    return this.round.filter((r) => {
      const k = this.#a.keyOf(r.q);
      if ((r.ok && !r.retried) || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }
  /** The skills answered wrong most, for the summary. */
  get weakest() {
    return weakest(this.skills, 3);
  }

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
        this.skills = parseSkills(s.skills);
      }
    } catch {}
  }
  #save() {
    if (this.strict) return;
    try {
      localStorage.setItem(
        this.#a.storageKey,
        JSON.stringify({ best: this.best, missed: this.missed, skills: this.skills }),
      );
    } catch {}
  }

  /**
   * The next question. In Practice: a missed one whose turn has come, now and then a saved one,
   * otherwise the one that practises the weakest skill among a few new ones. The exam steers its last
   * questions to a kind the run has not had yet.
   */
  #next(): Q {
    const a = this.#a,
      e = a.exam;
    if (this.strict && e) {
      const lacking = e.needs.filter((n) => !this.seen.includes(n));
      const steer = lacking.length > 0 && e.streak - this.streak <= lacking.length;
      return e.make(steer ? lacking[0] : null, this.cur);
    }
    const due = takeDue(this.#later, this.#asked);
    if (due) return due;
    const cur = this.cur,
      others = this.missed.filter((m) => !cur || a.keyOf(m) !== a.keyOf(cur));
    if (others.length && Math.random() < MISSED_CHANCE)
      return others[Math.floor(Math.random() * others.length)];
    const cands = Array.from({ length: CANDIDATES }, () => a.make(cur));
    return pickByNeed(cands, a.skillOf, this.skills);
  }
  /** Ask a question (the next one, unless given): a finished set begins a new one. */
  start(q: Q = this.#next()) {
    // an open question hides the plane's answers, so asking one is a reveal change and plays it
    withPen(() => this.#ask(q));
  }
  #ask(q: Q) {
    if (!this.strict) {
      if (this.setFull) this.round = [];
      this.summary = false;
      this.#asked++;
    }
    this.tries = 0;
    this.wrongPicks = [];
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
  /** Go on from an answered question: to the next, or after the last of a set to its summary. */
  next() {
    if (this.setFull) this.summary = true;
    else this.start();
  }
  /** Begin a set with the questions to go over from the last one first. */
  practiceReview() {
    const at = this.#asked;
    this.review.forEach((r, i) => this.#later.push({ q: r.q, due: at + 2 * i }));
    this.start();
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
    const ok = this.#a.isRight(q, this.choices[i]);
    if (!ok) this.wrongPicks.push(i);
    this.#judge(ok);
  }
  /** A placing question: is the point where it asks? */
  check() {
    const q = this.cur;
    if (!q || this.answered || this.choices.length) return;
    const r = this.#a.check?.(q, this);
    if (r !== null && r !== undefined) this.#judge(r);
  }
  /** A first wrong answer in Practice gets a second try; anything else ends the question. */
  #judge(ok: boolean) {
    if (ok || this.strict || this.tries > 0) return this.#finish(ok);
    this.tries = 1;
    this.note = this.choices.length
      ? 'Not quite. The streak holds while you try once more: pick another answer.'
      : 'Not quite. The streak holds while you try once more: move the point and press Check.';
  }
  #finish(ok: boolean) {
    withPen(() => this.#end(ok));
  }
  #end(ok: boolean) {
    const q = this.cur!,
      a = this.#a,
      retried = this.tries > 0;
    this.answered = true;
    this.ok = ok;
    this.note = '';
    const at = this.missed.findIndex((m) => a.keyOf(m) === a.keyOf(q));
    if (!this.strict) {
      const skill = a.skillOf(q);
      if (!ok || retried || !this.hint) record(this.skills, skill, ok && !retried);
      this.round.push({ q, skill, ok, retried });
    }
    if (ok) {
      if (!this.hint && !retried) {
        this.streak++;
        this.best = Math.max(this.best, this.streak);
        const add = (a.exam?.needsOf(q) ?? []).filter((n) => !this.seen.includes(n));
        if (add.length) this.seen = [...this.seen, ...add];
      }
      if (at >= 0 && !retried) this.missed.splice(at, 1);
    } else {
      this.streak = 0;
      if (this.strict) this.seen = [];
      else {
        if (at < 0) this.missed.push(q);
        this.#later.push({ q, due: this.#asked + COMES_BACK + Math.floor(Math.random() * 3) });
      }
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
