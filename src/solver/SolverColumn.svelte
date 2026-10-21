<!-- On wide screens the solver grows out of the ƒ button that opened it: the button's corner stays put
     and the card springs open leftward and down, over the definitions. Closing folds it back in. -->
<script lang="ts">
  import { camera } from '../lib/camera.svelte.ts';
  import { solver } from '../lib/state.svelte.ts';
  import Solver from './Solver.svelte';

  const WIDTH = 400, MIN_ROOM = 560;
  const show = $derived(solver.open && camera.wide);
  const anchor = $derived(solver.from);
  const right = $derived(anchor ? anchor.right : camera.inset.left - 12);
  const left = $derived(Math.max(12, right - WIDTH));
  // level with the button, unless that leaves too little room below
  const top = $derived(Math.max(20, Math.min(anchor?.top ?? 20, camera.vh - MIN_ROOM)));

  // an underdamped spring: overshoots a touch, then settles
  const spring = (t: number) => 1 - Math.exp(-7 * t) * Math.cos(8.5 * t);
  function grow(node: Element, { out = false } = {}) {
    const to = node.getBoundingClientRect(), from = anchor;
    if (!from || !to.width) return { duration: 0 };
    const sx = from.width / to.width, sy = from.height / to.height, dx = from.right - to.right, dy = from.top - to.top;
    return {
      duration: out ? 260 : 620, easing: out ? (t: number) => t * t : spring,
      css: (t: number, u: number) =>
        `transform-origin:100% 0;transform:translate(${dx * u}px,${dy * u}px) scale(${1 + (sx - 1) * u},${1 + (sy - 1) * u});opacity:${Math.min(1, t * 4)}`,
    };
  }
</script>

{#if show}
  <div class="col" style:left="{left}px" style:top="{top}px" style:width="{right - left}px" style:max-height="calc(100svh - {top + 20}px)"
    in:grow out:grow={{ out: true }}><Solver /></div>
{/if}

<style>
  .col { position: fixed; z-index: 3; overflow-y: auto; }
  .col :global(.card) { background: color-mix(in srgb, var(--panel) 82%, transparent); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); }
</style>
