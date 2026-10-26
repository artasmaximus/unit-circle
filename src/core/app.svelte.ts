// Which topic and mode the app is in, what may show, and the one motion that plays when any of
// that changes. Each topic keeps its own state in its own folder and registers hooks here for what
// arriving, leaving or switching mode means for it.
import type { Component } from 'svelte';
import { Tween } from 'svelte/motion';
import type { Unit } from './angles.ts';
import { sections, statusOf, fromSearch, type Status } from './nav.ts';
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
  /** The course or unit it is listed under in the switcher: the id of a group from `groups`. */
  group: string;
  /** Its place within the group (lower first); topics without one keep registration order. */
  order?: number;
  /**
   * Topics whose Guide should be completed first. Unmet, the switcher marks the topic as best
   * after them; with `strict` it stays locked until they are done.
   */
  requires?: Topic[];
  strict?: boolean;
  /** Extra words the switcher's search matches (synonyms, what the topic is about). */
  keywords?: string;
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
  /**
   * The run of questions in play in the current mode, if any (Practice, or the Guide's exam
   * step). While one of its questions is open the plane hides its answers: see `revealed`.
   */
  session?: () => { cur: unknown; answered: boolean } | null;
  /** The angle readout in the plane's corner: absent, or the unit it insists on. */
  angleInput?: () => { unit?: Unit } | null;
  /** How the shared ring is written while this topic shows. */
  ring?: () => { unit?: Unit; labels?: boolean; taken?: (deg: number) => boolean };
};
const registry: TopicDef[] = [];
export function registerTopics(...defs: TopicDef[]) {
  registry.push(...defs);
}
const groupList: { id: string; title: string }[] = [];
/** Name the courses or units topics are listed under, in the order they are shown. */
export function registerGroups(...gs: { id: string; title: string }[]) {
  groupList.push(...gs);
}
/** Every topic, in tab bar order. */
export const topics: readonly TopicDef[] = registry;
export const groups: readonly { id: string; title: string }[] = groupList;
/** The topics under their headings, as the switcher lists them. */
export const topicSections = () => sections(registry, groupList);
/** Whether a topic is open, recommended after others, or locked (see `TopicDef.requires`). */
export const topicStatus = (t: TopicDef): Status => statusOf(t, progress.completed);
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
  /** Snap points drawn larger: the angles found in Practice. */
  highlight: [] as number[],
});
/**
 * Whether answers (colors, values, labels) may show: not while a question is open. It follows the
 * topic's session, so Practice and every exam hide and reveal the same way, and the one motion that
 * plays when this changes (`withPen`) is the same everywhere.
 */
export const revealed = () => {
  const s = topicDef(ui.topic).session?.();
  return !(s && s.cur && !s.answered);
};

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
  // an address that names a topic (and mode) opens there, as if the learner had switched to it
  const at = fromSearch(location.search, registry, progress.completed);
  if (at.topic && at.topic !== ui.topic) {
    ui.topic = at.topic;
    ui.mode = at.mode ?? defaultMode(at.topic, 'explore');
    topicDef(at.topic).hooks.enter?.(ui.mode);
  } else if (at.mode) ui.mode = at.mode;
  topicDef(ui.topic).hooks.mode(ui.mode);
}

/** The mode a topic opens in: its Guide until that is done, else `last` (never Guide without one). */
const defaultMode = (t: Topic, last: Mode): Mode =>
  hasGuide(t) && !progress.completed[t]
    ? 'guide'
    : last === 'guide' && !hasGuide(t)
      ? 'explore'
      : last;

export function setTopic(t: Topic) {
  if (ui.topic === t || topicStatus(topicDef(t)).state === 'locked') return;
  topicDef(ui.topic).hooks.leave?.(t, ui.mode);
  withPen(() => {
    ui.topic = t;
    ui.highlight = [];
    // a topic with a Guide opens in it until the Guide is done; after that in whichever mode was
    // last used, and a topic without a Guide cannot be in Guide mode
    ui.mode = defaultMode(t, ui.mode === 'guide' ? 'explore' : ui.mode);
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
