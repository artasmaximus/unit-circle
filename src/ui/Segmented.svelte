<!-- Segmented control with a raised thumb that glides between options. The glide is not its own
     animation: it follows `progress` (0 → 1, may lean below 0 and overshoot past 1), so it can
     move in lockstep with anything else driven by the same value. -->
<script lang="ts" generics="T extends string">
  import { untrack, type Component } from 'svelte';
  import Lock from '@lucide/svelte/icons/lock';
  import Check from '@lucide/svelte/icons/check';
  /**
   * `icon` puts a glyph with each label; `stacked` lays it above the label, for a bar of
   * destinations rather than a switch. `done` adds a small check mark.
   */
  let {
    options,
    value,
    onchange,
    label,
    progress = 1,
    stacked = false,
  }: {
    options: {
      value: T;
      label: string;
      icon?: Component<{ size?: number }>;
      locked?: boolean;
      done?: boolean;
      tip?: string;
    }[];
    value: T;
    onchange: (v: T) => void;
    label: string;
    progress?: number;
    stacked?: boolean;
  } = $props();

  let root = $state<HTMLDivElement>();
  let pressed = $state(false);
  type Box = { x: number; w: number };
  const measure = (v: T): Box | null => {
    const b = root?.querySelector<HTMLElement>(`[data-v="${v}"]`);
    return b ? { x: b.offsetLeft, w: b.offsetWidth } : null;
  };
  let from = $state<Box | null>(null),
    to = $state<Box | null>(null),
    last: T | null = null;
  $effect(() => {
    const m = measure(value);
    if (!m) return;
    if (last !== null && last !== value && to) from = { ...to };
    else if (last === null) from = m;
    to = m;
    last = value;
  });
  // once a glide has landed, the thumb has nowhere to come from: the next one that plays on the same
  // progress (a mode switch drives the topic bar's too) must not start from the old position
  $effect(() => {
    if (progress >= 1) untrack(() => (from = to));
  });
  const x = $derived(from && to ? from.x + (to.x - from.x) * progress : 0);
  const w = $derived(
    from && to ? from.w + (to.w - from.w) * Math.min(1, Math.max(0, progress)) : 0,
  );
</script>

<div
  class="seg"
  role="group"
  aria-label={label}
  bind:this={root}
  class:pressed
  class:stacked
  onpointerdown={() => (pressed = true)}
  onpointerup={() => (pressed = false)}
  onpointerleave={() => (pressed = false)}
>
  <div
    class="thumb"
    aria-hidden="true"
    style:transform="translateX({x}px)"
    style:width="{w}px"
  ></div>
  {#each options as o (o.value)}
    {@const Icon = o.icon}
    <!-- a locked option stays hoverable (so it can say how to unlock it) but does nothing -->
    <button
      data-v={o.value}
      aria-pressed={value === o.value}
      aria-disabled={o.locked ? 'true' : null}
      data-tip={o.tip}
      onclick={() => !o.locked && value !== o.value && onchange(o.value)}
    >
      {#if Icon}<Icon size={18} />{/if}{#if o.locked}<Lock size={11} />{/if}{#if stacked}<span
          >{o.label}</span
        >{:else}{o.label}{/if}
      {#if o.done}<span class="done" title="Completed"><Check size={9} strokeWidth={3.5} /></span
        >{/if}
    </button>
  {/each}
</div>

<style>
  .seg {
    position: relative;
    display: inline-flex;
    padding: 3px;
    gap: 2px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--panel) 70%, transparent);
  }
  .thumb {
    position: absolute;
    left: 0;
    top: 3px;
    bottom: 3px;
    border-radius: 7px;
    background: var(--fg);
    box-shadow:
      0 2px 6px -1px var(--sh),
      0 6px 14px -6px var(--sh);
    transition: scale var(--dur-blink) ease-out;
  }
  .pressed .thumb {
    scale: 0.96;
  }
  button {
    position: relative;
    border: 0;
    border-radius: 7px;
    padding: 5px 13px;
    background: transparent;
    color: var(--fg);
    transition: color var(--dur-quick) var(--dur-blink);
  }
  button[aria-pressed='true'] {
    background: transparent;
    color: var(--bg);
  }
  button:hover {
    border-color: transparent;
  }
  button[aria-disabled='true'] {
    opacity: 0.55;
    cursor: not-allowed;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  /* a bar of destinations: icon over a tiny label, the inactive ones dimmed until hovered */
  .stacked {
    padding: 4px;
    border-radius: 14px;
  }
  .stacked .thumb {
    top: 4px;
    bottom: 4px;
    border-radius: 10px;
  }
  .stacked button {
    display: grid;
    justify-items: center;
    gap: 3px;
    min-width: 76px;
    padding: 6px 10px 5px;
    border-radius: 10px;
    font-size: 0.62rem;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  /* a small badge in the corner of a finished destination */
  .done {
    position: absolute;
    top: 3px;
    right: 6px;
    display: grid;
    place-items: center;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: var(--rad);
    color: var(--on-accent);
    pointer-events: none;
  }
  .stacked button:not([aria-pressed='true']) {
    color: var(--muted);
  }
  .stacked button:not([aria-pressed='true']):hover {
    color: var(--fg);
  }
</style>
