// What the Unit circle Guide puts on the plane, composed from figures (see figures/figure.ts). It
// is a simpler picture than Explore's, built up one feature at a time: the point's shadows on the
// axes, their names, the right triangle, the special triangles, its mirror images, where each value
// is positive, the reference angle and the slope. Explore's scene (scene.ts) steps aside while
// the Guide is on, and this one asks for nothing otherwise.
import { S } from '../../core/camera.svelte.ts';
import { angleTex, type Unit } from '../../core/angles.ts';
import { dec, refOf, trigTex, type Fn } from '../../core/trig.ts';
import type { Mark } from '../../plane/marks.ts';
import { polar, type Ctx, type Look } from '../../figures/figure.ts';
import { Arc } from '../../figures/arc.ts';
import { Brace } from '../../figures/brace.ts';
import { Label } from '../../figures/label.ts';
import { Point } from '../../figures/point.ts';
import { Polygon } from '../../figures/polygon.ts';
import { RightTriangle } from '../../figures/rightTriangle.ts';
import { Sector } from '../../figures/sector.ts';
import { Segment } from '../../figures/segment.ts';
import type { Feature } from './features.ts';
import { DUR, STAGGER, after } from '../../core/tuning.ts';

export type UnitGuideInput = {
  active: boolean;
  features: ReadonlySet<Feature>;
  /**
   * The point's angle in radians as drawn (it springs), and where it is headed in degrees (the
   * values are read off this).
   */
  ang: number;
  deg: number;
  unit: Unit;
  sw: number;
  lb: number;
};

const COS = 'var(--cos)',
  SIN = 'var(--sin)',
  TAN = 'var(--slope)';
/** The faint dashed line the Guide uses for drop lines and helper lines. */
const DASHED: Look = { width: 1.5, dash: true, round: true, opacity: 0.7 };

export function unitGuideScene(i: UnitGuideInput): Mark[] {
  if (!i.active || !i.features.size) return [];
  const f = i.features,
    ctx: Ctx = { sw: i.sw, lb: i.lb },
    sw = i.sw,
    out: Mark[] = [];
  const add = <D extends { marks: Mark[] }>(d: D) => {
    out.push(...d.marks);
    return d;
  };
  const a = ((i.ang % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI),
    c = Math.cos(a),
    s = Math.sin(a),
    [px, py] = polar(a, S);
  /**
   * A value at the point's angle: exact at a special angle once the Guide has earned that, a
   * decimal otherwise.
   */
  const val = (fn: Fn) => {
    if (f.has('exact')) return trigTex(fn, i.deg);
    const r = (i.deg * Math.PI) / 180,
      v = fn === 'cos' ? Math.cos(r) : fn === 'sin' ? Math.sin(r) : Math.sin(r) / Math.cos(r);
    return dec(v);
  };
  const ref = refOf(i.deg),
    named = f.has('names'),
    tri = f.has('triangle');

  // ---- where each value is positive: the right half (cos > 0) tinted in cos's color, the top half
  // (sin > 0) in sin's. A quadrant's signs are which tints cover it; quadrant III has neither.
  if (f.has('quads')) {
    const tint = { r: S, opacity: 0.1, z: 1, enter: 'fade', dur: DUR.draw } as const;
    add(Sector('ug:quads:cos', { from: -Math.PI / 2, to: Math.PI / 2, fill: COS, ...tint }, ctx));
    add(Sector('ug:quads:sin', { from: 0, to: Math.PI, fill: SIN, ...tint, delay: after(1) }, ctx));
  }

  // ---- the point's mirror images in the other quadrants. As in Explore, the lines already there
  // run on to the reflected points rather than a new one being drawn beneath: the drop line across
  // the y-axis, the radius through the centre, and the upright side down below the axis.
  if (f.has('mirror')) {
    (
      [
        { at: [-px, py], from: [0, py] },
        { at: [-px, -py], from: [0, 0] },
        { at: [px, -py], from: [px, 0] },
      ] as const
    ).forEach(({ at, from }, k) => {
      add(
        Segment(
          `ug:mirror:line:${k}`,
          {
            from: [...from],
            to: [...at],
            color: 'var(--muted)',
            ...DASHED,
            z: 3,
            enter: 'draw',
            delay: STAGGER.labels * k,
            dur: DUR.base,
          },
          ctx,
        ),
      );
      add(
        Point(
          `ug:mirror:dot:${k}`,
          {
            at: [...at],
            r: 4.5,
            fill: 'var(--bg)',
            stroke: 'var(--muted)',
            width: 1.5,
            z: 7,
            delay: STAGGER.labels * k + after(1),
          },
          ctx,
        ),
      );
    });
  }

  // ---- the shadows: drop lines to each axis, and the shadow itself along the axis, named x and y
  // (then cos θ and sin θ, in their colors). Once there is a triangle, the drop line to the x-axis
  // becomes its upright side.
  const shadows = f.has('shadows'),
    cc = named ? COS : 'var(--fg)',
    sc = named ? SIN : 'var(--fg)',
    shadow: Look = { width: 3.5, round: true, z: 5 };
  if (shadows) {
    add(
      Segment(
        'ug:drop:y',
        {
          from: [px, py],
          to: [0, py],
          color: 'var(--muted)',
          ...DASHED,
          z: 3,
          enter: 'draw',
          dur: DUR.base,
        },
        ctx,
      ),
    );
    add(
      Segment(
        'ug:shadow:x',
        { from: [0, 0], to: [px, 0], color: cc, ...shadow, enter: 'draw', dur: DUR.draw },
        ctx,
      ),
    );
    add(
      Segment(
        'ug:shadow:y',
        {
          from: [0, 0],
          to: [0, py],
          color: sc,
          ...shadow,
          opacity: tri ? 0.45 : 1,
          enter: 'draw',
          dur: DUR.draw,
        },
        ctx,
      ),
    );
    if (!tri)
      add(
        Segment(
          'ug:drop:x',
          {
            from: [px, py],
            to: [px, 0],
            color: 'var(--muted)',
            ...DASHED,
            z: 3,
            enter: 'draw',
            dur: DUR.base,
          },
          ctx,
        ),
      );
  }

  // ---- the right triangle under the ray: a soft fill and the right-angle mark; with the shadows
  // on, its upright side is the sin leg, and a brace on the outer side of each leg says which
  // length its label is
  const braceLook = { width: 1, z: 5, dur: DUR.draw } as const;
  let reach = { base: 0, upright: 0 };
  if (tri) {
    reach = add(
      RightTriangle(
        'ug:tri',
        {
          start: [0, 0],
          corner: [px, 0],
          apex: [px, py],
          fill: { color: 'var(--fg)', opacity: 0.07, z: 2, enter: 'fade', dur: DUR.base },
          rightAngle: {
            size: 9,
            minLeg: S * 0.12,
            color: 'var(--muted)',
            z: 4,
            enter: 'fade',
            delay: after(1),
          },
          sides: shadows
            ? {
                upright: {
                  line: { color: sc, ...shadow, enter: 'draw', dur: DUR.draw },
                  brace: { color: sc, opacity: 0.8, ...braceLook },
                },
                base: { brace: { color: cc, opacity: 0.8, ...braceLook } },
              }
            : undefined,
          equal:
            shadows && f.has('equal') && Math.abs(ref - 45) < 0.5
              ? { size: 6, color: 'var(--fg)', width: 2, z: 6, enter: 'draw', delay: after(1) }
              : undefined,
        },
        ctx,
      ),
    ).reach;
  }

  // ---- the triangle mirrored below the axis: together they make one triangle, equilateral at 30°.
  // A second brace, past the sin leg's, takes in the whole upright side of the big one.
  const side = Math.sign(c || 1);
  let yReach = reach.upright;
  if (f.has('equilateral') && tri) {
    add(
      Polygon(
        'ug:eq',
        {
          points: [
            [0, 0],
            [px, -py],
            [px, py],
          ],
          color: 'var(--muted)',
          ...DASHED,
          fill: 'none',
          z: 2,
          enter: 'draw',
          dur: DUR.grand,
        },
        ctx,
      ),
    );
    add(
      Point(
        'ug:eq:dot',
        {
          at: [px, -py],
          r: 4.5,
          fill: 'var(--bg)',
          stroke: 'var(--muted)',
          width: 1.5,
          z: 7,
          delay: after(3),
        },
        ctx,
      ),
    );
    if (shadows) {
      const off = reach.upright + 4 * sw,
        e = add(
          Brace(
            'ug:brace:eq',
            {
              from: [px + side * off, -py],
              to: [px + side * off, py],
              side: [side, 0],
              color: 'var(--ok)',
              ...braceLook,
              delay: after(3),
            },
            ctx,
          ),
        );
      if (e.marks.length) {
        yReach = off + e.reach;
        const eq = Math.abs(ref - 30) < 0.5;
        add(
          Label(
            'ug:eq:label',
            {
              tex: eq ? '\\text{whole side}=1' : '\\text{whole side}=2\\sin\\theta',
              size: 10,
              at: [px + side * (yReach + 5 * sw), 0],
              anchor: [c >= 0 ? 0 : 1, 0.5],
              color: 'var(--ok)',
              back: true,
              z: 9,
              enter: 'fade',
              delay: after(4),
            },
            ctx,
          ),
        );
      }
    }
  }

  // ---- the shadows' names: the x label past the cos leg's brace, on the side away from the point;
  // the y label past the sin leg's braces once there is a triangle, before that by the y-axis
  if (shadows) {
    // with the slope on, the legs are also named for it: the run across and the rise up
    const slope = f.has('slope'),
      xName = (slope ? '\\text{run}=' : '') + (named ? '\\cos\\theta' : 'x'),
      yName = (slope ? '\\text{rise}=' : '') + (named ? '\\sin\\theta' : 'y'),
      below = s >= 0 ? 1 : -1,
      xReach = reach.base ? reach.base + 4 * sw : 8 * sw;
    add(
      Label(
        'ug:shadow:x:label',
        {
          tex: `${xName}=${val('cos')}`,
          size: 10,
          at: [px / 2, below * xReach],
          anchor: [0.5, s >= 0 ? 0 : 1],
          color: cc,
          back: true,
          z: 9,
          enter: 'fade',
          delay: after(2),
        },
        ctx,
      ),
    );
    const yx = tri ? px + side * (yReach + 5 * sw) : -side * 8 * sw,
      yax = tri ? (c >= 0 ? 0 : 1) : c >= 0 ? 1 : 0;
    add(
      Label(
        'ug:shadow:y:label',
        {
          tex: `${yName}=${val('sin')}`,
          size: 10,
          at: [yx, py / 2],
          anchor: [yax, 0.5],
          color: sc,
          back: true,
          z: 9,
          enter: 'fade',
          delay: after(2),
        },
        ctx,
      ),
    );
  }

  // ---- the reference angle: the arc from the ray back to the nearest x-axis
  if (f.has('ref') && ref > 0.5 && ref < 89.5) {
    const base = c >= 0 ? (s >= 0 ? 0 : 2 * Math.PI) : Math.PI;
    const [a0, a1] = a < base ? [a, base] : [base, a];
    add(
      Arc(
        'ug:ref',
        {
          from: a0,
          to: a1,
          r: S * 0.34,
          color: 'var(--ok)',
          width: 2.5,
          round: true,
          z: 6,
          dur: DUR.draw,
          label: { tex: angleTex(ref, i.unit), size: 10, gap: 14, delay: after(2) },
        },
        ctx,
      ),
    );
  }

  // ---- the slope: how steep the ray is, rise over run, written beside it on the side away from the
  // triangle (the legs are named rise and run below)
  if (f.has('slope')) {
    const tex =
      Math.abs(c) < 0.02
        ? '\\tan\\theta\\ \\text{is undefined}'
        : `\\tan\\theta=\\dfrac{\\text{rise}}{\\text{run}}=${val('tan')}`;
    add(
      Label(
        'ug:tan:label',
        {
          tex,
          size: 10,
          at: [px * 0.55 - s * 16 * sw, py * 0.55 - c * 16 * sw],
          anchor: [c >= 0 ? 1 : 0, 0.5],
          color: TAN,
          back: true,
          z: 9,
          enter: 'fade',
          delay: after(2),
        },
        ctx,
      ),
    );
  }

  // ---- the θ arc and its angle
  if (f.has('angle') && a > 0.01) {
    add(
      Arc(
        'ug:angle',
        {
          from: 0,
          to: a,
          r: S * 0.18,
          width: 1.25,
          z: 6,
          dur: DUR.draw,
          label: { tex: `\\theta=${angleTex(i.deg, i.unit)}`, size: 9, gap: 12, delay: after(1) },
        },
        ctx,
      ),
    );
  }

  // ---- the radius, labelled 1 on the side away from the triangle (the triangle is on the x-axis
  // side of the radius, which is the side s·c points to; the label takes the other)
  if (f.has('hyp')) {
    const away = s * c > 0 ? -1 : s * c < 0 ? 1 : -1;
    add(
      Label(
        'ug:hyp',
        {
          tex: '1',
          size: 11,
          at: [px / 2 + away * s * 12 * sw, py / 2 + away * c * 12 * sw],
          color: 'var(--fg)',
          back: true,
          z: 9,
          enter: 'fade',
          delay: after(1),
        },
        ctx,
      ),
    );
  }
  // ---- the point's coordinates beside it, inside the circle
  const anchor: [number, number] = [c >= 0 ? 1 : 0, s >= 0 ? 0 : 1],
    away = s >= 0 ? 1 : -1,
    cx = px - Math.sign(c || 1) * 10 * sw;
  const cy = py + away * 10 * sw;
  if (f.has('coords')) {
    add(
      Label(
        'ug:coords',
        {
          tex: `\\left(${val('cos')},\\ ${val('sin')}\\right)`,
          size: 10,
          at: [cx, cy],
          anchor,
          color: 'var(--fg)',
          back: true,
          z: 9,
          enter: 'fade',
          delay: after(1),
        },
        ctx,
      ),
    );
  }
  // ---- the point and its radius
  add(
    Segment(
      'ug:ray',
      { from: [0, 0], to: [px, py], width: 1.75, round: true, z: 6, enter: 'draw', dur: DUR.draw },
      ctx,
    ),
  );
  add(
    Point(
      'ug:point',
      {
        at: [px, py],
        r: 7,
        fill: 'var(--fg)',
        stroke: 'var(--panel)',
        width: 2,
        z: 10,
        delay: after(1),
      },
      ctx,
    ),
  );
  return out;
}
