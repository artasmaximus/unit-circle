<!-- The unit circle with its 16 snap points, each in its heat-map color. -->
<script lang="ts">
  import { S } from "../lib/camera.svelte.ts";
  import { SPECIAL, colorOf, rad } from "../lib/trig.ts";
  import { texRect } from "../lib/tex.svelte.ts";
  import { penClock, penFrom, ui, revealed } from "../lib/state.svelte.ts";
  import SvgTex from "../ui/SvgTex.svelte";

  // during a mode switch the dots pulse in place, one after another around the ring; the whole wave
  // fits inside the switch's own glide, and each dot changes color at the peak of its pulse
  const PULSE = 0.4, STEP = (1 - PULSE) / (SPECIAL.length - 1), GROW = 0.25;
  const local = (i: number) => Math.min(1, Math.max(0, (penClock.current - i * STEP) / PULSE));
  const spots = $derived(
    SPECIAL.map((a, i) => {
      const q = local(i), shown = q >= 0.5 ? revealed() : penFrom.revealed;
      const c = Math.cos(rad(a)), s = -Math.sin(rad(a)), color = shown ? colorOf(a) : "var(--muted)";
      const rect = texRect(`${a}^\\circ`, 10, c * (S + 31), s * (S + 31));
      return { a, x: c * S, y: s * S, scale: 1 + GROW * Math.sin(Math.PI * q), color, label: rect && { latex: `${a}^\\circ`, size: 10, rect, color } };
    }),
  );
</script>

<circle r={S} fill="none" stroke="var(--muted)" stroke-width="1" />
{#each spots as p (p.a)}
  <circle class="dot" cx={p.x} cy={p.y} r={(ui.highlight.includes(p.a) ? 6.5 : 3.5) * p.scale} style:fill={p.color} />
  {#if p.label}<SvgTex label={p.label} />{/if}
{/each}

<style>
  .dot {
    pointer-events: none;
  }
</style>
