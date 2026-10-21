<!-- Segmented control with a raised thumb that glides between options. A switch moves like a ballpoint
     pen click: the thumb leans back, then snaps across and overshoots slightly before it settles. -->
<script lang="ts" generics="T extends string">
  let { options, value, onchange, label }: { options: { value: T; label: string }[]; value: T; onchange: (v: T) => void; label: string } = $props();

  let root = $state<HTMLDivElement>(), thumb = $state<HTMLDivElement>();
  let pressed = $state(false);
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const box = (v: T) => {
    const b = root?.querySelector<HTMLElement>(`[data-v="${v}"]`);
    return b ? { x: b.offsetLeft, w: b.offsetWidth } : { x: 0, w: 0 };
  };
  let last: { x: number; w: number } | null = null;
  $effect(() => {
    const to = box(value);
    if (!thumb || !to.w) return;
    thumb.style.transform = `translateX(${to.x}px)`; thumb.style.width = `${to.w}px`;
    if (last && last.x !== to.x && !reduce) {
      const dir = Math.sign(to.x - last.x);
      thumb.animate([
        { transform: `translateX(${last.x}px)`, width: `${last.w}px` },
        { transform: `translateX(${last.x - dir * 5}px) scaleX(0.96)`, width: `${last.w}px`, offset: 0.28, easing: 'cubic-bezier(0.6, 0, 0.9, 0.4)' },
        { transform: `translateX(${to.x + dir * 3}px)`, width: `${to.w}px`, offset: 0.72, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' },
        { transform: `translateX(${to.x}px)`, width: `${to.w}px` },
      ], { duration: 420 });
    }
    last = to;
  });
</script>

<div class="seg" role="group" aria-label={label} bind:this={root} class:pressed
  onpointerdown={() => (pressed = true)} onpointerup={() => (pressed = false)} onpointerleave={() => (pressed = false)}>
  <div class="thumb" bind:this={thumb} aria-hidden="true"></div>
  {#each options as o (o.value)}
    <button data-v={o.value} aria-pressed={value === o.value} onclick={() => value !== o.value && onchange(o.value)}>{o.label}</button>
  {/each}
</div>

<style>
  .seg { position: relative; display: inline-flex; padding: 3px; gap: 2px; border: 1px solid var(--line); border-radius: 10px; background: color-mix(in srgb, var(--panel) 70%, transparent); }
  .thumb {
    position: absolute; left: 0; top: 3px; bottom: 3px; border-radius: 7px; background: var(--fg);
    box-shadow: 0 2px 6px -1px var(--sh), 0 6px 14px -6px var(--sh); transform-origin: center;
    transition: scale 0.12s ease-out;
  }
  .pressed .thumb { scale: 0.96; }
  button {
    position: relative; border: 0; border-radius: 7px; padding: 5px 13px; background: transparent; color: var(--fg);
    transition: color 0.18s 0.12s;
  }
  button[aria-pressed='true'] { background: transparent; color: var(--bg); }
  button:hover { border-color: transparent; }
</style>
