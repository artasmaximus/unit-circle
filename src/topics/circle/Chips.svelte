<!-- Labels floating over the plane: the point's θ and coordinates, and the slope on the radius,
     which unfolds its working when clicked. Positions come from the layout, in world units. -->
<script lang="ts">
  import { scale } from 'svelte/transition';
  import { camera } from '../../core/camera.svelte.ts';
  import { ui } from '../../core/state.svelte.ts';
  import { CHIP_FONT, type Chip, type Layout } from './layout.ts';
  import Tex from '../../ui/Tex.svelte';
  let { layout }: { layout: Layout } = $props();
  let slopeEl = $state<HTMLButtonElement>();
  const close = () => (ui.slopeOpen = false);

  const box = (c: Chip) => {
    const k = camera.k;
    return `transform:translate(${camera.ox + (c.x - c.w / 2) * k}px,${camera.oy + (c.y - c.h / 2) * k}px);width:${c.w * k}px;height:${c.h * k}px;font-size:${CHIP_FONT * camera.textBoost}px;--c:${c.color}`;
  };
</script>

<svelte:window
  onpointerdown={(e) => {
    if (ui.slopeOpen && !slopeEl?.contains(e.target as Node)) close();
  }}
  onkeydown={(e) => {
    if (e.key === 'Escape' && ui.slopeOpen) close();
  }}
/>

<div class="layer">
  {#if layout.tag}
    {@const t = layout.tag}
    <!-- no card: a soft blur behind the values keeps them readable over the grid and lines -->
    <div class="tag" style={box(t)}>
      {#if t.values}
        <span class="values" transition:scale={{ start: 0.6, duration: 200 }}>
          {#each t.parts ?? [] as part}<span style:color={part.color}
              ><Tex latex={part.latex} /></span
            >{/each}
        </span>
      {/if}
    </div>
  {/if}
  {#if layout.slope}
    <!-- amber tan θ = value; hovering badges it as the slope, and a click unfolds the working
         inside the box -->
    <button
      bind:this={slopeEl}
      type="button"
      class="chip slope"
      style={box(layout.slope)}
      aria-expanded={ui.slopeOpen}
      aria-label="Slope: click to show the calculation"
      onclick={() => (ui.slopeOpen = !ui.slopeOpen)}
      onblur={close}
      transition:scale={{ start: 0.6, duration: 200 }}
    >
      <span class="badge">slope</span><Tex latex={layout.slope.latex} />
    </button>
  {/if}
</div>

<style>
  .tag {
    position: absolute;
    left: 0;
    top: 0;
    box-sizing: border-box;
    display: grid;
    place-items: center;
    transition: transform 0.24s cubic-bezier(0.22, 0.9, 0.3, 1);
  }
  .values {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
  }
  /* a blur that fades out at its edges, behind the values only (masking the text itself would
     fade it too) */
  .values::before {
    content: '';
    position: absolute;
    inset: -6px -10px;
    z-index: -1;
    background: color-mix(in srgb, var(--bg) 35%, transparent);
    -webkit-backdrop-filter: blur(5px);
    backdrop-filter: blur(5px);
    -webkit-mask-image: radial-gradient(closest-side, #000 50%, transparent);
    mask-image: radial-gradient(closest-side, #000 50%, transparent);
  }
  .layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
  }
  .chip {
    position: absolute;
    left: 0;
    top: 0;
    box-sizing: border-box;
    display: grid;
    place-items: center;
    line-height: 1;
    color: var(--fg);
    white-space: nowrap;
    border: 1px solid color-mix(in srgb, var(--c) 55%, var(--line));
    border-radius: 8px;
    background: var(--glass);
    box-shadow: 0 6px 14px -4px var(--sh);
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    transition:
      transform 0.24s cubic-bezier(0.22, 0.9, 0.3, 1),
      width 0.24s cubic-bezier(0.22, 0.9, 0.3, 1),
      height 0.24s cubic-bezier(0.22, 0.9, 0.3, 1),
      border-color 0.15s;
  }
  /* amber-tinted glass with a soft amber edge */
  .slope {
    pointer-events: auto;
    cursor: pointer;
    outline: none;
    font: inherit;
    padding: 0;
    border-color: color-mix(in srgb, var(--slope) 35%, transparent);
    background: color-mix(in srgb, var(--slope) 12%, var(--glass));
  }
  /* a small tag above the box's top-left corner, only while hovering or keyboard-focusing it */
  .badge {
    position: absolute;
    left: -1px;
    bottom: calc(100% + 4px);
    padding: 3px 7px;
    border-radius: 6px;
    font-size: 0.72em;
    line-height: 1;
    letter-spacing: 0.03em;
    color: var(--slope);
    border: 1px solid color-mix(in srgb, var(--slope) 35%, transparent);
    background: color-mix(in srgb, var(--slope) 12%, var(--glass));
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    opacity: 0;
    transform: translateY(2px);
    pointer-events: none;
    transition:
      opacity 0.15s,
      transform 0.15s;
  }
  .slope:hover .badge,
  .slope:focus-visible .badge,
  .slope[aria-expanded='true'] .badge {
    opacity: 1;
    transform: none;
  }
</style>
