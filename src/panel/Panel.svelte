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
  import { pen, setMode, ui } from '../core/app.svelte.ts';
  import Segmented from '../ui/Segmented.svelte';
  import AngleInput from '../ui/AngleInput.svelte';
  import { progress } from '../core/progress.svelte.ts';
  import { hasGuide, topicDef } from '../core/app.svelte.ts';
  import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
  import { topicMenu } from '../ui/topicMenu.svelte.ts';
  import './cards.css';

  const topic = $derived(topicDef(ui.topic));
  const angleInput = $derived(topic.angleInput?.());
  const View = $derived(topic.views[ui.mode] ?? topic.views.explore);
  let w = $state(0),
    h = $state(0);
  // The plane is its own layer under the UI: the panel never resizes it as its content changes (a
  // value turning into a tall fraction at a snap angle would otherwise shift the whole circle). On
  // phones the room the panel takes is read once per view, after the view has settled, and again
  // when the window resizes.
  let placed = false,
    settle = 0;
  $effect(() => {
    void `${ui.mode}|${camera.vw}|${camera.vh}|${folded}`;
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
  // the header stays put as the content scrolls under it, and gets a hairline once it has
  let scrolled = $state(false);
  // on phones the sheet can fold down to its header, to see the whole plane
  let folded = $state(false);

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

<aside class="panel" bind:clientWidth={w} bind:clientHeight={h}>
  <!-- the blur hugs the content: it fades out past the panel's edge and below its last element
       the same way, each layer a little further out, so neither edge is a hard line -->
  <div
    class="blur"
    aria-hidden="true"
    style:--content-h="{blurH.current}px"
    style:--head="{blurHead.current}px"
  >
    {#each LAYERS as [b, a, z]}<div
        style="--b:{b}px;--a:{a}%;--z:{z}%;--ya:{(100 - a) / 50};--yz:{(100 - z) / 50}"
      ></div>{/each}
    <div class="tint"></div>
  </div>
  <div
    class="content"
    bind:clientHeight={contentH}
    onscroll={(e) => (scrolled = e.currentTarget.scrollTop > 2)}
  >
    <header bind:clientHeight={headH} class:scrolled>
      <button
        class="fold"
        aria-label={folded ? 'Show the panel' : 'Hide the panel'}
        aria-expanded={!folded}
        onclick={() => (folded = !folded)}><span></span></button
      >
      <div class="title">
        <!-- on phones the title is where the topic switcher opens (wide screens have the tab bar) -->
        {#if camera.wide}
          <h1>{topic.title}</h1>
        {:else}
          <button
            class="switch-topic"
            aria-haspopup="dialog"
            onclick={() => (topicMenu.open = true)}
            ><h1>{topic.title}</h1>
            <ChevronsUpDown size={16} /></button
          >
        {/if}
        <Segmented
          label="Mode"
          value={ui.mode}
          onchange={setMode}
          progress={pen.current}
          options={[
            ...(hasGuide(ui.topic) ? [{ value: 'guide' as const, label: 'Guide' }] : []),
            { value: 'explore' as const, label: 'Explore' },
            { value: 'practice' as const, label: 'Practice' },
          ]}
        />
      </div>
    </header>
    <!-- the views share one grid cell, so the old one fades away under the new one as it rises
         in -->
    <div class="stage" class:folded>
      {#key `${ui.topic}|${ui.mode}`}
        <div class="view" in:fly={IN} out:fly={OUT}><View /></div>
      {/key}
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
    {#if angleInput}<AngleInput unit={angleInput.unit} />{/if}
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
    --below: 72px;
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
      top: var(--head);
      height: calc(100% - var(--head));
    }
  }
  .blur > div {
    position: absolute;
    inset: 0;
  }
  .blur > div:not(.tint) {
    -webkit-backdrop-filter: blur(var(--b));
    backdrop-filter: blur(var(--b));
    /* the bottom fades with the same stagger as the side (--ya, --yz: how far up from the bottom of
       the feather each layer is solid, and gone), and the two fades multiply into a soft corner */
    -webkit-mask-image:
      linear-gradient(var(--dir), #000 var(--a), transparent var(--z)),
      linear-gradient(
        to bottom,
        #000 calc(100% - var(--below) * var(--ya)),
        transparent calc(100% - var(--below) * var(--yz))
      );
    mask-image:
      linear-gradient(var(--dir), #000 var(--a), transparent var(--z)),
      linear-gradient(
        to bottom,
        #000 calc(100% - var(--below) * var(--ya)),
        transparent calc(100% - var(--below) * var(--yz))
      );
    -webkit-mask-composite: source-in;
    mask-composite: intersect;
  }
  .tint {
    background: linear-gradient(
      var(--dir),
      color-mix(in srgb, var(--bg) 45%, transparent) 55%,
      transparent 100%
    );
    -webkit-mask-image: linear-gradient(
      to bottom,
      #000 calc(100% - var(--below)),
      transparent calc(100% - var(--below) * 0.3)
    );
    mask-image: linear-gradient(
      to bottom,
      #000 calc(100% - var(--below)),
      transparent calc(100% - var(--below) * 0.3)
    );
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
    --pt: max(28px, env(safe-area-inset-top, 0px));
    --pl: max(24px, env(safe-area-inset-left, 0px));
    padding: 0 24px 96px var(--pl);
  }
  /* phones: the sheet is short, so everything tightens */
  @media not ((min-width: 700px) and (min-aspect-ratio: 1/1)) {
    .content {
      max-height: 44svh;
      --pt: 12px;
      --pl: max(14px, env(safe-area-inset-left, 0px));
      padding: 0 max(14px, env(safe-area-inset-right, 0px))
        max(14px, env(safe-area-inset-bottom, 0px)) var(--pl);
      gap: 12px;
      font-size: 0.93rem;
    }
    header {
      margin-right: calc(-1 * max(14px, env(safe-area-inset-right, 0px)));
      padding-right: max(14px, env(safe-area-inset-right, 0px));
      padding-top: calc(var(--pt) + 14px);
    }
    header .fold {
      display: block;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 64px;
      height: 22px;
      padding: 0;
      border: 0;
      background: none;
      cursor: pointer;
    }
    .fold span {
      display: block;
      width: 36px;
      height: 4px;
      margin: 8px auto 0;
      border-radius: 999px;
      background: var(--line);
      transition: background var(--dur-quick);
    }
    .fold:hover span {
      background: var(--muted);
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
  .stage.folded {
    display: none;
  }
  /* the header sticks to the top of the scrolling content; it reaches out over the content's padding
     so nothing shows above it, and a hairline fades in once content is under it */
  header {
    position: sticky;
    top: 0;
    z-index: 2;
    margin: 0 -24px 0 calc(-1 * var(--pl));
    padding: var(--pt) 24px 12px var(--pl);
    background: color-mix(in srgb, var(--bg) 86%, transparent);
    -webkit-backdrop-filter: blur(14px);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid transparent;
    transition: border-color var(--dur-quick);
  }
  header.scrolled {
    border-bottom-color: var(--line);
  }
  /* the grab handle that folds the sheet on phones */
  .fold {
    display: none;
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
    letter-spacing: -0.025em;
    line-height: 1.15;
    margin: 0;
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
  /* the phone title as a button: bare, so it reads as the heading it is, with a chevron */
  .switch-topic {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    padding: 4px 6px 4px 0;
    border: 0;
    background: transparent;
    color: var(--fg);
  }
  .switch-topic :global(svg) {
    flex: none;
    color: var(--muted);
  }
  .reset {
    padding: 3px 9px;
    font-size: 0.78rem;
    color: var(--muted);
    background: color-mix(in srgb, var(--panel) 70%, transparent);
    border-color: transparent;
  }
  .content :global(.switch)::after {
    left: auto;
    right: 0;
  }
</style>
