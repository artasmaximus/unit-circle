<!-- Graph paper filling the viewport: a line every 0.2, a stronger one every 1, axes, and ticks
     on the axes inside the circle. Drawn as marks (see gridScene.ts), so it enters like
     everything else. -->
<script lang="ts">
  import { camera } from '../core/camera.svelte.ts';
  import { gridScene } from './gridScene.ts';
  import MarkLayer from './MarkLayer.svelte';

  const marks = $derived(
    gridScene({ view: camera.view, k: camera.k, boost: camera.boost, wide: camera.wide }),
  );
</script>

<MarkLayer {marks} />
