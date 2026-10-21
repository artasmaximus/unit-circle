<!-- Labels floating over the plane: the point's θ and coordinates, and the slope on the radius,
     which unfolds its working when clicked. Positions come from the scene, in world units. -->
<script lang="ts">
  import { scale } from 'svelte/transition';
  import { camera } from '../lib/camera.svelte.ts';
  import type { Chip, Scene } from '../lib/scene.ts';
  import Tex from '../ui/Tex.svelte';
  import AngleInput from '../ui/AngleInput.svelte';
  let { scene }: { scene: Scene } = $props();

  const box = (c: Chip) => {
    const k = camera.k;
    return `transform:translate(${camera.ox + (c.x - c.w / 2) * k}px,${camera.oy + (c.y - c.h / 2) * k}px);width:${c.w * k}px;height:${c.h * k}px;--c:${c.color}`;
  };
</script>

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
    <!-- just tan θ = value; hovering (or focusing) shows how it is worked out -->
    <button type="button" class="chip slope" style={box(scene.slope)} aria-label="Slope: hover to see how it is worked out">
      <Tex latex={scene.slope.latex} />
      <span class="calc" role="tooltip"><Tex latex={scene.slopeCalc} /></span>
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
  /* amber-tinted glass with a soft amber edge */
  .slope {
    pointer-events: auto; cursor: help; outline: none; font: inherit; font-size: 13px; padding: 0;
    border-color: color-mix(in srgb, var(--slope) 35%, transparent);
    background: color-mix(in srgb, var(--slope) 12%, var(--glass));
  }
  .calc {
    position: absolute; left: 50%; top: calc(100% + 8px); translate: -50% 0; padding: 8px 12px; border-radius: 9px; white-space: nowrap;
    background: color-mix(in srgb, var(--panel) 92%, transparent); color: var(--fg); border: 1px solid var(--line); box-shadow: 0 8px 20px -6px var(--sh);
    -webkit-backdrop-filter: blur(16px) saturate(1.4); backdrop-filter: blur(16px) saturate(1.4);
    opacity: 0; pointer-events: none; transition: opacity 0.15s;
  }
  .slope:hover .calc, .slope:focus-visible .calc { opacity: 1; }
</style>
