// What the Unit circle Guide puts on the plane, as keyed marks (see marks.ts). It is a simpler
// figure than Explore's, built up one feature at a time: the point's shadows on the axes, their
// names, the right triangle, the special triangles, its mirror images, the signs by quadrant, the
// reference angle and the slope. Explore's figure (circleMarks.ts) steps aside while the Guide is
// on, and this one asks for nothing otherwise.
import { S } from './camera.svelte.ts';
import type { Mark } from './marks.ts';
import { brace, type Label } from './scene.ts';
import { texRect } from './tex.svelte.ts';
import { angleTex, type Unit } from './angles.ts';
import { dec, refOf, trigTex, type Fn } from './trig.ts';
import type { Feature } from './unitFeatures.ts';

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
const at = (a: number, r = S): [number, number] => [r * Math.cos(a), -r * Math.sin(a)];
const arcPath = (a0: number, a1: number, r: number) => {
  const [x0, y0] = at(a0, r),
    [x1, y1] = at(a1, r);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 0 ${x1} ${y1}`;
};
const poly = (...p: [number, number][]) => `M ${p.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`;

export function unitGuideMarks(i: UnitGuideInput): Mark[] {
  if (!i.active || !i.features.size) return [];
  const { sw, lb, features: f } = i,
    out: Mark[] = [];
  const a = ((i.ang % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI),
    c = Math.cos(a),
    s = Math.sin(a),
    [px, py] = at(a);
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
  const dash = {
    width: 1.5 * sw,
    dash: [3 * sw, 5 * sw] as [number, number],
    round: true,
    opacity: 0.7,
  };

  // ---- the quadrant the point is in, lit (its signs are written under the point's label, below)
  if (f.has('quads')) {
    const k = Math.floor((((i.deg % 360) + 360) % 360) / 90) % 4,
      a0 = (k * Math.PI) / 2,
      [x0, y0] = at(a0),
      [x1, y1] = at(a0 + Math.PI / 2);
    out.push({
      kind: 'path',
      key: 'ug:quad:lit',
      z: 1,
      d: `M 0 0 L ${x0} ${y0} A ${S} ${S} 0 0 0 ${x1} ${y1} Z`,
      color: 'none',
      width: 0,
      fill: 'var(--fg)',
      opacity: 0.06,
      enter: 'fade',
      dur: 300,
    });
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
      out.push({
        kind: 'path',
        key: `ug:mirror:tri:${k}`,
        z: 2,
        d: poly([0, 0], [x, 0], [x, y]),
        color: 'var(--muted)',
        width: 1 * sw,
        fill: 'color-mix(in srgb, var(--fg) 7%, transparent)',
        opacity: 0.6,
        enter: 'fade',
        delay: 120 * k,
        dur: 300,
      });
      out.push({
        kind: 'dot',
        key: `ug:mirror:dot:${k}`,
        z: 7,
        x,
        y,
        r: 4.5 * sw,
        fill: 'var(--bg)',
        stroke: 'var(--muted)',
        width: 1.5 * sw,
        enter: 'pop',
        delay: 120 * k + 200,
      });
    });
  }

  // ---- the right triangle under the ray: a soft fill and the right-angle mark
  if (tri) {
    out.push({
      kind: 'path',
      key: 'ug:tri',
      z: 2,
      d: poly([0, 0], [px, 0], [px, py]),
      color: 'none',
      width: 0,
      fill: 'var(--fg)',
      opacity: 0.07,
      enter: 'fade',
      dur: 300,
    });
    if (Math.abs(c) > 0.12 && Math.abs(s) > 0.12) {
      const q = 9 * sw,
        dx = -Math.sign(c) * q,
        dy = Math.sign(py) * q;
      out.push({
        kind: 'path',
        key: 'ug:tri:right',
        z: 4,
        d: `M ${px + dx} 0 L ${px + dx} ${dy} L ${px} ${dy}`,
        color: 'var(--muted)',
        width: 1 * sw,
        enter: 'fade',
        delay: 200,
      });
    }
  }
  // ---- the triangle mirrored below the axis: together they make one triangle, equilateral at 30°
  if (f.has('equilateral') && tri) {
    out.push({
      kind: 'path',
      key: 'ug:eq',
      z: 2,
      d: poly([0, 0], [px, -py], [px, py]),
      color: 'var(--muted)',
      ...dash,
      fill: 'none',
      enter: 'draw',
      dur: 600,
    });
    out.push({
      kind: 'dot',
      key: 'ug:eq:dot',
      z: 7,
      x: px,
      y: -py,
      r: 4.5 * sw,
      fill: 'var(--bg)',
      stroke: 'var(--muted)',
      width: 1.5 * sw,
      enter: 'pop',
      delay: 450,
    });
  }

  // ---- the shadows: drop lines to each axis, and the shadow itself along the axis, named x and y
  // (then cos θ and sin θ, in their colors)
  if (f.has('shadows')) {
    const cc = named ? COS : 'var(--fg)',
      sc = named ? SIN : 'var(--fg)';
    out.push({
      kind: 'line',
      key: 'ug:drop:y',
      z: 3,
      x1: px,
      y1: py,
      x2: 0,
      y2: py,
      color: 'var(--muted)',
      ...dash,
      enter: 'draw',
      dur: 350,
    });
    out.push({
      kind: 'line',
      key: 'ug:shadow:x',
      z: 5,
      x1: 0,
      y1: 0,
      x2: px,
      y2: 0,
      color: cc,
      width: 3.5 * sw,
      round: true,
      enter: 'draw',
      dur: 400,
    });
    out.push({
      kind: 'line',
      key: 'ug:shadow:y',
      z: 5,
      x1: 0,
      y1: 0,
      x2: 0,
      y2: py,
      color: sc,
      width: 3.5 * sw,
      round: true,
      opacity: tri ? 0.45 : 1,
      enter: 'draw',
      dur: 400,
    });
    // once there is a triangle, its upright side is the sin leg, drawn solid; before that it is a
    // drop line
    if (tri)
      out.push({
        kind: 'line',
        key: 'ug:leg:sin',
        z: 5,
        x1: px,
        y1: 0,
        x2: px,
        y2: py,
        color: sc,
        width: 3.5 * sw,
        round: true,
        enter: 'draw',
        dur: 400,
      });
    else
      out.push({
        kind: 'line',
        key: 'ug:drop:x',
        z: 3,
        x1: px,
        y1: py,
        x2: px,
        y2: 0,
        color: 'var(--muted)',
        ...dash,
        enter: 'draw',
        dur: 350,
      });
    if (f.has('equal') && tri && Math.abs(ref - 45) < 0.5) {
      const t = 6 * sw;
      out.push({
        kind: 'line',
        key: 'ug:tick:x',
        z: 6,
        x1: px / 2,
        y1: -t,
        x2: px / 2,
        y2: t,
        color: 'var(--fg)',
        width: 2 * sw,
        enter: 'draw',
        delay: 200,
      });
      out.push({
        kind: 'line',
        key: 'ug:tick:y',
        z: 6,
        x1: px - t,
        y1: py / 2,
        x2: px + t,
        y2: py / 2,
        color: 'var(--fg)',
        width: 2 * sw,
        enter: 'draw',
        delay: 300,
      });
    }
    const xName = named ? '\\cos\\theta' : 'x',
      yName = named ? '\\sin\\theta' : 'y';
    // once there is a triangle, a brace on the outer side of the sin leg says which length its
    // label is; with the mirrored triangle, a second brace further out takes in the whole upright
    // side of the big one
    const side = Math.sign(c || 1),
      bc = {
        z: 5,
        width: 1 * sw,
        round: true,
        join: true,
        symmetric: true,
        enter: 'draw',
        dur: 450,
      } as const;
    let reach = 0;
    if (tri) {
      const b = brace(px, 0, px, py, side, 0, 14 * sw, sw);
      if (b) {
        out.push({
          kind: 'path',
          key: 'ug:brace:sin',
          ...bc,
          d: b.path,
          transform: b.transform,
          color: sc,
          opacity: 0.8,
        });
        reach = b.m + b.d;
      }
      if (f.has('equilateral')) {
        const off = reach + 4 * sw,
          e = brace(px + side * off, -py, px + side * off, py, side, 0, 14 * sw, sw);
        if (e) {
          out.push({
            kind: 'path',
            key: 'ug:brace:eq',
            ...bc,
            d: e.path,
            transform: e.transform,
            color: 'var(--ok)',
            delay: 400,
          });
          reach = off + e.m + e.d;
          const eq = Math.abs(ref - 30) < 0.5;
          label(
            { key: 'ug:eq:label', z: 9, back: lb, enter: 'fade', delay: 600 },
            lab(
              eq ? '\\text{whole side}=1' : '\\text{whole side}=2\\sin\\theta',
              10,
              px + side * (reach + 5 * sw),
              0,
              'var(--ok)',
              c >= 0 ? 0 : 1,
              0.5,
            ),
          );
        }
      }
    }
    // the cos leg gets its brace on the side away from the point, and its label past it
    const below = s >= 0 ? 1 : -1;
    let xReach = 8 * sw;
    if (tri) {
      const b = brace(0, 0, px, 0, 0, below, 14 * sw, sw);
      if (b) {
        out.push({
          kind: 'path',
          key: 'ug:brace:cos',
          ...bc,
          d: b.path,
          transform: b.transform,
          color: cc,
          opacity: 0.8,
        });
        xReach = b.m + b.d + 4 * sw;
      }
    }
    label(
      { key: 'ug:shadow:x:label', z: 9, back: lb, enter: 'fade', delay: 250 },
      lab(`${xName}=${val('cos')}`, 10, px / 2, below * xReach, cc, 0.5, s >= 0 ? 0 : 1),
    );
    // the y label sits past the sin leg's braces once there is a triangle; before that by the
    // y-axis, on the side away from the point
    const yx = tri ? px + side * (reach + 5 * sw) : -side * 8 * sw,
      yax = tri ? (c >= 0 ? 0 : 1) : c >= 0 ? 1 : 0;
    label(
      { key: 'ug:shadow:y:label', z: 9, back: lb, enter: 'fade', delay: 300 },
      lab(`${yName}=${val('sin')}`, 10, yx, py / 2, sc, yax, 0.5),
    );
  }

  // ---- the reference angle: the arc from the ray back to the nearest x-axis
  if (f.has('ref') && ref > 0.5 && ref < 89.5) {
    const base = c >= 0 ? (s >= 0 ? 0 : 2 * Math.PI) : Math.PI;
    const [a0, a1] = a < base ? [a, base] : [base, a],
      r = S * 0.34;
    out.push({
      kind: 'path',
      key: 'ug:ref',
      z: 6,
      d: arcPath(a0, a1, r),
      color: 'var(--ok)',
      width: 2.5 * sw,
      round: true,
      enter: 'draw',
      dur: 400,
    });
    const [lx, ly] = at((a0 + a1) / 2, r + 14 * sw);
    label(
      { key: 'ug:ref:label', z: 9, back: lb, enter: 'fade', delay: 250 },
      lab(angleTex(ref, i.unit), 10, lx, ly, 'var(--ok)'),
    );
  }

  // ---- the slope: the ray carried on through the origin, and where it meets the line x = 1 is tan
  // θ
  if (f.has('slope')) {
    const L = 2.2 * S;
    out.push({
      kind: 'line',
      key: 'ug:slope:line',
      z: 3,
      x1: -L * c,
      y1: L * s,
      x2: L * c,
      y2: -L * s,
      color: TAN,
      ...dash,
      enter: 'draw',
      dur: 500,
    });
    out.push({
      kind: 'line',
      key: 'ug:slope:x1',
      z: 3,
      x1: S,
      y1: -L,
      x2: S,
      y2: L,
      color: 'var(--muted)',
      width: 1 * sw,
      opacity: 0.6,
      enter: 'draw',
      dur: 500,
    });
    label(
      { key: 'ug:slope:x1:label', z: 9, back: lb, enter: 'fade', delay: 300 },
      lab('x=1', 9, S + 6 * sw, L * 0.9, 'var(--muted)', 0, 1),
    );
    const t = s / c;
    if (Math.abs(c) > 0.03 && Math.abs(t) < 2.1) {
      out.push({
        kind: 'line',
        key: 'ug:tan',
        z: 6,
        x1: S,
        y1: 0,
        x2: S,
        y2: -S * t,
        color: TAN,
        width: 3.5 * sw,
        round: true,
        enter: 'draw',
        delay: 300,
        dur: 400,
      });
      out.push({
        kind: 'dot',
        key: 'ug:tan:dot',
        z: 7,
        x: S,
        y: -S * t,
        r: 4.5 * sw,
        fill: TAN,
        enter: 'pop',
        delay: 500,
      });
    }
    const ty = Math.abs(c) > 0.03 && Math.abs(t) < 2.1 ? (-S * t) / 2 : -S * 0.5;
    label(
      { key: 'ug:tan:label', z: 9, back: lb, enter: 'fade', delay: 500 },
      lab(`\\tan\\theta=${val('tan')}`, 10, S + 8 * sw, ty, TAN, 0, 0.5),
    );
  }

  // ---- the θ arc and its angle
  if (f.has('angle') && a > 0.01) {
    const r = S * 0.18;
    out.push({
      kind: 'path',
      key: 'ug:angle',
      z: 6,
      d: arcPath(0, a, r),
      color: 'var(--fg)',
      width: 1.25 * sw,
      enter: 'draw',
      dur: 400,
    });
    const [lx, ly] = at(a / 2, r + 12 * sw);
    label(
      { key: 'ug:angle:label', z: 9, back: lb, enter: 'fade', delay: 200 },
      lab(`\\theta=${angleTex(i.deg, i.unit)}`, 9, lx, ly, 'var(--fg)'),
    );
  }

  // ---- the radius, labelled 1 on the side away from the triangle
  if (f.has('hyp')) {
    const [mx, my] = [px / 2 - s * 12 * sw, py / 2 - c * 12 * sw];
    label(
      { key: 'ug:hyp', z: 9, back: lb, enter: 'fade', delay: 200 },
      lab('1', 11, mx, my, 'var(--fg)'),
    );
  }
  // ---- the point's coordinates beside it, inside the circle; with the quadrants on, their signs
  // go just past them (further from the point)
  const ax = c >= 0 ? 1 : 0,
    ay = s >= 0 ? 0 : 1,
    away = s >= 0 ? 1 : -1;
  let cx = px - Math.sign(c || 1) * 10 * sw,
    cy = py + away * 10 * sw;
  if (f.has('coords')) {
    const l = lab(`\\left(${val('cos')},\\ ${val('sin')}\\right)`, 10, cx, cy, 'var(--fg)', ax, ay);
    label({ key: 'ug:coords', z: 9, back: lb, enter: 'fade', delay: 200 }, l);
    if (l) cy += away * (l.rect.h + 5 * sw);
  }
  if (f.has('quads')) {
    const r = (i.deg * Math.PI) / 180,
      sign = (v: number) => (Math.abs(v) < 1e-9 ? '0' : v > 0 ? '+' : '-');
    label(
      { key: 'ug:signs', z: 9, back: lb, enter: 'fade', delay: 250 },
      lab(`(${sign(Math.cos(r))},\\,${sign(Math.sin(r))})`, 10, cx, cy, 'var(--fg)', ax, ay),
    );
  }

  // ---- the point and its radius
  out.push({
    kind: 'line',
    key: 'ug:ray',
    z: 6,
    x1: 0,
    y1: 0,
    x2: px,
    y2: py,
    color: 'var(--fg)',
    width: 1.75 * sw,
    round: true,
    enter: 'draw',
    dur: 450,
  });
  out.push({
    kind: 'dot',
    key: 'ug:point',
    z: 10,
    x: px,
    y: py,
    r: 7 * sw,
    fill: 'var(--fg)',
    stroke: 'var(--panel)',
    width: 2 * sw,
    enter: 'pop',
    delay: 150,
  });
  return out;
}
