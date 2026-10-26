<!-- The ring and its snap points: shared by every topic, so it just asks for its marks and
     never leaves. -->
<script lang="ts">
  import { camera } from '../core/camera.svelte.ts';
  import { inverse } from '../topics/inverse/state.svelte.ts';
  import { ringScene } from './ringScene.ts';
  import { progress } from '../core/progress.svelte.ts';
  import { radians } from '../topics/radians/state.svelte.ts';
  import { aim, penClock, penFrom, revealed, ui } from '../core/state.svelte.ts';
  import MarkLayer from './MarkLayer.svelte';

  /** The inverse topic writes the label for the angles it marks, so the ring leaves those out. */
  const taken = (a: number) =>
    ui.topic === 'inverse' &&
    inverse.marked.some((m) => Math.abs(m - a) < 1e-4 || Math.abs(Math.abs(m - a) - 360) < 1e-4);
  const marks = $derived(
    ringScene({
      t: penClock.current,
      wasRevealed: penFrom.revealed,
      revealed: revealed(),
      highlight: ui.highlight,
      aim: aim.deg,
      writesAim: ui.topic === 'circle' && ui.mode !== 'guide',
      taken,
      sw: camera.stroke,
      lb: camera.labelBoost,
      unit: ui.topic === 'radians' ? radians.ringUnit : progress.unit,
      labels: ui.topic === 'radians' ? radians.ringLabels : true,
    }),
  );
</script>

<MarkLayer {marks} />
