// What a learner has earned and prefers, kept in this browser: which topics they have completed (by
// passing their Guide's exam), how far they got in each Guide, whether the radians display is
// unlocked, and which unit they chose. Radians unlock when the Radians topic is completed, or for a
// teacher with ?unlock=radians (or ?teacher) in the address, which is remembered.
import type { Unit } from './angles.ts';

const KEY = 'ucp';
export type GuideTopic = string;
type Saved = {
  radians: boolean;
  unit: Unit;
  completed: Partial<Record<GuideTopic, boolean>>;
  step: Partial<Record<GuideTopic, number>>;
};

function load(): Saved {
  let s: Saved = { radians: false, unit: 'deg', completed: {}, step: {} };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw)
      s = {
        radians: !!raw.radians,
        unit: raw.unit === 'rad' ? 'rad' : 'deg',
        completed: raw.completed ?? {},
        step: raw.step ?? {},
      };
  } catch {}
  try {
    const q = new URLSearchParams(location.search);
    if (q.get('unlock') === 'radians' || q.has('teacher')) s.radians = true;
  } catch {}
  return s;
}

class Progress {
  radiansUnlocked = $state(false);
  /** The unit the learner picked, which counts only once radians are unlocked. */
  pick = $state<Unit>('deg');
  /** The unit in force everywhere an angle is written. */
  unit = $derived<Unit>(this.radiansUnlocked ? this.pick : 'deg');
  /** Topics whose Guide exam has been passed, and the step each Guide was last on. */
  completed = $state<Partial<Record<GuideTopic, boolean>>>({});
  step = $state<Partial<Record<GuideTopic, number>>>({});

  constructor() {
    const s = load();
    this.radiansUnlocked = s.radians;
    this.pick = s.unit;
    this.completed = s.completed;
    this.step = s.step;
    this.#save();
  }
  #save() {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          radians: this.radiansUnlocked,
          unit: this.pick,
          completed: this.completed,
          step: this.step,
        }),
      );
    } catch {}
  }
  setUnit(u: Unit) {
    if (u === 'rad' && !this.radiansUnlocked) return;
    this.pick = u;
    this.#save();
  }
  unlockRadians() {
    this.radiansUnlocked = true;
    this.#save();
  }
  setStep(t: GuideTopic, i: number) {
    this.step[t] = i;
    this.#save();
  }
  /** A topic's Guide exam is passed: it is complete, and whatever it unlocks opens. */
  complete(t: GuideTopic) {
    this.completed[t] = true;
    if (t === 'radians') this.radiansUnlocked = true;
    this.#save();
  }
}
export const progress = new Progress();
