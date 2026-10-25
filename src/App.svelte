<script lang="ts">
  import Plane from './plane/Plane.svelte';
  import Panel from './panel/Panel.svelte';
  import SolverLab from './lab/SolverLab.svelte';
  import TabBar from './ui/TabBar.svelte';
  import { camera } from './lib/camera.svelte.ts';
  import { inverse } from './lib/inverse.svelte.ts';
  import { point, quiz, ui } from './lib/state.svelte.ts';

  // ?lab=solver opens the equation solver's test bench in place of the panel
  const lab =
    typeof location !== 'undefined' && new URLSearchParams(location.search).get('lab') === 'solver';

  if (!lab && ui.mode === 'practice') quiz.start();

  // dev only: handles for timing a frame from the browser console, e.g. set point.ang, then time
  // flushSync() (dropped from production builds)
  if (import.meta.env.DEV)
    import('svelte').then(
      ({ flushSync }) => ((window as any).__uc = { point, inverse, ui, camera, flushSync }),
    );

  // arrow keys turn the point by 1° (15° with Shift); in inverse trig they nudge the value (0.01,
  // or 0.1 with Shift), or the ray's angle for arctan
  const onkeydown = (e: KeyboardEvent) => {
    if (e.defaultPrevented || (e.target as HTMLElement).tagName === 'INPUT') return;
    const dir =
      e.key === 'ArrowLeft' || e.key === 'ArrowDown'
        ? -1
        : e.key === 'ArrowRight' || e.key === 'ArrowUp'
          ? 1
          : 0;
    if (!dir) return;
    if (ui.topic === 'inverse') {
      if (inverse.probe !== null)
        return inverse.moveProbe(inverse.probe + dir * (e.shiftKey ? 15 : 1), 90);
      if (inverse.locked) return;
      return inverse.fn === 'atan'
        ? inverse.setAngle(inverse.target + dir * (e.shiftKey ? 15 : 1))
        : inverse.setValue(inverse.valueTo + dir * (e.shiftKey ? 0.1 : 0.01));
    }
    point.set(point.deg + dir * (e.shiftKey ? 15 : 1), true);
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

<Plane />
{#if lab}<SolverLab />{:else}<Panel />{#if camera.wide}<TabBar />{/if}{/if}
