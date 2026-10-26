// Finding your way among the topics, as plain functions over the registry's data (so they are
// tested without the app): grouping under headings, prerequisites, search, and the address that
// names a topic and mode. core/app.svelte.ts feeds them the registry and the learner's progress.
import type { Mode, Topic, TopicDef } from './app.svelte.ts';

/** What navigation reads of a topic. */
export type NavTopic = Pick<
  TopicDef,
  'id' | 'title' | 'group' | 'order' | 'requires' | 'strict' | 'keywords'
> & { tab: { label: string }; views: { guide?: unknown } };

/** A heading in the switcher, and the topics under it. */
export type Section<T extends NavTopic = NavTopic> = { id: string; title: string; topics: T[] };

/**
 * The topics under their headings. Headings come in the order they were registered, topics within
 * one by `order` (ties keep registration order); a topic naming an unregistered heading gets one of
 * its own at the end, titled after its id, so a typo shows up on screen instead of hiding a topic.
 */
export function sections<T extends NavTopic>(
  defs: readonly T[],
  groups: readonly { id: string; title: string }[],
): Section<T>[] {
  const out: Section<T>[] = groups.map((g) => ({ ...g, topics: [] }));
  for (const t of defs) {
    let s = out.find((s) => s.id === t.group);
    if (!s) out.push((s = { id: t.group, title: t.group, topics: [] }));
    s.topics.push(t);
  }
  for (const s of out) s.topics.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return out.filter((s) => s.topics.length);
}

/** Whether a topic is open, open but better left until later, or shut until its prerequisites. */
export type Status = { state: 'open' | 'recommended' | 'locked'; missing: Topic[] };

/** A topic's status given the topics whose Guide has been completed. */
export function statusOf(t: NavTopic, completed: Partial<Record<Topic, boolean>>): Status {
  const missing = (t.requires ?? []).filter((id) => !completed[id]);
  return { state: !missing.length ? 'open' : t.strict ? 'locked' : 'recommended', missing };
}

/**
 * The topics matching what was typed: every word of the query must appear (in any order, any case)
 * in the title, tab label, heading or keywords. An empty query matches everything.
 */
export function search<T extends NavTopic>(
  defs: readonly T[],
  groups: readonly { id: string; title: string }[],
  query: string,
): T[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return defs.filter((t) => {
    const hay = [t.title, t.tab.label, groups.find((g) => g.id === t.group)?.title, t.keywords]
      .join(' ')
      .toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

const MODES: Mode[] = ['guide', 'explore', 'practice'];

/**
 * The topic and mode an address names (`?topic=inverse&mode=practice`), each only if it is valid:
 * a topic that exists and is not locked, a mode that topic has. Anything else is left to the app's
 * own defaults.
 */
export function fromSearch(
  search: string,
  defs: readonly NavTopic[],
  completed: Partial<Record<Topic, boolean>>,
): { topic?: Topic; mode?: Mode } {
  const q = new URLSearchParams(search);
  const def = defs.find((t) => t.id === q.get('topic'));
  if (!def || statusOf(def, completed).state === 'locked') return {};
  const mode = MODES.find((m) => m === q.get('mode'));
  return { topic: def.id, mode: mode === 'guide' && !def.views.guide ? undefined : mode };
}

/**
 * The address for a topic and mode: the current one with only `topic` and `mode` replaced, so
 * everything else in it (`?unlock=radians`, `?teacher`) rides along.
 */
export function toSearch(search: string, topic: Topic, mode: Mode): string {
  const q = new URLSearchParams(search);
  q.set('topic', topic);
  q.set('mode', mode);
  return `?${q}`;
}
