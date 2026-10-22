<script lang="ts">
  import Plane from './plane/Plane.svelte';
  import Panel from './panel/Panel.svelte';
  import SolverLab from './lab/SolverLab.svelte';
  import { point, quiz, ui } from './lib/state.svelte.ts';

  // ?lab=solver opens the equation solver's test bench in place of the panel
  const lab = typeof location !== 'undefined' && new URLSearchParams(location.search).get('lab') === 'solver';

  if (!lab && ui.mode === 'quiz') quiz.start();

  // arrow keys turn the point by 1° (15° with Shift)
  const onkeydown = (e: KeyboardEvent) => {
    if (e.defaultPrevented || (e.target as HTMLElement).tagName === 'INPUT') return;
    const step = e.shiftKey ? 15 : 1;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') point.set(point.deg - step, true);
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') point.set(point.deg + step, true);
  };
  // tooltips open upward when their button sits in the lower half of the window, so they are never cut off
  const flipTip = (e: Event) => {
    const el = (e.target as Element).closest?.('[data-tip]');
    if (el) el.classList.toggle('tip-up', el.getBoundingClientRect().bottom > innerHeight * 0.5);
  };
</script>

<svelte:window {onkeydown} />
<svelte:document onpointerover={flipTip} onfocusin={flipTip} />

<Plane />
{#if lab}<SolverLab />{:else}<Panel />{/if}
