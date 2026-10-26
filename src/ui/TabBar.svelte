<!-- The topics, as a small bar floating at the bottom left (desktop and landscape tablets; phones
     reach them from the panel's title). It is the same segmented control as the mode switch (icon
     over a tiny label), and its thumb glides on the same pen motion a topic switch plays. Up to a
     handful of topics it lists them all; past that it keeps the current one and a button that opens
     the topic switcher. The tabs come from the topic registry (core/app.svelte.ts). -->
<script lang="ts">
  import LayoutGrid from '@lucide/svelte/icons/layout-grid';
  import { pen, setTopic, topicSections, topicStatus, topicDef, ui } from '../core/app.svelte.ts';
  import { progress } from '../core/progress.svelte.ts';
  import { nav } from '../core/tuning.ts';
  import Segmented from './Segmented.svelte';
  import { topicMenu } from './topicMenu.svelte.ts';

  const ALL = ' all';
  const all = $derived(topicSections().flatMap((s) => s.topics));
  // a topic shows a check once its Guide's exam has been passed, and a lock until it is open
  const tab = (t: (typeof all)[number]) => {
    const { state, missing } = topicStatus(t);
    return {
      value: t.id,
      label: t.tab.label,
      icon: t.tab.icon,
      done: !!progress.completed[t.id],
      locked: state === 'locked',
      tip:
        state === 'locked'
          ? `Finish ${missing.map((m) => topicDef(m).title).join(' and ')} first`
          : undefined,
    };
  };
  const tabs = $derived(
    all.length <= nav.barMax
      ? all.map(tab)
      : [tab(topicDef(ui.topic)), { value: ALL, label: 'All topics', icon: LayoutGrid }],
  );
</script>

<nav class="tabs">
  <Segmented
    label="Concepts"
    stacked
    value={ui.topic}
    onchange={(t) => (t === ALL ? (topicMenu.open = true) : setTopic(t))}
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
