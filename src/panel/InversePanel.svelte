<!-- Inverse trig, exploring: pick arcsin, arccos or arctan, drag the value on the plane, and read the equation it gives, what the
     function accepts and returns, and the other angle it could have been. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { inverse } from '../lib/inverse.svelte.ts';
  import { INV_NAME, PARTNER, RANGE, otherAngle, valueTex, type InvFn } from '../lib/inverse.ts';
  import { camera } from '../lib/camera.svelte.ts';
  import { degSigned } from '../lib/trig.ts';
  import Segmented from '../ui/Segmented.svelte';
  import Tex from '../ui/Tex.svelte';

  let { trailing }: { trailing?: Snippet } = $props();
  const FNS: { value: InvFn; label: string }[] = [{ value: 'asin', label: 'arcsin' }, { value: 'acos', label: 'arccos' }, { value: 'atan', label: 'arctan' }];
  const HUE = { asin: 'var(--sin)', acos: 'var(--cos)', atan: 'var(--slope)' };
  // the function switcher's thumb glides on its own run (the Segmented control follows a progress value)
  const slide = new Tween(1, { duration: 280, easing: cubicOut });
  const pick = (fn: InvFn) => { if (fn === inverse.fn) return; inverse.switchTo(fn); slide.set(0, { duration: 0 }).then(() => (slide.target = 1)); };

  const fn = $derived(inverse.fn);
  const n = $derived(`\\${INV_NAME[fn]}`), p = $derived(`\\${PARTNER[fn]}`);
  const v = $derived(valueTex(fn, inverse.valueTo));
  const deg = (a: number) => `${degSigned(a, camera.thetaDecimals)}^\\circ`;
  const range = $derived(RANGE[fn]);
  const dom = $derived(fn === 'atan' ? '(-\\infty,\\ \\infty)' : '[-1,\\ 1]');
  const rng = $derived(`${range.open ? '(' : '['}${range.lo}^\\circ,\\ ${range.hi}^\\circ${range.open ? ')' : ']'}`);
</script>

<section class="inv" style:--c={HUE[fn]}>
  <div class="head"><h2>Function</h2>{@render trailing?.()}</div>
  <Segmented label="Inverse function" value={fn} onchange={pick} progress={slide.current} options={FNS} />

  <div class="card eq">
    {#if inverse.poleTo}
      <!-- straight up or down has no slope, and arctan only ever gets closer to ±90° -->
      <div class="big"><Tex latex={`m=\\text{undefined}`} /></div>
      <div class="why"><Tex latex={`${n}()`} /> never reaches <Tex latex={deg(inverse.angleTo)} />. It only gets closer as the slope gets bigger.</div>
    {:else}
      <div class="big"><Tex latex={`${n}\\left(${v}\\right)=${deg(inverse.angleTo)}`} /></div>
      <div class="why"><Tex latex={`${p}\\ ${deg(inverse.angleTo)}=${v}`} /></div>
    {/if}
  </div>

  <div class="card">
    <div class="row"><span class="k">Domain</span><Tex latex={dom} /><span class="cap">what goes in</span></div>
    <div class="row"><span class="k">Range</span><Tex latex={rng} /><span class="cap">what comes out</span></div>
    <p class="note">
      Since <Tex latex={`${p}()`} /> repeats, the range of its inverse <Tex latex={`${n}()`} /> is only {fn === 'acos' ? 'the upper half' : 'the right half'} of the circle,
      where every possible <Tex latex={`${p}()`} /> {fn === 'atan' ? 'value (AKA slope)' : 'value'} appears once.
    </p>
    {#if !inverse.poleTo}<p class="note other"><Tex latex={`${p}\\ ${deg(otherAngle(fn, inverse.angleTo))}=${v}`} /> too, but <Tex latex={deg(otherAngle(fn, inverse.angleTo))} /> is outside the range, so <Tex latex={`${n}()`} /> never gives it.</p>{/if}
  </div>
</section>

<style>
  .inv { display: grid; gap: 12px; }
  .head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  h2 { margin: 0 0 2px; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; color: var(--muted); }
  .inv :global(.seg) { justify-self: start; }
  /* tinted glass like the slope chip, in the function's color */
  .card {
    display: grid; gap: 8px; padding: 12px 14px; border: 1px solid color-mix(in srgb, var(--c) 35%, transparent); border-radius: 8px;
    background: color-mix(in srgb, var(--c) 10%, var(--glass));
  }
  .eq { gap: 4px; }
  .big { font-size: 1.45rem; min-height: 2.6rem; display: flex; align-items: center; overflow-x: auto; overflow-y: hidden; }
  .why { color: var(--muted); font-size: 0.95rem; }
  .row { display: flex; align-items: baseline; gap: 12px; }
  .cap { margin-left: auto; font-size: 0.78rem; color: var(--muted); }
  .k { width: 4.5rem; font-size: 0.72rem; letter-spacing: 0.09em; text-transform: uppercase; color: var(--muted); }
  .note { margin: 0; font-size: 0.85rem; line-height: 1.5; color: var(--muted); }
  .note.other { color: var(--fg); }
</style>
