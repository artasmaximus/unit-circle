<!-- The unit circle with its 16 snap points, each in its heat-map color. -->
<script lang="ts">
  import { S } from '../lib/camera.svelte.ts';
  import { SPECIAL, colorOf, rad } from '../lib/trig.ts';
  import { texRect } from '../lib/tex.svelte.ts';
  import { pen, penFrom, ui, revealed } from '../lib/state.svelte.ts';
  import SvgTex from '../ui/SvgTex.svelte';

  // the dots ride the same pen motion as the mode switch: they dip toward the center while it leans
  // back, swing out past the ring as it snaps through, and settle; their color turns over halfway
  const p = $derived(pen.current);
  const lift = $derived(p < 0 ? (p / 0.08) * 3 : Math.sin(Math.PI * Math.min(1, p)) * 11);
  const shown = $derived(p >= 0.5 ? revealed() : penFrom.revealed);
  const spots = $derived(SPECIAL.map((a) => {
    const c = Math.cos(rad(a)), s = -Math.sin(rad(a)), color = shown ? colorOf(a) : 'var(--muted)';
    const rect = texRect(`${a}^\\circ`, 10, c * (S + 31), s * (S + 31));
    const out = S + lift;
    return { a, x: c * out, y: s * out, color, label: rect && { latex: `${a}^\\circ`, size: 10, rect, color } };
  }));
</script>

<circle r={S} fill="none" stroke="var(--muted)" stroke-width="1" />
{#each spots as p (p.a)}
  <circle class="dot" cx={p.x} cy={p.y} r={ui.highlight.includes(p.a) ? 6.5 : 3.5} style:fill={p.color} />
  {#if p.label}<SvgTex label={p.label} />{/if}
{/each}

<style>
  .dot { pointer-events: none; }
</style>
