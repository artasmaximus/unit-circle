<!-- The unit circle topic's layer of the plane (its Guide draws its own figure, in
     UnitGuideLayer). It stays mounted on every topic so its marks can play their exits when the
     topic is left; it just asks for no marks then (see scene.ts). -->
<script lang="ts">
  import { camera } from '../../core/camera.svelte.ts';
  import { circleScene, type CircleInput } from './scene.ts';
  import type { Layout } from './layout.ts';
  import { pen, penClock, penFrom, ui } from '../../core/app.svelte.ts';
  import { point } from '../../core/point.svelte.ts';
  import MarkLayer from '../../plane/MarkLayer.svelte';

  let { layout, ghost }: { layout: Layout; ghost: CircleInput['ghost'] } = $props();
  const marks = $derived(
    circleScene({
      active: ui.topic === 'circle' && ui.mode !== 'guide',
      layout,
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
