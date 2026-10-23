<!-- The full-viewport drawing. Pressing within BAND px of the circle grabs the point and turns it to the pointer;
     pressing elsewhere drags the whole view. Scroll (or pinch) zooms about the pointer. -->
<script lang="ts">
  import { camera, S, LABEL_R } from '../lib/camera.svelte.ts';
  import { fade } from 'svelte/transition';
  import { input } from '../lib/tuning.ts';
  import { aim, point, quiz, revealed, ui } from '../lib/state.svelte.ts';
  import { inverse } from '../lib/inverse.svelte.ts';
  import { snapValue } from '../lib/inverse.ts';
  import { buildScene } from '../lib/scene.ts';
  import { angleTex } from '../lib/angles.ts';
  import { progress } from '../lib/progress.svelte.ts';
  import { SPECIAL, colorOf, norm, rad, snapDeg } from '../lib/trig.ts';
  import { texRect } from '../lib/tex.svelte.ts';
  import Grid from './Grid.svelte';
  import RingLayer from './RingLayer.svelte';
  import CircleLayer from './CircleLayer.svelte';
  import Chips from './Chips.svelte';
  import InverseLayer from './InverseLayer.svelte';
  import RadiansLayer from './RadiansLayer.svelte';

  /** How close (px) to the circle a press must be to grab the point. */
  const BAND = input.grabBand;
  const memo = { b: -1 };
  const scene = $derived(buildScene({
    ang: point.ang, hit: point.hit, dotR: point.dotR, tail: point.tail,
    revealed: revealed(), mirror: ui.mirror,
    mirrorOnly: ui.mode === 'practice' && quiz.cur ? quiz.cur.fn : null,
    showCoords: revealed() || (ui.mode === 'practice' && quiz.hint),
    slopeOpen: ui.slopeOpen, k: camera.k, boost: camera.textBoost, labelBoost: camera.labelBoost, stroke: camera.stroke, unit: progress.unit, decimals: camera.thetaDecimals, bounds: camera.freeWorld, memo,
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
  // a free probe (a composition question) can be moved by the ring, the y-axis or the x-axis: a press takes whichever is closest
  type ProbeBy = 'ring' | 'y' | 'x';
  const probing = $derived(inInverse && inverse.probe !== null);
  const probeBy = (e: { clientX: number; clientY: number }): ProbeBy | null => {
    const dx = Math.abs(e.clientX - camera.ox), dy = Math.abs(e.clientY - camera.oy), reach = S * camera.k + BAND;
    const c: [ProbeBy, number][] = [];
    const dr = Math.abs(Math.hypot(dx, dy) - S * camera.k);
    if (dr <= BAND) c.push(['ring', dr]);
    if (dx <= BAND && dy <= reach) c.push(['y', dx]);
    if (dy <= BAND && dx <= reach) c.push(['x', dy]);
    return c.length ? c.sort((a, b) => a[1] - b[1])[0][0] : null;
  };
  let probeHold: ProbeBy = 'ring', hoverProbe = $state(false);
  const probeAngle = (by: ProbeBy, e: { clientX: number; clientY: number }) => {
    const w = camera.toWorld(e.clientX, e.clientY), cur = inverse.probe ?? 0, r = (v: number) => (v * Math.PI) / 180;
    if (by === 'ring') return snapDeg(grain((Math.atan2(-w.y, w.x) * 180) / Math.PI), snapRange());
    const v = snapValue('asin', Math.max(-1, Math.min(1, by === 'y' ? -w.y / S : w.x / S)), invSnap().value);
    // a value sits at two angles; keep to the side the probe is already on
    if (by === 'y') { const a = (Math.asin(v) * 180) / Math.PI; return Math.cos(r(cur)) >= 0 ? a : 180 - a; }
    const a = (Math.acos(v) * 180) / Math.PI; return Math.sin(r(cur)) >= 0 ? a : -a;
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
    if (probing) { const by = probeBy(e); if (by) { probeHold = by; dragging = true; inverse.moveProbe(probeAngle(by, e), 90); } else panning = true; }
    else if (nearControl(e)) { dragging = true; inverse.dragging = true; aimAt(e); } else panning = true;
  };
  const move = (e: PointerEvent) => {
    if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 2) {
      const p = pinchState();
      camera.panBy(p.x - last.x, p.y - last.y); camera.zoomAt(p.x, p.y, p.d / pinch);
      pinch = p.d; last = p; return;
    }
    if (dragging && probing) inverse.moveProbe(probeAngle(probeHold, e), 90);
    else if (dragging) aimAt(e);
    else if (panning) { camera.panBy(e.clientX - last.x, e.clientY - last.y); last = { x: e.clientX, y: e.clientY }; }
    else if (e.pointerType === 'mouse') {
      if (probing) hoverProbe = probeBy(e) !== null;
      else if (inInverse) inverse.ghost = nearControl(e) ? invPos(e) : null;
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
    const a = rad(ghost), x = S * Math.cos(a), y = -S * Math.sin(a), latex = angleTex(norm(ghost), progress.unit, camera.thetaDecimals);
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
  bind:this={svg} class:panning class:overRing={probing ? hoverProbe : inInverse ? inverse.ghost !== null : ghost !== null}
  onpointerdown={down} onpointermove={move} onpointerleave={() => { ghost = null; inverse.ghost = null; hoverProbe = false; }} onpointerup={up} onpointercancel={up}>
  <g transform="translate({camera.ox} {camera.oy}) scale({camera.k})">
    <Grid />
    <!-- every topic's layer is always mounted: when a topic is left its marks play their own exits, and the next topic's marks enter -->
    <RadiansLayer under />
    <RingLayer />
    <InverseLayer />
    <RadiansLayer />
    <CircleLayer {scene} ghost={ghostDraw} />
  </g>
</svg>
{#if ui.topic === 'circle'}<div in:fade={{ duration: 200 }} out:fade={{ duration: 160 }}><Chips {scene} /></div>{/if}

<style>
  .plane { position: fixed; inset: 0; display: block; touch-action: none; user-select: none; -webkit-user-select: none; }
  .plane:focus { outline: none; }
  .plane:focus-visible { outline: 2px solid var(--cos); outline-offset: -2px; }
  .plane { cursor: grab; }
  .plane.overRing { cursor: pointer; }
  .plane.panning { cursor: grabbing; }
  .dragging { cursor: grabbing; }
</style>
