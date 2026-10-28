<!-- The Unit circle Guide's layer of the plane. It stays mounted so its marks can play their
     exits when the Guide is left; it just asks for no marks then (see guideScene.ts). -->
<script lang="ts">
  import { camera } from '../../core/camera.svelte.ts';
  import { progress } from '../../core/progress.svelte.ts';
  import { point } from '../../core/point.svelte.ts';
  import { ui } from '../../core/app.svelte.ts';
  import { unitGuide } from './guide.svelte.ts';
  import { stage } from './stage.svelte.ts';
  import { unitGuideScene } from './guideScene.ts';
  import MarkLayer from '../../plane/MarkLayer.svelte';
  import { NO_MARKS } from '../../plane/marks.ts';

  const on = $derived(ui.topic === 'circle' && stage.now.guide);
  const marks = $derived(
    on
      ? unitGuideScene({
          active: true,
          features: unitGuide.features,
          ang: point.ang,
          deg: point.deg,
          unit: progress.unit,
          sw: camera.stroke,
          lb: camera.labelBoost,
        })
      : NO_MARKS,
  );
</script>

<MarkLayer {marks} name="unit-guide" />
