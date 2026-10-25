<!-- The Radians guide (see Guide.svelte); its exam is a strict run of Radians questions, and passing it unlocks radians everywhere. -->
<script lang="ts">
  import { progress } from '../lib/progress.svelte.ts';
  import { radians } from '../lib/radians.svelte.ts';
  import { setMode } from '../lib/state.svelte.ts';
  import Guide from './Guide.svelte';
  import RadiansQuiz from './RadiansQuiz.svelte';

  const done = $derived(!!progress.completed.radians);
</script>

<Guide run={radians} label="Radians guide" color="var(--rad)">
  {#snippet exam()}
    <!-- the run stays on screen through its last answer; coming back later, only the result shows -->
    {#if !done || radians.exam.passed}<RadiansQuiz session={radians.exam} />{/if}
    {#if done}
      <p class="fb good">Radians is complete. The ° | rad switch in the corner is unlocked, so every angle in the app can be shown in radians.</p>
      <div class="after"><button class="primary" onclick={() => setMode('explore')}>Explore</button><button onclick={() => setMode('practice')}>Practice</button></div>
    {/if}
  {/snippet}
</Guide>

<style>
  .fb { margin: 0; font-size: 0.88rem; line-height: 1.5; color: var(--ok); }
  .after { display: flex; gap: 8px; }
</style>
