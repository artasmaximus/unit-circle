<!-- The full-viewport drawing. Pressing within BAND px of the circle grabs the point and turns it to the pointer;
     pressing elsewhere drags the whole view. Scroll (or pinch) zooms about the pointer. -->
<script lang="ts">
  import { camera, S, LABEL_R } from '../lib/camera.svelte.ts';
  import { fade } from 'svelte/transition';
  import { input } from '../lib/tuning.ts';
  import { aim, point, quiz, revealed, ui } from '../lib/state.svelte.ts';
  import { inverse } from '../lib/inverse.svelte.ts';
  import { buildScene } from '../lib/scene.ts';
  import { SPECIAL, colorOf, degText, rad, snapDeg } from '../lib/trig.ts';
  import { texRect } from '../lib/tex.svelte.ts';
  import Grid from './Grid.svelte';
  import RingLayer from './RingLayer.svelte';
  import CircleLayer from './CircleLayer.svelte';
  import Chips from './Chips.svelte';
  import InverseLayer from './InverseLayer.svelte';

  /** How close (px) to the circle a press must be to grab the point. */
  const BAND = input.grabBand;
  const memo = { b: -1 };
  const scene = $derived(buildScene({
    ang: point.ang, hit: point.hit, dotR: point.dotR, tail: point.tail,
    revealed: revealed(), mirror: ui.mirror,
    mirrorOnly: ui.mode === 'quiz' && quiz.cur ? quiz.cur.fn : null,
    showCoords: revealed() || (ui.mode === 'quiz' && quiz.hint),
    slopeOpen: ui.slopeOpen, k: camera.k, boost: camera.textBoost, labelBoost: camera.labelBoost, stroke: camera.stroke, bounds: camera.freeWorld, memo,
  }));

  let dragging = $state(false), panning = $state(false);
  /** Where the pointer is aiming while it hovers near the circle: a faint ray shows the angle a press would pick. */
  let ghost = $state<number | null>(null);
  const ghostAt = (e: PointerEvent) => {
    const w = camera.toWorld(e.clientX, e.clientY);
    return snapDeg(grain((Math.atan2(-w.y, w.x) * 180) / Math.PI), snapRange());
  };
  /** Zoomed in, a degree is a lot of screen, so the snap range tightens with it. */
  const snapRange = () => input.snapRange / Math.max(1, camera.zoom);
  /** The angle lands on whole degrees at the default zoom, and on finer steps as you zoom in. */
  const grain = (deg: number) => { const f = 10 ** camera.thetaDecimals; return Math.round(deg * f) / f; };
  const nearRing = (e: { clientX: number; clientY: number }) =>
    Math.abs(Math.hypot(e.clientX - camera.ox, e.clientY - camera.oy) - S * camera.k) <= BAND;
  // what a press can grab depends on the topic: the point on the ring (unit circle, arctan), or the axis the value lives on (arcsin, arccos); the faded preview shows only where a press would grab
  const inInverse = $derived(ui.topic === 'inverse');
  const nearControl = (e: { clientX: number; clientY: number }) => {
    if (!inInverse) return nearRing(e);
    if (inverse.locked) return false;
    // press close to what you are choosing: the circle's edge for an angle (arctan), or the axis the value lives on
    const dx = Math.abs(e.clientX - camera.ox), dy = Math.abs(e.clientY - camera.oy), reach = S * camera.k + BAND;
    return inverse.fn === 'atan' ? nearRing(e) : inverse.fn === 'asin' ? dx <= BAND && dy <= reach : dy <= BAND && dx <= reach;
  };
  const invSnap = () => ({ value: 0.03 / Math.max(1, camera.zoom), angle: snapRange() });
  const invPos = (e: { clientX: number; clientY: number }) => { const w = camera.toWorld(e.clientX, e.clientY); return inverse.angleAt(w.x, w.y, S, invSnap(), grain); };
  const touches = new Map<number, { x: number; y: number }>();
  let last = { x: 0, y: 0 }, pinch = 0;
  const pinchState = () => { const [a, b] = [...touches.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
  const down = (e: PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 2) { dragging = false; panning = true; const p = pinchState(); pinch = p.d; last = p; return; }
    last = { x: e.clientX, y: e.clientY };
    if (nearControl(e)) { dragging = true; inverse.dragging = true; aimAt(e); } else panning = true;
  };
  const move = (e: PointerEvent) => {
    if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 2) {
      const p = pinchState();
      camera.panBy(p.x - last.x, p.y - last.y); camera.zoomAt(p.x, p.y, p.d / pinch);
      pinch = p.d; last = p; return;
    }
    if (dragging) aimAt(e);
    else if (panning) { camera.panBy(e.clientX - last.x, e.clientY - last.y); last = { x: e.clientX, y: e.clientY }; }
    else if (e.pointerType === 'mouse') {
      if (inInverse) inverse.ghost = nearControl(e) ? invPos(e) : null;
      else ghost = nearRing(e) ? ghostAt(e) : null;
    }
  };
  const up = (e: PointerEvent) => {
    touches.delete(e.pointerId);
    if (touches.size === 1) { const [r] = touches.values(); last = r; }
    if (!touches.size) { dragging = panning = false; inverse.dragging = false; }
  };
  let svg = $state<SVGSVGElement>();
  $effect(() => {
    const el = svg;
    if (!el) return;
    const wheel = (e: WheelEvent) => { e.preventDefault(); camera.zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * (e.ctrlKey ? input.pinchZoom : input.wheelZoom))); };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  });
  // the ghost sits exactly where the pointer aims; its label rides out to the ring label's own spot on a snap angle, and takes that label's place there
  const ghostDraw = $derived.by(() => {
    if (ghost === null || dragging || Math.abs(ghost - point.deg) < 0.5) return null;
    const a = rad(ghost), x = S * Math.cos(a), y = -S * Math.sin(a), latex = `${degText(ghost, camera.thetaDecimals)}^\\circ`;
    const special = SPECIAL.includes(ghost), size = 10 * camera.labelBoost;
    const rect = texRect(latex, size, LABEL_R * Math.cos(a), -LABEL_R * Math.sin(a));
    const color = special && revealed() ? colorOf(ghost) : 'var(--muted)';
    return { x, y, special, label: rect && { latex, size, rect, color } };
  });
  $effect(() => { aim.deg = ghostDraw?.special ? ghost : null; });
  const aimAt = (e: PointerEvent) => {
    const w = camera.toWorld(e.clientX, e.clientY);
    if (inInverse) return inverse.setFromWorld(w.x, w.y, S, invSnap(), grain);
    point.set(grain((Math.atan2(-w.y, w.x) * 180) / Math.PI), false, snapRange());
  };
</script>

<svg class="plane" style="--sw:{camera.boost}; --wk:{camera.stroke}" class:dragging width={camera.vw} height={camera.vh} role="slider" aria-label="Angle θ" aria-valuemin={0} aria-valuemax={360}
  aria-valuenow={Math.round(point.deg)} tabindex="0"
  bind:this={svg} class:panning class:overRing={inInverse ? inverse.ghost !== null : ghost !== null}
  onpointerdown={down} onpointermove={move} onpointerleave={() => { ghost = null; inverse.ghost = null; }} onpointerup={up} onpointercancel={up}>
  <g transform="translate({camera.ox} {camera.oy}) scale({camera.k})">
    <Grid />
    <!-- every topic's layer is always mounted: when a topic is left its marks play their own exits, and the next topic's marks enter -->
    <RingLayer />
    <InverseLayer />
    <CircleLayer {scene} ghost={ghostDraw} />
  </g>
</svg>
{#if !inInverse}<div in:fade={{ duration: 200 }} out:fade={{ duration: 160 }}><Chips {scene} /></div>{/if}

<style>
  .plane { position: fixed; inset: 0; display: block; touch-action: none; user-select: none; -webkit-user-select: none; }
  .plane:focus { outline: none; }
  .plane:focus-visible { outline: 2px solid var(--cos); outline-offset: -2px; }
  .plane { cursor: grab; }
  .plane.overRing { cursor: pointer; }
  .plane.panning { cursor: grabbing; }
  .dragging { cursor: grabbing; }
</style>
