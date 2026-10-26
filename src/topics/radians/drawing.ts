// What the Radians topic puts on the plane, composed from figures (see figures/figure.ts). The big
// idea is that an angle in radians is a length: lay the circle's radius along its edge and count.
// The drawing is built from features that a Guide turns on one at a time (a feature is a group of
// marks: its marks enter when it comes on and leave when it goes off), and that Explore turns on
// all together.
import { S } from '../../core/camera.svelte.ts';
import { piFraction, piTex } from '../../core/angles.ts';
import type { Mark } from '../../plane/marks.ts';
import { polar, type Ctx } from '../../figures/figure.ts';
import { Arc } from '../../figures/arc.ts';
import { ArcRuler } from '../../figures/arcRuler.ts';
import { Label } from '../../figures/label.ts';
import { Point } from '../../figures/point.ts';
import { Segment } from '../../figures/segment.ts';
import { Wedges } from '../../figures/wedges.ts';

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

export function radiansMarks(i: RadiansInput): Mark[] {
  if (!i.active) return [];
  const f = i.features,
    ctx: Ctx = { sw: i.sw, lb: i.lb },
    out: Mark[] = [];
  const add = (d: { marks: Mark[] }) => out.push(...d.marks);
  const a = i.ang,
    P = polar(a, S);

  // ---- the radius as a ruler, along the x-axis from the middle to where the angle starts
  if (f.has('radius')) {
    add(
      Segment(
        'rad:radius',
        {
          from: [0, 0],
          to: [S, 0],
          color: COLOR,
          width: 3.5,
          round: true,
          z: 4,
          enter: 'draw',
          dur: 600,
        },
        ctx,
      ),
    );
    add(
      Point(
        'rad:radius:end',
        { at: [S, 0], r: 4, fill: COLOR, stroke: 'var(--panel)', width: 1.5, z: 5, delay: 450 },
        ctx,
      ),
    );
    add(
      Label(
        'rad:radius:label',
        {
          tex: '\\text{radius}=1',
          size: 10,
          at: [S / 2, 14 * i.sw],
          color: COLOR,
          back: true,
          z: 9,
          enter: 'fade',
          delay: 500,
        },
        ctx,
      ),
    );
  }

  // ---- the radius laid along the top half of the edge: three lengths fit, and a little more is
  // left to reach the end of the half turn
  if (f.has('beads')) {
    add(
      ArcRuler(
        'rad:bead',
        { r: S, step: 1, count: 3, upTo: a, color: COLOR, labelAt: 0.84, delay: 680, every: 380 },
        ctx,
      ),
    );
  }
  // ---- the half turn itself, drawn over the top half of the circle and named π
  if (f.has('half')) {
    const beads = f.has('beads');
    add(
      Arc(
        'rad:half',
        {
          from: 0,
          to: Math.PI,
          r: S,
          color: 'url(#rad-half)',
          width: 4,
          round: true,
          z: 1,
          delay: beads ? 1600 : 200,
          dur: 700,
        },
        ctx,
      ),
    );
    add(
      Label(
        'rad:half:label',
        {
          tex: beads ? '\\pi\\approx 3.14\\text{ radii}' : '\\pi\\text{ radians}',
          size: 11,
          at: polar(Math.PI / 2, S * 1.1),
          color: COLOR,
          back: true,
          z: 9,
          enter: 'fade',
          delay: beads ? 2100 : 600,
        },
        ctx,
      ),
    );
  }

  // ---- the angle shaded as slices. Where the angle is whole pieces of one unit fraction of π
  // (2π/3 is two pieces of π/3) each piece is its own slice; anywhere else it is a single slice
  // that follows the point.
  if (f.has('slices') && i.target > 0.004) {
    const T = i.target,
      fr = piFraction((T * 180) / Math.PI),
      whole = fr && fr[0] <= 12 ? fr : null;
    const [n, d] = whole ?? [1, 0],
      readout = !!whole && f.has('readout');
    add(
      Wedges(
        'rad:piece',
        {
          n,
          step: whole ? Math.PI / d : T,
          r: S,
          fill: COLOR,
          opacity: 0.34,
          gap: 1.3,
          edge: 2.6,
          // each of several pieces is named, small and dark, so it reads as a piece of that size
          labels:
            readout && n > 1
              ? { tex: piTex(1, d), size: 9, at: 0.8, color: 'var(--bg)' }
              : undefined,
        },
        ctx,
      ),
    );
    if (readout) {
      add(
        Label(
          'rad:slice:label',
          {
            tex: piTex(n, d),
            size: 11,
            at: polar(T / 2, S * 0.5),
            color: COLOR,
            back: true,
            z: 9,
            enter: 'fade',
            delay: 120,
            dur: 200,
            exitDur: 120,
          },
          ctx,
        ),
      );
    }
  }

  // ---- the point and its radius line
  if (f.size) {
    add(
      Segment(
        'rad:ray',
        { from: [0, 0], to: P, width: 1.75, round: true, z: 6, enter: 'draw', dur: 450 },
        ctx,
      ),
    );
    add(
      Point(
        'rad:point',
        { at: P, r: 7, fill: 'var(--fg)', stroke: 'var(--panel)', width: 2, z: 10, delay: 150 },
        ctx,
      ),
    );
  }
  return out;
}
