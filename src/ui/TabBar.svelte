<!-- The concepts, as a small bar floating at the bottom left (desktop and landscape tablets;
     phones don't show it yet). It is the same segmented control as the mode switch (icon over a
     tiny label), and its thumb glides on the same pen motion a topic switch plays. -->
<script lang="ts">
  import CircleDot from '@lucide/svelte/icons/circle-dot';
  import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
  import Ruler from '@lucide/svelte/icons/ruler';
  import { pen, setTopic, ui } from '../core/state.svelte.ts';
  import { progress } from '../core/progress.svelte.ts';
  import Segmented from './Segmented.svelte';

  const TABS = [
    { value: 'circle', label: 'Unit circle', icon: CircleDot },
    { value: 'inverse', label: 'Inverse trig', icon: ArrowLeftRight },
    { value: 'radians', label: 'Radians', icon: Ruler },
  ] as const;
  // a topic shows a check once its Guide's exam has been passed
  const tabs = $derived(
    TABS.map((t) => ({
      ...t,
      done: !!(progress.completed as Record<string, boolean | undefined>)[t.value],
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
