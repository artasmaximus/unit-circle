// What the Radians topic puts on the plane, as keyed marks (see plane/marks.ts). The big idea is
// that an angle in radians is a length: lay the circle's radius along its edge and count. The
// drawing is built from features that a Guide turns on one at a time (a feature is a group of
// marks: its marks enter when it comes on and leave when it goes off), and that Explore turns on
// all together.
import { S } from '../../core/camera.svelte.ts';
import type { Mark } from '../../plane/marks.ts';
import type { Label } from '../../plane/marks.ts';
import { texRect } from '../../core/tex.svelte.ts';
import { piFraction, piTex } from '../../core/angles.ts';

export { FEATURES, type Feature } from './features.ts';
import type { Feature } from './features.ts';

export type RadiansInput = {
  active: boolean;
  features: ReadonlySet<Feature>;
  /** The point's angle in radians (it springs, so this moves smoothly). */
  ang: number;
  /** Where the point is headed, in radians: the slices follow this, not the spring. */
  target: number;
  sw: number;
  lb: number;
};

const COLOR = 'var(--rad)';
const at = (a: number, r = S): [number, number] => [r * Math.cos(a), -r * Math.sin(a)];
const arcPath = (a0: number, a1: number, r = S) => {
  const [x0, y0] = at(a0, r),
    [x1, y1] = at(a1, r);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 0 ${x1} ${y1}`;
};

export function radiansMarks(i: RadiansInput): Mark[] {
  if (!i.active) return [];
  const { sw, lb, features: f } = i,
    out: Mark[] = [];
  // the point's angle, kept inside one turn; an angle of exactly a full turn reads as a full turn
  // rather than zero
  const a = i.ang,
    P = at(a);
  const lab = (
    latex: string,
    size: number,
    x: number,
    y: number,
    color: string,
    ax = 0.5,
    ay = 0.5,
  ): Label | null => {
    const rect = texRect(latex, size * lb, x, y, ax, ay);
    return rect && { latex, size: size * lb, rect, color };
  };
  const label = (m: Omit<Extract<Mark, { kind: 'label' }>, 'kind' | 'label'>, l: Label | null) => {
    if (l) out.push({ kind: 'label', label: l, ...m });
  };

  // ---- the radius as a ruler, along the x-axis from the middle to where the angle starts
  if (f.has('radius')) {
    out.push({
      kind: 'line',
      key: 'rad:radius',
      z: 4,
      x1: 0,
      y1: 0,
      x2: S,
      y2: 0,
      color: COLOR,
      width: 3.5 * sw,
      round: true,
      enter: 'draw',
      dur: 600,
    });
    out.push({
      kind: 'dot',
      key: 'rad:radius:end',
      z: 5,
      x: S,
      y: 0,
      r: 4 * sw,
      fill: COLOR,
      stroke: 'var(--panel)',
      width: 1.5 * sw,
      enter: 'pop',
      delay: 450,
    });
    label(
      { key: 'rad:radius:label', z: 9, back: lb, enter: 'fade', delay: 500 },
      lab('\\text{radius}=1', 10, S / 2, 14 * sw, COLOR),
    );
  }

  // ---- the radius laid along the top half of the edge: three lengths fit, and a little more is
  // left to reach the end of the half turn
  if (f.has('beads')) {
    for (let k = 1; k <= 3; k++) {
      const [x, y] = at(k),
        reached = a >= k - 1e-9;
      out.push({
        kind: 'dot',
        key: `rad:bead:${k}`,
        z: 6,
        x,
        y,
        r: 4.2 * sw,
        fill: reached ? COLOR : 'var(--bg)',
        stroke: COLOR,
        width: 1.75 * sw,
        enter: 'pop',
        delay: 300 + 380 * k,
        dur: 320,
        exitDelay: 40 * (3 - k),
        exitDur: 160,
      });
      const [lx, ly] = at(k, S * 0.84);
      label(
        {
          key: `rad:bead:label:${k}`,
          z: 8,
          enter: 'fade',
          delay: 360 + 380 * k,
          exitDur: 120,
          opacity: reached ? 1 : 0.7,
        },
        lab(String(k), 10, lx, ly, COLOR),
      );
    }
  }
  // ---- the half turn itself, drawn over the top half of the circle and named π
  if (f.has('half')) {
    out.push({
      kind: 'path',
      key: 'rad:half',
      z: 1,
      d: arcPath(0, Math.PI),
      color: 'url(#rad-half)',
      width: 4 * sw,
      round: true,
      enter: 'draw',
      delay: f.has('beads') ? 1600 : 200,
      dur: 700,
    });
    const [tx, ty] = at(Math.PI / 2, S * 1.1);
    label(
      { key: 'rad:half:label', z: 9, back: lb, enter: 'fade', delay: f.has('beads') ? 2100 : 600 },
      lab(
        f.has('beads') ? '\\pi\\approx 3.14\\text{ radii}' : '\\pi\\text{ radians}',
        11,
        tx,
        ty,
        COLOR,
      ),
    );
  }

  // ---- the angle shaded as slices. Where the angle is whole pieces of one unit fraction of π
  // (2π/3 is two pieces of π/3) each piece is its own slice, and moving to another such angle
  // slides, shrinks, adds or removes slices; anywhere else it is a single slice that follows the
  // point. Slices go by slot, so they carry over from one angle to the next.
  if (f.has('slices') && i.target > 0.004) {
    const T = i.target,
      fr = piFraction((T * 180) / Math.PI),
      whole = fr && fr[0] <= 12 ? fr : null;
    const [n, d] = whole ?? [1, 0],
      step = whole ? Math.PI / d : T;
    for (let j = 0; j < n; j++) {
      out.push({
        kind: 'slice',
        key: `rad:piece:${j}`,
        z: 2,
        a0: j * step,
        a1: (j + 1) * step,
        r: S,
        gap: 1.3 * sw,
        edge0: j === 0 ? 2.6 * sw : undefined,
        edge1: j === n - 1 ? 2.6 * sw : undefined,
        rim: 2.6 * sw,
        fill: COLOR,
        opacity: 0.34,
        enter: 'fade',
        dur: 200,
        exitDur: 200,
      });
      // each of several pieces is named, small and dark, so it reads as a piece of that size
      if (whole && n > 1 && f.has('readout')) {
        const [mx, my] = at((j + 0.5) * step, S * 0.8);
        label(
          { key: `rad:piece:label:${j}`, z: 9, enter: 'fade', delay: 220, dur: 200, exitDur: 120 },
          lab(piTex(1, d), 9, mx, my, 'var(--bg)'),
        );
      }
    }
    if (whole && f.has('readout')) {
      const [mx, my] = at(T / 2, S * 0.5);
      label(
        {
          key: 'rad:slice:label',
          z: 9,
          back: lb,
          enter: 'fade',
          delay: 120,
          dur: 200,
          exitDur: 120,
        },
        lab(piTex(n, d), 11, mx, my, COLOR),
      );
    }
  }

  // ---- the point and its radius line
  if (f.size) {
    out.push({
      kind: 'line',
      key: 'rad:ray',
      z: 6,
      x1: 0,
      y1: 0,
      x2: P[0],
      y2: P[1],
      color: 'var(--fg)',
      width: 1.75 * sw,
      round: true,
      enter: 'draw',
      dur: 450,
    });
    out.push({
      kind: 'dot',
      key: 'rad:point',
      z: 10,
      x: P[0],
      y: P[1],
      r: 7 * sw,
      fill: 'var(--fg)',
      stroke: 'var(--panel)',
      width: 2 * sw,
      enter: 'pop',
      delay: 150,
    });
  }
  return out;
}
