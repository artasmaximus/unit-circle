<!-- Radians, exploring: drag the point and read the angle every way at once (radians, as a
     multiple of π, degrees, and as a share of a turn). -->
<script lang="ts">
  import { angleTex, piFraction } from '../../core/angles.ts';
  import { camera } from '../../core/camera.svelte.ts';
  import { point } from '../../core/point.svelte.ts';
  import { norm } from '../../core/trig.ts';
  import InfoTip from '../../ui/InfoTip.svelte';
  import Tex from '../../ui/Tex.svelte';

  const deg = $derived(norm(point.deg));
  const r = $derived(Math.round(((deg * Math.PI) / 180) * 1000) / 1000);
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
  <h2>This angle</h2>
  <div class="card main">
    <div class="big">
      <Tex latex={`\\theta=${r.toFixed(3)}\\text{ radians}`} />
      <InfoTip label="How this was worked out"
        ><Tex latex={`${deg.toFixed(dd)}^\\circ\\times\\pi/180=${r.toFixed(3)}`} /></InfoTip
      >
    </div>
  </div>
  <div class="card rows">
    <div class="row"><span class="k">As π</span><Tex latex={angleTex(deg, 'rad', dd)} /></div>
    <div class="row"><span class="k">Degrees</span><Tex latex={angleTex(deg, 'deg', dd)} /></div>
    <div class="row">
      <span class="k">Of a turn</span><Tex
        latex={turn === '0' ? '0' : /\//.test(turn) ? turn : turn}
      />
    </div>
    <p class="note">
      A half turn is <Tex latex={'\\pi'} /> radians, so every angle you know is a few pieces of <Tex
        latex={'\\pi/6'}
      />, <Tex latex={'\\pi/4'} />, <Tex latex={'\\pi/3'} /> or <Tex latex={'\\pi/2'} />. Here the
      angle is <Tex latex={angleTex(deg, 'rad', dd)} />.
    </p>
  </div>
</section>

<style>
  .rad {
    display: grid;
    gap: 12px;
    --c: var(--rad);
  }
  h2 {
    margin: 0 0 2px;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--muted);
  }
  /* tinted glass like the slope chip, in the radians color; fixed heights so changing numbers
     never resize the cards */
  .card {
    display: grid;
    gap: 8px;
    padding: 12px 14px;
    border: 1px solid color-mix(in srgb, var(--c) 35%, transparent);
    border-radius: 8px;
    background: color-mix(in srgb, var(--c) 10%, var(--glass));
  }
  .main {
    height: 4.6rem;
    box-sizing: border-box;
    align-content: center;
  }
  .big {
    font-size: 1.45rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .row {
    display: flex;
    align-items: baseline;
    gap: 12px;
    height: 1.7rem;
  }
  .k {
    width: 5rem;
    font-size: 0.72rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .note {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.5;
    color: var(--muted);
    min-height: 5.2em;
  }
</style>
