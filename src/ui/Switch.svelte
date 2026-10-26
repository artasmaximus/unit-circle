<!-- A labelled on/off switch, right-aligned in its row, with an optional tooltip. -->
<script lang="ts">
  let {
    label,
    checked,
    onchange,
    tip,
  }: { label: string; checked: boolean; onchange: (on: boolean) => void; tip?: string } = $props();
</script>

<button
  class="switch"
  role="switch"
  aria-checked={checked}
  onclick={() => onchange(!checked)}
  data-tip={tip}
>
  {label}<span class="track"><span class="knob"></span></span>
</button>

<style>
  .switch {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 0;
    border: 0;
    background: none;
    color: var(--fg);
    font-size: 0.85rem;
    cursor: pointer;
  }
  .track {
    position: relative;
    width: 32px;
    height: 18px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--muted) 35%, transparent);
    transition: background var(--dur-quick);
  }
  .knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--fg);
    transition: transform var(--dur-quick) var(--ease-pop);
  }
  .switch[aria-checked='true'] .track {
    background: var(--cos);
  }
  .switch[aria-checked='true'] .knob {
    transform: translateX(14px);
    background: var(--on-accent);
  }
  .switch:focus-visible {
    outline: 2px solid var(--cos);
    outline-offset: 4px;
    border-radius: 6px;
  }
</style>
