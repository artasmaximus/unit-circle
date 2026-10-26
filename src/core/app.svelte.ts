// Which topic and mode the app is in, what may show, and the one motion that plays when any of
// that changes. Each topic keeps its own state in its own folder and registers hooks here for what
// arriving, leaving or switching mode means for it.
import type { Component } from 'svelte';
import { Tween } from 'svelte/motion';
import type { Unit } from './angles.ts';
import { progress } from './progress.svelte.ts';
import { reduce } from './transition.ts';
import * as T from './tuning.ts';

/** A topic's id: the key of its entry in the registry below. */
export type Topic = string;
/**
 * How a topic is being used: Guide is the guided path (only some topics have one), Explore is free
 * play, Practice is questions.
 */
export type Mode = 'guide' | 'explore' | 'practice';

/**
 * Everything the shell needs to know about a topic. Topics describe themselves with one of these
 * (each topic's topic.ts) and are registered once at startup (topics/index.ts); the panel, the tab
 * bar, the plane and the ring read the registry, so none of them names a topic.
 */
export type TopicDef = {
  id: Topic;
  /** The heading over the panel. */
  title: string;
  /** Its entry in the tab bar. */
  tab: { label: string; icon: Component<{ size?: number }> };
  /** The panel for each mode; a topic without a `guide` has no Guide. */
  views: { guide?: Component; explore: Component; practice: Component };
  /**
   * What it draws on the plane. Every topic's layers stay mounted, so when a topic is left its
   * marks play their exits; a layer asks for no marks while its topic is not showing. `under`
   * layers sit beneath the ring's dots.
   */
  layers: { component: Component<any>; props?: Record<string, unknown>; under?: boolean }[];
  /** Floating over the plane (the unit circle's chips); mounted always, shows itself. */
  overlay?: Component;
  /** What switching mode, arriving and leaving mean for the topic (its state lives in its folder). */
  hooks: TopicHooks;
  /** The angle readout in the plane's corner: absent, or the unit it insists on. */
  angleInput?: () => { unit?: Unit } | null;
  /** How the shared ring is written while this topic shows. */
  ring?: () => { unit?: Unit; labels?: boolean; taken?: (deg: number) => boolean };
};
const registry: TopicDef[] = [];
export function registerTopics(...defs: TopicDef[]) {
  registry.push(...defs);
}
/** Every topic, in tab bar order. */
export const topics: readonly TopicDef[] = registry;
export const topicDef = (id: Topic): TopicDef => registry.find((t) => t.id === id) ?? registry[0];
/** Whether a topic has a Guide. */
export const hasGuide = (id: Topic) => !!topicDef(id).views.guide;
/** The topic the app opens on. */
export const HOME: Topic = 'circle';
export const ui = $state({
  /** The concept on the plane, picked in the tab bar. */
  topic: HOME,
  /** A learner who has not finished the unit circle's Guide starts in it. */
  mode: (progress.completed.circle ? 'practice' : 'guide') as Mode,
  /** In Practice, answers stay hidden until the question is answered. */
  revealed: true,
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

/** A topic's state lives in its own folder; these say what a mode or topic switch means for it. */
export type TopicHooks = {
  /** Set the topic up for a mode: on arriving, and whenever the mode changes inside it. */
  mode(m: Mode): void;
  /** Arriving at the topic, in the mode it opens in, before `mode` runs. */
  enter?(m: Mode): void;
  /** Leaving the topic for `to`, before the switch plays. */
  leave?(to: Topic, m: Mode): void;
};

/** Set the topic the app opens on up for the mode it opens in. */
export function startApp() {
  topicDef(ui.topic).hooks.mode(ui.mode);
}

export function setTopic(t: Topic) {
  if (ui.topic === t) return;
  topicDef(ui.topic).hooks.leave?.(t, ui.mode);
  withPen(() => {
    ui.topic = t;
    ui.highlight = [];
    // a topic with a Guide opens in it until the Guide is done; after that in whichever mode was
    // last used, and a topic without a Guide cannot be in Guide mode
    if (hasGuide(t) && !progress.completed[t]) ui.mode = 'guide';
    else if (ui.mode === 'guide') ui.mode = 'explore';
    const hooks = topicDef(t).hooks;
    hooks.enter?.(ui.mode);
    hooks.mode(ui.mode);
  }, true);
}

export function setMode(m: Mode) {
  if (m === 'guide' && !hasGuide(ui.topic)) return;
  withPen(() => {
    ui.mode = m;
    topicDef(ui.topic).hooks.mode(m);
  });
}
