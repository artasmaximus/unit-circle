<!-- csc, sec and cot: each definition with its value at the current angle. The ƒ strip opens a problem to solve. -->
<script lang="ts">
  import SquareFunction from '@lucide/svelte/icons/square-function';
  import { point, solver, type RecipKey } from '../lib/state.svelte.ts';
  import { recipTex } from '../lib/trig.ts';
  import { DEFINITIONS, eqTex } from '../lib/algebra.ts';
  import Tex from '../ui/Tex.svelte';
  import Morph from '../ui/Morph.svelte';
  import { morph } from '../lib/transition.ts';
  import { flushSync } from 'svelte';
  import Solver from '../solver/Solver.svelte';
  import { camera } from '../lib/camera.svelte.ts';

  const KEYS: RecipKey[] = ['csc', 'sec', 'cot'];
  const NAMES: Record<RecipKey, string> = { csc: 'cosecant', sec: 'secant', cot: 'cotangent' };
  // each reciprocal wears the color of the function it is built from
  const HUE: Record<RecipKey, string> = { csc: 'var(--sin)', sec: 'var(--cos)', cot: 'var(--slope)' };
</script>

<section class="defs" aria-labelledby="defs-h">
  <h2 id="defs-h">Definitions</h2>
  {#each KEYS as k (k)}
    <div class="card" style:--vc={HUE[k]}>
      <span class="eq"><Tex latex={eqTex(DEFINITIONS[k])} /></span>
      <span class="val"><Tex latex={'=' + recipTex(k, point.deg).r} /></span>
      <Morph name="solve-{k}" label="Solve a {NAMES[k]} problem" open={camera.wide && solver.open && solver.key === k} active={solver.key === k}
        onopen={() => { solver.key = k; flushSync(); morph(() => solver.start(k)); }}>
        {#snippet button()}<SquareFunction size={18} />{/snippet}
        <Solver bare />
      </Morph>
    </div>
  {/each}
</section>

<style>
  .defs { display: grid; gap: 8px; }
  h2 { margin: 0 0 2px; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; color: var(--muted); }
  .card {
    display: grid; grid-template-columns: minmax(0, 1fr) auto 38px; gap: 14px; align-items: center;
    padding: 6px 6px 6px 14px; min-height: 52px; font-size: 1.02rem;
    border: 1px solid var(--line); border-radius: 12px; background: color-mix(in srgb, var(--panel) 50%, transparent);
  }
  .eq { min-width: 0; overflow-x: auto; overflow-y: hidden; }
  .val { color: var(--vc); white-space: nowrap; }
</style>
