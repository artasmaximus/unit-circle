<!-- A topic's Guide: one step at a time, with what to read, what to do, and a way back or on. It never holds the learner (Explore is a click
     away); its exam, which the topic passes in as a snippet, is how the topic is completed. -->
<script lang="ts" module>
  import type { Step } from '../lib/guide.ts';
  /** What a topic's Guide state offers (radians.svelte.ts, unitGuide.svelte.ts). */
  export type GuideRun = {
    steps: Step[]; step: Step; stepIndex: number; solved: boolean; chosen: number | null; canGo: boolean;
    next(): void; back(): void; choose(i: number): void;
  };
</script>

<script lang="ts">
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import type { Snippet } from 'svelte';
  import { setMode } from '../lib/state.svelte.ts';
  import Rich from '../ui/Rich.svelte';
  import Tex from '../ui/Tex.svelte';

  let { run, label, color, intro, exam }: {
    run: GuideRun; label: string; color: string;
    /** Shown above the first step (a note on what the guide builds on). */
    intro?: Snippet;
    /** The exam step's content. */
    exam: Snippet;
  } = $props();
  const s = $derived(run.step), t = $derived(s.task), n = $derived(run.steps.length), i = $derived(run.stepIndex);
</script>

<section class="guide" aria-label={label} style:--c={color}>
  <div class="top">
    <div class="dots" role="progressbar" aria-valuemin={1} aria-valuemax={n} aria-valuenow={i + 1} aria-label="Step {i + 1} of {n}">
      {#each run.steps as _, k}<span class="dot" class:now={k === i} class:past={k < i}></span>{/each}
    </div>
    <button class="skip" onclick={() => setMode('explore')}>Skip to Explore</button>
  </div>

  {#key s.id}
    <div class="step" in:fly={{ y: 10, duration: 260, delay: 120, easing: cubicOut }}>
      {#if i === 0}{@render intro?.()}{/if}
      <h2>{s.title}</h2>
      {#each s.say as para}<p><Rich parts={para} /></p>{/each}

      {#if t.kind === 'choice'}
        <div class="task">
          <p class="ask"><Rich parts={t.prompt} /></p>
          <div class="opts">
            {#each t.choices as c, k}
              <button class:ok={run.solved && k === t.answer} class:bad={run.chosen === k && k !== t.answer} disabled={run.solved} onclick={() => run.choose(k)}><Tex latex={c} /></button>
            {/each}
          </div>
          {#if run.solved}<p class="fb good"><Rich parts={t.right} /></p>
          {:else if run.chosen !== null}<p class="fb"><Rich parts={t.wrong} /></p>{/if}
        </div>
      {:else if t.kind === 'drag'}
        <div class="task">
          <p class="ask"><Rich parts={t.prompt} /></p>
          {#if run.solved}<p class="fb good"><Rich parts={t.right} /></p>{:else}<p class="fb">Drag the point round the edge of the circle.</p>{/if}
        </div>
      {:else if t.kind === 'exam'}
        {@render exam()}
      {/if}
    </div>
  {/key}

  <div class="nav">
    <button onclick={() => run.back()} disabled={i === 0}>Back</button>
    {#if i < n - 1}<button class="primary" onclick={() => run.next()} disabled={!run.canGo}>Next</button>{/if}
  </div>
</section>

<style>
  .guide { display: grid; gap: 14px; }
  .top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .dots { display: flex; gap: 5px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--line); transition: background 0.25s, transform 0.25s; }
  .dot.past { background: color-mix(in srgb, var(--c) 60%, var(--line)); }
  .dot.now { background: var(--c); transform: scale(1.35); }
  .skip { border: 0; background: none; color: var(--muted); font-size: 0.78rem; padding: 2px 4px; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
  .skip:hover { color: var(--fg); }
  .step { display: grid; gap: 10px; align-content: start; min-height: 15rem; }
  h2 { margin: 0; font-size: 1.15rem; font-weight: 600; letter-spacing: -0.01em; }
  p { margin: 0; font-size: 0.95rem; line-height: 1.5; }
  .task { display: grid; gap: 10px; padding: 12px 14px; border: 1px solid color-mix(in srgb, var(--c) 35%, transparent); border-radius: 8px; background: color-mix(in srgb, var(--c) 10%, var(--glass)); }
  .ask { font-weight: 500; }
  .opts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .opts button { padding: 10px 6px; min-height: 48px; display: grid; place-items: center; background: color-mix(in srgb, var(--panel) 55%, transparent); font-size: 1.05rem; }
  .opts button.ok { border-color: var(--ok); box-shadow: inset 0 0 0 1px var(--ok); }
  .opts button.bad { border-color: var(--bad); box-shadow: inset 0 0 0 1px var(--bad); }
  .opts button:disabled { cursor: default; }
  .fb { color: var(--muted); font-size: 0.88rem; }
  .fb.good { color: var(--ok); }
  .nav { display: flex; justify-content: space-between; gap: 10px; }
  .nav button:disabled { opacity: 0.45; cursor: default; }
</style>
