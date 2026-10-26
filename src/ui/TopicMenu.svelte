<!-- The topic switcher: every topic under its course or unit, with a box to jump by typing. On wide
     screens it is a popover over the tab bar's corner, on phones a sheet rising from the bottom.
     Opened from the tab bar, the panel's title or "/" ; Enter takes the first match, the arrow
     keys walk the list. Topics read from the registry (core/app.svelte.ts). -->
<script lang="ts">
  import { DUR } from '../core/tuning.ts';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import Check from '@lucide/svelte/icons/check';
  import Lock from '@lucide/svelte/icons/lock';
  import Search from '@lucide/svelte/icons/search';
  import { camera } from '../core/camera.svelte.ts';
  import {
    groups,
    setTopic,
    topicDef,
    topicSections,
    topicStatus,
    ui,
  } from '../core/app.svelte.ts';
  import { search } from '../core/nav.ts';
  import { progress } from '../core/progress.svelte.ts';
  import { topicMenu } from './topicMenu.svelte.ts';

  let query = $state('');
  let input = $state<HTMLInputElement>();
  let list = $state<HTMLElement>();

  // the topics that match, under their headings (a heading with none left drops out)
  const shown = $derived.by(() => {
    const hits = new Set(
      search(
        topicSections().flatMap((s) => s.topics),
        groups,
        query,
      ),
    );
    return topicSections()
      .map((s) => ({ ...s, topics: s.topics.filter((t) => hits.has(t)) }))
      .filter((s) => s.topics.length);
  });
  const rows = () => [...(list?.querySelectorAll<HTMLButtonElement>('button.row') ?? [])];

  const close = () => {
    topicMenu.open = false;
    query = '';
  };
  const pick = (id: string) => {
    if (topicStatus(topicDef(id)).state === 'locked') return;
    setTopic(id);
    close();
  };
  // the first open topic among the matches is what Enter takes
  const first = $derived(
    shown.flatMap((s) => s.topics).find((t) => topicStatus(t).state !== 'locked'),
  );
  const hint = (id: string) => {
    const { state, missing } = topicStatus(topicDef(id));
    const names = missing.map((m) => topicDef(m).title).join(' and ');
    return state === 'locked'
      ? `Finish ${names} first`
      : state === 'recommended'
        ? `Best after ${names}`
        : '';
  };

  $effect(() => {
    if (topicMenu.open) input?.focus();
  });
  const onkeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') return close();
    if (e.key === 'Enter' && e.target === input && first) return pick(first.id);
    const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    // the box and the rows form one ring to walk
    const all: HTMLElement[] = [input!, ...rows()],
      at = all.indexOf(document.activeElement as HTMLElement);
    all[(at + step + all.length) % all.length].focus();
  };
</script>

{#if topicMenu.open}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="scrim" transition:fade={{ duration: DUR.quick }} onclick={close}></div>
  <div
    class="menu"
    class:wide={camera.wide}
    role="dialog"
    aria-label="Topics"
    tabindex="-1"
    {onkeydown}
    transition:fly={{ y: camera.wide ? 8 : 40, duration: DUR.quick, easing: cubicOut }}
  >
    <label class="find">
      <Search size={15} />
      <input
        bind:this={input}
        bind:value={query}
        type="search"
        placeholder="Jump to a topic"
        aria-label="Search topics"
        autocomplete="off"
        spellcheck="false"
      />
    </label>
    <div class="list" bind:this={list}>
      {#each shown as s (s.id)}
        <section>
          <h2>{s.title}</h2>
          {#each s.topics as t (t.id)}
            {@const Icon = t.tab.icon}
            {@const st = topicStatus(t).state}
            <button
              class="row"
              aria-pressed={ui.topic === t.id}
              aria-disabled={st === 'locked' ? 'true' : null}
              onclick={() => pick(t.id)}
            >
              <Icon size={18} />
              <span class="name">{t.title}</span>
              {#if st !== 'open' && ui.topic !== t.id}<span class="note">{hint(t.id)}</span>{/if}
              {#if st === 'locked'}<Lock size={12} />{/if}
              {#if progress.completed[t.id]}<span class="done" title="Completed"
                  ><Check size={9} strokeWidth={3.5} /></span
                >{/if}
            </button>
          {/each}
        </section>
      {:else}
        <p class="none">No topic matches “{query}”.</p>
      {/each}
    </div>
  </div>
{/if}

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 4;
  }
  .menu {
    position: fixed;
    z-index: 5;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 6px;
    padding: 6px;
    box-sizing: border-box;
    background: color-mix(in srgb, var(--panel) 86%, transparent);
    border: 1px solid var(--line);
    -webkit-backdrop-filter: blur(14px);
    backdrop-filter: blur(14px);
    box-shadow: 0 8px 24px -10px var(--sh);
    /* phones: a sheet along the bottom */
    left: 0;
    right: 0;
    bottom: 0;
    max-height: 72svh;
    border-radius: 14px 14px 0 0;
    padding-bottom: max(6px, env(safe-area-inset-bottom, 0px));
  }
  /* wide screens: a popover standing on the tab bar's corner */
  .menu.wide {
    left: 24px;
    right: auto;
    bottom: 88px;
    width: 320px;
    max-height: min(480px, calc(100svh - 120px));
    border-radius: 14px;
    padding-bottom: 6px;
  }
  .find {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--panel) 70%, transparent);
    color: var(--muted);
  }
  input {
    flex: 1;
    min-width: 0;
    padding: 9px 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--fg);
    font: inherit;
    /* 16px keeps iOS from zooming the page when the box is focused */
    font-size: 1rem;
  }
  .menu.wide input {
    font-size: 0.9rem;
  }
  .list {
    overflow-y: auto;
    overscroll-behavior: contain;
    display: grid;
    gap: 8px;
  }
  h2 {
    margin: 4px 10px 3px;
    font-size: 0.66rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
  }
  /* a row is a segmented-control option: the current topic carries the raised dark thumb */
  .row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    box-sizing: border-box;
    padding: 9px 12px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    text-align: left;
  }
  .row[aria-pressed='true'] {
    background: var(--fg);
    color: var(--bg);
    box-shadow: 0 2px 6px -1px var(--sh);
  }
  .row:not([aria-pressed='true']):hover,
  .row:not([aria-pressed='true']):focus-visible {
    background: color-mix(in srgb, var(--fg) 8%, transparent);
  }
  .row[aria-disabled='true'] {
    opacity: 0.55;
    cursor: not-allowed;
  }
  .name {
    flex: 1;
    min-width: 0;
  }
  .note {
    font-size: 0.72rem;
    color: var(--muted);
  }
  .row[aria-pressed='true'] .note {
    color: inherit;
    opacity: 0.7;
  }
  .done {
    display: grid;
    place-items: center;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: var(--rad);
    color: var(--on-accent);
  }
  .none {
    margin: 14px 10px;
    color: var(--muted);
  }
</style>
