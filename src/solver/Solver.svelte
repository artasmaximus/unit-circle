<!-- The solver card: a problem like csc θ = 2, rewritten one step at a time with operations picked on
     the drum, until sin, cos or tan stands alone; then both angles are found on the circle.
     Vertical, so it fits the panel (in place of the definitions) or a column of its own on very wide screens. -->
<script lang="ts">
  import { fly } from 'svelte/transition';
  import ArrowDown from '@lucide/svelte/icons/arrow-down';
  import X from '@lucide/svelte/icons/x';
  import { solver } from '../lib/state.svelte.ts';
  import { changes, eqTex, exactTex, type Op } from '../lib/algebra.ts';
  import Tex from '../ui/Tex.svelte';
  import Picker from './Picker.svelte';

  type Choice = Op | 'undo';
  const OPS: [Op, string][] = [
    [{ kind: 'reciprocal' }, 'Reciprocal of both sides'],
    [{ kind: 'simplify' }, 'Simplify'],
    [{ kind: 'inSinCos' }, 'Write in sin & cos'],
    [{ kind: 'times', by: 'sin' }, '× sin θ'],
    [{ kind: 'times', by: 'cos' }, '× cos θ'],
    [{ kind: 'times', by: 'tan' }, '× tan θ'],
    [{ kind: 'times', by: 2 }, '× 2'],
  ];
  let pick = $state(0);
  const items = $derived(solver.current ? [
    ...OPS.map(([op, label]) => ({ label, value: op as Choice, disabled: !changes(solver.current!, op) })),
    { label: 'Undo', value: 'undo' as Choice, disabled: solver.steps.length < 2 },
  ] : []);
  const run = (c: Choice) => {
    if (c === 'undo') return solver.undo();
    const it = items.find((x) => x.value === c);
    if (it && !it.disabled) solver.apply(c, it.label);
  };
  const fn = $derived(solver.target ? `\\${solver.target.fn}\\theta` : '');

  const onkeydown = (e: KeyboardEvent) => {
    if (!solver.open) return;
    if (e.key === 'Escape') return solver.close();
    if (e.key !== 'Enter' || (e.target as HTMLElement).tagName === 'BUTTON') return;
    e.preventDefault();
    if (solver.done) solver.next();
    else if (solver.target) solver.check();
    else if (items[pick]) run(items[pick].value);
  };
</script>

<svelte:window {onkeydown} />

{#if solver.current}
  <section class="card" aria-label="Solve" in:fly={{ y: 12, duration: 260 }}>
    <header>
      <span class="eyebrow">{solver.target ? 'Find θ on the circle' : 'Solve for θ'}</span>
      <button class="icon" aria-label="Close" onclick={() => solver.close()}><X size={16} /></button>
    </header>

    {#if !solver.target}
      <ol class="steps">
        {#each solver.steps as s, i (i)}
          <li in:fly={{ y: -14, duration: 260 }}>
            {#if i}<span class="op">{s.label}</span>{/if}
            <span class="m" class:now={i === solver.steps.length - 1}><Tex latex={eqTex(s.eq)} /></span>
          </li>
        {/each}
      </ol>
      <div class="controls">
        <Picker {items} bind:index={pick} onpick={run} />
        <div class="apply">
          <span class="lbl">Apply</span>
          <button class="go" aria-label="Apply {items[pick]?.label}" disabled={!items[pick] || items[pick].disabled} onclick={() => items[pick] && run(items[pick].value)}><ArrowDown size={20} /></button>
          <kbd>Enter</kbd>
        </div>
      </div>
    {:else}
      <div class="find">
        <span class="m now"><Tex latex={eqTex(solver.current)} /></span>
        {#if solver.done}
          <p class="ok">Solved: <Tex latex={`\\theta=${solver.sols.map((a) => a + '^\\circ').join(',\\ ')}`} /></p>
          <button class="primary" onclick={() => solver.next()}>Next problem</button>
        {:else}
          <p>Drag the point to an angle where <Tex latex={`${fn}=${exactTex(solver.target.v)}`} />, then Check. There are two. {solver.note}</p>
          <div class="row">
            <button class="primary" onclick={() => solver.check()}>Check</button>
            <button onclick={() => solver.undo()}>Back</button>
            <span class="count">{solver.found.length} of {solver.sols.length}</span>
          </div>
        {/if}
      </div>
    {/if}
  </section>
{/if}

<style>
  .card {
    box-sizing: border-box; display: grid; gap: 16px; align-content: start; padding: 14px 18px 20px;
    border: 1px solid color-mix(in srgb, var(--slope) 45%, transparent); border-radius: 20px;
    background: color-mix(in srgb, var(--panel) 70%, transparent);
    -webkit-backdrop-filter: blur(22px) saturate(1.2); backdrop-filter: blur(22px) saturate(1.2);
    box-shadow: 0 24px 60px -24px var(--sh);
  }
  header { display: flex; justify-content: space-between; align-items: center; }
  .eyebrow, .op, .lbl { font-size: 0.7rem; letter-spacing: 0.09em; text-transform: uppercase; color: var(--muted); }
  .icon { display: grid; place-items: center; width: 30px; height: 30px; padding: 0; background: transparent; }
  .steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
  .steps li { display: grid; gap: 2px; }
  .m { font-size: 1rem; opacity: 0.55; overflow-x: auto; overflow-y: hidden; }
  .m.now { font-size: 1.45rem; opacity: 1; }
  .controls { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; align-items: center; border-top: 1px solid var(--line); padding-top: 8px; }
  .apply { display: grid; justify-items: center; gap: 6px; }
  kbd { font: inherit; font-size: 0.72rem; color: var(--muted); }
  .go {
    display: grid; place-items: center; width: 60px; height: 40px; padding: 0; border: 0; border-radius: 10px;
    background: var(--slope); color: #1b1300; box-shadow: 0 3px 0 color-mix(in srgb, var(--slope) 55%, #000);
    transition: transform 0.08s, box-shadow 0.08s;
  }
  .go:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 0 0 transparent; }
  .go:disabled { opacity: 0.35; cursor: default; }
  .find { display: grid; gap: 12px; justify-items: start; }
  .find p { margin: 0; line-height: 1.5; color: var(--muted); }
  .find .ok { color: var(--ok); font-weight: 500; }
  .row { display: flex; gap: 10px; align-items: center; }
  .count { color: var(--muted); font-size: 0.85rem; font-variant-numeric: tabular-nums; }
</style>
