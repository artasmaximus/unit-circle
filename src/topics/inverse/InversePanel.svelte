<!-- Inverse trig, exploring: pick arcsin, arccos or arctan, drag the value on the plane, and
     read the equation it gives, what the function accepts and returns, and the other angle it
     could have been. -->
<script lang="ts">
  import { DUR } from '../../core/tuning.ts';
  import type { Snippet } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { inverse } from './state.svelte.ts';
  import { INV_NAME, PARTNER, RANGE, otherAngle, valueTex, type InvFn } from './math.ts';
  import { camera } from '../../core/camera.svelte.ts';
  import { angleTex, trigOf } from '../../core/angles.ts';
  import { progress } from '../../core/progress.svelte.ts';
  import Segmented from '../../ui/Segmented.svelte';
  import Tex from '../../ui/Tex.svelte';
  import InfoTip from '../../ui/InfoTip.svelte';

  let { trailing }: { trailing?: Snippet } = $props();
  const FNS: { value: InvFn; label: string }[] = [
    { value: 'asin', label: 'arcsin' },
    { value: 'acos', label: 'arccos' },
    { value: 'atan', label: 'arctan' },
  ];
  const HUE = { asin: 'var(--sin)', acos: 'var(--cos)', atan: 'var(--slope)' };
  // the function switcher's thumb glides on its own run (the Segmented control follows a progress
  // value)
  const slide = new Tween(1, { duration: DUR.base, easing: cubicOut });
  const pick = (fn: InvFn) => {
    if (fn === inverse.fn) return;
    inverse.switchTo(fn);
    slide.set(0, { duration: 0 }).then(() => (slide.target = 1));
  };

  const fn = $derived(inverse.fn);
  const n = $derived(`\\${INV_NAME[fn]}`),
    p = $derived(`\\${PARTNER[fn]}`);
  const v = $derived(valueTex(fn, inverse.valueTo));
  const deg = (a: number) => angleTex(a, progress.unit, camera.thetaDecimals);
  const trig = (a: number) => trigOf(p, a, progress.unit, camera.thetaDecimals);
  const range = $derived(RANGE[fn]);
  const dom = $derived(fn === 'atan' ? '(-\\infty,\\ \\infty)' : '[-1,\\ 1]');
  const rng = $derived(
    `${range.open ? '(' : '['}${angleTex(range.lo, progress.unit)},\\ ${angleTex(range.hi, progress.unit)}${range.open ? ')' : ']'}`,
  );
</script>

<section class="inv" style:--c={HUE[fn]}>
  <div class="p-head">
    <h2 class="p-title">Function</h2>
    {@render trailing?.()}
  </div>
  <Segmented
    label="Inverse function"
    value={fn}
    onchange={pick}
    progress={slide.current}
    options={FNS}
  />

  <div class="p-card eq">
    {#if inverse.poleTo}
      <!-- straight up or down has no slope, and arctan only ever gets closer to ±90° -->
      <div class="p-big big"><Tex latex={`m=\\text{undefined}`} /></div>
      <div class="why">
        <Tex latex={`${n}()`} /> never reaches <Tex latex={deg(inverse.target)} />. It only gets
        closer as the slope gets bigger.
      </div>
    {:else}
      <div class="p-big big">
        <Tex latex={`${n}\\left(${v}\\right)=${deg(inverse.target)}`} />
        <InfoTip label="Check it the other way round"
          ><Tex latex={`${trig(inverse.target)}=${v}`} /></InfoTip
        >
      </div>
    {/if}
  </div>

  <div class="p-card">
    <div class="p-row">
      <span class="p-k">Domain</span><Tex latex={dom} /><span class="cap">what goes in</span>
    </div>
    <div class="p-row">
      <span class="p-k">Range</span><Tex latex={rng} /><span class="cap">what comes out</span>
    </div>
    <p class="p-note">
      Since <Tex latex={`${p}()`} /> repeats, the range of its inverse <Tex latex={`${n}()`} /> is only
      {fn === 'acos' ? 'the upper half' : 'the right half'} of the circle, where every possible <Tex
        latex={`${p}()`}
      /> value ({fn === 'asin' ? 'y-value' : fn === 'acos' ? 'x-value' : 'AKA slope'}) appears once.
    </p>
    {#if !inverse.poleTo}<p class="p-note other">
        <Tex latex={`${trig(otherAngle(fn, inverse.target))}=${v}`} /> too, but <Tex
          latex={deg(otherAngle(fn, inverse.target))}
        /> is outside the range, so <Tex latex={`${n}()`} /> never gives it.
      </p>{/if}
  </div>
</section>

<style>
  .inv {
    display: grid;
    gap: 12px;
  }
  .inv :global(.seg) {
    justify-self: start;
  }
  /* fixed heights, so a tall fraction never resizes the cards */
  .eq {
    gap: 4px;
    height: 6.4rem;
    box-sizing: border-box;
    align-content: center;
  }
  .big {
    height: 4.2rem;
  }
  .why {
    color: var(--muted);
    font-size: 0.95rem;
    min-height: 2rem;
  }
  .cap {
    margin-left: auto;
    font-size: 0.78rem;
    color: var(--muted);
  }
  .other {
    color: var(--fg);
    min-height: 5.4em;
  }
</style>
