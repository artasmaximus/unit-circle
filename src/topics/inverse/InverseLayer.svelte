<!-- The Inverse trig topic's layer of the plane. It stays mounted on every topic so its marks
     can play their exits when the topic is left; it just asks for no marks then (see
     scene.ts). -->
<script lang="ts">
  import { camera } from '../../core/camera.svelte.ts';
  import { inverse } from './state.svelte.ts';
  import { stage } from './stage.svelte.ts';
  import { inverseScene } from './scene.ts';
  import { progress } from '../../core/progress.svelte.ts';
  import { ui } from '../../core/app.svelte.ts';
  import MarkLayer from '../../plane/MarkLayer.svelte';
  import { NO_MARKS } from '../../plane/marks.ts';
  import { useHandles } from '../../plane/handles.svelte.ts';
  import { inverseHandles } from './handles.ts';

  useHandles(() => (ui.topic === 'inverse' ? inverseHandles() : []));

  const on = $derived(ui.topic === 'inverse');
  const marks = $derived(
    on
      ? inverseScene({
          active: true,
          fn: inverse.fn,
          angle: inverse.angle,
          other: inverse.other,
          value: inverse.value,
          pole: inverse.pole,
          target: inverse.target,
          shown: stage.now.shown,
          showOther: stage.now.other,
          showBand: stage.now.band,
          given: stage.now.given,
          domain: stage.now.domain,
          ghost: inverse.ghost,
          dragging: inverse.dragging,
          probe: stage.now.probing ? inverse.probeAngle : null,
          tail: inverse.tail,
          probeTail: inverse.probeTail,
          sw: camera.stroke,
          lb: camera.labelBoost,
          decimals: camera.thetaDecimals,
          unit: progress.unit,
        })
      : NO_MARKS,
  );
</script>

<MarkLayer {marks} name="inverse" />
