<!-- The topics, as a small bar floating at the bottom left (desktop and landscape tablets; phones
     don't show it yet). It is the same segmented control as the mode switch (icon over a tiny
     label), and its thumb glides on the same pen motion a topic switch plays. The tabs come from
     the topic registry (core/app.svelte.ts). -->
<script lang="ts">
  import { pen, setTopic, topics, ui } from '../core/app.svelte.ts';
  import { progress } from '../core/progress.svelte.ts';
  import Segmented from './Segmented.svelte';

  // a topic shows a check once its Guide's exam has been passed
  const tabs = $derived(
    topics.map((t) => ({
      value: t.id,
      label: t.tab.label,
      icon: t.tab.icon,
      done: !!progress.completed[t.id],
    })),
  );
</script>

<nav class="tabs">
  <Segmented
    label="Concepts"
    stacked
    value={ui.topic}
    onchange={setTopic}
    progress={pen.current}
    options={tabs}
  />
</nav>

<style>
  .tabs {
    position: fixed;
    z-index: 3;
    bottom: 16px;
    left: 24px;
    border-radius: 14px;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 24px -10px var(--sh);
  }
</style>
