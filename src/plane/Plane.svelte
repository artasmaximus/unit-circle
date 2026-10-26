<!-- The full-viewport drawing. A press near a handle (see handles.svelte.ts) grabs it and drags
     it; a press anywhere else drags the whole view. Scroll (or pinch) zooms about the pointer.
     The layers come from App, so the plane knows nothing about any topic. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { camera } from '../core/camera.svelte.ts';
  import { point } from '../core/point.svelte.ts';
  import { input } from '../core/tuning.ts';
  import type { Pt } from '../figures/figure.ts';
  import { nearest, type Aim, type Handle } from './handles.svelte.ts';

  /**
   * `layers` are drawn inside the plane's world transform, in order; `overlay` sits over the plane
   * in screen space (the floating chips).
   */
  let { layers, overlay }: { layers: Snippet; overlay?: Snippet } = $props();

  /** How close (px) to a handle a press must be to grab it. */
  const BAND = input.grabBand;
  /** How finely handles read the pointer: the snap range tightens and the angle step shrinks as you zoom in. */
  const aim = (): Aim => {
    const f = 10 ** camera.thetaDecimals,
      zoom = Math.max(1, camera.zoom);
    return {
      angleRange: input.snapRange / zoom,
      valueRange: 0.03 / zoom,
      grain: (deg) => Math.round(deg * f) / f,
    };
  };
  const world = (e: { clientX: number; clientY: number }): Pt => {
    const w = camera.toWorld(e.clientX, e.clientY);
    return [w.x, w.y];
  };
  const under = (e: { clientX: number; clientY: number }) => nearest(world(e), camera.k, BAND);

  let held = $state<Handle | null>(null),
    panning = $state(false),
    hovered = $state<Handle | null>(null);
  const hover = (h: Handle | null, at: Pt | null) => {
    if (hovered && hovered.key !== h?.key) hovered.hover?.(null, aim());
    hovered = h;
    h?.hover?.(at, aim());
  };

  const touches = new Map<number, { x: number; y: number }>();
  let last = { x: 0, y: 0 },
    pinch = 0;
  const pinchState = () => {
    const [a, b] = [...touches.values()];
    return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };
  const letGo = () => {
    held?.release?.();
    held = null;
  };
  const down = (e: PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 2) {
      letGo();
      panning = true;
      const p = pinchState();
      pinch = p.d;
      last = p;
      return;
    }
    last = { x: e.clientX, y: e.clientY };
    const h = under(e);
    if (h) {
      held = h;
      h.press?.();
      h.drag(world(e), aim());
    } else panning = true;
  };
  const move = (e: PointerEvent) => {
    if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 2) {
      const p = pinchState();
      camera.panBy(p.x - last.x, p.y - last.y);
      camera.zoomAt(p.x, p.y, p.d / pinch);
      pinch = p.d;
      last = p;
      return;
    }
    if (held) held.drag(world(e), aim());
    else if (panning) {
      camera.panBy(e.clientX - last.x, e.clientY - last.y);
      last = { x: e.clientX, y: e.clientY };
    } else if (e.pointerType === 'mouse') {
      const h = under(e);
      hover(h, h ? world(e) : null);
    }
  };
  const up = (e: PointerEvent) => {
    touches.delete(e.pointerId);
    if (touches.size === 1) {
      const [r] = touches.values();
      last = r;
    }
    if (!touches.size) {
      letGo();
      panning = false;
    }
  };
  let svg = $state<SVGSVGElement>();
  $effect(() => {
    const el = svg;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.zoomAt(
        e.clientX,
        e.clientY,
        Math.exp(-e.deltaY * (e.ctrlKey ? input.pinchZoom : input.wheelZoom)),
      );
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  });
</script>

<svg
  class="plane"
  style="--sw:{camera.boost}; --wk:{camera.stroke}"
  class:dragging={held !== null}
  width={camera.vw}
  height={camera.vh}
  role="slider"
  aria-label="Angle θ"
  aria-valuemin={0}
  aria-valuemax={360}
  aria-valuenow={Math.round(point.deg)}
  tabindex="0"
  bind:this={svg}
  class:panning
  class:overRing={hovered !== null}
  onpointerdown={down}
  onpointermove={move}
  onpointerleave={() => hover(null, null)}
  onpointerup={up}
  onpointercancel={up}
>
  <g transform="translate({camera.ox} {camera.oy}) scale({camera.k})">
    {@render layers()}
  </g>
</svg>
{@render overlay?.()}

<style>
  .plane {
    position: fixed;
    inset: 0;
    display: block;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }
  .plane:focus {
    outline: none;
  }
  .plane:focus-visible {
    outline: 2px solid var(--cos);
    outline-offset: -2px;
  }
  .plane {
    cursor: grab;
  }
  .plane.overRing {
    cursor: pointer;
  }
  .plane.panning {
    cursor: grabbing;
  }
  .dragging {
    cursor: grabbing;
  }
</style>
