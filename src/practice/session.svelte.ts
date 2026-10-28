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

/** What differs between a Practice set and the exam; the Session holds the state both share. */
type Mode<Q, C> = {
  /** Hints and a second try after a wrong answer (Practice only). */
  forgiving: boolean;
  /** Bring back the saved best, missed list and skills. */
  restore(s: Session<Q, C>): void;
  /** The set is complete: the next step is its summary. */
  setFull(s: Session<Q, C>): boolean;
  /** The exam is passed: enough in a row, every kind of question among them. */
  passed(s: Session<Q, C>): boolean;
  next(s: Session<Q, C>): Q;
  /** A question is being asked. */
  asking(s: Session<Q, C>): void;
  /** A question has been answered and the streak updated: the rest of what the answer changes. */
  answered(s: Session<Q, C>, q: Q, ok: boolean, retried: boolean): void;
  /** Queue questions to come back soon, the first due now. */
  requeue(rs: Result<Q>[]): void;
};

/**
 * A Practice set: a tally per skill that steers the next question, a missed list that brings
 * questions back, a saved best.
 */
class PracticeRun<Q, C> implements Mode<Q, C> {
  readonly forgiving = true;
  readonly #a: Adapter<Q, C>;
  /** Missed questions on their way back, and how many questions have been asked. */
  #later: Later<Q>[] = [];
  #asked = 0;

  constructor(a: Adapter<Q, C>) {
    this.#a = a;
  }
  restore(s: Session<Q, C>) {
    try {
      const saved = JSON.parse(localStorage.getItem(this.#a.storageKey) || 'null');
      if (saved) {
        s.best = saved.best | 0;
        s.missed = Array.isArray(saved.missed) ? saved.missed : [];
        s.skills = parseSkills(saved.skills);
      }
    } catch {}
  }
  setFull(s: Session<Q, C>) {
    return s.round.length >= SET_SIZE;
  }
  passed() {
    return false;
  }
  /**
   * A missed one whose turn has come, now and then a saved one, otherwise the one that practises
   * the weakest skill among a few new ones.
   */
  next(s: Session<Q, C>): Q {
    const a = this.#a;
    const due = takeDue(this.#later, this.#asked);
    if (due) return due;
    const cur = s.cur,
      others = s.missed.filter((m) => !cur || a.keyOf(m) !== a.keyOf(cur));
    if (others.length && Math.random() < MISSED_CHANCE)
      return others[Math.floor(Math.random() * others.length)];
    const cands = Array.from({ length: CANDIDATES }, () => a.make(cur));
    return pickByNeed(cands, a.skillOf, s.skills);
  }
  asking(s: Session<Q, C>) {
    if (this.setFull(s)) s.round = [];
    s.summary = false;
    this.#asked++;
  }
  answered(s: Session<Q, C>, q: Q, ok: boolean, retried: boolean) {
    const a = this.#a,
      skill = a.skillOf(q),
      at = s.missed.findIndex((m) => a.keyOf(m) === a.keyOf(q));
    if (!ok || retried || !s.hint) record(s.skills, skill, ok && !retried);
    s.round.push({ q, skill, ok, retried });
    if (ok) {
      if (at >= 0 && !retried) s.missed.splice(at, 1);
    } else {
      if (at < 0) s.missed.push(q);
      this.#later.push({ q, due: this.#asked + COMES_BACK + Math.floor(Math.random() * 3) });
    }
    try {
      localStorage.setItem(
        a.storageKey,
        JSON.stringify({ best: s.best, missed: s.missed, skills: s.skills }),
      );
    } catch {}
  }
  requeue(rs: Result<Q>[]) {
    const at = this.#asked;
    rs.forEach((r, i) => this.#later.push({ q: r.q, due: at + 2 * i }));
  }
}

/**
 * The Guide's exam: nothing is saved, a miss starts the run again, and the last questions are
 * steered to a kind the run has not had yet.
 */
class ExamRun<Q, C> implements Mode<Q, C> {
  readonly forgiving = false;
  readonly #a: Adapter<Q, C>;

  constructor(a: Adapter<Q, C>) {
    this.#a = a;
  }
  restore() {}
  setFull() {
    return false;
  }
  passed(s: Session<Q, C>) {
    const e = this.#a.exam;
    return !!e && s.streak >= e.streak && e.needs.every((n) => s.seen.includes(n));
  }
  next(s: Session<Q, C>): Q {
    const e = this.#a.exam!;
    const lacking = e.needs.filter((n) => !s.seen.includes(n));
    const steer = lacking.length > 0 && e.streak - s.streak <= lacking.length;
    return e.make(steer ? lacking[0] : null, s.cur);
  }
  asking() {}
  answered(s: Session<Q, C>, _q: Q, ok: boolean) {
    if (!ok) s.seen = [];
  }
  requeue() {}
}

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
  readonly #mode: Mode<Q, C>;

  /** The set is complete: the next step is its summary. */
  get setFull() {
    return this.#mode.setFull(this);
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
    return this.#mode.passed(this);
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
    this.#mode = strict ? new ExamRun(adapter) : new PracticeRun(adapter);
    this.#mode.restore(this);
  }

  /** Ask a question (the next one, unless given): a finished set begins a new one. */
  start(q: Q = this.#mode.next(this)) {
    // an open question hides the plane's answers, so asking one is a reveal change and plays it
    withPen(() => this.#ask(q));
  }
  #ask(q: Q) {
    this.#mode.asking(this);
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
    this.#mode.requeue(this.review);
    this.start();
  }
  useHint() {
    if (!this.cur || this.answered || !this.#mode.forgiving) return;
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
    if (ok || !this.#mode.forgiving || this.tries > 0) return this.#finish(ok);
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
    if (ok) {
      if (!this.hint && !retried) {
        this.streak++;
        this.best = Math.max(this.best, this.streak);
        const add = (a.exam?.needsOf(q) ?? []).filter((n) => !this.seen.includes(n));
        if (add.length) this.seen = [...this.seen, ...add];
      }
    } else this.streak = 0;
    this.#mode.answered(this, q, ok, retried);
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
