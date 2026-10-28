<!-- The Radians guide (see guide/Guide.svelte); its exam is a strict run of Radians questions, and
     passing it unlocks radians everywhere. -->
<script lang="ts">
  import { radians } from './state.svelte.ts';
  import Guide from '../../guide/Guide.svelte';
  import ExamResult from '../../guide/ExamResult.svelte';
  import RadiansQuiz from './RadiansQuiz.svelte';
</script>

<Guide run={radians} label="Radians guide" color="var(--rad)">
  {#snippet exam()}
    <ExamResult
      topic="radians"
      passed={radians.exam.passed}
      message="Radians complete. The ° | rad switch in the corner is now unlocked, so you can show every angle in radians."
    >
      <RadiansQuiz session={radians.exam} />
    </ExamResult>
  {/snippet}
</Guide>
