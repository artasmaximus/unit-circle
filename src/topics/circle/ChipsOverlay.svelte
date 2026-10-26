<!-- The unit circle's floating labels over the plane (not in its Guide, which draws its own). -->
<script lang="ts">
  import { DUR } from '../../core/tuning.ts';
  import { fade } from 'svelte/transition';
  import { ui } from '../../core/app.svelte.ts';
  import { circleView } from './view.svelte.ts';
  import Chips from './Chips.svelte';
</script>

{#if ui.topic === 'circle' && ui.mode !== 'guide'}<div
    in:fade={{ duration: DUR.quick }}
    out:fade={{ duration: DUR.quick }}
  >
    <Chips layout={circleView.layout} />
  </div>{/if}
