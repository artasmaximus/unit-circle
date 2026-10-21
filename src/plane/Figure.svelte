<!-- The triangle, angle arcs, braces, labels, mirror ghosts and trail for the current angle.
     On a mode switch (the shared pen motion) the dashes tick one step, the new color washes along the θ arc
     from 0° and then out along the radius, the braces redraw from their ends inward, and the leg labels bob. -->
<script lang="ts">
  import type { Scene } from '../lib/scene.ts';
  import { pen, penClock, penFrom } from '../lib/state.svelte.ts';
  import SvgTex from '../ui/SvgTex.svelte';
  let { scene: sc }: { scene: Scene } = $props();

  const t = $derived(penClock.current);
  const moving = $derived(t < 1);
  const window01 = (a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  /** The color the figure had before the switch; the new one washes over it. */
  const before = $derived(penFrom.revealed ? sc.blend : 'var(--fg)');
  const arcWash = $derived(window01(0, 0.5)), rayWash = $derived(window01(0.5, 1));
  const braceDraw = $derived(window01(0.15, 0.85));
  // one dash period per switch, on the pen's own lean-and-snap curve, so the dashes tick like the switch
  const tick = (period: number) => period * pen.current;
  const bob = $derived(1 + 0.12 * Math.sin(Math.PI * window01(0.45, 1)));
</script>

<g class="figure">
  <line x1={sc.x} y1={sc.y} x2="0" y2={sc.y} stroke="var(--muted)" stroke-width=".75" stroke-dasharray="3 4" stroke-dashoffset={tick(7)} />
  <path d={sc.wedge} fill="none" stroke={moving ? before : sc.col} stroke-width="1.25" />
  {#if moving}<path d={sc.wedge} fill="none" stroke={sc.col} stroke-width="1.25" pathLength="1" stroke-dasharray="{arcWash} 1" />{/if}
  {#if sc.wedgeHead}<path d={sc.wedgeHead} fill="none" stroke={moving && arcWash < 1 ? before : sc.col} stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />{/if}
  {#if sc.refArc}<path d={sc.refArc} fill="none" stroke={sc.col} stroke-width="1.75" stroke-linecap="round" />{/if}
  <line class="leg" x1="0" y1="0" x2={sc.x} y2="0" stroke={sc.col} stroke-dashoffset={tick(9)} />
  <line class="leg" x1={sc.sinLeg[0]} y1={sc.sinLeg[1]} x2={sc.sinLeg[2]} y2={sc.sinLeg[3]} stroke={sc.col} stroke-dashoffset={tick(9)} />
  <line x1="0" y1="0" x2={sc.x} y2={sc.y} stroke={moving ? before : sc.col} stroke-width="1.75" stroke-linecap="round" />
  {#if moving}<line x1="0" y1="0" x2={sc.x} y2={sc.y} stroke={sc.col} stroke-width="1.75" stroke-linecap="round" pathLength="1" stroke-dasharray="{rayWash} 1" />{/if}
  {#each [sc.braceC, sc.braceS] as b}
    <!-- drawn from both ends toward the tip in the middle -->
    {#if b}<path class="brace" d={b.path} transform={b.transform} stroke={sc.col} pathLength="1"
      stroke-dasharray={moving ? `${braceDraw / 2} ${1 - braceDraw} ${braceDraw / 2} 0` : 'none'} />{/if}
  {/each}
  {#if sc.refLabel}<SvgTex label={sc.refLabel} />{/if}
  {#each [sc.cosLabel, sc.sinLabel] as l}
    {#if l}
      <g style:transform-origin="{l.rect.x + l.rect.w / 2}px {l.rect.y + l.rect.h / 2}px" style:scale={bob}>
        <rect x={l.rect.x - 3} y={l.rect.y - 1.5} width={l.rect.w + 6} height={l.rect.h + 3} rx="3" fill="var(--panel)" opacity=".72" />
        <SvgTex label={l} />
      </g>
    {/if}
  {/each}
  {#each sc.trail as tr}
    <line x1={tr.seg[0]} y1={tr.seg[1]} x2={tr.seg[2]} y2={tr.seg[3]} stroke={tr.color} stroke-width={tr.width} opacity={tr.opacity} stroke-linecap="round" />
  {/each}
  {#each sc.mirrors as m}
    {#if m.line}<line x1={m.line[0]} y1={m.line[1]} x2={m.line[2]} y2={m.line[3]} stroke={sc.col} stroke-width="1" stroke-dasharray="2 4" opacity=".8" />{/if}
    <circle cx={m.dot[0]} cy={m.dot[1]} r="4.5" fill="var(--bg)" stroke={sc.col} stroke-width="1.5" />
    {#if m.label}<SvgTex label={m.label} />{/if}
  {/each}
  {#if sc.guide2}
    <line x1={sc.guide2[0]} y1={sc.guide2[1]} x2={sc.guide2[2]} y2={sc.guide2[3]} stroke={sc.col} stroke-width=".75" stroke-dasharray="3 4" stroke-dashoffset={Math.abs(sc.x) % 7 + tick(7)} />
  {/if}
</g>

<style>
  .figure { pointer-events: none; }
  .leg { stroke-width: 2; stroke-linecap: round; stroke-dasharray: 3 6; opacity: 0.7; }
  .brace { fill: none; stroke-width: 1; stroke-linecap: round; stroke-linejoin: round; opacity: 0.6; }
</style>
