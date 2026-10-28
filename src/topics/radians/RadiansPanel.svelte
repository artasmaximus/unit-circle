<!-- Radians, exploring: drag the point and read the angle every way at once (radians, as a
     multiple of π, degrees, and as a share of a turn). -->
<script lang="ts">
  import { angleTex, piFraction } from '../../core/angles.ts';
  import { camera } from '../../core/camera.svelte.ts';
  import { point } from '../../core/point.svelte.ts';
  import { norm, rad } from '../../core/trig.ts';
  import InfoTip from '../../ui/InfoTip.svelte';
  import Tex, { PROSE } from '../../ui/Tex.svelte';

  const deg = $derived(norm(point.deg));
  const r = $derived(Math.round(rad(deg) * 1000) / 1000);
  const dd = $derived(camera.thetaDecimals);
  /** The share of a full turn: 1/6 at 60°, as a fraction when the angle has one. */
  const turn = $derived.by(() => {
    const f = piFraction(deg / 2);
    return f
      ? f[1] === 1
        ? String(f[0])
        : `${f[0]}/${f[1]}`
      : (Math.round((deg / 360) * 1000) / 1000).toString();
  });
</script>

<section class="rad">
  <h2 class="p-title">This angle</h2>
  <div class="p-card main">
    <div class="p-big">
      <Tex latex={`\\theta=${r.toFixed(3)}\\text{ radians}`} />
      <InfoTip label="How this was worked out"
        ><Tex latex={`${deg.toFixed(dd)}^\\circ\\times\\pi/180=${r.toFixed(3)}`} /></InfoTip
      >
    </div>
  </div>
  <div class="p-card">
    <div class="p-row"><span class="p-k">As π</span><Tex latex={angleTex(deg, 'rad', dd)} /></div>
    <div class="p-row">
      <span class="p-k">Degrees</span><Tex latex={angleTex(deg, 'deg', dd)} />
    </div>
    <div class="p-row">
      <span class="p-k">Of a turn</span><Tex latex={turn} />
    </div>
    <p class="p-note note">
      A half turn is <Tex latex={'\\pi'} scale={PROSE} /> radians, so every angle you know is a few wedges
      of <Tex latex={'\\pi/6'} scale={PROSE} />, <Tex latex={'\\pi/4'} scale={PROSE} />, <Tex
        latex={'\\pi/3'}
        scale={PROSE}
      /> or <Tex latex={'\\pi/2'} scale={PROSE} />. Here the angle is <Tex
        latex={angleTex(deg, 'rad', dd)}
        scale={PROSE}
      />.
    </p>
  </div>
</section>

<style>
  .rad {
    display: grid;
    gap: 12px;
    --c: var(--rad);
    --k-w: 5rem;
  }
  /* fixed heights so changing numbers never resize the cards */
  .main {
    height: 4.6rem;
    box-sizing: border-box;
    align-content: center;
  }
  .note {
    min-height: 5.2em;
  }
</style>
