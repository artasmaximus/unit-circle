<!-- The Inverse trig topic's layer of the plane. It stays mounted on every topic so its marks can play their exits when the
     topic is left; it just asks for no marks then (see inverseMarks.ts). -->
<script lang="ts">
  import { camera } from '../lib/camera.svelte.ts';
  import { inverse } from '../lib/inverse.svelte.ts';
  import { inverseMarks } from '../lib/inverseMarks.ts';
  import { ui } from '../lib/state.svelte.ts';
  import MarkLayer from './MarkLayer.svelte';

  const marks = $derived(inverseMarks({
    active: ui.topic === 'inverse',
    fn: inverse.fn, angle: inverse.angle, other: inverse.other, value: inverse.value, pole: inverse.pole, target: inverse.target,
    shown: inverse.shown, showOther: inverse.showOther, showBand: inverse.showBand, given: inverse.given, domain: inverse.domain,
    ghost: inverse.ghost, dragging: inverse.dragging,
    sw: camera.stroke, lb: camera.labelBoost, decimals: camera.thetaDecimals,
  }));
</script>

<MarkLayer {marks} />
