<!-- On very wide screens the solver gets its own column between the panel and the circle. -->
<script lang="ts">
  import { camera } from '../lib/camera.svelte.ts';
  import { solver } from '../lib/state.svelte.ts';
  import Solver from './Solver.svelte';

  const WIDTH = 380;
  const show = $derived(solver.open && camera.huge);
  $effect(() => { camera.side.target = show ? WIDTH + 24 : 0; });
</script>

{#if show}
  <div class="col" style:left="{camera.inset.left + 12}px" style:width="{WIDTH}px"><Solver /></div>
{/if}

<style>
  .col { position: fixed; z-index: 3; top: max(28px, env(safe-area-inset-top, 0px)); max-height: calc(100svh - 56px); overflow-y: auto; }
</style>
