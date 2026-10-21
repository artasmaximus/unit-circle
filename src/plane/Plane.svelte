<!-- The full-viewport drawing. Pressing anywhere on it moves the point to that direction; dragging keeps moving it. -->
<script lang="ts">
  import { camera, S } from '../lib/camera.svelte.ts';
  import { point, quiz, revealed, ui } from '../lib/state.svelte.ts';
  import { buildScene } from '../lib/scene.ts';
  import { rad, snapDeg } from '../lib/trig.ts';
  import { texRect } from '../lib/tex.svelte.ts';
  import SvgTex from '../ui/SvgTex.svelte';
  import Grid from './Grid.svelte';
  import Ring from './Ring.svelte';
  import Figure from './Figure.svelte';
  import Chips from './Chips.svelte';

  const memo = { a: -1, b: -1 };
  const scene = $derived(buildScene({
    ang: point.ang, hit: point.hit, dotR: point.dotR, tail: point.tail,
    revealed: revealed(), mirror: ui.mirror,
    mirrorOnly: ui.mode === 'quiz' && quiz.cur ? quiz.cur.fn : null,
    showCoords: revealed() || (ui.mode === 'quiz' && quiz.hint),
    k: camera.k, bounds: camera.freeWorld, memo,
  }));

  let dragging = $state(false);
  /** Where the pointer is aiming while it hovers: a faint ray shows the angle a press would pick. */
  let ghost = $state<number | null>(null);
  const ghostAt = (e: PointerEvent) => {
    const w = camera.toWorld(e.clientX, e.clientY);
    return snapDeg((Math.atan2(-w.y, w.x) * 180) / Math.PI);
  };
  const ghostDraw = $derived.by(() => {
    if (ghost === null || dragging || Math.abs(ghost - point.deg) < 0.5) return null;
    const x = S * Math.cos(rad(ghost)), y = -S * Math.sin(rad(ghost)), latex = `${Math.round(ghost * 10) / 10}^\\circ`;
    const rect = texRect(latex, 10, x * 1.13, y * 1.13);
    return { x, y, label: rect && { latex, size: 10, rect, color: 'var(--muted)' } };
  });
  const aim = (e: PointerEvent) => {
    const w = camera.toWorld(e.clientX, e.clientY);
    point.set((Math.atan2(-w.y, w.x) * 180) / Math.PI);
  };
</script>

<svg class="plane" class:dragging width={camera.vw} height={camera.vh} role="slider" aria-label="Angle θ" aria-valuemin={0} aria-valuemax={360}
  aria-valuenow={Math.round(point.deg)} tabindex="0"
  onpointerdown={(e) => { dragging = true; (e.currentTarget as Element).setPointerCapture(e.pointerId); aim(e); }}
  onpointermove={(e) => { if (dragging) aim(e); else if (e.pointerType === 'mouse') ghost = ghostAt(e); }}
  onpointerleave={() => (ghost = null)}
  onpointerup={() => (dragging = false)} onpointercancel={() => (dragging = false)}>
  <g transform="translate({camera.ox} {camera.oy}) scale({camera.k})">
    <Grid />
    <Ring />
    {#if ghostDraw}
      <g class="ghost">
        <line x1="0" y1="0" x2={ghostDraw.x} y2={ghostDraw.y} />
        <circle cx={ghostDraw.x} cy={ghostDraw.y} r="5" />
        {#if ghostDraw.label}<SvgTex label={ghostDraw.label} />{/if}
      </g>
    {/if}
    <Figure {scene} />
    <circle cx={scene.x} cy={scene.y} r="24" fill="transparent" class="grab" />
    <circle cx={scene.x} cy={scene.y} r={point.dotR} fill={scene.col} stroke="var(--panel)" stroke-width="2" pointer-events="none" />
  </g>
</svg>
<Chips {scene} />

<style>
  .plane { position: fixed; inset: 0; display: block; touch-action: none; user-select: none; -webkit-user-select: none; }
  .plane:focus { outline: none; }
  .plane:focus-visible { outline: 2px solid var(--cos); outline-offset: -2px; }
  .grab { cursor: grab; }
  .ghost { pointer-events: none; opacity: 0.45; }
  .ghost line { stroke: var(--muted); stroke-width: 1; stroke-dasharray: 2 4; }
  .ghost circle { fill: none; stroke: var(--muted); stroke-width: 1.25; }
  .dragging, .dragging .grab { cursor: grabbing; }
</style>
