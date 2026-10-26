<!-- Running text with inline math parts. -->
<script lang="ts">
  import Tex from './Tex.svelte';
  import type { Rich } from '../core/rich.ts';
  let { parts }: { parts: Rich | string } = $props();
  // punctuation straight after a formula travels with it, so a line never starts with a lone "."
  const PUNCT = /^[.,;:!?)\]]+/;
  const segs = $derived(
    typeof parts === 'string'
      ? []
      : parts.map((p, k) => {
          if (typeof p !== 'string') {
            const next = parts[k + 1];
            const tail: string = typeof next === 'string' ? (next.match(PUNCT)?.[0] ?? '') : '';
            return { m: p.m, tail, t: '' };
          }
          const prev = parts[k - 1];
          const lead = prev && typeof prev !== 'string' ? (p.match(PUNCT)?.[0] ?? '') : '';
          return { m: undefined, tail: '', t: p.slice(lead.length) };
        }),
  );
</script>

{#if typeof parts === 'string'}{parts}{:else}{#each segs as s}{#if s.m !== undefined}<span
        class="im"><Tex latex={s.m} />{s.tail}</span
      >{:else}{s.t}{/if}{/each}{/if}

<style>
  .im {
    margin: 0 0.12em;
    white-space: nowrap;
  }
</style>
