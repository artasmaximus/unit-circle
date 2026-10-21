<!-- The panel floats over the plane: on the left on wide screens, along the bottom on phones. Behind it a
     progressive blur fades out past its edge, so the grid stays visible and usable right up to the panel. -->
<script lang="ts">
  import { camera } from '../lib/camera.svelte.ts';
  import { point, setMode, ui } from '../lib/state.svelte.ts';
  import { degText, parseAngle } from '../lib/trig.ts';
  import Tex from '../ui/Tex.svelte';
  import Quiz from './Quiz.svelte';
  import Segmented from '../ui/Segmented.svelte';
  import Reciprocals from './Reciprocals.svelte';
  import Solver from '../solver/Solver.svelte';
  import { solver } from '../lib/state.svelte.ts';

  let w = $state(0), h = $state(0);
  $effect(() => { camera.inset = camera.wide ? { left: w, bottom: 0 } : { left: 0, bottom: h }; });

  // blur layers from strongest to weakest; each reaches a little further out, so the blur thins toward the edge
  const LAYERS = [[6, 62, 80], [4, 70, 87], [2, 78, 93], [1, 86, 100]];

  let editing = $state(false), draft = $state('');
  const shown = $derived(editing ? draft : degText(point.deg));
</script>

<aside class="panel" bind:clientWidth={w} bind:clientHeight={h}>
  <div class="blur" aria-hidden="true">
    {#each LAYERS as [b, a, z]}<div style="--b:{b}px;--a:{a}%;--z:{z}%"></div>{/each}
    <div class="tint"></div>
  </div>
  <div class="content">
    <!-- on phones a problem takes the whole sheet: grid on top, problem below -->
    {#if !(solver.open && ui.mode === 'explore' && !camera.wide)}
    <header>
      <h1>Unit Circle</h1>
      <div class="tools">
        <Segmented label="Mode" value={ui.mode} onchange={setMode}
          options={[{ value: 'explore', label: 'Explore' }, { value: 'quiz', label: 'Quiz' }]} />
        <button aria-pressed={ui.mirror} onclick={() => (ui.mirror = !ui.mirror)}
          data-tip="Shows the mirrored angles that share this point's reference angle. In a quiz it shows the other angle with the same sin, cos or tan, so you can see both answers.">Mirror</button>
        <label class="angbox" title="Type degrees (135) or radians (pi/6, 2pi/3)">
          <Tex latex={'\\theta ='} />
          <input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value={shown}
            onfocus={() => { draft = degText(point.deg); editing = true; }}
            oninput={(e) => { draft = e.currentTarget.value; const d = parseAngle(draft); if (d !== null) point.set(d, true); }}
            onkeydown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
            onblur={() => (editing = false)} />
          <Tex latex={'^\\circ'} />
        </label>
      </div>
    </header>
    {/if}
    {#if ui.mode === 'quiz'}<Quiz />{:else if solver.open && !camera.huge}<Solver />{:else}<Reciprocals />{/if}
  </div>
</aside>

<style>
  .panel {
    position: fixed; z-index: 2; left: 0; top: 0; bottom: 0; width: clamp(340px, 32vw, 460px);
    --dir: to right; --feather: 0 -120px 0 0;
  }
  @media not ((min-width: 700px) and (min-aspect-ratio: 1/1)) {
    .panel { top: auto; right: 0; width: auto; height: 48svh; --dir: to top; --feather: -90px 0 0 0; }
  }
  .blur { position: absolute; inset: var(--feather); pointer-events: none; }
  .blur > div { position: absolute; inset: 0; }
  .blur > div:not(.tint) {
    -webkit-backdrop-filter: blur(var(--b)); backdrop-filter: blur(var(--b));
    -webkit-mask-image: linear-gradient(var(--dir), #000 var(--a), transparent var(--z));
    mask-image: linear-gradient(var(--dir), #000 var(--a), transparent var(--z));
  }
  .tint { background: linear-gradient(var(--dir), color-mix(in srgb, var(--bg) 45%, transparent) 55%, transparent 100%); }
  .content {
    position: relative; height: 100%; box-sizing: border-box; overflow-y: auto; overscroll-behavior: contain;
    display: grid; align-content: start; gap: 22px;
    padding: max(28px, env(safe-area-inset-top, 0px)) 24px max(28px, env(safe-area-inset-bottom, 0px)) max(24px, env(safe-area-inset-left, 0px));
  }
  @media not ((min-width: 700px) and (min-aspect-ratio: 1/1)) {
    .content { padding: 18px max(16px, env(safe-area-inset-right, 0px)) max(18px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); gap: 16px; }
  }
  header { display: grid; gap: 14px; }
  /* the panel scrolls, which would clip tooltips: anchor them to their row instead, at the row's full width */
  .content :global([data-tip]) { position: static; }
  .content :global([data-tip]::after) { max-width: 100%; box-sizing: border-box; }
  h1 { font-weight: 600; font-size: 1.6rem; letter-spacing: -0.03em; line-height: 1.15; margin: 0; }
  .tools { position: relative; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .angbox { display: flex; align-items: center; gap: 3px; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 3px 9px 3px 10px; font-size: 1rem; }
  .angbox input {
    width: 5ch; font-variant-numeric: tabular-nums; font-family: 'CMmain', 'Latin Modern Roman', Georgia, serif; font-size: 1.15rem;
    background: transparent; color: var(--fg); border: 0; border-radius: 4px; text-align: right; padding: 0;
  }
</style>
