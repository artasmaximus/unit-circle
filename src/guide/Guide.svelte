<!-- A topic's Guide: one step at a time, with what to read, what to do, and a way back or on.
     It never holds the learner (Explore is a click away); its exam, which the topic passes in
     as a snippet, is how the topic is completed. -->
<script lang="ts" module>
  import type { Step } from './guide.ts';
  /**
   * What a topic's Guide state offers (topics/radians/state.svelte.ts,
   * topics/circle/guide.svelte.ts).
   */
  export type GuideRun = {
    steps: Step[];
    step: Step;
    stepIndex: number;
    solved: boolean;
    chosen: number | null;
    canGo: boolean;
    next(): void;
    back(): void;
    choose(i: number): void;
    /** Plays the current step's animation again (steps that have `replay`). */
    replay?(): void;
  };
</script>

<script lang="ts">
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import type { Snippet } from 'svelte';
  import { setMode } from '../core/app.svelte.ts';
  import Rich from '../ui/Rich.svelte';
  import Tex from '../ui/Tex.svelte';

  let {
    run,
    label,
    color,
    intro,
    exam,
  }: {
    run: GuideRun;
    label: string;
    color: string;
    /** Shown above the first step (a note on what the guide builds on). */
    intro?: Snippet;
    /** The exam step's content. */
    exam: Snippet;
  } = $props();
  const s = $derived(run.step),
    t = $derived(s.task),
    n = $derived(run.steps.length),
    i = $derived(run.stepIndex);
</script>

<section class="guide" aria-label={label} style:--c={color}>
  <div class="top">
    <div
      class="bar"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={n}
      aria-valuenow={i + 1}
      aria-label="Step {i + 1} of {n}"
    >
      <span class="fill" style:width="{((i + 1) / n) * 100}%"></span>
    </div>
    <span class="count">{i + 1} / {n}</span>
  </div>

  {#key s.id}
    <div class="step" in:fly={{ y: 10, duration: 260, delay: 120, easing: cubicOut }}>
      {#if i === 0}{@render intro?.()}{/if}
      <div class="heading">
        <h2>{s.title}</h2>
        {#if s.replay && run.replay}<button class="replay" onclick={() => run.replay?.()}
            >↻ Replay</button
          >{/if}
      </div>
      {#each s.say as para}<p><Rich parts={para} /></p>{/each}

      {#if t.kind === 'choice'}
        <div class="task" class:solved={run.solved}>
          <p class="ask"><Rich parts={t.prompt} /></p>
          <div class="opts">
            {#each t.choices as c, k}
              <button
                class:ok={run.solved && k === t.answer}
                class:bad={run.chosen === k && k !== t.answer}
                disabled={run.solved}
                onclick={() => run.choose(k)}><Tex latex={c} /></button
              >
            {/each}
          </div>
          {#if run.solved}<p class="fb good"><Rich parts={t.right} /></p>
          {:else if run.chosen !== null}<p class="fb"><Rich parts={t.wrong} /></p>{/if}
        </div>
      {:else if t.kind === 'drag'}
        <div class="task" class:solved={run.solved}>
          <p class="ask"><Rich parts={t.prompt} /></p>
          {#if run.solved}<p class="fb good"><Rich parts={t.right} /></p>{:else}<p class="fb">
              <Rich parts={t.how ?? ['Drag the point round the edge of the circle.']} />
            </p>{/if}
        </div>
      {:else if t.kind === 'exam'}
        {@render exam()}
      {/if}
    </div>
  {/key}

  <div class="nav">
    <button onclick={() => run.back()} disabled={i === 0}>Back</button>
    <button class="skip" onclick={() => setMode('explore')} title="Skip to Explore">Skip</button>
    {#if i < n - 1}<button class="primary" onclick={() => run.next()} disabled={!run.canGo}
        >{run.canGo ? 'Next' : t.kind === 'choice' ? 'Choose an answer' : 'Move the point'}</button
      >{/if}
  </div>
</section>

<style>
  .guide {
    display: grid;
    gap: 14px;
  }
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .bar {
    flex: 1;
    height: 4px;
    border-radius: 999px;
    background: var(--line);
    overflow: hidden;
  }
  .fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--c);
    transition: width 0.35s cubic-bezier(0.22, 0.9, 0.3, 1);
  }
  .count {
    color: var(--muted);
    font-size: 0.78rem;
    font-variant-numeric: tabular-nums;
  }
  .skip {
    border: 0;
    background: none;
    color: var(--muted);
    font-size: 0.82rem;
    padding: 2px 8px;
    cursor: pointer;
    margin-left: auto;
  }
  .skip:hover {
    color: var(--fg);
  }
  .step {
    display: grid;
    gap: 10px;
    align-content: start;
    min-height: 15rem;
  }
  h2 {
    margin: 4px 0 0;
    font-size: 1.3rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.5;
  }
  .task {
    display: grid;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid color-mix(in srgb, var(--c) 35%, transparent);
    border-radius: 8px;
    background: color-mix(in srgb, var(--c) 10%, var(--glass));
  }
  .task {
    transition:
      border-color 0.3s,
      background 0.3s;
  }
  .task.solved {
    border-color: color-mix(in srgb, var(--ok) 55%, transparent);
    background: color-mix(in srgb, var(--ok) 10%, var(--glass));
  }
  .ask {
    font-weight: 500;
  }
  .opts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
  .opts button {
    padding: 10px 6px;
    min-height: 48px;
    display: grid;
    place-items: center;
    background: color-mix(in srgb, var(--panel) 55%, transparent);
    font-size: 1.05rem;
  }
  .opts button.ok {
    border-color: var(--ok);
    box-shadow: inset 0 0 0 1px var(--ok);
  }
  .opts button.bad {
    border-color: var(--bad);
    box-shadow: inset 0 0 0 1px var(--bad);
  }
  .opts button:disabled {
    cursor: default;
  }
  .heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .replay {
    padding: 4px 10px;
    font-size: 0.82rem;
    color: var(--muted);
    background: none;
  }
  .replay:hover {
    color: var(--fg);
  }
  .fb {
    color: var(--muted);
    font-size: 0.88rem;
  }
  .fb.good {
    color: var(--ok);
  }
  .fb.good::before {
    content: '✓ ';
    font-weight: 600;
  }
  .nav {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  /* Next says what is still needed, so it takes the room Skip leaves */
  .nav .primary {
    flex: 1 1 auto;
    max-width: 14rem;
  }
  .nav button:disabled {
    opacity: 0.45;
    cursor: default;
  }
</style>
