<!-- The Unit circle Guide's layer of the plane. It stays mounted so its marks can play their exits when the Guide is left; it just asks for no
     marks then (see unitGuideMarks.ts). -->
<script lang="ts">
  import { camera } from '../lib/camera.svelte.ts';
  import { progress } from '../lib/progress.svelte.ts';
  import { point, ui } from '../lib/state.svelte.ts';
  import { unitGuide } from '../lib/unitGuide.svelte.ts';
  import { unitGuideMarks } from '../lib/unitGuideMarks.ts';
  import MarkLayer from './MarkLayer.svelte';

  const marks = $derived(unitGuideMarks({
    active: ui.topic === 'circle' && ui.mode === 'guide', features: unitGuide.features, ang: point.ang, deg: point.deg, unit: progress.unit, sw: camera.stroke, lb: camera.labelBoost,
  }));
</script>

<MarkLayer {marks} />
