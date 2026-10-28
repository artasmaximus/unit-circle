<!-- What a Guide's exam step shows: the exam itself (passed in as content) and, once the topic is
     complete, the result with ways on. The exam stays on screen through its last answer; coming
     back later, only the result shows. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { progress, type GuideTopic } from '../core/progress.svelte.ts';
  import { setMode } from '../core/app.svelte.ts';

  let {
    topic,
    passed,
    message,
    children,
  }: {
    topic: GuideTopic;
    /** The exam session's `passed`. */
    passed: boolean;
    /** What the topic's completion says and unlocks. */
    message: string;
    /** The exam's own screen. */
    children: Snippet;
  } = $props();
  const done = $derived(!!progress.completed[topic]);
</script>

{#if !done || passed}{@render children()}{/if}
{#if done}
  <p class="fb">{message}</p>
  <div class="after">
    <button class="primary" onclick={() => setMode('explore')}>Explore</button><button
      onclick={() => setMode('practice')}>Practice</button
    >
  </div>
{/if}

<style>
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
