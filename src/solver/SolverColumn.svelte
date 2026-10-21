<!-- On very wide screens the solver grows out of the ƒ button that opened it and stays beside it,
     pinned at the button's height; the circle glides right to make room. -->
<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { camera } from '../lib/camera.svelte.ts';
  import { solver } from '../lib/state.svelte.ts';
  import Solver from './Solver.svelte';

  const WIDTH = 380, GAP = 12, MIN_ROOM = 560;
  const show = $derived(solver.open && camera.huge);
  const anchor = $derived(solver.from);
  const left = $derived(anchor ? anchor.right + GAP : camera.inset.left + GAP);
  // as high as the button, but never so low that the card runs out of room below it
  const top = $derived(Math.max(28, Math.min(anchor?.top ?? 28, camera.vh - MIN_ROOM)));
  $effect(() => { camera.side.target = show ? Math.max(0, left + WIDTH + 24 - camera.inset.left) : 0; });

  function grow(node: Element) {
    const to = node.getBoundingClientRect(), from = anchor;
    if (!from || !to.width) return { duration: 0 };
    const sx = from.width / to.width, sy = from.height / to.height, dx = from.left - to.left, dy = from.top - to.top;
    return { duration: 420, easing: cubicOut, css: (t: number, u: number) =>
      `transform-origin:0 0;transform:translate(${dx * u}px,${dy * u}px) scale(${1 + (sx - 1) * u},${1 + (sy - 1) * u});opacity:${Math.min(1, t * 3)}` };
  }
</script>

{#if show}
  <div class="col" style:left="{left}px" style:top="{top}px" style:width="{WIDTH}px" style:max-height="calc(100svh - {top + 28}px)" in:grow><Solver /></div>
{/if}

<style>
  .col { position: fixed; z-index: 3; overflow-y: auto; }
</style>
