<!-- The Inverse trig guide (see guide/Guide.svelte). Its exam is a strict run of Inverse trig
     questions: ten in a row, with arcsin, arccos, arctan and a composition among them. -->
<script lang="ts">
  import { progress } from '../../core/progress.svelte.ts';
  import { setTopic } from '../../core/app.svelte.ts';
  import Guide from '../../guide/Guide.svelte';
  import ExamResult from '../../guide/ExamResult.svelte';
  import { inverseGuideRun as run } from './guide.svelte.ts';
  import InverseQuiz from './InverseQuiz.svelte';
</script>

<Guide {run} label="Inverse trig guide" color="var(--slope)">
  {#snippet intro()}
    {#if !progress.completed.circle}
      <p class="note">
        This guide builds on the
        <button class="link" onclick={() => setTopic('circle')}>Unit circle guide</button>, so it is
        worth doing that one first.
      </p>
    {/if}
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

<style>
  .note {
    margin: 0;
    padding: 8px 12px;
    border-left: 2px solid var(--cos);
    color: var(--muted);
    font-size: 0.85rem;
    line-height: 1.5;
  }
  .link {
    padding: 0;
    border: 0;
    background: none;
    color: var(--cos);
    font: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
</style>
