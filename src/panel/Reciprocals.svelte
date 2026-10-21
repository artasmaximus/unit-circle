<!-- csc, sec and cot: each definition with its value at the current angle, and a button into the equation workshop. -->
<script lang="ts">
  import SquareFunction from '@lucide/svelte/icons/square-function';
  import { point, workshop, type RecipKey } from '../lib/state.svelte.ts';
  import { colorOf, recipTex } from '../lib/trig.ts';
  import { DEFINITIONS, eqTex } from '../lib/algebra.ts';
  import Tex from '../ui/Tex.svelte';
  import Workshop from './Workshop.svelte';

  const NAMES: Record<RecipKey, string> = { csc: 'Cosecant', sec: 'Secant', cot: 'Cotangent' };
  const color = $derived(point.hit !== undefined ? colorOf(point.hit) : 'var(--muted)');
</script>

<section class="cards" aria-label="Reciprocal functions" style:--vc={color}>
  {#each Object.keys(NAMES) as RecipKey[] as k (k)}
    <div class="card">
      <span class="cap">{NAMES[k]}</span>
      <span class="eq"><Tex latex={eqTex(DEFINITIONS[k])} /></span>
      <span class="val"><Tex latex={'=' + recipTex(k, point.deg).r} /></span>
      <button class="open" aria-label="Open the equation workshop for {NAMES[k].toLowerCase()}" title="Play with this equation" onclick={() => workshop.show(k)}><SquareFunction size={16} /></button>
    </div>
  {/each}
</section>
<Workshop />

<style>
  .cards { display: grid; gap: 10px; }
  .card {
    position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 14px; align-items: center;
    padding: 24px 12px 12px 14px; font-size: 1.1rem; border: 1px solid var(--line); border-radius: 10px;
    background: color-mix(in srgb, var(--panel) 80%, transparent);
  }
  .cap { position: absolute; left: 14px; top: 9px; font-size: 0.62rem; letter-spacing: 0.09em; text-transform: uppercase; color: var(--muted); }
  .eq { min-width: 0; overflow-x: auto; overflow-y: hidden; }
  .val { color: var(--vc); white-space: nowrap; }
  .open { display: grid; place-items: center; width: 32px; height: 32px; padding: 0; border-radius: 8px; color: var(--muted); background: transparent; }
  .open:hover, .open:focus-visible { color: var(--fg); border-color: var(--slope); }
</style>
