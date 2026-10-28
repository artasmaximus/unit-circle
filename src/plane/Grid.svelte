<!-- Graph paper filling the viewport: a line every 0.2, a stronger one every 1, axes, and ticks
     on the axes inside the circle. Drawn as marks (see gridScene.ts), so it enters like
     everything else. -->
<script lang="ts">
  import { camera, S } from '../core/camera.svelte.ts';
  import { gridScene } from './gridScene.ts';
  import { gridWindow } from './gridWindow.ts';
  import MarkLayer from './MarkLayer.svelte';

  // The window is built from plain numbers that only change when a pan crosses a pitch step, so
  // the marks are not rebuilt (and the browser does not re-stroke every line) on each pan frame.
  const x = $derived(gridWindow(camera.view, S).x),
    y = $derived(gridWindow(camera.view, S).y),
    w = $derived(gridWindow(camera.view, S).w),
    h = $derived(gridWindow(camera.view, S).h);
  const marks = $derived(
    gridScene({ view: { x, y, w, h }, k: camera.k, boost: camera.boost, wide: camera.wide }),
  );
</script>

<MarkLayer {marks} name="grid" />
