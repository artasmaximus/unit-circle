<!-- Equation workshop: apply an operation to both sides of csc, sec or cot's definition and watch it change. -->
<script lang="ts">
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
  import Replace from '@lucide/svelte/icons/replace';
  import Shrink from '@lucide/svelte/icons/shrink';
  import Undo2 from '@lucide/svelte/icons/undo-2';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import X from '@lucide/svelte/icons/x';
  import { point, workshop, type RecipKey } from '../lib/state.svelte.ts';
  import { changes, eqTex, isIdentity, type Atom, type Op } from '../lib/algebra.ts';
  import { recipTex } from '../lib/trig.ts';
  import Tex from '../ui/Tex.svelte';

  const KEYS: RecipKey[] = ['csc', 'sec', 'cot'];
  // Easy mode offers only factors that lead somewhere; hard mode offers all of them, dead ends included.
  const EASY: Record<RecipKey, (Atom | 2)[]> = { csc: ['sin'], sec: ['cos'], cot: ['tan', 'sin', 'cos'] };
  const ALL: (Atom | 2)[] = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot', 2];
  const name = (f: Atom | 2) => (f === 2 ? '2' : `${f} θ`);
  const OPS: { op: Op; label: string; icon: typeof X }[] = [
    { op: { kind: 'reciprocal' }, label: 'Reciprocal', icon: ArrowUpDown },
    { op: { kind: 'inSinCos' }, label: 'Write in sin & cos', icon: Replace },
    { op: { kind: 'simplify' }, label: 'Simplify fractions', icon: Shrink },
  ];

  let dialog = $state<HTMLDialogElement>();
  $effect(() => {
    if (workshop.open && !dialog?.open) dialog?.showModal();
    else if (!workshop.open && dialog?.open) dialog.close();
  });
  const steps = $derived(workshop.steps[workshop.key]);
  const eq = $derived(workshop.current.eq);
  const at = $derived(recipTex(workshop.key, point.deg));
</script>

<dialog bind:this={dialog} aria-label="Equation workshop" onclose={() => (workshop.open = false)}
  onclick={(e) => { if (e.target === dialog) workshop.open = false; }}>
  <div class="card">
    <div class="head">
      <div class="seg" role="group" aria-label="Function">
        {#each KEYS as k}<button aria-pressed={workshop.key === k} onclick={() => (workshop.key = k)}>{k}</button>{/each}
      </div>
      <div class="seg" role="group" aria-label="Difficulty">
        <button aria-pressed={!workshop.hard} onclick={() => (workshop.hard = false)}>Easy</button>
        <button aria-pressed={workshop.hard} onclick={() => (workshop.hard = true)} title="Offers every factor, with no hints about which ones help">Hard</button>
      </div>
      <button class="icon close" aria-label="Close" onclick={() => (workshop.open = false)}><X size={16} /></button>
    </div>

    {#if steps.length > 1}
      <div class="steps">
        {#each steps.slice(0, -1) as s}<div class="step"><span class="m"><Tex latex={eqTex(s.eq)} /></span><span class="op">{s.label}</span></div>{/each}
      </div>
    {/if}
    <div class="now"><span class="m"><Tex latex={eqTex(eq)} /></span><span class="op">{workshop.current.label}</span></div>
    {#if isIdentity(eq)}<div class="identity">Both sides match for every θ.</div>{/if}

    <div class="group">
      <div class="label">Do to both sides</div>
      <div class="ops">
        {#each OPS as o}
          {@const Icon = o.icon}
          <button disabled={!changes(eq, o.op)} onclick={() => workshop.do(o.op, o.label)}><Icon size={16} />{o.label}</button>
        {/each}
      </div>
    </div>
    <div class="group">
      <div class="label">Multiply both sides by</div>
      <div class="ops">
        {#each workshop.hard ? ALL : EASY[workshop.key] as f}
          <button onclick={() => workshop.do({ kind: 'times', by: f }, `× ${name(f)}`)}><X size={14} />{name(f)}</button>
        {/each}
      </div>
    </div>
    <div class="ops">
      <button disabled={steps.length < 2} onclick={() => workshop.undo()}><Undo2 size={16} />Undo</button>
      <button disabled={steps.length < 2} onclick={() => workshop.reset()}><RotateCcw size={16} />Reset</button>
    </div>
    <div class="group">
      <div class="label">At this angle</div>
      <div class="m"><Tex latex={`\\${workshop.key}\\theta=${at.sub}=${at.r}`} /></div>
    </div>
  </div>
</dialog>

<style>
  dialog { padding: 0; border: 0; background: transparent; color: var(--fg); max-width: calc(100vw - 32px); width: 540px; }
  dialog::backdrop { background: color-mix(in srgb, var(--bg) 55%, transparent); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
  .card {
    max-height: calc(100svh - 48px); overflow-y: auto; box-sizing: border-box; display: grid; gap: 16px; padding: 16px;
    background: var(--panel); border: 1px solid var(--line); border-radius: 14px; box-shadow: 0 24px 60px -16px var(--sh);
  }
  .head { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .close { margin-left: auto; }
  .icon { display: grid; place-items: center; width: 32px; height: 32px; padding: 0; background: transparent; }
  .steps { display: grid; gap: 6px; }
  .step, .now { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .step { font-size: 0.95rem; opacity: 0.55; }
  .now { font-size: 1.5rem; }
  .m { min-width: 0; overflow-x: auto; overflow-y: hidden; padding: 2px 0; }
  .op, .label { font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); white-space: nowrap; }
  .identity { color: var(--ok); font-size: 0.82rem; }
  .group { display: grid; gap: 4px; }
  .ops { display: flex; gap: 6px; flex-wrap: wrap; }
  .ops button { display: inline-flex; align-items: center; gap: 6px; }
  button:disabled { color: color-mix(in srgb, var(--fg) 40%, transparent); border-style: dashed; background: transparent; cursor: default; }
</style>
