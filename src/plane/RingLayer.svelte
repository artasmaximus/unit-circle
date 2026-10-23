<!-- The ring and its snap points: shared by every topic, so it just asks for its marks and never leaves. -->
<script lang="ts">
  import { camera } from '../lib/camera.svelte.ts';
  import { inverse } from '../lib/inverse.svelte.ts';
  import { ringMarks } from '../lib/ringMarks.ts';
  import { progress } from '../lib/progress.svelte.ts';
  import { radians } from '../lib/radians.svelte.ts';
  import { aim, penClock, penFrom, revealed, ui } from '../lib/state.svelte.ts';
  import MarkLayer from './MarkLayer.svelte';

  /** The inverse topic writes the label for the angles it marks, so the ring leaves those out. */
  const taken = (a: number) => ui.topic === 'inverse' && inverse.marked.some((m) => Math.abs(m - a) < 1e-4 || Math.abs(Math.abs(m - a) - 360) < 1e-4);
  const marks = $derived(ringMarks({
    t: penClock.current, wasRevealed: penFrom.revealed, revealed: revealed(),
    highlight: ui.highlight, aim: aim.deg, writesAim: ui.topic === 'circle', taken, sw: camera.stroke, lb: camera.labelBoost, unit: ui.topic === 'radians' ? radians.ringUnit : progress.unit, labels: ui.topic === 'radians' ? radians.ringLabels : true,
  }));
</script>

<MarkLayer {marks} />
