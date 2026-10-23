<!-- The Radians topic's layer of the plane. It stays mounted on every topic so its marks can play their exits when the topic is left; it just asks
     for no marks then (see radiansMarks.ts). -->
<script lang="ts">
  import { camera } from '../lib/camera.svelte.ts';
  import { radians } from '../lib/radians.svelte.ts';
  import { radiansMarks } from '../lib/radiansMarks.ts';
  import { point, ui } from '../lib/state.svelte.ts';
  import MarkLayer from './MarkLayer.svelte';

  /** `under` is the part drawn beneath the ring's dots (the shading), the rest sits on top of them. */
  let { under = false }: { under?: boolean } = $props();
  const marks = $derived(radiansMarks({ active: ui.topic === 'radians', features: radians.features, ang: point.ang, target: point.target, sw: camera.stroke, lb: camera.labelBoost }).filter((m) => ((m.z ?? 5) <= 3) === under));
</script>

{#if under}
  <defs><linearGradient id="rad-half" x1="1" y1="0" x2="0" y2="0"><stop offset="0" style="stop-color: var(--rad); stop-opacity: 0.2" /><stop offset="1" style="stop-color: var(--rad)" /></linearGradient></defs>
{/if}
<MarkLayer {marks} />
