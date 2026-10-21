<!-- A button that becomes a card. Both carry the same view-transition name, so opening and closing
     run through `morph()`: the browser animates the button's box into the card's (right edge fixed,
     growing left and down) on a spring, cross-fading their contents, and lands exactly in place. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { camera } from '../lib/camera.svelte.ts';

  let { open, name, onopen, label, button, children }: {
    open: boolean; name: string; onopen: () => void; label: string; button: Snippet; children: Snippet;
  } = $props();

  const W = 400, MIN_ROOM = 560, EDGE = 16;
  let home = $state<HTMLDivElement>();
  // where the card sits: its right edge on the button's, as wide as fits, level with the button
  const place = $derived.by(() => {
    if (!open || !home) return '';
    void camera.vw; void camera.vh;
    const r = home.getBoundingClientRect(), w = Math.min(W, r.right - EDGE);
    const top = Math.max(EDGE, Math.min(r.top, camera.vh - MIN_ROOM));
    return `left:${r.right - w}px;top:${top}px;width:${w}px;max-height:${camera.vh - top - EDGE}px`;
  });
</script>

<div class="home" bind:this={home}>
  {#if open}
    <div class="card" style="{place};view-transition-name:{name}">{@render children()}</div>
  {:else}
    <button class="face" style:view-transition-name={name} aria-label={label} title={label} onclick={onopen}>{@render button()}</button>
  {/if}
</div>

<style>
  .home { position: relative; align-self: stretch; }
  .face {
    display: grid; place-items: center; width: 100%; height: 100%; padding: 0; border-radius: 12px; cursor: pointer;
    color: var(--slope); background: color-mix(in srgb, var(--slope) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--slope) 35%, transparent);
  }
  .face:hover { background: color-mix(in srgb, var(--slope) 20%, transparent); border-color: var(--slope); }
  .face:active { scale: 0.94; }
  .card {
    position: fixed; z-index: 5; overflow-y: auto; border-radius: 12px;
    background: color-mix(in srgb, var(--panel) 86%, transparent);
    -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
    border: 1px solid color-mix(in srgb, var(--slope) 50%, transparent); box-shadow: 0 24px 60px -20px var(--sh);
  }
</style>
