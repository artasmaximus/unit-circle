<!-- The solver card: a problem like csc θ = 2, rewritten one step at a time with operations
     picked on the drum, until sin, cos or tan stands alone; then both angles are found on the
     circle. Vertical, so it fits the panel (in place of the definitions) or a column of its own
     on very wide screens. -->
<script lang="ts">
  import { DUR } from '../core/tuning.ts';
  import { fly } from 'svelte/transition';
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
  import Shrink from '@lucide/svelte/icons/shrink';
  import Replace from '@lucide/svelte/icons/replace';
  import XIcon from '@lucide/svelte/icons/x';
  import Undo2 from '@lucide/svelte/icons/undo-2';
  import X from '@lucide/svelte/icons/x';
  import { solver } from './solver.svelte.ts';
  import { changes, eqTex, exactTex, type Op } from './algebra.ts';
  import Tex, { PROSE } from '../ui/Tex.svelte';
  import Rich from '../ui/Rich.svelte';
  import { morph } from '../core/transition.ts';

  let { bare = false }: { bare?: boolean } = $props();

  // operations are keys: press one and it happens, no separate Apply step. Keys 1-8 work too.
  type Key = { op: Op | 'undo'; label: string; icon: typeof XIcon; mono?: boolean };
  const KEYS: Key[] = [
    { op: { kind: 'reciprocal' }, label: 'Flip both sides', icon: ArrowUpDown },
    { op: { kind: 'simplify' }, label: 'Simplify', icon: Shrink },
    { op: { kind: 'inSinCos' }, label: 'Write in sin & cos', icon: Replace },
    { op: { kind: 'times', by: 'sin' }, label: 'sin θ', icon: XIcon, mono: true },
    { op: { kind: 'times', by: 'cos' }, label: 'cos θ', icon: XIcon, mono: true },
    { op: { kind: 'times', by: 'tan' }, label: 'tan θ', icon: XIcon, mono: true },
    { op: { kind: 'times', by: 2 }, label: '2', icon: XIcon, mono: true },
    { op: 'undo', label: 'Undo', icon: Undo2 },
  ];
  const enabled = (k: Key) =>
    k.op === 'undo' ? solver.steps.length > 1 : !!solver.current && changes(solver.current, k.op);
  const press = (k: Key) => {
    if (!enabled(k)) return;
    if (k.op === 'undo') solver.undo();
    else solver.apply(k.op, k.mono ? `× ${k.label}` : k.label);
    navigator.vibrate?.(6);
  };
  const fn = $derived(solver.target ? `\\${solver.target.fn}\\theta` : '');

  const onkeydown = (e: KeyboardEvent) => {
    if (!solver.open) return;
    if (e.key === 'Escape') return morph(() => solver.close());
    if (!solver.target && /^[1-8]$/.test(e.key)) return press(KEYS[+e.key - 1]);
    if (e.key !== 'Enter' || (e.target as HTMLElement).tagName === 'BUTTON') return;
    e.preventDefault();
    if (solver.done) solver.next();
    else if (solver.target) solver.check();
  };
</script>

<svelte:window {onkeydown} />

{#if solver.current}
  <section class="card" class:bare aria-label="Solve" in:fly={{ y: 12, duration: bare ? 0 : 260 }}>
    <header>
      <span class="eyebrow">{solver.target ? 'Find θ on the circle' : 'Solve for θ'}</span>
      <button class="icon" aria-label="Close" onclick={() => morph(() => solver.close())}
        ><X size={16} /></button
      >
    </header>

    {#if !solver.target}
      <ol class="steps">
        {#each solver.steps as s, i (i)}
          <li in:fly={{ y: -14, duration: DUR.base }}>
            {#if i}<span class="op">{s.label}</span>{/if}
            <span class="m" class:now={i === solver.steps.length - 1}
              ><Tex latex={eqTex(s.eq)} /></span
            >
          </li>
        {/each}
      </ol>
      <div class="keys">
        {#each KEYS as k, i}
          {@const Icon = k.icon}
          {#if i === 3}<span class="times">Multiply both sides by</span>{/if}
          <button
            class="key"
            class:mono={k.mono}
            disabled={!enabled(k)}
            onclick={() => press(k)}
            title="Key {i + 1}"
          >
            <Icon size={k.mono ? 13 : 16} /><span>{k.label}</span><kbd>{i + 1}</kbd>
          </button>
        {/each}
      </div>
    {:else}
      <div class="find">
        <span class="m now"><Tex latex={eqTex(solver.current)} /></span>
        {#if solver.done}
          <p class="ok">
            Solved: <Tex
              latex={`\\theta=${solver.sols.map((a) => a + '^\\circ').join(',\\ ')}`}
              scale={PROSE}
            />
          </p>
          <button class="primary" onclick={() => solver.next()}>Next problem</button>
        {:else}
          <p>
            Drag the point to an angle where <Tex
              latex={`${fn}=${exactTex(solver.target.v)}`}
              scale={PROSE}
            />, then Check. There are two. <Rich parts={solver.note} />
          </p>
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
    box-sizing: border-box;
    display: grid;
    gap: 16px;
    align-content: start;
    padding: 14px 18px 20px;
    border: 1px solid color-mix(in srgb, var(--slope) 45%, transparent);
    border-radius: 20px;
    background: color-mix(in srgb, var(--panel) 45%, transparent);
    -webkit-backdrop-filter: blur(6px) saturate(1.2);
    backdrop-filter: blur(6px) saturate(1.2);
    box-shadow: 0 24px 60px -24px var(--sh);
  }
  .bare {
    border: 0;
    background: none;
    box-shadow: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .eyebrow,
  .op {
    font-size: 0.7rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .icon {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    padding: 0;
    background: transparent;
  }
  .steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 10px;
  }
  .steps li {
    display: grid;
    gap: 2px;
  }
  .m {
    font-size: 1rem;
    opacity: 0.55;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .m.now {
    font-size: 1.45rem;
    opacity: 1;
  }
  .keys {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid var(--line);
  }
  .times {
    grid-column: 1 / -1;
    margin-top: 6px;
    font-size: 0.7rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--muted);
  }
  /* keycaps: a lip underneath that the key presses down into */
  .key {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 12px;
    text-align: left;
    font-size: 0.92rem;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: color-mix(in srgb, var(--panel) 85%, transparent);
    color: var(--fg);
    box-shadow: 0 3px 0 var(--line);
    transition:
      transform var(--dur-blink),
      box-shadow var(--dur-blink),
      border-color var(--dur-quick);
  }
  .key:hover:not(:disabled) {
    border-color: var(--slope);
    box-shadow: 0 3px 0 color-mix(in srgb, var(--slope) 60%, var(--line));
  }
  .key:active:not(:disabled) {
    transform: translateY(3px);
    box-shadow: 0 0 0 transparent;
  }
  .key :global(svg) {
    flex: none;
    color: var(--slope);
  }
  .key span {
    flex: 1;
    min-width: 0;
  }
  .key.mono span {
    font-family: 'CMmain', 'Latin Modern Roman', Georgia, serif;
    font-size: 1.05rem;
  }
  .key kbd {
    font: inherit;
    font-size: 0.68rem;
    color: var(--muted);
  }
  .key:disabled {
    opacity: 0.35;
    box-shadow: none;
    cursor: default;
  }
  .find {
    display: grid;
    gap: 12px;
    justify-items: start;
  }
  .find p {
    margin: 0;
    line-height: 1.5;
    color: var(--muted);
  }
  .find .ok {
    color: var(--ok);
    font-weight: 500;
  }
  .row {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .count {
    color: var(--muted);
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
  }
</style>
