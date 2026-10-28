<!-- A Guide's opening note pointing at another topic's Guide, until that one is done: the words
     before and after the link are the topic's own, the link and its colour come from the registry.
     With several topics to point at it names the first that is not done. -->
<script lang="ts">
  import { progress } from '../core/progress.svelte.ts';
  import { pending } from '../core/nav.ts';
  import { setTopic, topicDef, type Topic } from '../core/app.svelte.ts';

  let {
    topics,
    before,
    after,
  }: {
    /** The topics it may point at (`TopicDef.suggests` or `requires`). */
    topics?: Topic[];
    /** The words leading to the link, ending in a space. */
    before: string;
    /** The words after it, starting with a space or punctuation. */
    after: string;
  } = $props();
  const to = $derived(pending(topics, progress.completed)[0]);
  const def = $derived(to ? topicDef(to) : null);
</script>

{#if to && def}
  <p class="note" style:--c={def.color}>
    {before}<button class="link" onclick={() => setTopic(to)}>{def.tab.label} guide</button>{after}
  </p>
{/if}

<style>
  .note {
    margin: 0;
    padding: 8px 12px;
    border-left: 2px solid var(--c);
    color: var(--muted);
    font-size: 0.85rem;
    line-height: 1.5;
  }
  .link {
    padding: 0;
    border: 0;
    background: none;
    color: var(--c);
    font: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
</style>
