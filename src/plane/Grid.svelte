<!-- Graph paper filling the viewport: a line every 0.2, a stronger one every 1, axes, and ticks on the axes inside the circle. -->
<script lang="ts">
  import { camera, S } from '../lib/camera.svelte.ts';
  const STEP = S / 5;
  const range = (lo: number, hi: number) => {
    const out: number[] = [];
    for (let i = Math.floor(lo / STEP); i <= Math.ceil(hi / STEP); i++) out.push(i);
    return out;
  };
  const v = $derived(camera.view);
  const cols = $derived(range(v.x, v.x + v.w));
  const rows = $derived(range(v.y, v.y + v.h));
</script>

<g class="grid" vector-effect="non-scaling-stroke">
  {#each cols as i (i)}
    {#if i}<line x1={i * STEP} y1={v.y} x2={i * STEP} y2={v.y + v.h} class:major={i % 5 === 0} />{/if}
  {/each}
  {#each rows as i (i)}
    {#if i}<line x1={v.x} y1={i * STEP} x2={v.x + v.w} y2={i * STEP} class:major={i % 5 === 0} />{/if}
  {/each}
  <line class="axis" x1={v.x} y1="0" x2={v.x + v.w} y2="0" />
  <line class="axis" x1="0" y1={v.y} x2="0" y2={v.y + v.h} />
  {#each [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5] as i (i)}
    <line class="tick" x1={i * STEP} y1="-3.5" x2={i * STEP} y2="3.5" />
    <line class="tick" x1="-3.5" y1={i * STEP} x2="3.5" y2={i * STEP} />
  {/each}
</g>

<style>
  line { stroke: var(--line); stroke-width: 0.75px; vector-effect: non-scaling-stroke; opacity: 0.55; }
  .major { opacity: 1; }
  .axis { stroke: var(--muted); opacity: 0.45; stroke-width: 1px; }
  .tick { stroke: var(--muted); opacity: 1; stroke-width: 1px; }
</style>
