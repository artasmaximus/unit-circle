<!-- One element that is both a button and, when open, a card. Opening lifts that very element out of
     the page (it is moved, not copied) and springs its box from where it sat to where the card belongs:
     same right edge, growing left and down. As its content grows it keeps resizing on the spring;
     closing springs it back and drops it into its slot again. -->
<script lang="ts">
  import { Spring } from 'svelte/motion';
  import type { Snippet } from 'svelte';
  import { camera } from '../lib/camera.svelte.ts';

  let { open, onopen, label, button, children }: { open: boolean; onopen: () => void; label: string; button: Snippet; children: Snippet } = $props();

  const W = 400, MIN_ROOM = 560, EDGE = 16;
  let home = $state<HTMLDivElement>(), el = $state<HTMLDivElement>();
  let floating = $state(false), innerH = $state(0);
  /** The card's final width: its content is laid out at this width from the start, so it never reflows as it grows. */
  let cardW = $state(W);
  const box = new Spring({ x: 0, y: 0, w: 0, h: 0 }, { stiffness: 0.12, damping: 0.6 });

  const homeRect = () => {
    const r = home!.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  };
  // where the card wants to be: its right edge on the button's, as wide as fits, level with the button
  const place = () => {
    const r = home!.getBoundingClientRect(), w = Math.min(W, r.right - EDGE);
    cardW = w;
    const y = Math.max(EDGE, Math.min(r.top, camera.vh - MIN_ROOM));
    return { x: r.right - w, y, w, h: Math.min(innerH || r.height, camera.vh - y - EDGE) };
  };

  $effect(() => {
    if (open && !floating && home && el) {
      box.set(homeRect(), { instant: true });
      cardW = Math.min(W, home.getBoundingClientRect().right - EDGE);
      floating = true;
      document.body.appendChild(el);
    } else if (!open && floating) {
      box.set(homeRect()).then(() => {
        if (open) return;
        home?.appendChild(el!);
        floating = false;
      });
    }
  });
  // follow the content: a new step makes the card grow, on the same spring
  $effect(() => { if (open && floating) { void innerH; void camera.vh; box.target = place(); } });
  // if the panel goes away while the card is out, take it with it
  $effect(() => () => { if (el && el.parentNode === document.body) el.remove(); });
</script>

<div class="home" bind:this={home}>
  <div class="morph" class:floating bind:this={el}
    style={floating ? `left:${box.current.x}px;top:${box.current.y}px;width:${box.current.w}px;height:${box.current.h}px` : ''}>
    {#if open}
      <div class="inner" style:width="{cardW}px" bind:clientHeight={innerH}>{@render children()}</div>
    {:else}
      <button class="face" aria-label={label} title={label} onclick={onopen}>{@render button()}</button>
    {/if}
  </div>
</div>

<style>
  .home { position: relative; align-self: stretch; }
  .morph {
    position: absolute; inset: 0; overflow: hidden; border-radius: 9px;
    color: var(--slope); background: color-mix(in srgb, var(--slope) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--slope) 35%, transparent);
    transition: background 0.25s, border-radius 0.25s, box-shadow 0.25s;
  }
  .morph:hover:not(.floating) { background: color-mix(in srgb, var(--slope) 20%, transparent); border-color: var(--slope); }
  .floating {
    position: fixed; inset: auto; z-index: 5; border-radius: 20px; color: var(--fg);
    background: color-mix(in srgb, var(--panel) 86%, transparent);
    -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
    border-color: color-mix(in srgb, var(--slope) 50%, transparent); box-shadow: 0 24px 60px -20px var(--sh);
  }
  .inner { position: absolute; right: 0; top: 0; }
  .face { all: unset; display: grid; place-items: center; width: 100%; height: 100%; cursor: pointer; transition: transform 0.12s; }
  .face:active { transform: scale(0.94); }
  .face:focus-visible { outline: 2px solid var(--slope); outline-offset: 2px; border-radius: 9px; }
</style>
