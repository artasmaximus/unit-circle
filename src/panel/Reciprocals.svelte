<!-- csc, sec and cot: each named in the color of the function it is built from (csc ↔ sin, sec
     ↔ cos, cot ↔ tan), styled like the slope chip on the plane, with its value at the current
     angle in white. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { point, type RecipKey } from '../lib/state.svelte.ts';
  import { recipTex } from '../lib/trig.ts';
  import Tex from '../ui/Tex.svelte';

  let { trailing }: { trailing?: Snippet } = $props();
  const KEYS: RecipKey[] = ['csc', 'sec', 'cot'];
  const NAMES: Record<RecipKey, string> = { csc: 'cosecant', sec: 'secant', cot: 'cotangent' };
  const HUE: Record<RecipKey, string> = {
    csc: 'var(--sin)',
    sec: 'var(--cos)',
    cot: 'var(--slope)',
  };
</script>

<section class="defs" aria-labelledby="defs-h">
  <div class="head">
    <h2 id="defs-h">Definitions</h2>
    {@render trailing?.()}
  </div>
  <div class="row">
    {#each KEYS as k (k)}
      <div
        class="card"
        style:--c={HUE[k]}
        data-tip="Answers like 1/√2 stay as they are (not √2/2), so you can see each one is just its partner flipped upside down."
      >
        <span class="eq" title={NAMES[k]}><Tex latex={`\\${k}\\theta`} /></span>
        <span class="val"><Tex latex={recipTex(k, point.deg).r} /></span>
      </div>
    {/each}
  </div>
</section>

<style>
  .defs {
    display: grid;
    gap: 8px;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  h2 {
    margin: 0 0 2px;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
  /* tinted glass with a soft tinted edge, like the slope chip; fixed height, so a tall fraction
     never resizes the card */
  .card {
    position: relative;
    display: grid;
    gap: 2px;
    align-content: start;
    padding: 8px 12px;
    height: 78px;
    box-sizing: border-box;
    border: 1px solid color-mix(in srgb, var(--c) 35%, transparent);
    border-radius: 8px;
    background: color-mix(in srgb, var(--c) 12%, var(--glass));
  }
  .eq {
    height: 20px;
    font-size: 0.85rem;
    color: var(--c);
    white-space: nowrap;
  }
  .val {
    color: var(--fg);
    font-size: 1rem;
    white-space: nowrap;
    height: 44px;
    display: flex;
    align-items: center;
  }
</style>
