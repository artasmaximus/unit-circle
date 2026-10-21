<!-- The full-viewport drawing. Pressing anywhere on it moves the point to that direction; dragging keeps moving it. -->
<script lang="ts">
  import { camera } from '../lib/camera.svelte.ts';
  import { point, quiz, revealed, ui } from '../lib/state.svelte.ts';
  import { buildScene } from '../lib/scene.ts';
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
    slopeOpen: ui.slopeOpen, k: camera.k, bounds: camera.freeWorld, memo,
  }));

  let dragging = $state(false);
  const aim = (e: PointerEvent) => {
    const w = camera.toWorld(e.clientX, e.clientY);
    point.set((Math.atan2(-w.y, w.x) * 180) / Math.PI);
  };
</script>

<svg class="plane" class:dragging width={camera.vw} height={camera.vh} role="slider" aria-label="Angle θ" aria-valuemin={0} aria-valuemax={360}
  aria-valuenow={Math.round(point.deg)} tabindex="0"
  onpointerdown={(e) => { dragging = true; (e.currentTarget as Element).setPointerCapture(e.pointerId); aim(e); }}
  onpointermove={(e) => dragging && aim(e)}
  onpointerup={() => (dragging = false)} onpointercancel={() => (dragging = false)}>
  <g transform="translate({camera.ox} {camera.oy}) scale({camera.k})">
    <Grid />
    <Ring />
    <Figure {scene} />
    <circle cx={scene.x} cy={scene.y} r="24" fill="transparent" class="grab" />
    <circle cx={scene.x} cy={scene.y} r={point.dotR} fill={point.hit !== undefined ? scene.col : 'var(--fg)'} stroke="var(--panel)" stroke-width="2" pointer-events="none" />
  </g>
</svg>
<Chips {scene} />

<style>
  .plane { position: fixed; inset: 0; display: block; touch-action: none; user-select: none; -webkit-user-select: none; }
  .plane:focus { outline: none; }
  .plane:focus-visible { outline: 2px solid var(--c45); outline-offset: -2px; }
  .grab { cursor: grab; }
  .dragging, .dragging .grab { cursor: grabbing; }
</style>
