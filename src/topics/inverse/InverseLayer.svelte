<!-- The Inverse trig topic's layer of the plane. It stays mounted on every topic so its marks
     can play their exits when the topic is left; it just asks for no marks then (see
     scene.ts). -->
<script lang="ts">
  import { camera } from '../../core/camera.svelte.ts';
  import { inverse } from './state.svelte.ts';
  import { inverseScene } from './scene.ts';
  import { progress } from '../../core/progress.svelte.ts';
  import { ui } from '../../core/app.svelte.ts';
  import MarkLayer from '../../plane/MarkLayer.svelte';

  const marks = $derived(
    inverseScene({
      active: ui.topic === 'inverse',
      fn: inverse.fn,
      angle: inverse.angle,
      other: inverse.other,
      value: inverse.value,
      pole: inverse.pole,
      target: inverse.target,
      shown: inverse.shown,
      showOther: inverse.showOther,
      showBand: inverse.showBand,
      given: inverse.given,
      domain: inverse.domain,
      ghost: inverse.ghost,
      dragging: inverse.dragging,
      probe: inverse.probe === null ? null : inverse.probeAngle,
      sw: camera.stroke,
      lb: camera.labelBoost,
      decimals: camera.thetaDecimals,
      unit: progress.unit,
    }),
  );
</script>

<MarkLayer {marks} />
