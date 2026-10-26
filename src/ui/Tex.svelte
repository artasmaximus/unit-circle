<!-- Inline math in HTML. Sized in em, so it follows the surrounding font size. `scale` grows it:
     running text asks for a little more (see Rich.svelte), since Computer Modern has a smaller
     x-height than the sans around it; cards, buttons and readouts take it as is. -->
<script lang="ts" module>
  /** The scale math gets inside a sentence, to match the text around it. */
  export const PROSE = 1.25;
</script>

<script lang="ts">
  import { texBox } from '../core/tex.svelte.ts';
  let { latex, scale = 1 }: { latex: string; scale?: number } = $props();
  const b = $derived(texBox(latex));
</script>

{#if b}
  <svg
    class="tex"
    viewBox={b.viewBox}
    style:width="{b.w * scale}em"
    style:height="{b.h * scale}em"
    style:vertical-align="{-b.depth * scale}em"
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
