<!-- The panel floats over the plane: on the left on wide screens, along the bottom on phones.
     Behind it a progressive blur fades out past its edge, so the grid stays visible and usable
     right up to the panel. -->
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { cubicIn, cubicOut } from 'svelte/easing';
  import { untrack } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { panel as panelT } from '../core/tuning.ts';
  import { camera } from '../core/camera.svelte.ts';
  import { pen, setMode, ui } from '../core/state.svelte.ts';
  import Quiz from '../topics/circle/Quiz.svelte';
  import Segmented from '../ui/Segmented.svelte';
  import AngleInput from '../ui/AngleInput.svelte';
  import { progress } from '../core/progress.svelte.ts';
  import Reciprocals from '../topics/circle/Reciprocals.svelte';
  import InversePanel from '../topics/inverse/InversePanel.svelte';
  import InverseQuiz from '../topics/inverse/InverseQuiz.svelte';
  import RadiansGuide from '../topics/radians/RadiansGuide.svelte';
  import UnitGuide from '../topics/circle/UnitGuide.svelte';
  import RadiansPanel from '../topics/radians/RadiansPanel.svelte';
  import RadiansQuiz from '../topics/radians/RadiansQuiz.svelte';
  import { radians } from '../topics/radians/state.svelte.ts';
  import { guideTopics } from '../core/state.svelte.ts';
  import { inverse } from '../topics/inverse/state.svelte.ts';

  let w = $state(0),
    h = $state(0);
  // The plane is its own layer under the UI: the panel never resizes it as its content changes (a
  // value turning into a tall fraction at a snap angle would otherwise shift the whole circle). On
  // phones the room the panel takes is read once per view, after the view has settled, and again
  // when the window resizes.
  let placed = false,
    settle = 0;
  $effect(() => {
    void `${ui.mode}|${camera.vw}|${camera.vh}`;
    clearTimeout(settle);
    if (camera.wide) {
      camera.inset = { left: w, bottom: 0 };
      placed = false;
      return;
    }
    if (!placed) return;
    settle = window.setTimeout(() => {
      camera.inset = { left: 0, bottom: untrack(() => h) };
    }, panelT.settleMs);
    return () => clearTimeout(settle);
  });
  // the very first reading goes straight in, so the circle starts where it belongs
  $effect(() => {
    if (!camera.wide && h && !placed) {
      camera.inset = { left: 0, bottom: h };
      placed = true;
    }
  });
  // on phones the blur starts under the header
  let headH = $state(0);

  // blur layers from strongest to weakest; each reaches a little further out, so the blur thins
  // toward the edge
  const LAYERS = panelT.blur;

  const IN = {
      y: panelT.enter.y,
      duration: panelT.enter.ms,
      delay: panelT.enter.delay,
      easing: cubicOut,
    },
    OUT = { y: panelT.exit.y, duration: panelT.exit.ms, easing: cubicIn };
  let contentH = $state(0);
  // the blur follows the content's height on a glide, so it grows and shrinks with the panel
  // instead of jumping when a view changes
  const blurH = new Tween(0, { duration: panelT.blurGlideMs, easing: cubicOut });
  const blurHead = new Tween(0, { duration: panelT.blurGlideMs, easing: cubicOut });
  let blurSeen = false;
  $effect(() => {
    const first = !blurSeen && contentH > 0;
    if (contentH > 0) blurSeen = true;
    blurH.set(contentH, first ? { duration: 0 } : undefined);
    blurHead.set(headH, first ? { duration: 0 } : undefined);
  });
</script>

{#snippet otherToggle()}
  <button
    class="switch"
    role="switch"
    aria-checked={inverse.showOther}
    onclick={() => (inverse.showOther = !inverse.showOther)}
    data-tip="Shows the other angle that has the same value. It is outside the range, which is why the inverse never gives it."
  >
    Other angle<span class="track"><span class="knob"></span></span>
  </button>
{/snippet}

{#snippet mirror()}
  <button
    class="switch"
    role="switch"
    aria-checked={ui.mirror}
    onclick={() => (ui.mirror = !ui.mirror)}
    data-tip="Shows the other angles that have the same reference angle. In Practice it also shows the second angle with the same sin, cos or tan."
  >
    Mirror Point<span class="track"><span class="knob"></span></span>
  </button>
{/snippet}

<aside class="panel" bind:clientWidth={w} bind:clientHeight={h}>
  <!-- the blur hugs the content: it ends a little below the last element and fades out past the
       panel edge -->
  <div
    class="blur"
    aria-hidden="true"
    style:--content-h="{blurH.current}px"
    style:--head="{blurHead.current}px"
  >
    {#each LAYERS as [b, a, z]}<div style="--b:{b}px;--a:{a}%;--z:{z}%"></div>{/each}
    <div class="tint"></div>
  </div>
  <div class="content" bind:clientHeight={contentH}>
    <header bind:clientHeight={headH}>
      <div class="title">
        <h1>
          {ui.topic === 'inverse'
            ? 'Inverse Trig'
            : ui.topic === 'radians'
              ? 'Radians'
              : 'Unit Circle'}
        </h1>
        <Segmented
          label="Mode"
          value={ui.mode}
          onchange={setMode}
          progress={pen.current}
          options={[
            ...(guideTopics.has(ui.topic) ? [{ value: 'guide' as const, label: 'Guide' }] : []),
            { value: 'explore' as const, label: 'Explore' },
            { value: 'practice' as const, label: 'Practice' },
          ]}
        />
      </div>
    </header>
    <!-- the views share one grid cell, so the old one fades away under the new one as it rises
         in -->
    <div class="stage">
      {#if ui.topic === 'radians'}
        {#if ui.mode === 'guide'}<div class="view" in:fly={IN} out:fly={OUT}><RadiansGuide /></div>
        {:else if ui.mode === 'practice'}<div class="view" in:fly={IN} out:fly={OUT}>
            <RadiansQuiz session={radians.practice} />
          </div>
        {:else}<div class="view" in:fly={IN} out:fly={OUT}><RadiansPanel /></div>{/if}
      {:else if ui.topic === 'inverse'}
        {#if ui.mode === 'practice'}<div class="view" in:fly={IN} out:fly={OUT}>
            <InverseQuiz />
          </div>
        {:else}<div class="view" in:fly={IN} out:fly={OUT}>
            <InversePanel trailing={otherToggle} />
          </div>{/if}
      {:else if ui.mode === 'guide'}<div class="view" in:fly={IN} out:fly={OUT}><UnitGuide /></div>
      {:else if ui.mode === 'practice'}<div class="view" in:fly={IN} out:fly={OUT}>
          <Quiz trailing={mirror} />
        </div>
      {:else}<div class="view" in:fly={IN} out:fly={OUT}>
          <Reciprocals trailing={mirror} />
        </div>{/if}
    </div>
  </div>
</aside>

<!-- the angle reads and edits here, in the plane's top-right corner; "Reset view" appears under
     it once the view has moved -->
<div class="corner">
  <div class="row">
    <!-- the unit every angle is written in; radians unlock once the Radians topic is done -->
    <Segmented
      label="Angle unit"
      value={progress.unit}
      onchange={(u) => progress.setUnit(u)}
      options={[
        { value: 'deg', label: '°' },
        {
          value: 'rad',
          label: 'rad',
          locked: !progress.radiansUnlocked,
          tip: 'Learn radians to unlock',
        },
      ]}
    />
    {#if ui.topic === 'circle' || (ui.topic === 'radians' && !radians.asking)}<AngleInput
        unit={ui.topic === 'radians' ? 'rad' : undefined}
      />{/if}
  </div>
  {#if camera.moved}<button class="reset" onclick={camera.reset}>Reset view</button>{/if}
</div>

<style>
  /* the panel only positions things; empty space in it lets the grid through, to the pointer too */
  .panel {
    position: fixed;
    z-index: 2;
    left: 0;
    top: 0;
    bottom: 0;
    width: clamp(340px, 32vw, 460px);
    pointer-events: none;
    --dir: to right;
    --side: 36px;
    --below: 12px;
  }
  @media not ((min-width: 700px) and (min-aspect-ratio: 1/1)) {
    .panel {
      top: auto;
      right: 0;
      width: auto;
      height: auto;
      --dir: to top;
      --side: 0px;
    }
  }
  /* sized to the content plus a feather past the panel's edge and below its last element */
  .blur {
    position: absolute;
    left: 0;
    top: 0;
    width: calc(100% + var(--side));
    height: calc(var(--content-h) + var(--below));
    pointer-events: none;
  }
  @media not ((min-width: 700px) and (min-aspect-ratio: 1/1)) {
    .blur {
      top: calc(12px + var(--head));
      height: calc(100% - 12px - var(--head));
    }
  }
  .blur > div {
    position: absolute;
    inset: 0;
  }
  .blur > div:not(.tint) {
    -webkit-backdrop-filter: blur(var(--b));
    backdrop-filter: blur(var(--b));
    -webkit-mask-image:
      linear-gradient(var(--dir), #000 var(--a), transparent var(--z)),
      linear-gradient(to bottom, #000 calc(100% - var(--below)), transparent);
    mask-image:
      linear-gradient(var(--dir), #000 var(--a), transparent var(--z)),
      linear-gradient(to bottom, #000 calc(100% - var(--below)), transparent);
    -webkit-mask-composite: source-in;
    mask-composite: intersect;
  }
  .tint {
    background: linear-gradient(
      var(--dir),
      color-mix(in srgb, var(--bg) 45%, transparent) 55%,
      transparent 100%
    );
    -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - var(--below)), transparent);
    mask-image: linear-gradient(to bottom, #000 calc(100% - var(--below)), transparent);
  }
  @media not ((min-width: 700px) and (min-aspect-ratio: 1/1)) {
    .blur > div:not(.tint) {
      -webkit-mask-image: linear-gradient(var(--dir), #000 var(--a), transparent var(--z));
      mask-image: linear-gradient(var(--dir), #000 var(--a), transparent var(--z));
    }
    .tint {
      -webkit-mask-image: none;
      mask-image: none;
    }
  }
  .content {
    position: relative;
    max-height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    overscroll-behavior: contain;
    pointer-events: auto;
    display: grid;
    align-content: start;
    gap: 22px;
    /* the bottom padding keeps the last line clear of the tab bar floating at the bottom left */
    padding: max(28px, env(safe-area-inset-top, 0px)) 24px 96px
      max(24px, env(safe-area-inset-left, 0px));
  }
  /* phones: the sheet is short, so everything tightens */
  @media not ((min-width: 700px) and (min-aspect-ratio: 1/1)) {
    .content {
      max-height: 44svh;
      padding: 12px max(14px, env(safe-area-inset-right, 0px))
        max(14px, env(safe-area-inset-bottom, 0px)) max(14px, env(safe-area-inset-left, 0px));
      gap: 12px;
      font-size: 0.93rem;
    }
  }
  /* the title and the mode switch share a row, the switch right-aligned */
  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .stage {
    display: grid;
  }
  .view {
    grid-area: 1 / 1;
    min-width: 0;
  }
  /* the panel scrolls, which would clip tooltips: anchor them to their row instead, at the row's
     full width */
  .content :global([data-tip]) {
    position: static;
  }
  .content :global([data-tip]::after) {
    max-width: 100%;
    box-sizing: border-box;
  }
  h1 {
    font-weight: 600;
    font-size: 1.6rem;
    letter-spacing: -0.03em;
    line-height: 1.15;
    margin: 0;
  }
  .switch {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 0;
    border: 0;
    background: none;
    color: var(--fg);
    font-size: 0.85rem;
    cursor: pointer;
  }
  /* the angle readout and reset button, floating in the plane's top-right corner */
  .corner :global([data-tip]::after) {
    left: auto;
    right: 0;
  }
  .corner .row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .corner {
    position: fixed;
    z-index: 3;
    top: max(14px, env(safe-area-inset-top, 0px));
    right: max(14px, env(safe-area-inset-right, 0px));
    display: grid;
    justify-items: end;
    gap: 8px;
  }
  .reset {
    padding: 3px 9px;
    font-size: 0.78rem;
    color: var(--muted);
    background: color-mix(in srgb, var(--panel) 70%, transparent);
    border-color: transparent;
  }
  .content .switch::after {
    left: auto;
    right: 0;
  }
  .track {
    position: relative;
    width: 32px;
    height: 18px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--muted) 35%, transparent);
    transition: background 0.18s;
  }
  .knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--fg);
    transition: transform 0.18s cubic-bezier(0.22, 0.9, 0.3, 1);
  }
  .switch[aria-checked='true'] .track {
    background: var(--cos);
  }
  .switch[aria-checked='true'] .knob {
    transform: translateX(14px);
    background: #fff;
  }
  .switch:focus-visible {
    outline: 2px solid var(--cos);
    outline-offset: 4px;
    border-radius: 6px;
  }
</style>
