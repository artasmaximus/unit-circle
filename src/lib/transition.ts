// Shared-element morphs through the browser's View Transitions API: give two elements the same
// `view-transition-name`, change the page inside `morph()`, and the browser animates one into the
// other, landing exactly on the final layout. Where the API is missing (or motion is reduced) the
// change just happens.
import { tick } from 'svelte';

export const reduce =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function morph(change: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => Promise<void>) => unknown };
  if (reduce || !doc.startViewTransition) return change();
  doc.startViewTransition(async () => {
    change();
    await tick();
  });
}

/** An underdamped spring sampled into a CSS `linear()` easing: overshoots a touch, then settles. */
function springCurve(stiffness = 170, damping = 19, steps = 40) {
  const w0 = Math.sqrt(stiffness),
    zeta = damping / (2 * w0),
    wd = w0 * Math.sqrt(1 - zeta * zeta);
  const x = (t: number) =>
    1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
  let end = 0; // time at which it has settled to within 0.1%
  for (let t = 0; t < 5; t += 0.01) if (Math.abs(1 - x(t)) > 0.001) end = t;
  const pts = Array.from({ length: steps + 1 }, (_, i) => +x((end * i) / steps).toFixed(4));
  pts[steps] = 1;
  return { easing: `linear(${pts.join(', ')})`, ms: Math.round(end * 1000) };
}
if (typeof document !== 'undefined') {
  const s = springCurve();
  document.documentElement.style.setProperty('--spring', s.easing);
  document.documentElement.style.setProperty('--spring-ms', `${s.ms}ms`);
}
