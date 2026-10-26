<!-- The Unit circle guide (see guide/Guide.svelte). Its exam is a strict run of exact values:
     ten in a row, with sin, cos and tan all among them. -->
<script lang="ts">
  import { progress } from '../../core/progress.svelte.ts';
  import { explain, qTex, trigTexAnswer } from './quiz.ts';
  import { setMode, setTopic } from '../../core/state.svelte.ts';
  import { EXAM_FNS, EXAM_STREAK, unitGuide } from './guide.svelte.ts';
  import Rich from '../../ui/Rich.svelte';
  import Tex from '../../ui/Tex.svelte';
  import Guide from '../../guide/Guide.svelte';

  const ex = unitGuide.exam;
  const done = $derived(!!progress.completed.circle);
  const q = $derived(ex.cur);
  const right = $derived(q ? trigTexAnswer(q) : null);
</script>

<svelte:window
  onkeydown={(e) => {
    const t = e.target as HTMLElement;
    if (
      !q ||
      unitGuide.step.task.kind !== 'exam' ||
      t.tagName === 'INPUT' ||
      e.metaKey ||
      e.ctrlKey
    )
      return;
    if (e.key === 'Enter' && t.tagName !== 'BUTTON' && ex.answered && !ex.passed) {
      e.preventDefault();
      ex.start();
    } else if (!ex.answered && /^[1-4]$/.test(e.key)) ex.answer(+e.key - 1);
  }}
/>

<Guide run={unitGuide} label="Unit circle guide" color="var(--cos)">
  {#snippet intro()}
    {#if !progress.completed.radians}
      <p class="note">
        This guide works in degrees, so you can start here. If you would like the angles in radians
        too, the <button class="link" onclick={() => setTopic('radians')}>Radians guide</button> comes
        first.
      </p>
    {/if}
  {/snippet}
  {#snippet exam()}
    {#if q && (!done || ex.passed)}
      <section class="quiz" aria-label="Unit circle exam">
        <div class="hud">
          <span class="pill" style="--c:var(--cos)"
            >In a row <b>{ex.streak} of {EXAM_STREAK}</b></span
          >
          {#each EXAM_FNS as f}<span
              class="pill seen"
              class:got={ex.seen.includes(f)}
              style="--c:var(--ok)">{ex.seen.includes(f) ? '✓' : '·'} {f}</span
            >{/each}
        </div>
        <div class="qa split">
          <div class="ask">
            <div>
              <div class="label">Find the value</div>
              <div class="prompt"><Tex latex={`${qTex(q, progress.unit)}=\\ ?`} /></div>
            </div>
          </div>
          <div class="choices">
            {#each ex.choices as c, k}
              <button
                disabled={ex.answered}
                class:ok={ex.answered && c === right}
                class:bad={ex.answered && k === ex.picked && c !== right}
                onclick={() => ex.answer(k)}><Tex latex={c} /></button
              >
            {/each}
          </div>
        </div>
        {#if ex.answered}
          <div class="actions">
            <span class="verdict" class:ok={ex.ok} class:bad={!ex.ok}
              >{ex.ok ? 'Correct' : 'Not quite. The count starts again.'}</span
            >
            {#if !ex.passed}<button class="primary next" onclick={() => ex.start()}>Next</button
              >{/if}
          </div>
          <div class="explain">
            {#each explain(q, progress.unit) as line}<p><Rich parts={line} /></p>{/each}
          </div>
        {/if}
      </section>
    {/if}
    {#if done}
      <p class="fb">
        The unit circle is complete. Explore keeps the whole figure, and Practice asks for both
        angles that share a value too.
      </p>
      <div class="after">
        <button class="primary" onclick={() => setMode('explore')}>Explore</button><button
          onclick={() => setMode('practice')}>Practice</button
        >
      </div>
    {/if}
  {/snippet}
</Guide>

<style>
  .note {
    margin: 0;
    padding: 8px 12px;
    border-left: 2px solid var(--rad);
    color: var(--muted);
    font-size: 0.85rem;
    line-height: 1.5;
  }
  .link {
    padding: 0;
    border: 0;
    background: none;
    color: var(--rad);
    font: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
  .fb {
    margin: 0;
    font-size: 0.88rem;
    line-height: 1.5;
    color: var(--ok);
  }
  .after {
    display: flex;
    gap: 8px;
  }
</style>
