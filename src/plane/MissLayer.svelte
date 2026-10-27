<!-- Where a missed placing question went wrong: the ring's gap between the point's last spot and the
     right angle, drawn once the question is answered. Shared by every topic; it asks for no marks
     when nothing was missed, so the mark layer plays the exit on the next question. -->
<script lang="ts">
  import { camera, S } from '../core/camera.svelte.ts';
  import { topicDef, ui } from '../core/app.svelte.ts';
  import { rad } from '../core/trig.ts';
  import { Miss } from '../figures/miss.ts';
  import MarkLayer from './MarkLayer.svelte';

  const miss = $derived.by(() => {
    return topicDef(ui.topic).session?.()?.miss ?? null;
  });
  const marks = $derived(
    miss
      ? Miss(
          'miss',
          { from: rad(miss.from), to: rad(miss.to), r: S },
          { sw: camera.stroke, lb: camera.labelBoost },
        ).marks
      : [],
  );
</script>

<MarkLayer {marks} name="miss" />
