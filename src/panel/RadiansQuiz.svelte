<!-- A run of Radians questions. Practice (hints, best, missed list) and the Guide's exam (no hints, ten in a row with every type) are the same
     screen on two sessions, so the questions look and answer alike. The shared styles live in quiz.css. -->
<script lang="ts">
  import { EXAM_STREAK, type Session } from '../lib/radians.svelte.ts';
  import { R_TYPES, rChoiceTex, rExplain, rHintMsg, rHintTip, rLabel, rPromptTex, rTask } from '../lib/radiansQuiz.ts';
  import Rich from '../ui/Rich.svelte';
  import Tex from '../ui/Tex.svelte';

  let { session }: { session: Session } = $props();
  let showMissed = $state(false);
  const q = $derived(session.cur);
  const TYPE_NAMES = { 1: 'degrees → radians', 2: 'radians → degrees', 3: 'placing the point' } as const;
</script>

<svelte:window onkeydown={(e) => {
  const t = e.target as HTMLElement;
  if (!q || t.tagName === 'INPUT' || e.metaKey || e.ctrlKey) return;
  if (e.key === 'Enter' && t.tagName !== 'BUTTON') { e.preventDefault(); if (session.answered) session.start(); else session.check(); }
  else if (q.t !== 3 && !session.answered && /^[1-4]$/.test(e.key)) session.answer(+e.key - 1);
}} />

{#if q}
  <section class="quiz" aria-label={session.strict ? 'Radians exam' : 'Radians practice'}>
    <div class="hud">
      {#if session.strict}
        <span class="pill" style="--c:var(--rad)">In a row <b>{session.streak} of {EXAM_STREAK}</b></span>
        {#each R_TYPES as t}<span class="pill seen" class:got={session.seen.includes(t)} style="--c:var(--ok)" title={TYPE_NAMES[t]}>{session.seen.includes(t) ? '✓' : '·'} {TYPE_NAMES[t]}</span>{/each}
      {:else}
        <span class="pill" style="--c:var(--ok)">Streak <b>{session.streak}</b></span>
        <span class="pill" style="--c:var(--slope)">Best <b>{session.best}</b></span>
        <button class="pill" style="--c:var(--bad)" disabled={!session.missed.length} aria-expanded={showMissed} onclick={() => (showMissed = !showMissed)}>Missed <b>{session.missed.length}</b></button>
      {/if}
    </div>
    {#if showMissed && session.missed.length}
      <div class="missed">{#each session.missed as m}<button onclick={() => { session.start(m); showMissed = false; }}><Tex latex={rPromptTex(m)} /></button>{/each}</div>
    {/if}
    <div class="qa" class:split={q.t !== 3}>
      <div class="ask">
        <div>
          <div class="label">{rLabel(q)}</div>
          <div class="prompt"><Tex latex={rPromptTex(q)} /></div>
        </div>
        <p class="task"><Rich parts={rTask(q)} /></p>
      </div>
      {#if q.t !== 3}
        <div class="choices">
          {#each session.choices as c, i}
            <button disabled={session.answered} class:ok={session.answered && c === q.deg} class:bad={session.answered && i === session.picked && c !== q.deg} onclick={() => session.answer(i)}><Tex latex={rChoiceTex(q, c)} /></button>
          {/each}
        </div>
      {/if}
    </div>
    <div class="actions">
      {#if !session.answered}
        {#if q.t === 3}<button class="primary" onclick={() => session.check()}>Check</button>{/if}
        {#if !session.strict}
          {#if session.hint}<p class="hint"><Rich parts={rHintMsg()} /></p>{:else}<button data-tip={rHintTip()} onclick={() => session.useHint()}>Hint</button>{/if}
        {/if}
      {:else}
        <span class="verdict" class:ok={session.ok} class:bad={!session.ok}>
          {session.ok ? (session.hint ? 'Correct, with a hint (streak unchanged)' : 'Correct') : session.strict ? 'Not quite. The count starts again.' : 'Not quite'}
        </span>
        {#if !session.passed}<button class="primary next" onclick={() => session.start()}>Next</button>{/if}
      {/if}
    </div>
    {#if session.answered}<div class="explain">{#each rExplain(q) as line}<p><Rich parts={line} /></p>{/each}</div>{/if}
  </section>
{/if}
