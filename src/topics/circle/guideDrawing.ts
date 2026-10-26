// What the Unit circle Guide puts on the plane, composed from figures (see figures/figure.ts). It
// is a simpler picture than Explore's, built up one feature at a time: the point's shadows on the
// axes, their names, the right triangle, the special triangles, its mirror images, the signs by
// quadrant, the reference angle and the slope. Explore's drawing (drawing.ts) steps aside while
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
import { Sector } from '../../figures/sector.ts';
import { Segment } from '../../figures/segment.ts';
import type { Feature } from './features.ts';

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

export function unitGuideMarks(i: UnitGuideInput): Mark[] {
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

  // ---- the quadrant the point is in, lit (its signs are written under the point's label, below)
  if (f.has('quads')) {
    const k = Math.floor((((i.deg % 360) + 360) % 360) / 90) % 4,
      a0 = (k * Math.PI) / 2;
    add(
      Sector(
        'ug:quad:lit',
        {
          from: a0,
          to: a0 + Math.PI / 2,
          r: S,
          fill: 'var(--fg)',
          opacity: 0.06,
          z: 1,
          enter: 'fade',
          dur: 300,
        },
        ctx,
      ),
    );
  }

  // ---- the point's mirror images in the other quadrants, each with its own faint triangle
  if (f.has('mirror')) {
    (
      [
        [-1, 1],
        [-1, -1],
        [1, -1],
      ] as const
    ).forEach(([mx, my], k) => {
      const x = px * mx,
        y = py * my;
      add(
        Polygon(
          `ug:mirror:tri:${k}`,
          {
            points: [
              [0, 0],
              [x, 0],
              [x, y],
            ],
            color: 'var(--muted)',
            fill: 'color-mix(in srgb, var(--fg) 7%, transparent)',
            opacity: 0.6,
            z: 2,
            enter: 'fade',
            delay: 120 * k,
            dur: 300,
          },
          ctx,
        ),
      );
      add(
        Point(
          `ug:mirror:dot:${k}`,
          {
            at: [x, y],
            r: 4.5,
            fill: 'var(--bg)',
            stroke: 'var(--muted)',
            width: 1.5,
            z: 7,
            delay: 120 * k + 200,
          },
          ctx,
        ),
      );
    });
  }

  // ---- the right triangle under the ray: a soft fill and the right-angle mark
  if (tri) {
    add(
      Polygon(
        'ug:tri',
        {
          points: [
            [0, 0],
            [px, 0],
            [px, py],
          ],
          noStroke: true,
          fill: 'var(--fg)',
          opacity: 0.07,
          z: 2,
          enter: 'fade',
          dur: 300,
        },
        ctx,
      ),
    );
    if (Math.abs(c) > 0.12 && Math.abs(s) > 0.12) {
      const q = 9 * sw,
        dx = -Math.sign(c) * q,
        dy = Math.sign(py) * q;
      add(
        Polygon(
          'ug:tri:right',
          {
            points: [
              [px + dx, 0],
              [px + dx, dy],
              [px, dy],
            ],
            open: true,
            color: 'var(--muted)',
            z: 4,
            enter: 'fade',
            delay: 200,
          },
          ctx,
        ),
      );
    }
  }
  // ---- the triangle mirrored below the axis: together they make one triangle, equilateral at 30°
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
          dur: 600,
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
          delay: 450,
        },
        ctx,
      ),
    );
  }

  // ---- the shadows: drop lines to each axis, and the shadow itself along the axis, named x and y
  // (then cos θ and sin θ, in their colors)
  if (f.has('shadows')) {
    const cc = named ? COS : 'var(--fg)',
      sc = named ? SIN : 'var(--fg)',
      shadow: Look = { width: 3.5, round: true, z: 5 };
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
          dur: 350,
        },
        ctx,
      ),
    );
    add(
      Segment(
        'ug:shadow:x',
        { from: [0, 0], to: [px, 0], color: cc, ...shadow, enter: 'draw', dur: 400 },
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
          dur: 400,
        },
        ctx,
      ),
    );
    // once there is a triangle, its upright side is the sin leg, drawn solid; before that it is a
    // drop line
    if (tri)
      add(
        Segment(
          'ug:leg:sin',
          { from: [px, 0], to: [px, py], color: sc, ...shadow, enter: 'draw', dur: 400 },
          ctx,
        ),
      );
    else
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
            dur: 350,
          },
          ctx,
        ),
      );
    if (f.has('equal') && tri && Math.abs(ref - 45) < 0.5) {
      const t = 6 * sw,
        tick: Look = { color: 'var(--fg)', width: 2, z: 6 };
      add(
        Segment(
          'ug:tick:x',
          { from: [px / 2, -t], to: [px / 2, t], ...tick, enter: 'draw', delay: 200 },
          ctx,
        ),
      );
      add(
        Segment(
          'ug:tick:y',
          { from: [px - t, py / 2], to: [px + t, py / 2], ...tick, enter: 'draw', delay: 300 },
          ctx,
        ),
      );
    }
    const xName = named ? '\\cos\\theta' : 'x',
      yName = named ? '\\sin\\theta' : 'y';
    // once there is a triangle, a brace on the outer side of the sin leg says which length its
    // label is; with the mirrored triangle, a second brace further out takes in the whole upright
    // side of the big one
    const side = Math.sign(c || 1),
      braceLook = { width: 1, z: 5, dur: 450 } as const;
    let reach = 0;
    if (tri) {
      reach = add(
        Brace(
          'ug:brace:sin',
          { from: [px, 0], to: [px, py], side: [side, 0], color: sc, opacity: 0.8, ...braceLook },
          ctx,
        ),
      ).reach;
      if (f.has('equilateral')) {
        const off = reach + 4 * sw,
          e = add(
            Brace(
              'ug:brace:eq',
              {
                from: [px + side * off, -py],
                to: [px + side * off, py],
                side: [side, 0],
                color: 'var(--ok)',
                ...braceLook,
                delay: 400,
              },
              ctx,
            ),
          );
        if (e.marks.length) {
          reach = off + e.reach;
          const eq = Math.abs(ref - 30) < 0.5;
          add(
            Label(
              'ug:eq:label',
              {
                tex: eq ? '\\text{whole side}=1' : '\\text{whole side}=2\\sin\\theta',
                size: 10,
                at: [px + side * (reach + 5 * sw), 0],
                anchor: [c >= 0 ? 0 : 1, 0.5],
                color: 'var(--ok)',
                back: true,
                z: 9,
                enter: 'fade',
                delay: 600,
              },
              ctx,
            ),
          );
        }
      }
    }
    // the cos leg gets its brace on the side away from the point, and its label past it
    const below = s >= 0 ? 1 : -1;
    let xReach = 8 * sw;
    if (tri) {
      const b = add(
        Brace(
          'ug:brace:cos',
          { from: [0, 0], to: [px, 0], side: [0, below], color: cc, opacity: 0.8, ...braceLook },
          ctx,
        ),
      );
      if (b.marks.length) xReach = b.reach + 4 * sw;
    }
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
          delay: 250,
        },
        ctx,
      ),
    );
    // the y label sits past the sin leg's braces once there is a triangle; before that by the
    // y-axis, on the side away from the point
    const yx = tri ? px + side * (reach + 5 * sw) : -side * 8 * sw,
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
          delay: 300,
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
          dur: 400,
          label: { tex: angleTex(ref, i.unit), size: 10, gap: 14, delay: 250 },
        },
        ctx,
      ),
    );
  }

  // ---- the slope: the ray carried on through the origin, and where it meets the line x = 1 is
  // tan θ
  if (f.has('slope')) {
    const L = 2.2 * S;
    add(
      Segment(
        'ug:slope:line',
        {
          from: [-L * c, L * s],
          to: [L * c, -L * s],
          color: TAN,
          ...DASHED,
          z: 3,
          enter: 'draw',
          dur: 500,
        },
        ctx,
      ),
    );
    add(
      Segment(
        'ug:slope:x1',
        {
          from: [S, -L],
          to: [S, L],
          color: 'var(--muted)',
          width: 1,
          opacity: 0.6,
          z: 3,
          enter: 'draw',
          dur: 500,
        },
        ctx,
      ),
    );
    add(
      Label(
        'ug:slope:x1:label',
        {
          tex: 'x=1',
          size: 9,
          at: [S + 6 * sw, L * 0.9],
          anchor: [0, 1],
          color: 'var(--muted)',
          back: true,
          z: 9,
          enter: 'fade',
          delay: 300,
        },
        ctx,
      ),
    );
    const t = s / c,
      onLine = Math.abs(c) > 0.03 && Math.abs(t) < 2.1;
    if (onLine) {
      add(
        Segment(
          'ug:tan',
          {
            from: [S, 0],
            to: [S, -S * t],
            color: TAN,
            width: 3.5,
            round: true,
            z: 6,
            enter: 'draw',
            delay: 300,
            dur: 400,
          },
          ctx,
        ),
      );
      add(Point('ug:tan:dot', { at: [S, -S * t], r: 4.5, fill: TAN, z: 7, delay: 500 }, ctx));
    }
    add(
      Label(
        'ug:tan:label',
        {
          tex: `\\tan\\theta=${val('tan')}`,
          size: 10,
          at: [S + 8 * sw, onLine ? (-S * t) / 2 : -S * 0.5],
          anchor: [0, 0.5],
          color: TAN,
          back: true,
          z: 9,
          enter: 'fade',
          delay: 500,
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
          dur: 400,
          label: { tex: `\\theta=${angleTex(i.deg, i.unit)}`, size: 9, gap: 12, delay: 200 },
        },
        ctx,
      ),
    );
  }

  // ---- the radius, labelled 1 on the side away from the triangle
  if (f.has('hyp')) {
    add(
      Label(
        'ug:hyp',
        {
          tex: '1',
          size: 11,
          at: [px / 2 - s * 12 * sw, py / 2 - c * 12 * sw],
          color: 'var(--fg)',
          back: true,
          z: 9,
          enter: 'fade',
          delay: 200,
        },
        ctx,
      ),
    );
  }
  // ---- the point's coordinates beside it, inside the circle; with the quadrants on, their signs
  // go just past them (further from the point)
  const anchor: [number, number] = [c >= 0 ? 1 : 0, s >= 0 ? 0 : 1],
    away = s >= 0 ? 1 : -1,
    cx = px - Math.sign(c || 1) * 10 * sw;
  let cy = py + away * 10 * sw;
  if (f.has('coords')) {
    const { rect } = add(
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
          delay: 200,
        },
        ctx,
      ),
    );
    if (rect) cy += away * (rect.h + 5 * sw);
  }
  if (f.has('quads')) {
    const r = (i.deg * Math.PI) / 180,
      sign = (v: number) => (Math.abs(v) < 1e-9 ? '0' : v > 0 ? '+' : '-');
    add(
      Label(
        'ug:signs',
        {
          tex: `(${sign(Math.cos(r))},\\,${sign(Math.sin(r))})`,
          size: 10,
          at: [cx, cy],
          anchor,
          color: 'var(--fg)',
          back: true,
          z: 9,
          enter: 'fade',
          delay: 250,
        },
        ctx,
      ),
    );
  }

  // ---- the point and its radius
  add(
    Segment(
      'ug:ray',
      { from: [0, 0], to: [px, py], width: 1.75, round: true, z: 6, enter: 'draw', dur: 450 },
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
        delay: 150,
      },
      ctx,
    ),
  );
  return out;
}
