<!-- The unit circle topic's layer of the plane (its Guide draws its own figure, in
     UnitGuideLayer). It stays mounted on every topic so its marks can play their exits when the
     topic is left; it just asks for no marks then (see scene.ts). -->
<script lang="ts">
  import { camera } from '../../core/camera.svelte.ts';
  import { circleScene } from './scene.ts';
  import { circleView } from './view.svelte.ts';
  import { stage } from './stage.svelte.ts';
  import { pen, penClock, penFrom, ui } from '../../core/app.svelte.ts';
  import { point } from '../../core/point.svelte.ts';
  import { useHandles } from '../../plane/handles.svelte.ts';
  import { pointHandle } from '../../plane/pointHandle.svelte.ts';
  import MarkLayer from '../../plane/MarkLayer.svelte';
  import { NO_MARKS } from '../../plane/marks.ts';

  // on the unit circle, in every mode, a press near the ring turns the point
  useHandles(() => (ui.topic === 'circle' ? [pointHandle] : []));
  // while another topic is up the layout is not even read, so its frames cost nothing here
  const on = $derived(ui.topic === 'circle' && !stage.now.guide);
  const marks = $derived(
    on
      ? circleScene({
          active: true,
          layout: circleView.layout,
          t: penClock.current,
          pen: pen.current,
          wasRevealed: penFrom.revealed,
          hintAt: circleView.hintAt,
          dotR: point.dotR,
          sw: camera.stroke,
          lb: camera.labelBoost,
          k: camera.k,
        })
      : NO_MARKS,
  );
</script>

<MarkLayer {marks} name="circle" />
