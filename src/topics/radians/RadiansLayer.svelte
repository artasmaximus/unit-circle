<!-- The Radians topic's layer of the plane. It stays mounted on every topic so its marks can
     play their exits when the topic is left; it just asks for no marks then (see
     scene.ts). -->
<script lang="ts">
  import { ui } from '../../core/app.svelte.ts';
  import { radiansMarks } from './marks.svelte.ts';
  import MarkLayer from '../../plane/MarkLayer.svelte';
  import { useHandles } from '../../plane/handles.svelte.ts';
  import { pointHandle } from '../../plane/pointHandle.svelte.ts';

  /**
   * `under` is the part drawn beneath the ring's dots (the shading), the rest sits on top of them.
   */
  let { under = false }: { under?: boolean } = $props();
  // in Radians a press near the ring turns the point (the layer is mounted twice; one offers it)
  useHandles(() => (ui.topic === 'radians' && !under ? [pointHandle] : []));
  const marks = $derived(radiansMarks(under));
</script>

{#if under}
  <defs
    ><linearGradient id="rad-half" x1="1" y1="0" x2="0" y2="0"
      ><stop offset="0" style="stop-color: var(--rad); stop-opacity: 0.2" /><stop
        offset="1"
        style="stop-color: var(--rad)"
      /></linearGradient
    ></defs
  >
{/if}
<MarkLayer {marks} name={under ? 'radians-under' : 'radians'} />
