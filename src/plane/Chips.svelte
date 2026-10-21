<!-- Frosted labels floating over the plane: the point's coordinates, and the slope on the radius,
     which unfolds its working when clicked. Positions come from the scene, in world units. -->
<script lang="ts">
  import { scale } from 'svelte/transition';
  import { camera } from '../lib/camera.svelte.ts';
  import { ui } from '../lib/state.svelte.ts';
  import type { Chip, Scene } from '../lib/scene.ts';
  import Tex from '../ui/Tex.svelte';
  import AngleInput from '../ui/AngleInput.svelte';
  let { scene }: { scene: Scene } = $props();

  const box = (c: Chip) => {
    const k = camera.k;
    return `transform:translate(${camera.ox + (c.x - c.w / 2) * k}px,${camera.oy + (c.y - c.h / 2) * k}px);width:${c.w * k}px;height:${c.h * k}px;--c:${c.color}`;
  };
  let slopeEl = $state<HTMLButtonElement>();
  const close = () => (ui.slopeOpen = false);
</script>

<svelte:window
  onpointerdown={(e) => { if (ui.slopeOpen && !slopeEl?.contains(e.target as Node)) close(); }}
  onkeydown={(e) => { if (e.key === 'Escape' && ui.slopeOpen) close(); }} />

<div class="layer">
  {#if scene.tag}
    {@const t = scene.tag}
    <!-- no card: a soft blur behind the values keeps them readable over the grid and lines -->
    <div class="tag" class:below={!t.thetaAbove} style={box(t)}>
      <AngleInput />
      {#if t.values}
        <span class="values" transition:scale={{ start: 0.6, duration: 200 }}>
          {#each t.parts ?? [] as part}<span style:color={part.color}><Tex latex={part.latex} /></span>{/each}
        </span>
      {/if}
    </div>
  {/if}
  {#if scene.slope}
    <button bind:this={slopeEl} class="chip slope" style={box(scene.slope)} aria-expanded={ui.slopeOpen}
      title="Click to show the calculation" onclick={() => (ui.slopeOpen = !ui.slopeOpen)} onblur={close}
      transition:scale={{ start: 0.6, duration: 200 }}>
      <span class="cap">slope</span><Tex latex={scene.slope.latex} />
    </button>
  {/if}
</div>

<style>
  .tag {
    position: absolute; left: 0; top: 0; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
    font-size: 13px; transition: transform 0.24s cubic-bezier(0.22, 0.9, 0.3, 1);
  }
  .tag.below { flex-direction: column-reverse; }
  .values { position: relative; display: inline-flex; align-items: center; padding: 6px 12px; }
  /* a blur that fades out at its edges, behind the values only (masking the text itself would fade it too) */
  .values::before {
    content: ''; position: absolute; inset: -6px -10px; z-index: -1;
    background: color-mix(in srgb, var(--bg) 35%, transparent);
    -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px);
    -webkit-mask-image: radial-gradient(closest-side, #000 50%, transparent); mask-image: radial-gradient(closest-side, #000 50%, transparent);
  }
  .layer { position: fixed; inset: 0; pointer-events: none; }
  .chip {
    position: absolute; left: 0; top: 0; box-sizing: border-box; display: grid; place-items: center;
    font-size: 13px; line-height: 1; color: var(--fg); white-space: nowrap;
    border: 1px solid color-mix(in srgb, var(--c) 55%, var(--line)); border-radius: 8px;
    background: var(--glass); box-shadow: 0 6px 14px -4px var(--sh);
    -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
    transition: transform 0.24s cubic-bezier(0.22, 0.9, 0.3, 1), width 0.24s cubic-bezier(0.22, 0.9, 0.3, 1), height 0.24s cubic-bezier(0.22, 0.9, 0.3, 1), border-color 0.15s;
  }
  .slope { pointer-events: auto; cursor: pointer; padding: 10px 0 0; font: inherit; font-size: 13px; }
  .slope:hover, .slope:focus-visible { border-color: var(--slope); outline: none; }
  .cap { position: absolute; left: 8px; top: 4px; font-size: 8px; letter-spacing: 0.09em; text-transform: uppercase; color: var(--muted); }
  .slope::after {
    content: ''; position: absolute; right: 7px; top: 6px; width: 4px; height: 4px;
    border-right: 1.5px solid var(--muted); border-bottom: 1.5px solid var(--muted); transform: rotate(45deg); opacity: 0; transition: opacity 0.15s;
  }
  .slope:hover::after, .slope:focus-visible::after { opacity: 1; }
  .slope[aria-expanded='true']::after { opacity: 1; transform: rotate(-135deg); top: 9px; }
</style>
