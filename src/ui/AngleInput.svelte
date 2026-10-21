<!-- θ = [angle]°: shows the point's angle and accepts degrees (135) or radians (pi/6, 2pi/3). -->
<script lang="ts">
  import { point } from '../lib/state.svelte.ts';
  import { degText, parseAngle } from '../lib/trig.ts';
  import Tex from './Tex.svelte';

  let editing = $state(false), draft = $state('');
  const shown = $derived(editing ? draft : degText(point.deg));
</script>

<label class="angbox" title="Type degrees (135) or radians (pi/6, 2pi/3)">
  <Tex latex={'\\theta ='} />
  <input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value={shown} size={Math.max(2, shown.length)}
    onfocus={() => { draft = degText(point.deg); editing = true; }}
    oninput={(e) => { draft = e.currentTarget.value; const d = parseAngle(draft); if (d !== null) point.set(d, true); }}
    onkeydown={(e) => { e.stopPropagation(); if (e.key === 'Enter') e.currentTarget.blur(); }}
    onblur={() => (editing = false)} />
  <Tex latex={'^\\circ'} />
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
