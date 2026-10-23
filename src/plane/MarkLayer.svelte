<!-- Draws a list of keyed marks and owns their lives. When a key appears the mark enters, when a key goes missing the mark keeps
     its last shape and plays its exit, and while a key stays the mark just follows the geometry it is given (which is already
     animated by whatever state produced it). Features hand this a list; they never track presence themselves. -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { DEFAULTS, drawCurve, popCurve, verbFor, type Mark } from '../lib/marks.ts';
  import { reduce } from '../lib/transition.ts';
  import SvgTex from '../ui/SvgTex.svelte';

  let { marks }: { marks: Mark[] } = $props();

  class Entry {
    mark = $state.raw<Mark>(undefined as unknown as Mark);
    leaving = $state(false);
    #tw = new Tween(0, { duration: DEFAULTS.dur });
    onGone: (e: Entry) => void;
    constructor(m: Mark, onGone: (e: Entry) => void) { this.mark = m; this.onGone = onGone; }
    get key() { return this.mark.key; }
    get p() { return this.#tw.current; }
    show() {
      if (!this.leaving && this.#tw.target === 1) return;
      this.leaving = false;
      const m = this.mark;
      this.#tw.set(1, { delay: reduce ? 0 : m.delay ?? DEFAULTS.delay, duration: reduce ? 0 : m.dur ?? DEFAULTS.dur });
    }
    hide() {
      if (this.leaving) return;
      this.leaving = true;
      const m = this.mark;
      this.#tw.set(0, { delay: reduce ? 0 : m.exitDelay ?? DEFAULTS.exitDelay, duration: reduce ? 0 : m.exitDur ?? DEFAULTS.exitDur })
        .then(() => { if (this.leaving && this.#tw.current <= 0.001) this.onGone(this); });
    }
  }

  /** Whether a mark is unchanged since the last frame, so its drawing is left alone. Builders make fresh objects every frame,
   *  and most marks (the ring, the ticks, a still arc) come out identical; looking two levels in is far cheaper than redrawing them. */
  const same = (a: unknown, b: unknown, depth = 0): boolean => {
    if (a === b) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null || depth > 3) return false;
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) if (!same((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], depth + 1)) return false;
    return true;
  };
  const live = new Map<string, Entry>();
  let entries = $state.raw<Entry[]>([]);
  const order = () => (entries = [...live.values()].sort((a, b) => (a.mark.z ?? DEFAULTS.z) - (b.mark.z ?? DEFAULTS.z)));
  const gone = (e: Entry) => { if (live.get(e.key) === e) { live.delete(e.key); order(); } };

  $effect.pre(() => {
    const list = marks;
    untrack(() => {
      const seen = new Set<string>();
      let added = false;
      for (const m of list) {
        seen.add(m.key);
        let e = live.get(m.key);
        if (!e) { e = new Entry(m, gone); live.set(m.key, e); added = true; } else if (!e.leaving) e.mark = m;
        e.show();
      }
      for (const [k, e] of live) if (!seen.has(k)) e.hide();
      if (added) order();
    });
  });

  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  /** Everything a mark's drawing needs from how far through its verb it is, worked out once so each mark costs one derived, not seven. */
  const view = (m: Mark, p: number, leaving: boolean) => {
    const verb = verbFor(m, leaving), q = clamp01(p);
    const pop = verb === 'pop' ? Math.max(0, (m.curve ?? popCurve)(q)) : 1;
    const op = (m.opacity ?? 1) * (verb === 'draw' ? clamp01(p * 8) : verb === 'pop' ? clamp01(p / (m.fadeBy ?? 0.2)) : q);
    const t = (verb === 'draw' ? drawCurve(p, m.power) : 1) * (m.kind === 'path' ? m.part ?? 1 : 1);
    if (m.kind !== 'label') return { pop, op, t, cx: 0, cy: 0, sx: 0, sy: 0, k: 1, blur: 0 };
    const sh = verb === 'shoot', from = m.popFrom ?? 0;
    return {
      pop, op, t, cx: m.label.rect.x + m.label.rect.w / 2, cy: m.label.rect.y + m.label.rect.h / 2,
      sx: sh ? (1 - q) * (m.shoot?.[0] ?? 0) : 0, sy: sh ? (1 - q) * (m.shoot?.[1] ?? 0) : 0,
      k: verb === 'pop' ? Math.max(0, (pop - from) / (1 - from)) : 1, blur: sh && p < 0.999 ? (1 - q) * 4 : 0,
    };
  };
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
</script>

{#each entries as e (e.key)}
  {@const m = e.mark}
  {@const v = view(m, e.p, e.leaving)}
  {#if m.kind === 'line'}
    <line x1={m.x1} y1={m.y1} x2={lerp(m.x1, m.x2, v.t)} y2={lerp(m.y1, m.y2, v.t)} stroke={m.color} stroke-width={m.width} opacity={v.op}
      stroke-dasharray={m.dash ? `${m.dash[0]} ${m.dash[1]}` : null} stroke-dashoffset={m.offset ?? 0} stroke-linecap={m.round ? 'round' : 'butt'} />
  {:else if m.kind === 'path'}
    <path d={m.at ? m.at(v.pop) : m.d} fill={m.fill ?? 'none'} stroke={m.color} stroke-width={m.width} opacity={v.op} transform={m.transform}
      stroke-linecap={m.round ? 'round' : 'butt'} stroke-linejoin={m.join ? 'round' : 'miter'}
      vector-effect={m.fixed ? 'non-scaling-stroke' : null}
      pathLength={m.dash ? null : 1} stroke-dasharray={m.dash ? `${m.dash[0]} ${m.dash[1]}` : v.t < 0.999 ? (m.symmetric ? `${v.t / 2} ${1 - v.t} ${v.t / 2} 0` : `${v.t} 1`) : null} />
  {:else if m.kind === 'dot'}
    <circle cx={m.x} cy={m.y} style:r="{v.pop * m.r}px" fill={m.fill} stroke={m.stroke ?? 'none'} stroke-width={m.width ?? 0} opacity={v.op} style:transition={m.glide ? `r ${m.glide}ms ease-out` : null} />
  {:else if m.kind === 'dotgrid'}
    {@const h = m.step / 2}
    <defs>
      <pattern id="mark-dotgrid" patternUnits="userSpaceOnUse" width={m.step} height={m.step}>
        <circle cx={h} cy="0" r={m.r} fill={m.color} /><circle cx="0" cy={h} r={m.r} fill={m.color} /><circle cx={h} cy={h} r={m.r} fill={m.color} />
        <circle cx={m.step} cy={h} r={m.r} fill={m.color} /><circle cx={h} cy={m.step} r={m.r} fill={m.color} />
      </pattern>
    </defs>
    <rect x={m.x} y={m.y} width={m.w} height={m.h} fill="url(#mark-dotgrid)" opacity={v.op} />
  {:else if m.kind === 'segments'}
    <g opacity={v.op}>
      {#each m.segs as sg}<line x1={sg.x1} y1={sg.y1} x2={sg.x2} y2={sg.y2} stroke={sg.color} stroke-width={sg.width} opacity={sg.opacity} stroke-linecap="round" />{/each}
    </g>
  {:else}
    <g opacity={v.op} transform="translate({v.cx + v.sx} {v.cy + v.sy}) scale({v.k}) translate({-v.cx} {-v.cy})" style:filter={v.blur ? `blur(${v.blur}px)` : null}>
      {#if m.back}<rect class="back" x={m.label.rect.x - 3 * m.back} y={m.label.rect.y - 1.5 * m.back} width={m.label.rect.w + 6 * m.back} height={m.label.rect.h + 3 * m.back} rx={3 * m.back} />{/if}
      <SvgTex label={m.label} />
    </g>
  {/if}
{/each}

<style>
  .back { fill: var(--panel); opacity: 0.72; }
</style>
