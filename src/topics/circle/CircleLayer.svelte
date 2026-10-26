<!-- The unit circle topic's layer of the plane (its Guide draws its own figure, in
     UnitGuideLayer). It stays mounted on every topic so its marks can play their exits when the
     topic is left; it just asks for no marks then (see drawing.ts). -->
<script lang="ts">
  import { camera } from '../../core/camera.svelte.ts';
  import { circleMarks, type CircleInput } from './drawing.ts';
  import type { Scene } from './scene.ts';
  import { pen, penClock, penFrom, point, ui } from '../../core/state.svelte.ts';
  import MarkLayer from '../../plane/MarkLayer.svelte';

  let { scene, ghost }: { scene: Scene; ghost: CircleInput['ghost'] } = $props();
  const marks = $derived(
    circleMarks({
      active: ui.topic === 'circle' && ui.mode !== 'guide',
      sc: scene,
      t: penClock.current,
      pen: pen.current,
      wasRevealed: penFrom.revealed,
      ghost,
      dotR: point.dotR,
      sw: camera.stroke,
      lb: camera.labelBoost,
      k: camera.k,
    }),
  );
</script>

<MarkLayer {marks} />
