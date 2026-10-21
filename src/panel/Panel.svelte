<!-- The panel floats over the plane: on the left on wide screens, along the bottom on phones. Behind it a
     progressive blur fades out past its edge, so the grid stays visible and usable right up to the panel. -->
<script lang="ts">
  import { camera } from '../lib/camera.svelte.ts';
  import { pen, setMode, ui } from '../lib/state.svelte.ts';
  import Quiz from './Quiz.svelte';
  import Segmented from '../ui/Segmented.svelte';
  import Reciprocals from './Reciprocals.svelte';
  import Solver from '../solver/Solver.svelte';
  import { solver } from '../lib/state.svelte.ts';

  let w = $state(0), h = $state(0);
  $effect(() => { camera.inset = camera.wide ? { left: w, bottom: 0 } : { left: 0, bottom: h }; });

  // blur layers from strongest to weakest; each reaches a little further out, so the blur thins toward the edge
  const LAYERS = [[6, 62, 80], [4, 70, 87], [2, 78, 93], [1, 86, 100]];

  let contentH = $state(0);
</script>

<aside class="panel" bind:clientWidth={w} bind:clientHeight={h}>
  <!-- the blur hugs the content: it ends a little below the last element and fades out past the panel edge -->
  <div class="blur" aria-hidden="true" style:--content-h="{contentH}px">
    {#each LAYERS as [b, a, z]}<div style="--b:{b}px;--a:{a}%;--z:{z}%"></div>{/each}
    <div class="tint"></div>
  </div>
  <div class="content" bind:clientHeight={contentH}>
    <!-- on phones a problem takes the whole sheet: grid on top, problem below -->
    {#if !(solver.open && ui.mode === 'explore' && !camera.wide)}
    <header>
      <h1>Unit Circle</h1>
      <div class="tools">
        <Segmented label="Mode" value={ui.mode} onchange={setMode} progress={pen.current}
          options={[{ value: 'explore', label: 'Explore' }, { value: 'quiz', label: 'Quiz' }]} />
        <button aria-pressed={ui.mirror} onclick={() => (ui.mirror = !ui.mirror)}
          data-tip="Shows the mirrored angles that share this point's reference angle. In a quiz it shows the other angle with the same sin, cos or tan, so you can see both answers.">Mirror</button>
      </div>
    </header>
    {/if}
    {#if ui.mode === 'quiz'}<Quiz />{:else if solver.open && !camera.wide}<Solver />{:else}<Reciprocals />{/if}
  </div>
</aside>

<style>
  /* the panel only positions things; empty space in it lets the grid through, to the pointer too */
  .panel {
    position: fixed; z-index: 2; left: 0; top: 0; bottom: 0; width: clamp(340px, 32vw, 460px); pointer-events: none;
    --dir: to right; --side: 120px; --below: 110px;
  }
  @media not ((min-width: 700px) and (min-aspect-ratio: 1/1)) {
    .panel { top: auto; right: 0; width: auto; height: 44svh; --dir: to top; --side: 0px; }
  }
  /* sized to the content plus a feather past the panel's edge and below its last element */
  .blur { position: absolute; left: 0; top: 0; width: calc(100% + var(--side)); height: calc(var(--content-h) + var(--below)); pointer-events: none; }
  @media not ((min-width: 700px) and (min-aspect-ratio: 1/1)) { .blur { top: -90px; height: calc(100% + 90px); } }
  .blur > div { position: absolute; inset: 0; }
  .blur > div:not(.tint) {
    -webkit-backdrop-filter: blur(var(--b)); backdrop-filter: blur(var(--b));
    -webkit-mask-image: linear-gradient(var(--dir), #000 var(--a), transparent var(--z)), linear-gradient(to bottom, #000 calc(100% - var(--below)), transparent);
    mask-image: linear-gradient(var(--dir), #000 var(--a), transparent var(--z)), linear-gradient(to bottom, #000 calc(100% - var(--below)), transparent);
    -webkit-mask-composite: source-in; mask-composite: intersect;
  }
  .tint {
    background: linear-gradient(var(--dir), color-mix(in srgb, var(--bg) 45%, transparent) 55%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - var(--below)), transparent);
    mask-image: linear-gradient(to bottom, #000 calc(100% - var(--below)), transparent);
  }
  @media not ((min-width: 700px) and (min-aspect-ratio: 1/1)) {
    .blur > div:not(.tint) { -webkit-mask-image: linear-gradient(var(--dir), #000 var(--a), transparent var(--z)); mask-image: linear-gradient(var(--dir), #000 var(--a), transparent var(--z)); }
    .tint { -webkit-mask-image: none; mask-image: none; }
  }
  .content {
    position: relative; max-height: 100%; box-sizing: border-box; overflow-y: auto; overscroll-behavior: contain; pointer-events: auto;
    display: grid; align-content: start; gap: 22px;
    padding: max(28px, env(safe-area-inset-top, 0px)) 24px max(28px, env(safe-area-inset-bottom, 0px)) max(24px, env(safe-area-inset-left, 0px));
  }
  /* phones: the sheet is short, so everything tightens and the title goes */
  @media not ((min-width: 700px) and (min-aspect-ratio: 1/1)) {
    .content { height: 100%; padding: 12px max(14px, env(safe-area-inset-right, 0px)) max(14px, env(safe-area-inset-bottom, 0px)) max(14px, env(safe-area-inset-left, 0px)); gap: 12px; font-size: 0.93rem; }
    h1 { display: none; }
    header { gap: 0; }
  }
  header { display: grid; gap: 14px; }
  /* the panel scrolls, which would clip tooltips: anchor them to their row instead, at the row's full width */
  .content :global([data-tip]) { position: static; }
  .content :global([data-tip]::after) { max-width: 100%; box-sizing: border-box; }
  h1 { font-weight: 600; font-size: 1.6rem; letter-spacing: -0.03em; line-height: 1.15; margin: 0; }
  .tools { position: relative; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
</style>
