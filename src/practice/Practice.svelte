<!-- The Practice screen, the same for every topic and for every exam: the run's numbers, the question,
     its choices (or a Check button, when the answer is placing the point), a hint, and why once it
     is answered. Practice runs in sets, each ending in a summary of how it went and what to go over. Practice and the Guide's exam are two sessions on this one screen. A topic says
     what its questions look like through `view`; the styles live in practice.css. -->
<script lang="ts" module>
  import type { Rich as RichText } from '../core/rich.ts';
  /** How a topic's questions read on the Practice screen. */
  export type PracticeView<Q, C> = {
    ariaLabel(strict: boolean): string;
    /** The small heading over the question ("Find the value"). */
    label(q: Q, s: Session<Q, C>): string;
    promptTex(q: Q): string;
    /** A second line under the prompt, when the question has one (a domain). */
    subTex?(q: Q): string | null;
    task(q: Q): RichText;
    choiceTex(q: Q, choice: C): string;
    explain(q: Q): RichText[];
    hintMsg(q: Q): RichText;
    hintTip(q: Q): string;
    /** How a missed question is written on its button. */
    missedTex(q: Q): string;
    /** The exam's checklist: what kinds of question the run needs, by key. */
    checklist?: Record<string, string>;
    /** The color of the exam's "in a row" counter. */
    color: string;
  };
</script>

<script lang="ts" generics="Q, C">
  import type { Snippet } from 'svelte';
  import type { Session } from './session.svelte.ts';
  import Rich from '../ui/Rich.svelte';
  import Tex from '../ui/Tex.svelte';
  import { SET_SIZE } from './skills.ts';

  let {
    session,
    view,
    trailing,
  }: { session: Session<Q, C>; view: PracticeView<Q, C>; trailing?: Snippet } = $props();
  let showMissed = $state(false);
  const q = $derived(session.cur);
  const placing = $derived(!session.choices.length);
</script>

<svelte:window
  onkeydown={(e) => {
    const t = e.target as HTMLElement;
    if (!q || t.tagName === 'INPUT' || e.metaKey || e.ctrlKey) return;
    if (e.key === 'Enter' && t.tagName !== 'BUTTON') {
      e.preventDefault();
      if (!session.answered) session.check();
      else if (!session.passed) session.next();
    } else if (!placing && !session.answered && /^[1-4]$/.test(e.key)) session.answer(+e.key - 1);
  }}
/>

{#snippet verdict()}
  {#if session.ok}
    {session.retried
      ? 'Correct on the second try (streak unchanged)'
      : session.hint
        ? 'Correct, with a hint (streak unchanged)'
        : 'Correct'}
  {:else}
    {session.strict ? 'Not quite. The count starts again.' : 'Not quite. The streak starts again.'}
  {/if}
{/snippet}

{#if q}
  <section class="quiz" aria-label={view.ariaLabel(session.strict)}>
    <div class="hud">
      {#if session.strict}
        <span class="pill" style="--c:{view.color}"
          >In a row <b>{session.streak} of {session.examStreak}</b></span
        >
        {#each session.needs as n}<span
            class="pill seen"
            class:got={session.seen.includes(n)}
            style="--c:var(--ok)"
            >{session.seen.includes(n) ? '✓' : '·'} {view.checklist?.[n] ?? n}</span
          >{/each}
      {:else}
        <span class="pill" style="--c:var(--cos)"
          >Set <b>{session.round.length} of {SET_SIZE}</b></span
        >
        <span class="pill" style="--c:var(--ok)">Streak <b>{session.streak}</b></span>
        <span class="pill" style="--c:var(--slope)">Best <b>{session.best}</b></span>
        <button
          class="pill"
          style="--c:var(--bad)"
          disabled={!session.missed.length}
          aria-expanded={showMissed}
          onclick={() => (showMissed = !showMissed)}>Missed <b>{session.missed.length}</b></button
        >
      {/if}
      {@render trailing?.()}
    </div>
    {#if session.summary}
      {@const got = session.round.filter((r) => r.ok && !r.retried).length}
      {@const second = session.round.filter((r) => r.ok && r.retried).length}
      <div class="summary">
        <div>
          <div class="label">Set complete</div>
          <div class="score">
            <b>{got}</b> of {session.round.length} right first time
          </div>
          {#if second}<p class="sub">{second} more right on a second try.</p>{/if}
        </div>
        {#if session.review.length}
          <div>
            <div class="label">To go over</div>
            <div class="missed">
              {#each session.review as r}<span class="chip" class:bad={!r.ok}
                  ><Tex latex={view.missedTex(r.q)} /><small>{r.skill}</small></span
                >{/each}
            </div>
          </div>
        {/if}
        <div>
          <div class="label">Weakest skills</div>
          {#if session.weakest.length}
            <ul class="skills">
              {#each session.weakest as w}
                <li>
                  <span>{w.name}</span>
                  <span class="bar" style="--p:{(100 * w.right) / (w.right + w.wrong)}%"></span>
                  <span class="n">{w.right} of {w.right + w.wrong}</span>
                </li>
              {/each}
            </ul>
          {:else}<p class="sub">No weak spots so far.</p>{/if}
        </div>
        <div class="actions">
          <button class="primary" onclick={() => session.start()}>Another set</button>
          {#if session.review.length}<button onclick={() => session.practiceReview()}
              >Practise these first</button
            >{/if}
        </div>
      </div>
    {:else}
      {#if showMissed && session.missed.length}
        <div class="missed">
          {#each session.missed as m}<button
              onclick={() => {
                session.start(m);
                showMissed = false;
              }}><Tex latex={view.missedTex(m)} /></button
            >{/each}
        </div>
      {/if}
      <div class="qa" class:split={!placing}>
        <div class="ask">
          <div>
            <div class="label">{view.label(q, session)}</div>
            <div class="prompt"><Tex latex={view.promptTex(q)} /></div>
            {#if view.subTex?.(q)}<div class="domain"><Tex latex={view.subTex(q)!} /></div>{/if}
          </div>
          <p class="task"><Rich parts={view.task(q)} /></p>
        </div>
        {#if !placing}
          <div class="choices">
            {#each session.choices as c, i}
              <button
                disabled={session.answered || session.wrongPicks.includes(i)}
                class:ok={session.answered && session.isRight(c)}
                class:bad={session.wrongPicks.includes(i)}
                onclick={() => session.answer(i)}><Tex latex={view.choiceTex(q, c)} /></button
              >
            {/each}
          </div>
        {/if}
      </div>
      <div class="actions">
        {#if !session.answered}
          {#if placing}<button class="primary" onclick={() => session.check()}>Check</button>{/if}
          {#if !session.strict}
            {#if session.hint}<p class="hint"><Rich parts={view.hintMsg(q)} /></p>
            {:else}<button data-tip={view.hintTip(q)} onclick={() => session.useHint()}>Hint</button
              >{/if}
          {/if}
          {#if session.note}<p class="hint"><Rich parts={session.note} /></p>{/if}
        {:else}
          <span class="verdict" class:ok={session.ok} class:bad={!session.ok}>
            {@render verdict()}
          </span>
          {#if !session.passed}<button class="primary next" onclick={() => session.next()}
              >{session.setFull ? 'See summary' : 'Next'}</button
            >{/if}
        {/if}
      </div>
      {#if session.answered}<div class="explain">
          {#each view.explain(q) as line}<p><Rich parts={line} /></p>{/each}
        </div>{/if}
    {/if}
  </section>
{/if}
