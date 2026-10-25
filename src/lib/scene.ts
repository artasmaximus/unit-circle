// Everything drawn on the plane for one frame, as plain data. Components only render what this
// returns. World units: the circle has radius S, y points down (so sin is drawn as -y).
import { S } from './camera.svelte.ts';
import { angleTex, type Unit } from './angles.ts';
import { figure as tuning, tag as tagT } from './tuning.ts';
import { colorOf, norm, refOf, specialOf, trigTex, type Fn } from './trig.ts';
import { texBox, texRect, type Rect } from './tex.svelte.ts';

export type Seg = [number, number, number, number];
export type Label = { latex: string; size: number; rect: Rect; color: string };
/**
 * `parts`, when set, render in place of `latex`, each in its own color (it is sized by `latex`).
 */
export type Chip = {
  latex: string;
  parts?: { latex: string; color: string }[];
  x: number;
  y: number;
  w: number;
  h: number;
  ax: number;
  ay: number;
  color: string;
};
export type Scene = ReturnType<typeof buildScene>;

export type SceneInput = {
  ang: number;
  hit: number | undefined;
  dotR: number;
  /** Signed arc (radians) of the trail behind the point. */
  tail: number;
  revealed: boolean;
  mirror: boolean;
  mirrorOnly: Fn | null;
  showCoords: boolean;
  slopeOpen: boolean;
  /**
   * Px per world unit and the uncovered area in world units, for sizing and keeping chips on
   * screen.
   */
  k: number;
  bounds: Rect;
  boost: number;
  /**
   * Multipliers for in-plane label sizes, and for line widths and brace size (see camera.stroke /
   * camera.labelBoost).
   */
  labelBoost: number;
  stroke: number;
  /** How angles are written, and the degree precision (see angles.ts). */
  unit: Unit;
  decimals: number;
  memo: { b: number };
};

const label = (
  latex: string,
  size: number,
  x: number,
  y: number,
  color: string,
  ax = 0.5,
  ay = 0.5,
): Label | null => {
  const rect = texRect(latex, size, x, y, ax, ay);
  return rect && { latex, size, rect, color };
};

// Each reflection keeps one function's value: across the x-axis (cos), the y-axis (sin), through
// the origin (tan).
const REFL: { ang: (a: number) => number; deg: (d: number) => number; fn: Fn }[] = [
  { ang: (a) => 2 * Math.PI - a, deg: (d) => 360 - d, fn: 'cos' },
  { ang: (a) => Math.PI - a, deg: (d) => 540 - d, fn: 'sin' },
  { ang: (a) => a + Math.PI, deg: (d) => d + 180, fn: 'tan' },
];

/** A curly brace beside segment (x1,y1)-(x2,y2), tip along the outward normal (nx,ny). */
export function brace(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  nx: number,
  ny: number,
  minLen: number,
  sf: number,
) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < minLen) return null;
  const ux = (x2 - x1) / L,
    uy = (y2 - y1) / L,
    d = Math.min(7 * sf, L / 6),
    m = 5 * sf,
    h = L / 2;
  return {
    d,
    m,
    path: `M 0 0 Q 0 ${-d / 2} ${d} ${-d / 2} H ${h - d} Q ${h} ${-d / 2} ${h} ${-d} Q ${h} ${-d / 2} ${h + d} ${-d / 2} H ${L - d} Q ${L} ${-d / 2} ${L} 0`,
    transform: `matrix(${ux} ${uy} ${-nx} ${-ny} ${x1 + nx * m} ${y1 + ny * m})`,
  };
}

export function buildScene(p: SceneInput) {
  const { ang, hit } = p;
  const c = Math.cos(ang),
    s = Math.sin(ang),
    x = c * S,
    y = -s * S;
  const deg = hit ?? norm((ang * 180) / Math.PI);
  const col = p.revealed ? colorOf(deg) : 'var(--fg)';

  // angle arc with a small open arrowhead whose tip sits on the terminal side
  const r = S / 5;
  const wedge = `M ${r} 0 A ${r} ${r} 0 ${ang > Math.PI ? 1 : 0} 0 ${r * Math.cos(-ang)} ${r * Math.sin(-ang)}`;
  const px = r * c,
    py = -r * s,
    tx = -s,
    ty = -c,
    L = 4.6 * p.stroke,
    W = 2.6 * p.stroke;
  const wedgeHead =
    ang > 0.16 && ang < 2 * Math.PI - 0.02
      ? `M ${px - tx * L - ty * W} ${py - ty * L + tx * W} L ${px} ${py} L ${px - tx * L + ty * W} ${py - ty * L - tx * W}`
      : null;

  // legs of the triangle; mirror mode adds a line out to each reflected point, with the reflected
  // dot at its tip
  const sinLeg: Seg = [x, 0, x, y];
  let sinExt: Seg | null = null;
  let guide2: Seg | null = null;
  const mirrors: { i: number; line: Seg | null; dot: [number, number]; label: Label | null }[] = [];
  REFL.forEach((rf, i) => {
    if (!p.mirror || (p.mirrorOnly && p.mirrorOnly !== rf.fn)) return;
    const a = rf.ang(ang),
      gx = S * Math.cos(a),
      gy = -S * Math.sin(a),
      gd = norm(Math.round(rf.deg(deg)));
    let line: Seg | null = null;
    if (i === 0) sinExt = [x, 0, x, gy];
    else if (i === 1) guide2 = [0, y, gx, y];
    else line = [x, y, gx, gy];
    // a ghost on a snap point is already named by the ring label
    const lb =
      specialOf(gd) !== undefined
        ? null
        : label(
            angleTex(gd, p.unit, 0),
            11 * p.labelBoost,
            (S + 17) * Math.cos(a),
            -(S + 17) * Math.sin(a),
            col,
          );
    mirrors.push({ i, line, dot: [gx, gy], label: lb });
  });

  // reference angle: quadrants II–IV get a small arc from the nearest x-axis; in quadrant I the
  // label rides the θ arc
  let refLabel: Label | null = null;
  /**
   * The reference arc at pop `e` (0 = lying on the θ arc, 1 = out at its own radius), so it can pop
   * out of the θ arc.
   */
  let refArcAt: ((e: number) => string) | null = null;
  /**
   * Where the reference label sits (polar, y up) and the x-axis angle it grows out of, so it can
   * glide along the arc.
   */
  let refPolar: { rr: number; from: number; to: number; dy: number } | null = null;
  if (hit !== undefined && p.revealed) {
    const ref = refOf(hit);
    let mid: number,
      rr = tagT.refRadius,
      from = 0;
    if (hit > 90 && ref > 0) {
      const ra = (S / 5) * 1.3,
        phiA = c >= -1e-9 ? 0 : Math.PI;
      const diff =
        ((((ang - phiA + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
      refArcAt = (e) => {
        const q = r + (ra - r) * e;
        return `M ${q * Math.cos(phiA)} ${-q * Math.sin(phiA)} A ${q} ${q} 0 0 ${diff > 0 ? 0 : 1} ${q * c} ${-q * s}`;
      };
      mid = phiA + diff / 2;
      from = phiA;
    } else if (hit > 90) {
      mid = (hit * Math.PI) / 180;
      from = mid;
    } else {
      mid = ang / 2;
      rr = tagT.refRadius - 4;
    }
    const dy = ref === 0 ? -9 : 0;
    refPolar = { rr, from, to: mid, dy };
    refLabel = label(
      angleTex(ref, p.unit, 0),
      tagT.refFont * p.labelBoost,
      rr * Math.cos(mid),
      -rr * Math.sin(mid) + dy,
      col,
    );
  }

  // leg labels sit past a curly brace on the outside of each leg, so they read as lengths
  const ncy = s >= 0 ? 1 : -1,
    ncx = c >= 0 ? 1 : -1;
  const cosCol = p.revealed ? 'var(--cos)' : 'var(--fg)',
    sinCol = p.revealed ? 'var(--sin)' : 'var(--fg)';
  // each leg's label bounces away from its brace; leaving, the cosine label continues that way and
  // the sine label goes right
  const cosDir: [number, number] = [0, ncy],
    sinDir: [number, number] = [ncx, 0],
    cosExit = cosDir,
    sinExit: [number, number] = [1, 0];
  const braceC = brace(0, 0, x, 0, 0, ncy, tuning.braceMinPx[0] / p.k, p.stroke),
    braceS = brace(x, 0, x, y, ncx, 0, tuning.braceMinPx[1] / p.k, p.stroke);
  const obstacles: (Rect & { k?: number })[] = [];
  let cosLabel: Label | null = null,
    sinLabel: Label | null = null;
  if (braceC) {
    const h = (texBox('x=\\cos\\theta')?.h ?? 0) * 12 * p.labelBoost;
    cosLabel = label(
      'x=\\cos\\theta',
      12 * p.labelBoost,
      x / 2,
      ncy * (braceC.m + braceC.d + 4 * p.stroke + h / 2),
      cosCol,
    );
    obstacles.push({
      x: Math.min(0, x),
      y: Math.min(ncy * braceC.m, ncy * (braceC.m + braceC.d)),
      w: Math.abs(x),
      h: braceC.d,
    });
  }
  if (braceS) {
    sinLabel = label(
      'y=\\sin\\theta',
      12 * p.labelBoost,
      x + ncx * (braceS.m + braceS.d + 5 * p.stroke),
      y / 2,
      sinCol,
      ncx > 0 ? 0 : 1,
      0.5,
    );
    obstacles.push({
      x: Math.min(x + ncx * braceS.m, x + ncx * (braceS.m + braceS.d)),
      y: Math.min(0, y),
      w: braceS.d,
      h: Math.abs(y),
    });
  }
  if (cosLabel) obstacles.push(cosLabel.rect);
  if (sinLabel) obstacles.push(sinLabel.rect);

  // floating chips: point coordinates and slope
  const cx = trigTex('cos', deg),
    sx = trigTex('sin', deg),
    tv = trigTex('tan', deg);
  const segs: Seg[] = [
    [0, 0, x, y],
    [0, 0, x, 0],
    [x, 0, x, y],
  ];
  const onH = Math.abs(s) < 0.02,
    onV = Math.abs(c) < 0.02;
  const slopeTex = p.slopeOpen
    ? `\\begin{aligned}\\tan\\theta&=\\frac{\\sin\\theta}{\\cos\\theta}\\\\[1.6ex]&=\\frac{${sx}}{${cx}}\\\\[1.6ex]&=${tv}\\end{aligned}`
    : `\\tan\\theta=${tv}`;
  const place = (
    o: PlaceOpts,
    latex: string,
    padX: number,
    padY: number,
    minW: number,
    color: string,
  ): Chip | null => {
    const b = texBox(latex);
    if (!b) return null;
    const w = Math.max(b.w * CHIP_FONT * p.boost + padX, minW) / p.k,
      h = (b.h * CHIP_FONT * p.boost + padY) / p.k;
    const at = placeChip(o, w, h, obstacles, p.bounds, p.memo);
    return { latex, x: at.x, y: at.y, w, h, ax: o.ax, ay: o.ay, color };
  };
  const slope = p.revealed
    ? place(
        {
          ax: x / 2,
          ay: y / 2,
          fixed: true,
          gap: 0,
          pref: [0, 0],
          segs,
          place: onH ? 'above' : onV ? 'left' : undefined,
        },
        slopeTex,
        28,
        p.slopeOpen ? 28 : 16,
        0,
        'var(--slope)',
      )
    : null;
  // the point's tag is just its coordinates (the angle reads in the corner). The box sits a fixed
  // distance out along θ at a nominal size, so a taller or wider value changes its extent but never
  // where it is centered.
  const tw = tagT.w / p.k,
    th = tagT.h / p.k;
  const away = standoff(c, -s, tw / 2, th / 2, tagT.gap / p.k);
  const at = clampTo(p.bounds, x + away * c, y - away * s, tw / 2, th / 2);
  const tag: Chip & { values: boolean } & { parts?: Chip['parts'] } = {
    latex: '',
    x: at.x,
    y: at.y,
    w: tw,
    h: th,
    ax: x,
    ay: y,
    color: col,
    values: p.showCoords,
  };
  // coordinates read (cos, sin): gray brackets and comma, each value in its function's color
  if (tag.values) {
    const tall = `\\vphantom{${cx}${sx}}`,
      gray = 'var(--muted)';
    tag.parts = [
      { latex: `\\left(${tall}\\right.`, color: gray },
      { latex: cx, color: 'var(--cos)' },
      { latex: ',\\ ', color: gray },
      { latex: sx, color: 'var(--sin)' },
      { latex: `\\left.${tall}\\right)`, color: gray },
    ];
  }

  // the trail: short segments from the tail up to the point, thickening and taking the nearest snap
  // color
  const TRAIL_N = 28;
  const trail = p.tail
    ? Array.from({ length: TRAIL_N }, (_, i) => {
        const u0 = i / TRAIL_N,
          u1 = (i + 1) / TRAIL_N,
          a0 = ang - p.tail * (1 - u0),
          a1 = ang - p.tail * (1 - u1);
        return {
          seg: [S * Math.cos(a0), -S * Math.sin(a0), S * Math.cos(a1), -S * Math.sin(a1)] as Seg,
          color: p.revealed ? colorOf((a1 * 180) / Math.PI) : 'var(--muted)',
          width: 0.8 + 3.4 * u1,
          opacity: 0.9 * Math.pow(u1, 1.3),
        };
      })
    : [];

  return {
    x,
    y,
    col,
    cosCol,
    sinCol,
    blend: colorOf(deg),
    trail,
    wedge,
    wedgeHead,
    sinLeg,
    sinExt,
    guide2,
    mirrors,
    refArcAt,
    refLabel,
    refPolar,
    braceC,
    braceS,
    cosLabel,
    sinLabel,
    cosDir,
    sinDir,
    cosExit,
    sinExit,
    tag,
    slope,
  };
}

/** Chip text size in px; chips keep their size on screen whatever the zoom. */
export const CHIP_FONT = tagT.chipFont;
type PlaceOpts = {
  ax: number;
  ay: number;
  gap: number;
  pref: [number, number];
  segs: Seg[];
  fixed?: boolean;
  place?: 'above' | 'left';
};
const OFFS = [0, 15, -15, 30, -30, 45, -45, 60, -60, 75, -75, 90, -90, 120, -120, 150, -150, 180];
/**
 * How far out along the unit direction (ux, uy) a box of half-size hw × hh must sit for its edge to
 * clear the anchor by `g`.
 */
function standoff(ux: number, uy: number, hw: number, hh: number, g: number) {
  let lo = 0,
    hi = 300;
  for (let i = 0; i < 24; i++) {
    const m = (lo + hi) / 2;
    if (Math.hypot(Math.max(Math.abs(m * ux) - hw, 0), Math.max(Math.abs(m * uy) - hh, 0)) >= g)
      hi = m;
    else lo = m;
  }
  return hi;
}
/** A box center, kept so the box (half-size hw × hh) stays inside B. */
const clampTo = (B: Rect, x: number, y: number, hw: number, hh: number) => ({
  x: Math.max(B.x + 2 + hw, Math.min(B.x + B.w - 2 - hw, x)),
  y: Math.max(B.y + 2 + hh, Math.min(B.y + B.h - 2 - hh, y)),
});
/**
 * Center of a w×h chip near its anchor: tries spots around it and takes the one that covers the
 * fewest labels and lines, preferring a direction. Sticks with the last pick unless another is
 * clearly better.
 */
function placeChip(
  o: PlaceOpts,
  w: number,
  h: number,
  labels: (Rect & { k?: number })[],
  B: Rect,
  memo: { b: number },
) {
  const hw = w / 2,
    hh = h / 2,
    g = o.gap;
  const cands: [number, number][] = [];
  if (o.fixed)
    cands.push(o.place === 'above' ? [0, -(hh + 9)] : o.place === 'left' ? [-(hw + 9), 0] : [0, 0]);
  else {
    // hug the anchor at one minimal distance, fanning out from the preferred direction, so it
    // glides instead of hopping
    const a0 = Math.atan2(o.pref[1], o.pref[0]);
    for (const off of OFFS) {
      const an = a0 + (off * Math.PI) / 180,
        ux = Math.cos(an),
        uy = Math.sin(an),
        d = standoff(ux, uy, hw, hh, g);
      cands.push([d * ux, d * uy]);
    }
  }
  if (cands.length === 1) return clampTo(B, o.ax + cands[0][0], o.ay + cands[0][1], hw, hh);
  const hits = (rx: number, ry: number, l: Rect, pad: number) =>
    rx < l.x + l.w + pad && rx + w > l.x - pad && ry < l.y + l.h + pad && ry + h > l.y - pad;
  const scores = cands.map((d) => {
    const rx = o.ax + d[0] - hw,
      ry = o.ay + d[1] - hh;
    let sc = 0;
    if (rx < B.x + 2 || ry < B.y + 2 || rx + w > B.x + B.w - 2 || ry + h > B.y + B.h - 2) sc += 100;
    for (const l of labels) if (hits(rx, ry, l, 3)) sc += l.k ?? 6;
    for (const sg of o.segs)
      for (let t = 0; t <= 1.001; t += 0.05) {
        const px = sg[0] + (sg[2] - sg[0]) * t,
          py = sg[1] + (sg[3] - sg[1]) * t;
        if (px > rx - 2 && px < rx + w + 2 && py > ry - 2 && py < ry + h + 2) sc += 1;
      }
    return sc + 0.8 * (1 - (d[0] * o.pref[0] + d[1] * o.pref[1]) / (Math.hypot(d[0], d[1]) || 1));
  });
  let best = scores.indexOf(Math.min(...scores));
  const prev = memo.b;
  if (prev >= 0 && prev < scores.length && scores[prev] < scores[best] + 0.3) best = prev;
  memo.b = best;
  return clampTo(B, o.ax + cands[best][0], o.ay + cands[best][1], hw, hh);
}
