<!-- The interactive demo: a frosted card, top-aligned over the plane, that grows down one step at a time.
     Pick an operation on the drum and Apply it (Enter) until sin, cos or tan stands alone; then the card
     shrinks back and the circle finishes the job. -->
<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { fly, fade } from 'svelte/transition';
  import ArrowDown from '@lucide/svelte/icons/arrow-down';
  import X from '@lucide/svelte/icons/x';
  import SquareFunction from '@lucide/svelte/icons/square-function';
  import { camera } from '../lib/camera.svelte.ts';
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

  const GAP = 24;
  // while you find θ, the compact card claims the top of the plane so the whole circle fits below it
  let cardH = $state(0);
  $effect(() => { camera.top = solver.open && solver.target ? cardH + GAP : 0; });
  const box = $derived.by(() => {
    const f = camera.free, w = Math.min(780, f.w - GAP * 2);
    return `left:${f.x + (f.w - w) / 2}px;width:${w}px;max-height:${camera.vh - camera.inset.bottom - GAP * 2}px`;
  });
  const fn = $derived(solver.target ? `\\${solver.target.fn}\\theta` : '');

  /** Grow out of the card that was clicked. */
  function fromCard(node: Element) {
    const from = solver.from, to = node.getBoundingClientRect();
    if (!from || !to.width) return { duration: 0 };
    const dx = from.left - to.left, dy = from.top - to.top, sx = from.width / to.width, sy = from.height / to.height;
    return { duration: 420, easing: cubicOut, css: (t: number, u: number) =>
      `transform-origin:0 0;transform:translate(${dx * u}px,${dy * u}px) scale(${1 + (sx - 1) * u},${1 + (sy - 1) * u});opacity:${Math.min(1, t * 2.5)}` };
  }
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

{#if solver.open && solver.current}
  <section class="card" class:compact={!!solver.target} style={box} bind:clientHeight={cardH} aria-label="Solve" in:fromCard out:fade={{ duration: 160 }}>
    <header>
      <span class="eyebrow">{solver.target ? 'Find θ on the circle' : 'Solve for θ'}</span>
      <button class="icon" aria-label="Close" onclick={() => solver.close()}><X size={16} /></button>
    </header>

    {#if !solver.target}
      <div class="work">
        <ol class="steps">
          {#each solver.steps as s, i (i)}
            <li in:fly={{ y: -14, duration: 260 }}>
              {#if i}<span class="op">{s.label}</span>{/if}
              <span class="m" class:now={i === solver.steps.length - 1}><Tex latex={eqTex(s.eq)} /></span>
            </li>
          {/each}
        </ol>
        <div class="apply">
          <span class="lbl">Apply</span>
          <kbd>Enter</kbd>
          <button class="go" aria-label="Apply {items[pick]?.label}" disabled={!items[pick] || items[pick].disabled} onclick={() => items[pick] && run(items[pick].value)}><ArrowDown size={20} /></button>
        </div>
        <Picker {items} bind:index={pick} onpick={run} />
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

{#if solver.open}
  <button class="badge" style:left="{camera.free.x + 16}px" style:bottom="{camera.inset.bottom + 16}px" title="Leave the demo" onclick={() => solver.close()} transition:fade={{ duration: 150 }}>
    <span class="f"><SquareFunction size={16} /></span><span class="pill">interactive demo</span>
  </button>
{/if}

<style>
  .card {
    position: fixed; z-index: 3; top: max(24px, env(safe-area-inset-top, 0px)); box-sizing: border-box; overflow-y: auto;
    display: grid; gap: 18px; padding: 18px 22px 24px;
    border: 1px solid color-mix(in srgb, var(--slope) 45%, transparent); border-radius: 22px;
    background: color-mix(in srgb, var(--panel) 62%, transparent);
    -webkit-backdrop-filter: blur(22px) saturate(1.2); backdrop-filter: blur(22px) saturate(1.2);
    box-shadow: 0 30px 70px -24px var(--sh);
  }
  .compact { gap: 12px; }
  header { display: flex; justify-content: space-between; align-items: center; }
  .eyebrow, .op, .lbl { font-size: 0.7rem; letter-spacing: 0.09em; text-transform: uppercase; color: var(--muted); }
  .icon { display: grid; place-items: center; width: 30px; height: 30px; padding: 0; background: transparent; }
  .work { display: grid; grid-template-columns: minmax(0, 1.2fr) auto minmax(0, 1fr); gap: 28px; align-items: start; }
  @media (max-width: 640px) { .work { grid-template-columns: 1fr auto; } .work :global(.picker) { grid-column: 1 / -1; } }
  .steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
  .steps li { display: grid; gap: 2px; }
  .m { font-size: 1.05rem; opacity: 0.55; overflow-x: auto; overflow-y: hidden; }
  .m.now { font-size: 1.5rem; opacity: 1; }
  .apply { display: grid; justify-items: center; gap: 4px; margin-top: 76px; }
  kbd { font: inherit; font-size: 0.72rem; color: var(--muted); }
  .go {
    display: grid; place-items: center; width: 64px; height: 40px; margin-top: 4px; padding: 0; border: 0; border-radius: 10px;
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
  .badge { position: fixed; z-index: 3; display: flex; gap: 8px; padding: 0; border: 0; background: none; color: var(--slope); }
  .f, .pill { display: grid; place-items: center; height: 34px; border: 1px solid color-mix(in srgb, var(--slope) 60%, transparent); border-radius: 8px; background: color-mix(in srgb, var(--bg) 70%, transparent); }
  .f { width: 34px; }
  .pill { padding: 0 14px; font-size: 0.95rem; }
  .badge:hover .pill, .badge:hover .f { border-color: var(--slope); }
</style>
