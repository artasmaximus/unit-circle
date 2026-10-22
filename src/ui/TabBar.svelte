<!-- The concepts, as a small bar floating over the bottom middle of the plane (desktop and landscape tablets; phones keep
     the panel's room). Each tab is an icon over a tiny label. Only Unit Circle exists so far; the rest are placeholders. -->
<script lang="ts">
  import CircleDot from '@lucide/svelte/icons/circle-dot';
  import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
  import { camera } from '../lib/camera.svelte.ts';
  import { ui } from '../lib/state.svelte.ts';

  const TABS = [
    { id: 'circle', label: 'Unit circle', icon: CircleDot, ready: true },
    { id: 'inverse', label: 'Inverse trig', icon: ArrowLeftRight, ready: false },
  ] as const;
</script>

<nav class="tabs" aria-label="Concepts" style:left="{camera.free.x + camera.free.w / 2}px">
  {#each TABS as t (t.id)}
    <button aria-pressed={ui.topic === t.id} disabled={!t.ready} title={t.ready ? t.label : `${t.label}: coming soon`}
      onclick={() => (ui.topic = t.id)}>
      <t.icon size={18} /><span>{t.label}</span>
    </button>
  {/each}
</nav>

<style>
  .tabs {
    position: fixed; z-index: 3; bottom: 16px; transform: translateX(-50%); display: flex; gap: 2px; padding: 4px;
    border-radius: 14px; background: color-mix(in srgb, var(--panel) 70%, transparent);
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); box-shadow: 0 8px 24px -10px var(--sh);
  }
  button {
    display: grid; justify-items: center; gap: 3px; min-width: 76px; padding: 6px 10px 5px; border: 0; border-radius: 10px;
    background: transparent; color: var(--muted); font-size: 0.62rem; letter-spacing: 0.02em; white-space: nowrap;
  }
  button:hover:not(:disabled) { color: var(--fg); border-color: transparent; }
  button[aria-pressed='true'] { background: var(--fg); color: var(--bg); }
  button:disabled { opacity: 0.45; cursor: default; }
</style>
