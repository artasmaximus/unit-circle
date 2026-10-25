<!-- Running text with inline math parts. -->
<script lang="ts">
  import Tex from './Tex.svelte';
  import type { Rich } from '../lib/quiz.ts';
  let { parts }: { parts: Rich | string } = $props();
</script>

{#if typeof parts === 'string'}{parts}{:else}{#each parts as p}{#if typeof p === 'string'}{p}{:else}<span
        class="im"><Tex latex={p.m} /></span
      >{/if}{/each}{/if}

<style>
  .im {
    margin: 0 0.12em;
  }
</style>
