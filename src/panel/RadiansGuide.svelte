<!-- The Radians guide: one step at a time, with what to read, what to do, and a way back or on. It never holds the learner (Explore is a click
     away); its exam is how the topic is completed. -->
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { progress } from '../lib/progress.svelte.ts';
  import { radians } from '../lib/radians.svelte.ts';
  import { setMode } from '../lib/state.svelte.ts';
  import Rich from '../ui/Rich.svelte';
  import Tex from '../ui/Tex.svelte';
  import RadiansQuiz from './RadiansQuiz.svelte';

  const s = $derived(radians.step), t = $derived(s.task), n = $derived(radians.steps.length), i = $derived(radians.stepIndex);
  const done = $derived(!!progress.completed.radians);
</script>

<section class="guide" aria-label="Radians guide">
  <div class="top">
    <div class="dots" role="progressbar" aria-valuemin={1} aria-valuemax={n} aria-valuenow={i + 1} aria-label="Step {i + 1} of {n}">
      {#each radians.steps as _, k}<span class="dot" class:now={k === i} class:past={k < i}></span>{/each}
    </div>
    <button class="skip" onclick={() => setMode('explore')}>Skip to Explore</button>
  </div>

  {#key s.id}
    <div class="step" in:fly={{ y: 10, duration: 260, delay: 120, easing: cubicOut }}>
      <h2>{s.title}</h2>
      {#each s.say as para}<p><Rich parts={para} /></p>{/each}

      {#if t.kind === 'choice'}
        <div class="task">
          <p class="ask"><Rich parts={t.prompt} /></p>
          <div class="opts">
            {#each t.choices as c, k}
              <button class:ok={radians.solved && k === t.answer} class:bad={radians.chosen === k && k !== t.answer} disabled={radians.solved} onclick={() => radians.choose(k)}><Tex latex={c} /></button>
            {/each}
          </div>
          {#if radians.solved}<p class="fb good"><Rich parts={t.right} /></p>
          {:else if radians.chosen !== null}<p class="fb"><Rich parts={t.wrong} /></p>{/if}
        </div>
      {:else if t.kind === 'drag'}
        <div class="task">
          <p class="ask"><Rich parts={t.prompt} /></p>
          {#if radians.solved}<p class="fb good"><Rich parts={t.right} /></p>{:else}<p class="fb">Drag the point round the edge of the circle.</p>{/if}
        </div>
      {:else if t.kind === 'exam'}
        <!-- the run stays on screen through its last answer; coming back later, only the result shows -->
        {#if !done || radians.exam.passed}<RadiansQuiz session={radians.exam} />{/if}
        {#if done}
          <p class="fb good">Radians is complete. The ° | rad switch in the corner is unlocked, so every angle in the app can be shown in radians.</p>
          <div class="after"><button class="primary" onclick={() => setMode('explore')}>Explore</button><button onclick={() => setMode('practice')}>Practice</button></div>
        {/if}
      {/if}
    </div>
  {/key}

  <div class="nav">
    <button onclick={() => radians.back()} disabled={i === 0}>Back</button>
    {#if i < n - 1}<button class="primary" onclick={() => radians.next()} disabled={!radians.canGo}>Next</button>{/if}
  </div>
</section>

<style>
  .guide { display: grid; gap: 14px; --c: var(--rad); }
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
  .opts button { padding: 10px 6px; min-height: 48px; display: grid; place-items: center; background: var(--panel); font-size: 1.05rem; }
  .opts button.ok { border-color: var(--ok); box-shadow: inset 0 0 0 1px var(--ok); }
  .opts button.bad { border-color: var(--bad); box-shadow: inset 0 0 0 1px var(--bad); }
  .opts button:disabled { cursor: default; }
  .fb { color: var(--muted); font-size: 0.88rem; }
  .fb.good { color: var(--ok); }
  .after { display: flex; gap: 8px; }
  .nav { display: flex; justify-content: space-between; gap: 10px; }
  .nav button:disabled { opacity: 0.45; cursor: default; }
</style>
