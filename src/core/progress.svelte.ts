// What a learner has earned and prefers, kept in this browser: which topics they have completed (by
// passing their Guide's exam), how far they got in each Guide, which capabilities that has unlocked
// (a topic names what completing it unlocks: TopicDef.unlocks), and which unit they chose. A
// capability also opens for a teacher with ?unlock=<capability> (or everything, with ?teacher) in
// the address, which is remembered.
import type { Unit } from './angles.ts';

const KEY = 'ucp';
export type GuideTopic = string;
/** The capability that lets angles be written in radians (and so the ° | rad switch). */
const RADIANS = 'radians';
type Saved = {
  unlocked: Record<string, boolean>;
  teacher: boolean;
  unit: Unit;
  completed: Partial<Record<GuideTopic, boolean>>;
  step: Partial<Record<GuideTopic, number>>;
};

function load(): Saved {
  let s: Saved = { unlocked: {}, teacher: false, unit: 'deg', completed: {}, step: {} };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw)
      s = {
        // `radians` is how an earlier version kept the one capability there was
        unlocked: { ...raw.unlocked, ...(raw.radians && { [RADIANS]: true }) },
        teacher: !!raw.teacher,
        unit: raw.unit === 'rad' ? 'rad' : 'deg',
        completed: raw.completed ?? {},
        step: raw.step ?? {},
      };
  } catch {}
  try {
    const q = new URLSearchParams(location.search);
    const cap = q.get('unlock');
    if (cap) s.unlocked[cap] = true;
    if (q.has('teacher')) s.teacher = true;
  } catch {}
  return s;
}

class Progress {
  /** Capabilities earned by completing topics (or unlocked by the address), and the teacher's all. */
  unlocked = $state<Record<string, boolean>>({});
  teacher = $state(false);
  /** Whether angles may be written in radians. */
  radiansUnlocked = $derived(this.teacher || !!this.unlocked[RADIANS]);
  /** The unit the learner picked, which counts only once radians are unlocked. */
  pick = $state<Unit>('deg');
  /** The unit in force everywhere an angle is written. */
  unit = $derived<Unit>(this.radiansUnlocked ? this.pick : 'deg');
  /** Topics whose Guide exam has been passed, and the step each Guide was last on. */
  completed = $state<Partial<Record<GuideTopic, boolean>>>({});
  step = $state<Partial<Record<GuideTopic, number>>>({});
  /**
   * What completing a topic unlocks. The shell sets this from the topic registry (which imports
   * this module, so it cannot be imported here).
   */
  unlocksOf: (t: GuideTopic) => string | undefined = () => undefined;

  constructor() {
    const s = load();
    this.unlocked = s.unlocked;
    this.teacher = s.teacher;
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
          unlocked: this.unlocked,
          teacher: this.teacher,
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
  setStep(t: GuideTopic, i: number) {
    this.step[t] = i;
    this.#save();
  }
  /** A topic's Guide exam is passed: it is complete, and whatever it unlocks opens. */
  complete(t: GuideTopic) {
    this.completed[t] = true;
    const cap = this.unlocksOf(t);
    if (cap) this.unlocked[cap] = true;
    this.#save();
  }
}
export const progress = new Progress();
