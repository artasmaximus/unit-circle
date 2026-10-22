<!-- The triangle, angle arcs, braces, labels, mirror ghosts and trail for the current angle.
     On a mode switch (the shared pen motion) the dashes tick one step, the new color washes along the θ arc
     from 0° and then out along the radius, the braces redraw from their ends inward, and the leg labels bob. -->
<script lang="ts">
  import { camera } from '../lib/camera.svelte.ts';
  import type { Label, Scene } from '../lib/scene.ts';
  import { pen, penClock, penFrom } from '../lib/state.svelte.ts';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { figure as F } from '../lib/tuning.ts';
  import SvgTex from '../ui/SvgTex.svelte';
  let { scene: sc }: { scene: Scene } = $props();

  // a real spring (about 16% overshoot, settled in 0.55s) sampled as an easing, so the reference angle snaps in quickly and rings
  const WD = F.refFreq * Math.sqrt(1 - F.refDamping ** 2);
  const give = (u: number) => {
    if (u >= 1) return 1;
    const x = u * F.refSettle;
    return 1 - Math.exp(-F.refDamping * F.refFreq * x) * (Math.cos(WD * x) + ((F.refDamping * F.refFreq) / WD) * Math.sin(WD * x));
  };
  /** Grows 0 → 1 with a little overshoot, for a dot that pops in. */
  const popOut = (u: number) => 1 + 2.7 * (u - 1) ** 3 + 1.7 * (u - 1) ** 2;
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  type Brace = NonNullable<Scene['braceC']>;
  type Item = { b: Brace | null; l: Label | null };
  /** A leg's brace and label come and go as the leg shrinks past what a brace fits. Keeps the last ones drawn on
   *  hand and a 0 → 1 presence, so they can leave (the brace undraws, the label blurs away) and return. */
  const presence = (get: () => Item) => {
    const tw = new Tween(0, { duration: F.legExitMs, easing: cubicOut });
    let last: Item | null = null;
    $effect.pre(() => {
      const cur = get(), want = cur.b ? 1 : 0;
      if (cur.b) last = cur;
      if (tw.target !== want) tw.target = want; // setting it restarts the tween, so only when it changes
    });
    return { get p() { return tw.current; }, get item() { const cur = get(); return cur.b ? cur : tw.current > 0.005 ? last : null; } };
  };
  /** The two legs: the cosine one along the x-axis, the sine one up to the point. */
  const legs = [
    { fn: 'cos' as const, pres: presence(() => ({ b: sc.braceC, l: sc.cosLabel })), seg: () => [0, 0, sc.x, 0], dir: () => sc.cosDir, exit: () => sc.cosExit, now: () => sc.cosCol },
    { fn: 'sin' as const, pres: presence(() => ({ b: sc.braceS, l: sc.sinLabel })), seg: () => sc.sinLeg as number[], dir: () => sc.sinDir, exit: () => sc.sinExit, now: () => sc.sinCol },
  ];
  const t = $derived(penClock.current);
  const moving = $derived(t < 1);
  const window01 = (a: number, b: number) => clamp01((t - a) / (b - a));
  /** The color the figure had before the switch; the new one washes over it. */
  const before = $derived(penFrom.revealed ? sc.blend : 'var(--fg)');
  const arcWash = $derived(window01(...F.arcWash)), rayWash = $derived(window01(...F.rayWash));
  const braceDraw = $derived(window01(...F.braceDraw));
  // the reference angle pops out of the θ arc: its arc starts lying on it and swells out to its own radius, and the label
  // pops in on the arc's midpoint. The last ones stay on hand so they can pop back in when it leaves.
  type RefSnap = { label: Label | null; polar: Scene['refPolar']; arcAt: Scene['refArcAt'] };
  let lastRef = null as RefSnap | null;
  const refLabelP = $derived(window01(...F.refLabel));
  // the pop also plays when a drag lands on a snap angle and the reference angle shows up (a mode switch has its own)
  const whoosh = new Tween(1, { duration: F.refSettle * 1000, easing: give });
  let hadRef = false;
  /** Set only when a reference angle that was showing goes away, so the last one is kept to leave with: a stale one from an earlier angle must never appear. */
  let goneRef = $state(false);
  // ...and in reverse when a drag leaves it
  $effect.pre(() => {
    const has = !!sc.refLabel;
    if (has) lastRef = { label: sc.refLabel, polar: sc.refPolar, arcAt: sc.refArcAt };
    if (has) goneRef = false;
    else if (hadRef) goneRef = true;
    if (moving) whoosh.set(has ? 1 : 0, { duration: 0 });
    else if (has && !hadRef) whoosh.set(0, { duration: 0 }).then(() => (whoosh.target = 1));
    else if (!has && hadRef) whoosh.set(1, { duration: 0 }).then(() => (whoosh.target = 0));
    hadRef = has;
  });
  const refLabelShown = $derived(sc.refLabel ?? (goneRef ? lastRef?.label ?? null : null));
  const refLabelScale = $derived(moving ? give(sc.refLabel ? (penFrom.revealed ? 1 : refLabelP) : 1 - refLabelP) : whoosh.current);
  // it fades as it goes (and in as it arrives), so leaving never cuts off abruptly
  const refFade = $derived(clamp01(refLabelScale / F.refFadeBy));
  const refLabelAt = (e: number) => {
    const pl = sc.refPolar ?? lastRef?.polar;
    if (!pl) return '';
    const fx = pl.rr * Math.cos(pl.to), fy = -pl.rr * Math.sin(pl.to) + pl.dy, k = Math.max(0, (e - 0.3) / 0.7);
    return `translate(${fx} ${fy}) scale(${k}) translate(${-fx} ${-fy})`;
  };
  const refArcFn = $derived(sc.refLabel ? sc.refArcAt : goneRef ? lastRef?.arcAt ?? null : null);
  // one dash period per switch, on the pen's own lean-and-snap curve, so the dashes tick like the switch
  const tick = (period: number) => period * pen.current;
  // each leg and its brace wear their function's color (x blue, y magenta), so the triangle's mix reads at a glance
  const legBefore = (fn: 'cos' | 'sin') => (penFrom.revealed ? `var(--${fn})` : 'var(--fg)');
  // the new color fills the dashes along each leg in step with the shift (the pen motion, without its lean and overshoot)
  const legWash = $derived(clamp01(pen.current));
  const rest = (s: number[], f: number) => ({ x1: s[0] + (s[2] - s[0]) * f, y1: s[1] + (s[3] - s[1]) * f, x2: s[2], y2: s[3] });
  const part = (s: number[], f: number) => ({ x1: s[0], y1: s[1], x2: s[0] + (s[2] - s[0]) * f, y2: s[1] + (s[3] - s[1]) * f });
  // the labels step away from their braces and back (down for x, sideways for y; which way depends on the quadrant)
  // the bounce starts the moment the switch does; the labels recolor once it has landed
  const bob = $derived((F.bob / camera.k) * Math.sin(Math.PI * window01(0, F.bobEnd)));
</script>

<g class="figure">
  <line x1={sc.x} y1={sc.y} x2="0" y2={sc.y} stroke="var(--muted)" stroke-width={.75 * camera.boost} stroke-dasharray="3 4" stroke-dashoffset={tick(7)} />
  <path d={sc.wedge} fill="none" stroke={moving ? before : sc.col} stroke-width={1.25 * camera.boost} />
  {#if moving}<path d={sc.wedge} fill="none" stroke={sc.col} stroke-width={1.25 * camera.boost} pathLength="1" stroke-dasharray="{arcWash} 1" />{/if}
  {#if sc.wedgeHead}<path d={sc.wedgeHead} fill="none" stroke={moving && arcWash < 1 ? before : sc.col} stroke-width={1.25 * camera.boost} stroke-linecap="round" stroke-linejoin="round" />{/if}
  {#if refArcFn && refLabelScale > 0.001}<path d={refArcFn(refLabelScale)} fill="none" stroke={sc.col} stroke-width={1.75 * camera.boost} stroke-linecap="round" opacity={refFade} />{/if}
  {#each legs as leg}
    {@const seg = leg.seg()}
    {#if moving}
      <!-- the old color keeps only the part ahead of the wash front (its dashes continue the same pattern), so the two never overlap -->
      <line class="leg" {...rest(seg, legWash)} stroke={legBefore(leg.fn)} stroke-dashoffset={tick(9) + legWash * Math.hypot(seg[2] - seg[0], seg[3] - seg[1])} />
      <line class="leg" {...part(seg, legWash)} stroke={leg.now()} stroke-dashoffset={tick(9)} />
    {:else}
      <line class="leg" x1={seg[0]} y1={seg[1]} x2={seg[2]} y2={seg[3]} stroke={leg.now()} stroke-dashoffset={tick(9)} />
    {/if}
  {/each}
  {#if sc.sinExt}<line class="leg" x1={sc.sinExt[0]} y1={sc.sinExt[1]} x2={sc.sinExt[2]} y2={sc.sinExt[3]} stroke={sc.sinCol} stroke-dashoffset={tick(9)} />{/if}
  <line x1="0" y1="0" x2={sc.x} y2={sc.y} stroke={moving ? before : sc.col} stroke-width={1.75 * camera.boost} stroke-linecap="round" />
  {#if moving}<line x1="0" y1="0" x2={sc.x} y2={sc.y} stroke={sc.col} stroke-width={1.75 * camera.boost} stroke-linecap="round" pathLength="1" stroke-dasharray="{rayWash} 1" />{/if}
  {#each legs as leg}
    {@const it = leg.pres.item}
    {#if it?.b}
      {@const e = leg.pres.p}
      <path class="brace" d={it.b.path} transform={it.b.transform} stroke={moving ? legBefore(leg.fn) : leg.now()}
        pathLength="1" stroke-dasharray={e < 0.999 ? `${e / 2} ${1 - e} ${e / 2} 0` : null} />
      <!-- the brace stays put; only its new color draws in, from both ends toward the tip -->
      {#if moving && e >= 0.999}<path class="brace" d={it.b.path} transform={it.b.transform} stroke={leg.now()} pathLength="1"
        stroke-dasharray="{braceDraw / 2} {1 - braceDraw} {braceDraw / 2} 0" />{/if}
    {/if}
  {/each}
  {#if refLabelShown && refLabelScale > 0.001}<g transform={refLabelAt(refLabelScale)} opacity={refFade}><SvgTex label={refLabelShown} /></g>{/if}
  {#each legs as leg}
    {@const it = leg.pres.item}
    {#if it?.l}
      {@const l = it.l}
      {@const e = leg.pres.p}
      {@const dir = leg.dir()}
      {@const out = leg.exit()}
      <!-- leaving, the label blurs out as it shoots off -->
      <g transform="translate({dir[0] * bob + out[0] * (1 - e) * F.legShoot} {dir[1] * bob + out[1] * (1 - e) * F.legShoot})" opacity={e} style:filter={e < 0.999 ? `blur(${(1 - e) * 4}px)` : null}>
        <rect x={l.rect.x - 3} y={l.rect.y - 1.5} width={l.rect.w + 6} height={l.rect.h + 3} rx="3" fill="var(--panel)" opacity=".72" />
        <SvgTex label={{ ...l, color: t < F.bobEnd ? legBefore(leg.fn) : l.color }} />
      </g>
    {/if}
  {/each}
  {#each sc.trail as tr}
    <line x1={tr.seg[0]} y1={tr.seg[1]} x2={tr.seg[2]} y2={tr.seg[3]} stroke={tr.color} stroke-width={tr.width * camera.boost} opacity={tr.opacity} stroke-linecap="round" />
  {/each}
  {#each sc.mirrors as m}
    {#if m.line}<line x1={m.line[0]} y1={m.line[1]} x2={m.line[2]} y2={m.line[3]} stroke={sc.col} stroke-width={1 * camera.boost} stroke-dasharray="2 4" opacity=".8" />{/if}
    {#if m.e > 0.001}<circle cx={m.dot[0]} cy={m.dot[1]} r={4.5 * popOut(m.e)} fill="var(--bg)" stroke={sc.col} stroke-width={1.5 * camera.boost} />{/if}
    {#if m.label}<g opacity={m.e}><SvgTex label={m.label} /></g>{/if}
  {/each}
  {#if sc.guide2}
    <line x1={sc.guide2[0]} y1={sc.guide2[1]} x2={sc.guide2[2]} y2={sc.guide2[3]} stroke={sc.col} stroke-width={.75 * camera.boost} stroke-dasharray="3 4" stroke-dashoffset={Math.abs(sc.x) % 7 + tick(7)} />
  {/if}
</g>

<style>
  .figure { pointer-events: none; }
  .leg { stroke-width: calc(2px * var(--sw, 1)); stroke-linecap: round; stroke-dasharray: 3 6; opacity: 0.7; }
  .brace { fill: none; stroke-width: calc(1px * var(--sw, 1)); stroke-linecap: round; stroke-linejoin: round; opacity: 0.6; }
</style>
