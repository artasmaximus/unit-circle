<!-- A small info icon that shows what it is given when hovered or focused. Unlike the text
     tooltips (data-tip) its content can be typeset math. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Info from '@lucide/svelte/icons/info';

  let { label, children }: { label: string; children: Snippet } = $props();
</script>

<span class="info">
  <button type="button" class="icon" aria-label={label}><Info size={16} /></button>
  <span class="pop" role="tooltip">{@render children()}</span>
</span>

<style>
  .info {
    position: relative;
    display: inline-flex;
    flex: none;
  }
  .icon {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--muted);
    cursor: help;
  }
  .icon:hover,
  .icon:focus-visible {
    color: var(--fg);
  }
  .pop {
    position: absolute;
    z-index: 20;
    right: 0;
    top: calc(100% + 8px);
    width: max-content;
    max-width: 260px;
    padding: 9px 12px;
    border-radius: 9px;
    background: var(--tipbg);
    color: var(--tipfg);
    border: 1px solid var(--tipbd);
    font-size: 0.85rem;
    line-height: 1.4;
    -webkit-backdrop-filter: blur(16px) saturate(1.4);
    backdrop-filter: blur(16px) saturate(1.4);
    box-shadow: 0 8px 20px -6px var(--sh);
    opacity: 0;
    transform: translateY(-4px);
    pointer-events: none;
    transition:
      opacity 0.15s ease-out,
      transform 0.15s ease-out;
  }
  .info:hover .pop,
  .info:focus-within .pop {
    opacity: 1;
    transform: none;
    transition-delay: 0.15s;
  }
</style>
