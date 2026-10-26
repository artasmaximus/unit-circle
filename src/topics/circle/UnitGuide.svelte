<!-- The Unit circle guide (see guide/Guide.svelte). Its exam is a strict run of exact values:
     ten in a row, with sin, cos and tan all among them. -->
<script lang="ts">
  import { progress } from '../../core/progress.svelte.ts';
  import { setMode, setTopic } from '../../core/app.svelte.ts';
  import { unitGuide } from './guide.svelte.ts';
  import Practice from '../../practice/Practice.svelte';
  import { circleView } from './practiceView.ts';
  import Guide from '../../guide/Guide.svelte';

  const ex = unitGuide.exam;
  const done = $derived(!!progress.completed.circle);
</script>

<Guide run={unitGuide} label="Unit circle guide" color="var(--cos)">
  {#snippet intro()}
    {#if !progress.completed.radians}
      <p class="note">
        This guide works in degrees, so you can start here. If you would like the angles in radians
        too, the <button class="link" onclick={() => setTopic('radians')}>Radians guide</button> comes
        first.
      </p>
    {/if}
  {/snippet}
  {#snippet exam()}
    {#if !done || ex.passed}<Practice session={ex} view={circleView} />{/if}
    {#if done}
      <p class="fb">
        Unit circle complete. Explore shows the full figure, and Practice also asks you to find both
        angles that share a value.
      </p>
      <div class="after">
        <button class="primary" onclick={() => setMode('explore')}>Explore</button><button
          onclick={() => setMode('practice')}>Practice</button
        >
      </div>
    {/if}
  {/snippet}
</Guide>

<style>
  .note {
    margin: 0;
    padding: 8px 12px;
    border-left: 2px solid var(--rad);
    color: var(--muted);
    font-size: 0.85rem;
    line-height: 1.5;
  }
  .link {
    padding: 0;
    border: 0;
    background: none;
    color: var(--rad);
    font: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
  .fb {
    margin: 0;
    font-size: 0.88rem;
    line-height: 1.5;
    color: var(--ok);
  }
  .after {
    display: flex;
    gap: 8px;
  }
</style>
