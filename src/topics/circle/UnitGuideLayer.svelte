<!-- The Unit circle Guide's layer of the plane. It stays mounted so its marks can play their
     exits when the Guide is left; it just asks for no marks then (see guideDrawing.ts). -->
<script lang="ts">
  import { camera } from '../../core/camera.svelte.ts';
  import { progress } from '../../core/progress.svelte.ts';
  import { point, ui } from '../../core/state.svelte.ts';
  import { unitGuide } from './guide.svelte.ts';
  import { unitGuideMarks } from './guideDrawing.ts';
  import MarkLayer from '../../plane/MarkLayer.svelte';

  const marks = $derived(
    unitGuideMarks({
      active: ui.topic === 'circle' && ui.mode === 'guide',
      features: unitGuide.features,
      ang: point.ang,
      deg: point.deg,
      unit: progress.unit,
      sw: camera.stroke,
      lb: camera.labelBoost,
    }),
  );
</script>

<MarkLayer {marks} />
