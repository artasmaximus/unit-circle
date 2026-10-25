<!-- The Inverse trig quiz: the same shape as the unit circle quiz (streak, a prompt, choices,
     hint, why), with its own questions. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { invQuiz as quiz } from '../lib/inverseQuiz.svelte.ts';
  import { angleTex } from '../lib/angles.ts';
  import { progress } from '../lib/progress.svelte.ts';
  import {
    NOUN,
    answerOf,
    domainTex,
    explain,
    hintMsg,
    hintTip,
    qTex,
    task,
  } from '../lib/inverseQuiz.ts';
  import Tex from '../ui/Tex.svelte';
  import Rich from '../ui/Rich.svelte';

  let { trailing }: { trailing?: Snippet } = $props();
  let showMissed = $state(false);
  const q = $derived(quiz.cur);
  const unit = $derived(progress.unit);
  const right = $derived(q && q.t !== 3 ? answerOf(q) : null);
  const named = $derived(q?.t === 3 ? `Set the ${NOUN[q.fn]}` : 'Find the angle');
</script>

<svelte:window
  onkeydown={(e) => {
    const t = e.target as HTMLElement;
    if (!q || t.tagName === 'INPUT' || e.metaKey || e.ctrlKey) return;
    if (e.key === 'Enter' && t.tagName !== 'BUTTON') {
      e.preventDefault();
      if (quiz.answered) quiz.start();
      else quiz.check();
    } else if (q.t !== 3 && !quiz.answered && /^[1-4]$/.test(e.key)) quiz.answer(+e.key - 1);
  }}
/>

{#if q}
  <section class="quiz" aria-label="Inverse trig practice">
    <div class="hud">
      <span class="pill" style="--c:var(--ok)">Streak <b>{quiz.streak}</b></span>
      <span class="pill" style="--c:var(--slope)">Best <b>{quiz.best}</b></span>
      <button
        class="pill"
        style="--c:var(--bad)"
        disabled={!quiz.missed.length}
        aria-expanded={showMissed}
        onclick={() => (showMissed = !showMissed)}>Missed <b>{quiz.missed.length}</b></button
      >
      {@render trailing?.()}
    </div>
    {#if showMissed && quiz.missed.length}
      <div class="missed">
        {#each quiz.missed as m}<button
            onclick={() => {
              quiz.start(m);
              showMissed = false;
            }}><Tex latex={qTex(m, unit)} /></button
          >{/each}
      </div>
    {/if}
    <div class="qa" class:split={q.t !== 3}>
      <div class="ask">
        <div>
          <div class="label">{named}</div>
          <div class="prompt">
            <Tex latex={q.t === 3 ? qTex(q, unit) : `${qTex(q, unit)}=\\ ?`} />
          </div>
          {#if q.t === 2}<div class="domain"><Tex latex={domainTex(q.dom, unit)} /></div>{/if}
        </div>
        <p class="task"><Rich parts={task(q, unit)} /></p>
      </div>
      {#if q.t !== 3}
        <div class="choices">
          {#each quiz.choices as c, i}
            <button
              disabled={quiz.answered}
              class:ok={quiz.answered && c === right}
              class:bad={quiz.answered && i === quiz.picked && c !== right}
              onclick={() => quiz.answer(i)}><Tex latex={angleTex(c, unit)} /></button
            >
          {/each}
        </div>
      {/if}
    </div>
    <div class="actions">
      {#if !quiz.answered}
        {#if q.t === 3}<button class="primary" onclick={() => quiz.check()}>Check</button>{/if}
        {#if quiz.hint}<p class="hint"><Rich parts={hintMsg(q, unit)} /></p>
        {:else}<button data-tip={hintTip(q)} onclick={() => quiz.useHint()}>Hint</button>{/if}
      {:else}
        <span class="verdict" class:ok={quiz.ok} class:bad={!quiz.ok}
          >{quiz.ok
            ? quiz.hint
              ? 'Correct, with a hint (streak unchanged)'
              : 'Correct'
            : 'Not quite'}</span
        >
        <button class="primary next" onclick={() => quiz.start()}>Next</button>
      {/if}
    </div>
    {#if quiz.answered}<div class="explain">
        {#each explain(q, unit) as line}<p><Rich parts={line} /></p>{/each}
      </div>{/if}
  </section>
{/if}

<style>
  .quiz {
    display: grid;
    gap: 16px;
    container-type: inline-size;
  }
  .qa,
  .ask {
    display: grid;
    gap: 16px;
  }
  .ask {
    align-content: start;
  }
  .hud {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  .pill {
    box-sizing: border-box;
    height: 30px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 13px;
    border: 1px solid color-mix(in srgb, var(--c) 45%, var(--line));
    border-radius: 999px;
    background: color-mix(in srgb, var(--c) 10%, transparent);
    color: var(--muted);
    font-size: 0.85rem;
    line-height: 1;
    white-space: nowrap;
  }
  .pill b {
    font-weight: 600;
    color: var(--c);
    font-variant-numeric: tabular-nums;
  }
  button.pill:hover {
    border-color: var(--c);
  }
  button.pill:disabled {
    opacity: 0.55;
    cursor: default;
  }
  button.pill[aria-expanded='true'] {
    background: color-mix(in srgb, var(--c) 18%, transparent);
    color: var(--muted);
  }
  .missed {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .label {
    font-size: 0.72rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 4px;
  }
  .prompt {
    font-size: 1.7rem;
    min-height: 2.4rem;
    display: flex;
    align-items: center;
  }
  .domain {
    margin-top: 2px;
    color: var(--muted);
    font-size: 1rem;
  }
  .task {
    margin: 0;
    font-size: 1rem;
    line-height: 1.45;
    max-width: 62ch;
  }
  .choices {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  @container (min-width: 520px) {
    .choices {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
  .choices button {
    padding: 14px 8px;
    font-size: 1.2rem;
    min-height: 68px;
    display: grid;
    place-items: center;
    background: var(--panel);
  }
  .choices button:disabled {
    cursor: default;
  }
  .choices button.ok {
    border-color: var(--ok);
    box-shadow: inset 0 0 0 1px var(--ok);
  }
  .choices button.bad {
    border-color: var(--bad);
    box-shadow: inset 0 0 0 1px var(--bad);
  }
  .actions {
    position: relative;
    display: flex;
    gap: 10px 12px;
    align-items: center;
    flex-wrap: wrap;
    min-height: 44px;
  }
  .hint {
    flex: 1;
    min-width: 12rem;
    margin: 0;
    color: var(--muted);
    font-size: 0.85rem;
    line-height: 1.45;
    border-left: 2px solid var(--slope);
    padding-left: 10px;
  }
  .verdict {
    font-weight: 500;
  }
  .verdict.ok {
    color: var(--ok);
  }
  .verdict.bad {
    color: var(--bad);
  }
  .next {
    margin-left: auto;
  }
  .explain {
    display: grid;
    gap: 8px;
    padding-top: 14px;
    border-top: 1px solid var(--line);
    line-height: 1.5;
  }
  .explain p {
    margin: 0;
    overflow-x: auto;
    overflow-y: hidden;
  }
  @media not ((min-width: 700px) and (min-aspect-ratio: 1/1)) {
    .quiz {
      gap: 10px;
    }
    .qa,
    .ask {
      gap: 10px;
    }
    .qa.split {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
      gap: 12px;
      align-items: start;
    }
    .qa.split .choices {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .pill {
      height: 26px;
      padding: 0 10px;
      font-size: 0.78rem;
    }
    .prompt {
      font-size: 1.35rem;
      min-height: 0;
    }
    .task {
      font-size: 0.88rem;
      line-height: 1.4;
    }
    .choices {
      gap: 8px;
    }
    .choices button {
      min-height: 50px;
      padding: 8px;
      font-size: 1.05rem;
    }
    .actions {
      min-height: 0;
    }
  }
</style>
