<!-- Math placed inside the plane's SVG, at a rect computed by the scene. -->
<script lang="ts">
  import { texBox } from '../core/tex.svelte.ts';
  import type { Label } from '../topics/circle/scene.ts';
  let { label, style = '' }: { label: Label; style?: string } = $props();
  const b = $derived(texBox(label.latex));
</script>

{#if b}
  <svg
    x={label.rect.x}
    y={label.rect.y}
    width={label.rect.w}
    height={label.rect.h}
    viewBox={b.viewBox}
    overflow="visible"
    style:color={label.color}
    {style}>{@html b.inner}</svg
  >
{/if}
