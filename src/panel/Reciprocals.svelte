<!-- csc, sec and cot: each definition with its value at the current angle. The ƒ strip opens a problem to solve. -->
<script lang="ts">
  import SquareFunction from '@lucide/svelte/icons/square-function';
  import { point, solver, type RecipKey } from '../lib/state.svelte.ts';
  import { colorOf, recipTex } from '../lib/trig.ts';
  import { DEFINITIONS, eqTex } from '../lib/algebra.ts';
  import Tex from '../ui/Tex.svelte';

  const KEYS: RecipKey[] = ['csc', 'sec', 'cot'];
  const NAMES: Record<RecipKey, string> = { csc: 'cosecant', sec: 'secant', cot: 'cotangent' };
  const color = $derived(point.hit !== undefined ? colorOf(point.hit) : 'var(--muted)');
</script>

<section class="defs" aria-labelledby="defs-h" style:--vc={color}>
  <h2 id="defs-h">Definitions</h2>
  {#each KEYS as k (k)}
    <div class="card">
      <span class="eq"><Tex latex={eqTex(DEFINITIONS[k])} /></span>
      <span class="val"><Tex latex={'=' + recipTex(k, point.deg).r} /></span>
      <button class="solve" aria-label="Solve a {NAMES[k]} problem" title="Solve a {k} problem"
        onclick={(e) => solver.start(k, (e.currentTarget.closest('.card') as HTMLElement).getBoundingClientRect())}>
        <SquareFunction size={18} />
      </button>
    </div>
  {/each}
</section>

<style>
  .defs { display: grid; gap: 10px; }
  h2 { margin: 0 0 2px; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; color: var(--muted); }
  .card {
    display: grid; grid-template-columns: minmax(0, 1fr) auto 44px; gap: 14px; align-items: center;
    padding: 10px 10px 10px 16px; min-height: 64px; font-size: 1.1rem;
    border: 1px solid var(--line); border-radius: 12px; background: color-mix(in srgb, var(--panel) 80%, transparent);
  }
  .eq { min-width: 0; overflow-x: auto; overflow-y: hidden; }
  .val { color: var(--vc); white-space: nowrap; }
  /* a tall, tactile strip down the card's right edge */
  .solve {
    align-self: stretch; display: grid; place-items: center; padding: 0; border-radius: 9px;
    color: var(--slope); background: color-mix(in srgb, var(--slope) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--slope) 35%, transparent);
    transition: transform 0.12s ease-out, background 0.15s;
  }
  .solve:hover { background: color-mix(in srgb, var(--slope) 20%, transparent); border-color: var(--slope); }
  .solve:active { transform: scale(0.94); }
</style>
