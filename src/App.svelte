<script lang="ts">
  import Plane from './plane/Plane.svelte';
  import Panel from './panel/Panel.svelte';
  import SolverLab from './solver/SolverLab.svelte';
  import TabBar from './ui/TabBar.svelte';
  import { camera } from './core/camera.svelte.ts';
  import { inverse } from './topics/inverse/state.svelte.ts';
  import { point } from './core/point.svelte.ts';
  import { quiz } from './topics/circle/quiz.svelte.ts';
  import { invQuiz } from './topics/inverse/quiz.svelte.ts';
  import { inverseGuideRun } from './topics/inverse/guide.svelte.ts';
  import { unitGuide } from './topics/circle/guide.svelte.ts';
  import { radians } from './topics/radians/state.svelte.ts';
  import { ui } from './core/app.svelte.ts';
  import { nudge } from './plane/handles.svelte.ts';
  import { fade } from 'svelte/transition';
  import Grid from './plane/Grid.svelte';
  import RingLayer from './plane/RingLayer.svelte';
  import CircleLayer from './topics/circle/CircleLayer.svelte';
  import Chips from './topics/circle/Chips.svelte';
  import UnitGuideLayer from './topics/circle/UnitGuideLayer.svelte';
  import { circleView } from './topics/circle/view.svelte.ts';
  import InverseLayer from './topics/inverse/InverseLayer.svelte';
  import RadiansLayer from './topics/radians/RadiansLayer.svelte';

  // ?lab=solver opens the equation solver's test bench in place of the panel
  const lab =
    typeof location !== 'undefined' && new URLSearchParams(location.search).get('lab') === 'solver';

  if (!lab && ui.mode === 'practice') quiz.start();

  // dev only: handles for timing a frame from the browser console, e.g. set point.ang, then time
  // flushSync() (dropped from production builds)
  if (import.meta.env.DEV)
    import('svelte').then(
      ({ flushSync }) =>
        ((window as any).__uc = {
          point,
          inverse,
          ui,
          camera,
          flushSync,
          quiz,
          invQuiz,
          radians,
          unitGuide,
          inverseGuideRun,
        }),
    );

  // arrow keys go to whatever the topic offers to move: the point, or in inverse trig the value,
  // the ray's angle or the probe (see each topic's handles)
  const onkeydown = (e: KeyboardEvent) => {
    if (e.defaultPrevented || (e.target as HTMLElement).tagName === 'INPUT') return;
    const dir =
      e.key === 'ArrowLeft' || e.key === 'ArrowDown'
        ? -1
        : e.key === 'ArrowRight' || e.key === 'ArrowUp'
          ? 1
          : 0;
    if (dir) nudge(dir, e.shiftKey);
  };
  // tooltips open upward when their button sits in the lower half of the window, so they are never
  // cut off
  const flipTip = (e: Event) => {
    const el = (e.target as Element).closest?.('[data-tip]');
    if (el) el.classList.toggle('tip-up', el.getBoundingClientRect().bottom > innerHeight * 0.5);
  };
</script>

<svelte:window {onkeydown} />
<svelte:document onpointerover={flipTip} onfocusin={flipTip} />

<Plane>
  {#snippet layers()}
    <Grid />
    <!-- every topic's layer is always mounted: when a topic is left its marks play their own
         exits, and the next topic's marks enter -->
    <RadiansLayer under />
    <RingLayer />
    <InverseLayer />
    <RadiansLayer />
    <CircleLayer />
    <UnitGuideLayer />
  {/snippet}
  {#snippet overlay()}
    {#if ui.topic === 'circle' && ui.mode !== 'guide'}<div
        in:fade={{ duration: 200 }}
        out:fade={{ duration: 160 }}
      >
        <Chips layout={circleView.layout} />
      </div>{/if}
  {/snippet}
</Plane>
{#if lab}<SolverLab />{:else}<Panel />{#if camera.wide}<TabBar />{/if}{/if}
