<!-- The unit circle with its 16 snap points, each in its heat-map color. -->
<script lang="ts">
  import { S } from '../lib/camera.svelte.ts';
  import { SPECIAL, colorOf, rad } from '../lib/trig.ts';
  import { texRect } from '../lib/tex.svelte.ts';
  import { ui, revealed } from '../lib/state.svelte.ts';
  import SvgTex from '../ui/SvgTex.svelte';


  // when colors come or go (switching mode, answering), each dot dips toward the center, springs out
  // past the ring and settles back, like the mode switch; the color lands as it returns
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dots: SVGCircleElement[] = [];
  let prev = revealed();
  $effect(() => {
    const r = revealed();
    if (r === prev) return;
    prev = r;
    if (reduce) return;
    SPECIAL.forEach((a, i) => {
      const c = Math.cos(rad(a)), s = -Math.sin(rad(a));
      dots[i]?.animate([
        { translate: '0 0' },
        { translate: `${-c * 3}px ${-s * 3}px`, offset: 0.25, easing: 'cubic-bezier(0.6, 0, 0.9, 0.4)' },
        { translate: `${c * 11}px ${s * 11}px`, offset: 0.62, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' },
        { translate: '0 0' },
      ], { duration: 520, delay: i * 16 });
    });
  });
  const spots = $derived(SPECIAL.map((a) => {
    const c = Math.cos(rad(a)), s = -Math.sin(rad(a)), color = revealed() ? colorOf(a) : 'var(--muted)';
    const rect = texRect(`${a}^\\circ`, 10, c * (S + 31), s * (S + 31));
    return { a, x: c * S, y: s * S, color, label: rect && { latex: `${a}^\\circ`, size: 10, rect, color } };
  }));
</script>

<circle r={S} fill="none" stroke="var(--muted)" stroke-width="1" />
{#each spots as p, i (p.a)}
  <circle bind:this={dots[i]} class="dot" cx={p.x} cy={p.y} r={ui.highlight.includes(p.a) ? 6.5 : 3.5} style:fill={p.color} />
  {#if p.label}<SvgTex label={p.label} />{/if}
{/each}

<style>
  .dot { transition: fill 0.2s 0.3s; pointer-events: none; }
</style>
