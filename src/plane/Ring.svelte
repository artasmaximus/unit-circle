<!-- The unit circle with its 16 snap points. Hovering a point grows it and its label; clicking sends the point there. -->
<script lang="ts">
  import { S } from '../lib/camera.svelte.ts';
  import { SPECIAL, colorOf, rad } from '../lib/trig.ts';
  import { texRect } from '../lib/tex.svelte.ts';
  import { point, ui, revealed } from '../lib/state.svelte.ts';
  import SvgTex from '../ui/SvgTex.svelte';

  let hover = $state<number | null>(null);
  const spots = $derived(SPECIAL.map((a) => {
    const c = Math.cos(rad(a)), s = -Math.sin(rad(a)), color = revealed() ? colorOf(a) : 'var(--muted)';
    const rect = texRect(`${a}^\\circ`, 10, c * (S + 31), s * (S + 31));
    return { a, x: c * S, y: s * S, color, label: rect && { latex: `${a}^\\circ`, size: 10, rect, color } };
  }));
</script>

<circle r={S} fill="none" stroke="var(--muted)" stroke-width="1" />
{#each spots as p (p.a)}
  <circle class="dot" cx={p.x} cy={p.y} r={ui.highlight.includes(p.a) ? 6.5 : 3.5} fill={p.color} style:scale={hover === p.a ? 1.9 : 1} />
  {#if p.label}
    {@const r = p.label.rect}
    <g class="lbl" style:scale={hover === p.a ? 1.1 : 1} style:transform-origin="{r.x + r.w / 2}px {r.y + r.h / 2}px"><SvgTex label={p.label} /></g>
  {/if}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <circle cx={p.x} cy={p.y} r="13" fill="transparent" style="cursor:pointer"
    onpointerenter={() => (hover = p.a)} onpointerleave={() => (hover = null)}
    onpointerdown={(e) => { e.stopPropagation(); point.set(p.a, true); }} />
{/each}

<style>
  .dot { transform-box: fill-box; transform-origin: center; transition: scale 0.16s cubic-bezier(0.22, 0.9, 0.3, 1); }
  .lbl { transition: scale 0.09s ease-out; pointer-events: none; }
</style>
