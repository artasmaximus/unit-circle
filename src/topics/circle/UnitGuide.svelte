<!-- The Unit circle guide (see guide/Guide.svelte). Its exam is a strict run of exact values:
     ten in a row, with sin, cos and tan all among them. -->
<script lang="ts">
  import { topicDef } from '../../core/app.svelte.ts';
  import { unitGuide } from './guide.svelte.ts';
  import Practice from '../../practice/Practice.svelte';
  import { circleView } from './practiceView.ts';
  import Guide from '../../guide/Guide.svelte';
  import ExamResult from '../../guide/ExamResult.svelte';
  import GuideNote from '../../guide/GuideNote.svelte';

  const ex = unitGuide.exam;
</script>

<Guide run={unitGuide} label="Unit circle guide" color="var(--cos)">
  {#snippet intro()}
    <GuideNote
      topics={topicDef('circle').suggests}
      before="This guide works in degrees, so you can start here. If you would like the angles in radians too, the "
      after=" comes first."
    />
  {/snippet}
  {#snippet exam()}
    <ExamResult
      topic="circle"
      passed={ex.passed}
      message="Unit circle complete. Explore shows the full figure, and Practice also asks you to find both angles that share a value."
    >
      <Practice session={ex} view={circleView} />
    </ExamResult>
  {/snippet}
</Guide>
