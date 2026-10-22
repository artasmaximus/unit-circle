<!-- The unit circle with its 16 snap points, each in its heat-map color. -->
<script lang="ts">
  import { camera, S, LABEL_R } from "../lib/camera.svelte.ts";
  import { SPECIAL, colorOf, rad } from "../lib/trig.ts";
  import { input } from "../lib/tuning.ts";
  import { texRect } from "../lib/tex.svelte.ts";
  import { aim, penClock, penFrom, ui, revealed } from "../lib/state.svelte.ts";
  import SvgTex from "../ui/SvgTex.svelte";

  // during a mode switch the dots pulse in place, one after another around the ring; the whole wave
  // fits inside the switch's own glide, and each dot changes color at the peak of its pulse
  const PULSE = input.pulseShare, STEP = (1 - PULSE) / (SPECIAL.length - 1), GROW = input.pulseGrow;
  const local = (i: number) => Math.min(1, Math.max(0, (penClock.current - i * STEP) / PULSE));
  const spots = $derived(
    SPECIAL.map((a, i) => {
      const q = local(i), shown = q >= 0.5 ? revealed() : penFrom.revealed;
      const c = Math.cos(rad(a)), s = -Math.sin(rad(a)), color = shown ? colorOf(a) : "var(--muted)";
      const rect = texRect(`${a}^\\circ`, 10 * camera.labelBoost, c * LABEL_R, s * LABEL_R);
      return { a, x: c * S, y: s * S, scale: 1 + GROW * Math.sin(Math.PI * q), color, label: rect && { latex: `${a}^\\circ`, size: 10 * camera.labelBoost, rect, color } };
    }),
  );
</script>

<circle r={S} fill="none" stroke="var(--muted)" stroke-width={1 * camera.stroke} />
{#each spots as p (p.a)}
  <circle class="dot" cx={p.x} cy={p.y} style:r="{(ui.highlight.includes(p.a) ? 6.5 : 3.5) * p.scale * (aim.deg === p.a ? input.aimGrow : 1) * camera.stroke}px" style:fill={p.color}
    style:transition={penClock.current < 1 ? "none" : null} />
  {#if p.label && aim.deg !== p.a}<SvgTex label={p.label} />{/if}
{/each}

<style>
  .dot {
    pointer-events: none; transition: r 0.14s ease-out;
  }
</style>
