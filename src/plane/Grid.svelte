<!-- Graph paper filling the viewport: a line every 0.2, a stronger one every 1, axes, and ticks on the axes inside the circle.
     Drawn as marks (see gridMarks.ts), so it enters like everything else. -->
<script lang="ts">
  import { camera } from '../lib/camera.svelte.ts';
  import { gridMarks } from '../lib/gridMarks.ts';
  import MarkLayer from './MarkLayer.svelte';

  const marks = $derived(gridMarks({ view: camera.view, k: camera.k, boost: camera.boost, wide: camera.wide }));
</script>

<MarkLayer {marks} />
