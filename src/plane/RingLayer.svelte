<!-- The ring and its snap points: shared by every topic, so it just asks for its marks and
     never leaves. -->
<script lang="ts">
  import { camera } from '../core/camera.svelte.ts';
  import { ringScene } from './ringScene.ts';
  import { progress } from '../core/progress.svelte.ts';
  import { penClock, penFrom, revealed, topicDef, ui } from '../core/app.svelte.ts';
  import { aim, preview } from './pointHandle.svelte.ts';
  import MarkLayer from './MarkLayer.svelte';

  /** How the showing topic wants the ring written (its unit, its labels, the angles it marks). */
  const ring = $derived(topicDef(ui.topic).ring?.());
  const marks = $derived(
    ringScene({
      t: penClock.current,
      wasRevealed: penFrom.revealed,
      revealed: revealed(),
      highlight: ui.highlight,
      aim: aim.deg,
      preview: preview.deg,
      decimals: camera.thetaDecimals,
      taken: ring?.taken ?? (() => false),
      sw: camera.stroke,
      lb: camera.labelBoost,
      unit: ring?.unit ?? progress.unit,
      labels: ring?.labels ?? true,
    }),
  );
</script>

<MarkLayer {marks} />
