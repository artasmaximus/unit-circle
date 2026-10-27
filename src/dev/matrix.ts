// Dev-only switch check: moves the app between every pair of states (each topic in each mode, and
// Practice with a question open or answered) and, for each move, looks at what every mark layer did.
// A move fails when:
//  - a mark arrived on its own, not led by the switch (it would pop in against the old figure);
//  - a mark is still leaving after the move should have settled (a stuck exit);
//  - a layer still draws after its topic was left (a leak);
//  - the plane changed, yet nothing animated: no mark entered or left and none changed over more
//    than one frame (the old "the circle does not animate when switching" bug).
// Marks whose look changed in a single frame are listed per move as `snaps`: some are by design (the
// ring's dots swap look at the pen's midpoint), so they are reported, not failed.
// Run it from the browser console: `await __motion.matrix()`; it returns `{ ok, failures, rows }`.
import {
  hasGuide,
  setMode,
  setTopic,
  topicDef,
  topics,
  ui,
  type Mode,
  type Topic,
} from '../core/app.svelte.ts';
import { motion, type LayerNow } from './motion.ts';

type State = { topic: Topic; mode: Mode; answered?: boolean };
const name = (s: State) => `${s.topic}/${s.mode}${s.answered ? ' (answered)' : ''}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Which layers belong to which topic (the ring and the grid are shared, so never leak). */
const OWNER: Record<string, Topic> = {
  circle: 'circle',
  'unit-guide': 'circle',
  inverse: 'inverse',
  radians: 'radians',
  'radians-under': 'radians',
};

function states(): State[] {
  const out: State[] = [];
  for (const t of topics) {
    const modes: Mode[] = hasGuide(t.id)
      ? ['guide', 'explore', 'practice']
      : ['explore', 'practice'];
    for (const mode of modes) {
      out.push({ topic: t.id, mode });
      if (mode === 'practice') out.push({ topic: t.id, mode, answered: true });
    }
  }
  return out;
}

/** Answer the question open in a session, wrong if need be, until it is over. */
function finish(s: NonNullable<ReturnType<NonNullable<ReturnType<typeof topicDef>['session']>>>) {
  const x = s as any;
  for (let i = 0; i < 4 && !x.answered; i++)
    x.choices.length ? x.answer(x.wrongPicks.length) : x.check();
}

async function go(to: State) {
  const settle = 1200;
  if (ui.topic !== to.topic) {
    setTopic(to.topic);
    await sleep(settle);
  }
  if (ui.mode !== to.mode) {
    setMode(to.mode);
    await sleep(settle);
  }
  const s = topicDef(ui.topic).session?.() as any;
  if (to.mode === 'practice' && s) {
    if (to.answered && !s.answered) finish(s);
    else if (!to.answered && s.answered) s.start();
    await sleep(settle);
  }
}

type Row = { from: string; to: string; failures: string[]; snaps: string[] };

export async function matrix(
  only?: string,
): Promise<{ ok: boolean; failures: string[]; rows: Row[] }> {
  // a page that is not being painted never advances its tweens, so nothing would settle
  const painting = await Promise.race([
    new Promise<boolean>((r) => requestAnimationFrame(() => r(true))),
    sleep(300).then(() => false),
  ]);
  if (!painting)
    return { ok: false, failures: ['page is not painting: bring it to the front'], rows: [] };

  const all = states(),
    rows: Row[] = [];
  for (const from of all)
    for (const to of all) {
      if (from === to || (only && !`${name(from)} -> ${name(to)}`.includes(only))) continue;
      await go(from);
      const before = motion.plane();
      motion.begin();
      await go(to);
      const log = motion.end(),
        changes = motion.changes(),
        after = motion.plane();
      const row: Row = { from: name(from), to: name(to), failures: [], snaps: [] };
      let changed = false,
        animated = false;
      for (const layer of Object.keys(after) as string[]) {
        const now: LayerNow = after[layer],
          was: LayerNow | undefined = before[layer],
          l = log[layer];
        if (l && l.in > l.led)
          row.failures.push(`${layer}: ${l.in - l.led} of ${l.in} arrived unled`);
        if (now.leaving) row.failures.push(`${layer}: ${now.leaving} exits stuck`);
        const owner = OWNER[layer];
        if (owner && owner !== ui.topic && Object.keys(now.live).length)
          row.failures.push(`${layer}: ${Object.keys(now.live).length} marks left drawn off-topic`);
        const live = Object.keys(now.live),
          gone = Object.keys(was?.live ?? {});
        const differs =
          live.length !== gone.length ||
          live.some((k) => was?.live[k] !== now.live[k]) ||
          gone.some((k) => !(k in now.live));
        if (differs) changed = true;
        if (l && l.in + l.out > 0) animated = true;
        for (const [k, look] of Object.entries(now.live)) {
          const n = changes[layer]?.[k] ?? 0;
          if (n > 1) animated = true;
          if (was?.live[k] !== undefined && was.live[k] !== look && n === 1)
            row.snaps.push(`${layer}:${k}`);
        }
      }
      if (changed && !animated) row.failures.push('the plane changed but nothing animated');
      rows.push(row);
    }
  const failures = rows
    .filter((r) => r.failures.length)
    .map((r) => `${r.from} -> ${r.to}: ${r.failures.join('; ')}`);
  return { ok: !failures.length, failures, rows };
}

if (import.meta.env.DEV && typeof window !== 'undefined') (window as any).__motion.matrix = matrix;
