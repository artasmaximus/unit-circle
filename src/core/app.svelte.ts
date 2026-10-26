// Which topic and mode the app is in, what may show, and the one motion that plays when any of
// that changes. Each topic keeps its own state in its own folder and registers hooks here for what
// arriving, leaving or switching mode means for it.
import { Tween } from 'svelte/motion';
import { progress } from './progress.svelte.ts';
import { reduce } from './transition.ts';
import * as T from './tuning.ts';

export type Topic = 'circle' | 'inverse' | 'radians';
/**
 * How a topic is being used: Guide is the guided path (only some topics have one), Explore is free
 * play, Practice is questions.
 */
export type Mode = 'guide' | 'explore' | 'practice';
/** The topics that have a Guide. */
export const guideTopics: ReadonlySet<Topic> = new Set<Topic>(['radians', 'circle', 'inverse']);
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
// One motion drives every reaction to a mode switch or a reveal: the segmented control's thumb and
// the dots on the ring read the same progress value, so they move as one. Like a ballpoint pen's
// click it leans back first, then snaps through with a small overshoot and settles.
const LEAN = T.pen.lean,
  OVER = T.pen.over;
const easeIn = (t: number) => t * t * t,
  easeOut = (t: number) => 1 - (1 - t) ** 3;
export function penEase(t: number) {
  if (t < 0.28) return -LEAN * easeIn(t / 0.28) ** 0.6;
  if (t < 0.72) return -LEAN + (1 + OVER + LEAN) * easeOut((t - 0.28) / 0.44);
  return 1 + OVER - OVER * easeOut((t - 0.72) / 0.28);
}
export const PEN_MS = reduce ? 0 : T.pen.ms;
export const pen = new Tween(1, { duration: PEN_MS, easing: penEase });
/**
 * The same motion's plain clock (0 → 1, linear), for things that run their own timing inside it.
 */
export const penClock = new Tween(1, { duration: PEN_MS });
/**
 * Whether answers showed before the latest pen motion; the dots keep that look until it is halfway
 * through.
 */
export const penFrom = $state({ revealed: true });
/**
 * Run `change`, and start the pen motion if it switched the mode or what is revealed (or always,
 * with `force`: a topic switch has to glide the topic bar's thumb even when nothing else changes).
 */
export function withPen(change: () => void, force = false) {
  const before = revealed(),
    mode = ui.mode;
  change();
  if (force || revealed() !== before || ui.mode !== mode) {
    penFrom.revealed = before;
    pen.set(0, { duration: 0 }).then(() => (pen.target = 1));
    penClock.set(0, { duration: 0 }).then(() => (penClock.target = 1));
  }
}

/**
 * Topics other than the unit circle keep their state in their own modules, and register here what a
 * mode or topic switch means for them.
 */
export type TopicHooks = {
  /** Switching mode inside the topic. */
  mode(m: Mode): void;
  /** Arriving at the topic, in the mode the app is in. */
  enter(m: Mode): void;
  /** Leaving the topic for `to`, before the switch plays. */
  leave?(to: Topic, m: Mode): void;
};
export const topicHooks: Partial<Record<Topic, TopicHooks>> = {};

export function setTopic(t: Topic) {
  if (ui.topic === t) return;
  topicHooks[ui.topic]?.leave?.(t, ui.mode);
  withPen(() => {
    ui.topic = t;
    ui.slopeOpen = false;
    ui.highlight = [];
    // a topic without a Guide cannot be in Guide mode
    if (ui.mode === 'guide' && !guideTopics.has(t)) ui.mode = 'explore';
    topicHooks[t]?.enter(ui.mode);
  }, true);
}

export function setMode(m: Mode) {
  if (m === 'guide' && !guideTopics.has(ui.topic)) return;
  withPen(() => {
    ui.mode = m;
    topicHooks[ui.topic]?.mode(m);
  });
}
