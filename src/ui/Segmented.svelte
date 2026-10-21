<!-- Segmented control with a raised thumb that glides between options. The glide is not its own
     animation: it follows `progress` (0 → 1, may lean below 0 and overshoot past 1), so it can move in
     lockstep with anything else driven by the same value. -->
<script lang="ts" generics="T extends string">
  let { options, value, onchange, label, progress = 1 }: {
    options: { value: T; label: string }[]; value: T; onchange: (v: T) => void; label: string; progress?: number;
  } = $props();

  let root = $state<HTMLDivElement>();
  let pressed = $state(false);
  type Box = { x: number; w: number };
  const measure = (v: T): Box | null => {
    const b = root?.querySelector<HTMLElement>(`[data-v="${v}"]`);
    return b ? { x: b.offsetLeft, w: b.offsetWidth } : null;
  };
  let from = $state<Box | null>(null), to = $state<Box | null>(null), last: T | null = null;
  $effect(() => {
    const m = measure(value);
    if (!m) return;
    if (last !== null && last !== value && to) from = { ...to };
    else if (last === null) from = m;
    to = m; last = value;
  });
  const x = $derived(from && to ? from.x + (to.x - from.x) * progress : 0);
  const w = $derived(from && to ? from.w + (to.w - from.w) * Math.min(1, Math.max(0, progress)) : 0);
</script>

<div class="seg" role="group" aria-label={label} bind:this={root} class:pressed
  onpointerdown={() => (pressed = true)} onpointerup={() => (pressed = false)} onpointerleave={() => (pressed = false)}>
  <div class="thumb" aria-hidden="true" style:transform="translateX({x}px)" style:width="{w}px"></div>
  {#each options as o (o.value)}
    <button data-v={o.value} aria-pressed={value === o.value} onclick={() => value !== o.value && onchange(o.value)}>{o.label}</button>
  {/each}
</div>

<style>
  .seg { position: relative; display: inline-flex; padding: 3px; gap: 2px; border: 1px solid var(--line); border-radius: 10px; background: color-mix(in srgb, var(--panel) 70%, transparent); }
  .thumb {
    position: absolute; left: 0; top: 3px; bottom: 3px; border-radius: 7px; background: var(--fg);
    box-shadow: 0 2px 6px -1px var(--sh), 0 6px 14px -6px var(--sh); transition: scale 0.12s ease-out;
  }
  .pressed .thumb { scale: 0.96; }
  button {
    position: relative; border: 0; border-radius: 7px; padding: 5px 13px; background: transparent; color: var(--fg);
    transition: color 0.18s 0.12s;
  }
  button[aria-pressed='true'] { background: transparent; color: var(--bg); }
  button:hover { border-color: transparent; }
</style>
