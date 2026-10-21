<!-- Inline math in HTML. Sized in em, so it follows the surrounding font size. -->
<script lang="ts">
  import { texBox } from '../lib/tex.svelte.ts';
  let { latex }: { latex: string } = $props();
  const b = $derived(texBox(latex));
</script>

{#if b}
  <svg class="tex" viewBox={b.viewBox} style:width="{b.w}em" style:height="{b.h}em" style:vertical-align="{-b.depth}em" role="img" aria-label={latex}>{@html b.inner}</svg>
{/if}

<style>
  .tex { display: inline-block; overflow: visible; }
</style>
