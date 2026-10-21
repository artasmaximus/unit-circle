<!-- A drum-style picker: the chosen option sits level with the Apply button and its neighbours fade
     away above and below. Scroll, drag, arrow keys or a click move it. -->
<script lang="ts" generics="T">
  type Item = { label: string; disabled?: boolean; value: T };
  let { items, index = $bindable(0), onpick }: { items: Item[]; index?: number; onpick: (v: T) => void } = $props();

  const ROW = 46;
  const focusOnMount = (el: HTMLElement) => { el.focus({ preventScroll: true }); };
  const move = (d: number) => {
    let i = index;
    do i += d; while (items[i]?.disabled);
    if (i >= 0 && i < items.length && i !== index) { index = i; navigator.vibrate?.(4); }
  };
  // keep the selection on an enabled row when the list changes
  $effect(() => { if (items[index]?.disabled || index >= items.length) { const i = items.findIndex((x) => !x.disabled); if (i >= 0) index = i; } });

  let wheelAcc = 0, dragY: number | null = null, dragAcc = 0;
  const onwheel = (e: WheelEvent) => { e.preventDefault(); wheelAcc += e.deltaY; while (Math.abs(wheelAcc) >= 40) { move(Math.sign(wheelAcc)); wheelAcc -= 40 * Math.sign(wheelAcc); } };
</script>

<div class="picker" use:focusOnMount role="listbox" tabindex="0" aria-label="Operation" aria-activedescendant="op-{index}" {onwheel}
  onkeydown={(e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
  }}
  onpointerdown={(e) => { dragY = e.clientY; dragAcc = 0; }}
  onpointermove={(e) => {
    if (dragY === null || !e.buttons) return;
    dragAcc += dragY - e.clientY; dragY = e.clientY;
    while (Math.abs(dragAcc) >= ROW * 0.7) { move(Math.sign(dragAcc)); dragAcc -= ROW * 0.7 * Math.sign(dragAcc); }
  }}
  onpointerup={() => (dragY = null)} onpointerleave={() => (dragY = null)}>
  <div class="track" style:transform="translateY({-index * ROW}px)">
    {#each items as it, i}
      {@const d = Math.abs(i - index)}
      <button id="op-{i}" role="option" aria-selected={i === index} tabindex="-1" disabled={it.disabled}
        style:opacity={it.disabled ? 0.2 : Math.max(0.15, 1 - d * 0.22)} style:scale={i === index ? 1 : 1 - Math.min(d, 3) * 0.06}
        onmousedown={(e) => e.preventDefault()}
        onclick={() => (i === index ? onpick(it.value) : ((index = i), navigator.vibrate?.(4)))}>{it.label}</button>
    {/each}
  </div>
</div>

<style>
  .picker {
    --row: 46px; position: relative; height: calc(var(--row) * 5); overflow: hidden; touch-action: none; cursor: ns-resize;
    -webkit-mask-image: linear-gradient(transparent, #000 30%, #000 70%, transparent);
    mask-image: linear-gradient(transparent, #000 30%, #000 70%, transparent);
    border-radius: 10px;
  }
  .picker:focus-visible { outline: 2px solid var(--slope); outline-offset: 2px; }
  .track { position: absolute; left: 0; right: 0; top: calc(var(--row) * 2); transition: transform 0.28s cubic-bezier(0.22, 1.2, 0.36, 1); }
  button {
    display: flex; align-items: center; width: 100%; height: var(--row); padding: 0 6px; border: 0; background: none;
    font-size: 1.15rem; color: var(--fg); text-align: left; white-space: nowrap; transform-origin: left center;
    transition: opacity 0.2s, scale 0.28s cubic-bezier(0.22, 1.2, 0.36, 1), color 0.15s;
  }
  button[aria-selected='true'] { color: var(--slope); font-weight: 500; }
  button:disabled { cursor: default; text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--fg) 40%, transparent); }
</style>
