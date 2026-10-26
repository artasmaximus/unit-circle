<!-- The unit circle topic's layer of the plane (its Guide draws its own figure, in
     UnitGuideLayer). It stays mounted on every topic so its marks can play their exits when the
     topic is left; it just asks for no marks then (see scene.ts). -->
<script lang="ts">
  import { camera } from '../../core/camera.svelte.ts';
  import { circleScene } from './scene.ts';
  import { circleView } from './view.svelte.ts';
  import { pen, penClock, penFrom, ui } from '../../core/app.svelte.ts';
  import { point } from '../../core/point.svelte.ts';
  import { useHandles } from '../../plane/handles.svelte.ts';
  import { pointHandle } from '../../plane/pointHandle.svelte.ts';
  import MarkLayer from '../../plane/MarkLayer.svelte';

  // on the unit circle, in every mode, a press near the ring turns the point
  useHandles(() => (ui.topic === 'circle' ? [pointHandle] : []));
  const marks = $derived(
    circleScene({
      active: ui.topic === 'circle' && ui.mode !== 'guide',
      layout: circleView.layout,
      t: penClock.current,
      pen: pen.current,
      wasRevealed: penFrom.revealed,
      ghost: circleView.ghost,
      dotR: point.dotR,
      sw: camera.stroke,
      lb: camera.labelBoost,
      k: camera.k,
    }),
  );
</script>

<MarkLayer {marks} />
