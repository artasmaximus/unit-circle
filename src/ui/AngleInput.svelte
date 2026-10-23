<!-- θ = [angle]: shows the point's angle in the learner's unit and accepts either (135, 135°, pi/6, 2π/3, 0.5 rad). A bare number is read in the unit
     being shown. -->
<script lang="ts">
  import { angleField, piFraction, type Unit } from '../lib/angles.ts';
  import { camera } from '../lib/camera.svelte.ts';
  import { progress } from '../lib/progress.svelte.ts';
  import { point } from '../lib/state.svelte.ts';
  import { norm, parseAngle } from '../lib/trig.ts';
  import Tex from './Tex.svelte';

  /** The unit to write the angle in; the learner's own setting unless a topic (Radians) insists. */
  let { unit: forced }: { unit?: Unit } = $props();
  let editing = $state(false), draft = $state('');
  const unit = $derived(forced ?? progress.unit);
  const field = () => angleField(norm(point.deg), unit, camera.thetaDecimals);
  const shown = $derived(editing ? draft : field());
  /** The mark after the number: the degree sign, or "rad" when a radian reads as a decimal (an exact π fraction needs none). */
  const mark = $derived(unit === 'deg' ? '^\\circ' : piFraction(norm(point.deg)) ? '' : '\\text{rad}');
</script>

<label class="angbox" title={unit === 'deg' ? 'Type degrees (135) or radians (pi/6, 2pi/3)' : 'Type radians (3pi/4, 2.36) or degrees (135°)'}>
  <Tex latex={'\\theta ='} />
  <input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value={shown} size={Math.max(2, shown.length)}
    onfocus={() => { draft = field(); editing = true; }}
    oninput={(e) => { draft = e.currentTarget.value; const d = parseAngle(draft, unit); if (d !== null) point.set(d, true); }}
    onkeydown={(e) => { e.stopPropagation(); if (e.key === 'Enter') e.currentTarget.blur(); }}
    onblur={() => (editing = false)} />
  {#if mark}<Tex latex={mark} />{/if}
</label>

<style>
  .angbox {
    display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; font-size: 1rem; pointer-events: auto;
    background: color-mix(in srgb, var(--panel) 80%, transparent); border: 1px solid var(--line); border-radius: 8px;
  }
  input {
    width: auto; field-sizing: content; min-width: 2ch; font-variant-numeric: tabular-nums; font-family: 'CMmain', 'Latin Modern Roman', Georgia, serif;
    font-size: 1.15rem; background: transparent; color: var(--fg); border: 0; border-radius: 4px; text-align: left; padding: 0;
  }
</style>
