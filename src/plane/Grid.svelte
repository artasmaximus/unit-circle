<!-- Graph paper filling the viewport: a line every 0.2, a stronger one every 1, axes, and ticks on the axes inside the circle. -->
<script lang="ts">
  import { camera, S } from '../lib/camera.svelte.ts';
  const STEP = S / 5, MAX_DOT_CELLS = 20000;
  const range = (lo: number, hi: number) => {
    const out: number[] = [];
    for (let i = Math.floor(lo / STEP); i <= Math.ceil(hi / STEP); i++) out.push(i);
    return out;
  };
  const v = $derived(camera.view);
  /** A faint dot at the middle of every square and of every square's edge: the half-step points that are not line crossings. */
  const dots = $derived.by(() => {
    const H = STEP / 2, out: string[] = [];
    // zoomed far out the cells run into the hundreds of thousands, and the dots would be a haze anyway
    if ((v.w / H) * (v.h / H) > MAX_DOT_CELLS) return '';
    for (let i = Math.floor(v.x / H); i <= Math.ceil((v.x + v.w) / H); i++)
      for (let j = Math.floor(v.y / H); j <= Math.ceil((v.y + v.h) / H); j++)
        if ((i | j) & 1) out.push(`M${i * H} ${j * H}h0`);
    return out.join('');
  });
  const cols = $derived(range(v.x, v.x + v.w));
  const rows = $derived(range(v.y, v.y + v.h));
</script>

<g class="grid" vector-effect="non-scaling-stroke">
  <path class="dots" d={dots} style:stroke-width="{camera.wide ? 2 : 1.2}px" />
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
  <!-- the odd 0.1 marks sit between the full ticks, a little shorter -->
  {#each [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4] as i (i)}
    <line class="tick" x1={(i + 0.5) * STEP} y1="-2.2" x2={(i + 0.5) * STEP} y2="2.2" />
    <line class="tick" x1="-2.2" y1={(i + 0.5) * STEP} x2="2.2" y2={(i + 0.5) * STEP} />
  {/each}
</g>

<style>
  line { stroke: var(--line); stroke-width: calc(0.75px * var(--sw, 1)); vector-effect: non-scaling-stroke; opacity: 0.55; }
  .dots { fill: none; stroke: var(--muted); stroke-linecap: round; vector-effect: non-scaling-stroke; opacity: 0.3; }
  .major { opacity: 1; }
  .axis { stroke: var(--muted); opacity: 0.45; stroke-width: calc(1px * var(--sw, 1)); }
  .tick { stroke: var(--muted); opacity: 1; stroke-width: calc(1px * var(--sw, 1)); }
</style>
