<!-- The triangle, angle arcs, braces, labels, mirror ghosts and trail for the current angle. -->
<script lang="ts">
  import type { Scene } from '../lib/scene.ts';
  import SvgTex from '../ui/SvgTex.svelte';
  let { scene: sc }: { scene: Scene } = $props();
</script>

<g class="figure">
  <line x1={sc.x} y1={sc.y} x2="0" y2={sc.y} stroke="var(--muted)" stroke-width=".75" stroke-dasharray="3 4" />
  <path d={sc.wedge} fill="none" stroke={sc.col} stroke-width="1.25" />
  {#if sc.wedgeHead}<path d={sc.wedgeHead} fill="none" stroke={sc.col} stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />{/if}
  {#if sc.refArc}<path d={sc.refArc} fill="none" stroke={sc.col} stroke-width="1.75" stroke-linecap="round" />{/if}
  <line class="leg" x1="0" y1="0" x2={sc.x} y2="0" stroke={sc.col} />
  <line class="leg" x1={sc.sinLeg[0]} y1={sc.sinLeg[1]} x2={sc.sinLeg[2]} y2={sc.sinLeg[3]} stroke={sc.col} />
  <line x1="0" y1="0" x2={sc.x} y2={sc.y} stroke={sc.col} stroke-width="1.75" stroke-linecap="round" />
  {#each [sc.braceC, sc.braceS] as b}
    {#if b}<path class="brace" d={b.path} transform={b.transform} stroke={sc.col} />{/if}
  {/each}
  {#if sc.refLabel}<SvgTex label={sc.refLabel} />{/if}
  {#each [sc.cosLabel, sc.sinLabel] as l}
    {#if l}
      <rect x={l.rect.x - 3} y={l.rect.y - 1.5} width={l.rect.w + 6} height={l.rect.h + 3} rx="3" fill="var(--panel)" opacity=".72" />
      <SvgTex label={l} />
    {/if}
  {/each}
  {#each sc.trail as t}
    <line x1={t.seg[0]} y1={t.seg[1]} x2={t.seg[2]} y2={t.seg[3]} stroke={t.color} stroke-width={t.width} opacity={t.opacity} stroke-linecap="round" />
  {/each}
  {#each sc.mirrors as m}
    {#if m.line}<line x1={m.line[0]} y1={m.line[1]} x2={m.line[2]} y2={m.line[3]} stroke={sc.col} stroke-width="1" stroke-dasharray="2 4" opacity=".8" />{/if}
    <circle cx={m.dot[0]} cy={m.dot[1]} r="4.5" fill="var(--bg)" stroke={sc.col} stroke-width="1.5" />
    {#if m.label}<SvgTex label={m.label} />{/if}
  {/each}
  {#if sc.guide2}
    <line x1={sc.guide2[0]} y1={sc.guide2[1]} x2={sc.guide2[2]} y2={sc.guide2[3]} stroke={sc.col} stroke-width=".75" stroke-dasharray="3 4" stroke-dashoffset={Math.abs(sc.x) % 7} />
  {/if}
</g>

<style>
  .figure { pointer-events: none; }
  .leg { stroke-width: 2; stroke-linecap: round; stroke-dasharray: 3 6; opacity: 0.7; }
  .brace { fill: none; stroke-width: 1; stroke-linecap: round; stroke-linejoin: round; opacity: 0.6; }
</style>
