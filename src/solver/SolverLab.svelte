<!-- Test bench for the equation solver, kept out of the main UI: open the app with ?lab=solver.
     Pick csc, sec or cot to start a problem; the Solver card appears and the circle is used to
     find the angles. -->
<script lang="ts">
  import { camera } from '../core/camera.svelte.ts';
  import { ui, solver, type RecipKey } from '../core/state.svelte.ts';
  import Solver from './Solver.svelte';

  ui.mode = 'explore';
  let w = $state(0);
  $effect(() => {
    camera.inset = { left: camera.wide ? w : 0, bottom: camera.wide ? 0 : 320 };
  });
  const KEYS: RecipKey[] = ['csc', 'sec', 'cot'];
</script>

<aside class="lab" bind:clientWidth={w}>
  <h1>Solver lab</h1>
  <div class="starts">
    {#each KEYS as k}<button
        aria-pressed={solver.open && solver.key === k}
        onclick={() => solver.start(k)}>{k}</button
      >{/each}
  </div>
  {#if solver.open}<Solver bare />{/if}
</aside>

<style>
  .lab {
    position: fixed;
    z-index: 2;
    left: 0;
    top: 0;
    bottom: 0;
    width: clamp(340px, 32vw, 460px);
    box-sizing: border-box;
    padding: 24px;
    overflow-y: auto;
    background: color-mix(in srgb, var(--bg) 80%, transparent);
  }
  @media not ((min-width: 700px) and (min-aspect-ratio: 1/1)) {
    .lab {
      top: auto;
      right: 0;
      width: auto;
      height: 320px;
    }
  }
  h1 {
    margin: 0 0 12px;
    font-size: 1.2rem;
  }
  .starts {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
</style>
