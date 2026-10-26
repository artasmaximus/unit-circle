<!-- Inline math in HTML. Sized in em, so it follows the surrounding font size; Computer Modern has a
     smaller x-height than the sans around it, so it is scaled up a little to match. -->
<script lang="ts">
  import { texBox } from '../core/tex.svelte.ts';
  let { latex }: { latex: string } = $props();
  const SCALE = 1.25;
  const b = $derived(texBox(latex));
</script>

{#if b}
  <svg
    class="tex"
    viewBox={b.viewBox}
    style:width="{b.w * SCALE}em"
    style:height="{b.h * SCALE}em"
    style:vertical-align="{-b.depth * SCALE}em"
    role="img"
    aria-label={latex}>{@html b.inner}</svg
  >
{/if}

<style>
  .tex {
    display: inline-block;
    overflow: visible;
  }
</style>
