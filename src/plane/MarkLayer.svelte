<!-- Draws a list of keyed marks and owns their lives. When a key appears the mark enters, when
     a key goes missing the mark keeps its last shape and plays its exit, and while a key stays
     the mark just follows the geometry it is given (which is already animated by whatever state
     produced it). Features hand this a list; they never track presence themselves. -->
<script lang="ts">
  import { clamp01 } from '../core/num.ts';
  import { DUR, SWITCH } from '../core/tuning.ts';
  import { untrack } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { DEFAULTS, drawCurve, popCurve, verbFor, type Mark } from './marks.ts';
  import { reduce } from '../core/transition.ts';
  import SvgTex from '../ui/SvgTex.svelte';
  import { recordLead, recordMarks, registerLayer } from '../dev/motion.ts';
  import { switchJustBegan } from '../core/app.svelte.ts';

  /** `name` says which layer this is, for the dev motion log. */
  let { marks, name = '' }: { marks: Mark[]; name?: string } = $props();

  class Entry {
    mark = $state.raw<Mark>(undefined as unknown as Mark);
    leaving = $state(false);
    #tw = new Tween(0, { duration: DEFAULTS.dur });
    onGone: (e: Entry) => void;
    /** The layer it belongs to, for the dev motion log. */
    layer: string;
    /**
     * A slice's edges, which glide on their own so the pieces grow, shrink and slide as the target
     * moves.
     */
    geo: Tween<{ a0: number; a1: number }>;
    constructor(m: Mark, onGone: (e: Entry) => void, layer: string) {
      this.layer = layer;
      this.mark = m;
      this.onGone = onGone;
      this.geo = new Tween(m.kind === 'slice' ? { a0: m.a0, a1: m.a0 } : { a0: 0, a1: 0 }, {
        duration: DUR.base,
        easing: cubicOut,
      });
    }
    update(m: Mark) {
      this.mark = m;
      if (m.kind === 'slice')
        this.geo.set({ a0: m.a0, a1: m.a1 }, { duration: reduce ? 0 : (m.glide ?? DUR.base) });
    }
    get key() {
      return this.mark.key;
    }
    get p() {
      return this.#tw.current;
    }
    show() {
      if (!this.leaving && this.#tw.target === 1) return;
      this.leaving = false;
      const m = this.mark;
      // a mark arriving with a mode or topic switch waits for the old figure to leave
      const lead = !reduce && switchJustBegan() ? SWITCH.lead : 0;
      if (import.meta.env.DEV && lead) recordLead(this.layer);
      this.#tw.set(1, {
        delay: reduce ? 0 : (m.delay ?? DEFAULTS.delay) + lead,
        duration: reduce ? 0 : (m.dur ?? DEFAULTS.dur),
      });
    }
    hide() {
      if (this.leaving) return;
      this.leaving = true;
      const m = this.mark;
      if (m.kind === 'slice')
        this.geo.set(
          { a0: m.a0, a1: m.a0 },
          { duration: reduce ? 0 : (m.exitDur ?? DEFAULTS.exitDur) },
        );
      this.#tw
        .set(0, {
          delay: reduce ? 0 : (m.exitDelay ?? DEFAULTS.exitDelay),
          duration: reduce ? 0 : (m.exitDur ?? DEFAULTS.exitDur),
        })
        .then(() => {
          if (this.leaving && this.#tw.current <= 0.001) this.onGone(this);
        });
    }
  }

  /**
   * Whether a mark is unchanged since the last frame, so its drawing is left alone. Builders make
   * fresh objects every frame, and most marks (the ring, the ticks, a still arc) come out
   * identical; looking two levels in is far cheaper than redrawing them.
   */
  const same = (a: unknown, b: unknown, depth = 0): boolean => {
    if (a === b) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null || depth > 3)
      return false;
    const ka = Object.keys(a),
      kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka)
      if (!same((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], depth + 1))
        return false;
    return true;
  };
  const live = new Map<string, Entry>();
  let entries = $state.raw<Entry[]>([]);
  const order = () =>
    (entries = [...live.values()].sort(
      (a, b) => (a.mark.z ?? DEFAULTS.z) - (b.mark.z ?? DEFAULTS.z),
    ));
  const gone = (e: Entry) => {
    if (live.get(e.key) === e) {
      live.delete(e.key);
      order();
    }
  };

  $effect.pre(() => {
    const list = marks;
    untrack(() => {
      const seen = new Set<string>();
      let added = false;
      const log = import.meta.env.DEV
        ? { a: [] as string[], r: [] as string[], c: [] as string[] }
        : null;
      for (const m of list) {
        seen.add(m.key);
        let e = live.get(m.key);
        if (!e) {
          e = new Entry(m, gone, name);
          live.set(m.key, e);
          added = true;
          e.update(m);
          log?.a.push(m.key);
        } else if (!e.leaving) {
          if (!same(e.mark, m)) {
            log?.c.push(m.key);
            e.update(m);
          }
        }
        e.show();
      }
      for (const [k, e] of live)
        if (!seen.has(k)) {
          if (log && !e.leaving) log.r.push(k);
          e.hide();
        }
      if (log) recordMarks(name, log.a, log.r, log.c);
      if (added) order();
    });
  });

  // dev only: lets the switch check (dev/matrix.ts) look at what this layer has on the plane
  $effect(() => {
    if (!import.meta.env.DEV || !name) return;
    return registerLayer(name, () => ({
      live: Object.fromEntries(
        [...live].filter(([, e]) => !e.leaving).map(([k, e]) => [k, look(e.mark)]),
      ),
      leaving: [...live.values()].filter((e) => e.leaving).length,
    }));
  });
  /** A mark's appearance as text, numbers rounded, so two frames can be compared. */
  const look = (m: Mark) =>
    JSON.stringify(m, (_, v) =>
      typeof v === 'function' ? 'fn' : typeof v === 'number' ? Math.round(v * 100) / 100 : v,
    );

  /**
   * Everything a mark's drawing needs from how far through its verb it is, worked out once so each
   * mark costs one derived, not seven.
   */
  const view = (m: Mark, p: number, leaving: boolean) => {
    const verb = verbFor(m, leaving),
      q = clamp01(p);
    const pop = verb === 'pop' ? Math.max(0, (m.curve ?? popCurve)(q)) : 1;
    const op =
      (m.opacity ?? 1) *
      (verb === 'draw' ? clamp01(p * 8) : verb === 'pop' ? clamp01(p / (m.fadeBy ?? 0.2)) : q);
    const t =
      (verb === 'draw' ? drawCurve(p, m.power) : 1) * (m.kind === 'path' ? (m.part ?? 1) : 1);
    if (m.kind !== 'label') return { pop, op, t, cx: 0, cy: 0, sx: 0, sy: 0, k: 1, blur: 0 };
    const sh = verb === 'shoot',
      from = m.popFrom ?? 0;
    return {
      pop,
      op,
      t,
      cx: m.label.rect.x + m.label.rect.w / 2,
      cy: m.label.rect.y + m.label.rect.h / 2,
      sx: sh ? (1 - q) * (m.shoot?.[0] ?? 0) : 0,
      sy: sh ? (1 - q) * (m.shoot?.[1] ?? 0) : 0,
      k: verb === 'pop' ? Math.max(0, (pop - from) / (1 - from)) : 1,
      blur: sh && p < 0.999 ? (1 - q) * 4 : 0,
    };
  };
  /**
   * The wedge between two angles with each straight edge pulled in by its own distance (d0, d1) and
   * the rim pulled in by `dr`, so a slice keeps the same gap to its neighbour, the axis, the ray
   * and the circle however far from the middle. Worked in ordinary (y up) coordinates, flipped on
   * the way out.
   */
  const slicePath = (a0: number, a1: number, r: number, d0: number, d1: number, dr: number) => {
    const D = a1 - a0,
      R = r - dr;
    if (D < 1e-3 || R <= Math.max(d0, d1)) return '';
    const u0 = [Math.cos(a0), Math.sin(a0)],
      n0 = [-u0[1], u0[0]],
      u1 = [Math.cos(a1), Math.sin(a1)],
      n1 = [u1[1], -u1[0]];
    // where the two pulled-in edges meet; a half turn makes them parallel, so the meeting point is
    // taken on the bisector instead
    const det = n0[0] * n1[1] - n0[1] * n1[0];
    const apex =
      Math.abs(det) > 0.05
        ? [(d0 * n1[1] - d1 * n0[1]) / det, (n0[0] * d1 - n1[0] * d0) / det]
        : [Math.cos((a0 + a1) / 2) * ((d0 + d1) / 2), Math.sin((a0 + a1) / 2) * ((d0 + d1) / 2)];
    const t0 = Math.sqrt(R * R - d0 * d0),
      t1 = Math.sqrt(R * R - d1 * d1);
    const p0 = [d0 * n0[0] + t0 * u0[0], d0 * n0[1] + t0 * u0[1]],
      p1 = [d1 * n1[0] + t1 * u1[0], d1 * n1[1] + t1 * u1[1]];
    // the rim arc runs between the two pulled-in edges; once they have crossed (a slice folding
    // shut) there is nothing left to draw, and without this the arc would read as the long way
    // round
    const span = D - Math.asin(d0 / R) - Math.asin(d1 / R);
    if (span <= 1e-3) return '';
    const f = (p: number[]) => `${p[0]} ${-p[1]}`;
    return `M ${f(apex)} L ${f(p0)} A ${R} ${R} 0 ${span > Math.PI ? 1 : 0} 0 ${f(p1)} Z`;
  };
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
</script>

{#each entries as e (e.key)}
  {@const m = e.mark}
  {@const v = view(m, e.p, e.leaving)}
  {#if m.kind === 'line'}
    <line
      x1={m.x1}
      y1={m.y1}
      x2={lerp(m.x1, m.x2, v.t)}
      y2={lerp(m.y1, m.y2, v.t)}
      stroke={m.color}
      stroke-width={m.width}
      opacity={v.op}
      stroke-dasharray={m.dash ? `${m.dash[0]} ${m.dash[1]}` : null}
      stroke-dashoffset={m.offset ?? 0}
      stroke-linecap={m.round ? 'round' : 'butt'}
    />
  {:else if m.kind === 'path'}
    <path
      d={m.at ? m.at(v.pop) : m.d}
      fill={m.fill ?? 'none'}
      stroke={m.color}
      stroke-width={m.width}
      opacity={v.op}
      transform={m.transform}
      stroke-linecap={m.round ? 'round' : 'butt'}
      stroke-linejoin={m.join ? 'round' : 'miter'}
      vector-effect={m.fixed ? 'non-scaling-stroke' : null}
      pathLength={m.dash ? null : 1}
      stroke-dasharray={m.dash
        ? `${m.dash[0]} ${m.dash[1]}`
        : v.t < 0.999
          ? m.symmetric
            ? `${v.t / 2} ${1 - v.t} ${v.t / 2} 0`
            : `${v.t} 1`
          : null}
    />
  {:else if m.kind === 'slice'}
    <path
      d={slicePath(
        e.geo.current.a0,
        e.geo.current.a1,
        m.r,
        m.edge0 ?? m.gap,
        m.edge1 ?? m.gap,
        m.rim ?? m.gap,
      )}
      fill={m.fill}
      opacity={v.op}
    />
  {:else if m.kind === 'dot'}
    <circle
      cx={m.x}
      cy={m.y}
      style:r="{v.pop * m.r}px"
      fill={m.fill}
      stroke={m.stroke ?? 'none'}
      stroke-width={m.width ?? 0}
      opacity={v.op}
      style:transition={m.glide ? `r ${m.glide}ms ease-out` : null}
    />
  {:else if m.kind === 'dotgrid'}
    {@const h = m.step / 2}
    <defs>
      <pattern id="mark-dotgrid" patternUnits="userSpaceOnUse" width={m.step} height={m.step}>
        <circle cx={h} cy="0" r={m.r} fill={m.color} /><circle
          cx="0"
          cy={h}
          r={m.r}
          fill={m.color}
        /><circle cx={h} cy={h} r={m.r} fill={m.color} />
        <circle cx={m.step} cy={h} r={m.r} fill={m.color} /><circle
          cx={h}
          cy={m.step}
          r={m.r}
          fill={m.color}
        />
      </pattern>
    </defs>
    <rect x={m.x} y={m.y} width={m.w} height={m.h} fill="url(#mark-dotgrid)" opacity={v.op} />
  {:else if m.kind === 'segments'}
    <g opacity={v.op}>
      {#each m.segs as sg}<line
          x1={sg.x1}
          y1={sg.y1}
          x2={sg.x2}
          y2={sg.y2}
          stroke={sg.color}
          stroke-width={sg.width}
          opacity={sg.opacity}
          stroke-linecap="round"
        />{/each}
    </g>
  {:else}
    <g
      opacity={v.op}
      transform="translate({v.cx + v.sx} {v.cy + v.sy}) scale({v.k}) translate({-v.cx} {-v.cy})"
      style:filter={v.blur ? `blur(${v.blur}px)` : null}
    >
      {#if m.back}<rect
          class="back"
          x={m.label.rect.x - 3 * m.back}
          y={m.label.rect.y - 1.5 * m.back}
          width={m.label.rect.w + 6 * m.back}
          height={m.label.rect.h + 3 * m.back}
          rx={3 * m.back}
        />{/if}
      <SvgTex label={m.label} />
    </g>
  {/if}
{/each}

<style>
  .back {
    fill: var(--panel);
    opacity: 0.72;
  }
</style>
