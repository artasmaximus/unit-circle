<!-- The Inverse trig guide (see guide/Guide.svelte). Its exam is a strict run of Inverse trig
     questions: ten in a row, with arcsin, arccos, arctan and a composition among them. -->
<script lang="ts">
  import { topicDef } from '../../core/app.svelte.ts';
  import Guide from '../../guide/Guide.svelte';
  import ExamResult from '../../guide/ExamResult.svelte';
  import GuideNote from '../../guide/GuideNote.svelte';
  import { inverseGuideRun as run } from './guide.svelte.ts';
  import InverseQuiz from './InverseQuiz.svelte';
</script>

<Guide {run} label="Inverse trig guide" color="var(--slope)">
  {#snippet intro()}
    <GuideNote
      topics={topicDef('inverse').requires}
      before="This guide builds on the "
      after=", so it is worth doing that one first."
    />
  {/snippet}
  {#snippet exam()}
    <ExamResult
      topic="inverse"
      passed={run.exam.passed}
      message="Inverse trig complete. Explore lets you try any value, and Practice mixes all the question types."
    >
      <InverseQuiz session={run.exam} />
    </ExamResult>
  {/snippet}
</Guide>
