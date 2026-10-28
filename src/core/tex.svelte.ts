// LaTeX → SVG through MathJax (bundled, no network). Sizes come back in em, so callers can lay
// labels out without measuring the DOM.
import './mathjax-config.ts';
import 'mathjax/es5/tex-svg.js';

export const math = $state({ ready: false });
(window as any).MathJax.startup.promise.then(() => (math.ready = true));

/** w, h and depth (below the baseline) in em. */
export type TexBox = { viewBox: string; w: number; h: number; depth: number; inner: string };
const cache = new Map<string, TexBox>();

/** Null until MathJax has loaded; reading it inside $derived re-runs once it has. */
export function texBox(latex: string): TexBox | null {
  if (!math.ready) return null;
  let b = cache.get(latex);
  if (b) {
    // keep the labels in use at the back, so a full cache drops the ones not drawn lately
    cache.delete(latex);
    cache.set(latex, b);
  } else {
    if (cache.size > 800) for (const k of [...cache.keys()].slice(0, 200)) cache.delete(k);
    const svg = (window as any).MathJax.tex2svg('\\displaystyle ' + latex, {
      display: false,
    }).querySelector('svg') as SVGSVGElement;
    const [, y, w, h] = svg.getAttribute('viewBox')!.split(/\s+/).map(Number);
    b = {
      viewBox: svg.getAttribute('viewBox')!,
      w: w / 1000,
      h: h / 1000,
      depth: (h + y) / 1000,
      inner: svg.innerHTML,
    };
    cache.set(latex, b);
  }
  return b;
}

export type Rect = { x: number; y: number; w: number; h: number };
/**
 * Box of a label of font size `size` anchored at (x, y); (ax, ay) = which point of the box sits on
 * the anchor.
 */
export function texRect(
  latex: string,
  size: number,
  x: number,
  y: number,
  ax = 0.5,
  ay = 0.5,
): Rect | null {
  const b = texBox(latex);
  if (!b) return null;
  const w = b.w * size,
    h = b.h * size;
  return { x: x - w * ax, y: y - h * ay, w, h };
}
