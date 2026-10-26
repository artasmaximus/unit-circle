// Where everything on the unit circle sits for one frame, as plain data: the point and its colors,
// its mirror images, the reference angle, the legs' braces and labels, and the floating chips
// (placed clear of the labels). The scene (scene.ts) turns this into figures. World units:
// the circle has radius S, y points down (so sin is drawn as -y).
import { S } from '../../core/camera.svelte.ts';
import { angleTex, type Unit } from '../../core/angles.ts';
import { figure as tuning, tag as tagT } from '../../core/tuning.ts';
import { colorOf, norm, refOf, specialOf, trigTex, type Fn } from '../../core/trig.ts';
import { texBox, type Rect } from '../../core/tex.svelte.ts';
import { braceShape } from '../../figures/brace.ts';
import type { Pt } from '../../figures/figure.ts';
import { labelData } from '../../figures/label.ts';

export type Seg = [number, number, number, number];
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
export type Layout = ReturnType<typeof buildLayout>;

export type LayoutInput = {
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
  /** How angles are written, and the degree precision (see core/angles.ts). */
  unit: Unit;
  decimals: number;
  memo: { b: number };
};

// Each reflection keeps one function's value: across the x-axis (cos), the y-axis (sin), through
// the origin (tan).
const REFL: { ang: (a: number) => number; deg: (d: number) => number; fn: Fn }[] = [
  { ang: (a) => 2 * Math.PI - a, deg: (d) => 360 - d, fn: 'cos' },
  { ang: (a) => Math.PI - a, deg: (d) => 540 - d, fn: 'sin' },
  { ang: (a) => a + Math.PI, deg: (d) => d + 180, fn: 'tan' },
];

/** A label's text and where it sits, sized before the zoom's label scale. */
export type Placed = { tex: string; size: number; at: Pt; anchor?: Pt };
/** A leg's brace, the label past it, and which ways the label bobs and leaves. */
export type Leg = {
  brace: { from: Pt; to: Pt; side: Pt; minLen: number };
  label: Placed;
  dir: Pt;
  exit: Pt;
};

export function buildLayout(p: LayoutInput) {
  const { ang, hit } = p;
  const c = Math.cos(ang),
    s = Math.sin(ang),
    x = c * S,
    y = -s * S;
  const deg = hit ?? norm((ang * 180) / Math.PI);
  const col = p.revealed ? colorOf(deg) : 'var(--fg)';
  const ctx = { sw: p.stroke, lb: p.labelBoost };

  // mirror mode adds a line out to each reflected point, with the reflected dot at its tip
  const sinLeg: Seg = [x, 0, x, y];
  let sinExt: Seg | null = null;
  let guide2: Seg | null = null;
  const mirrors: { i: number; line: Seg | null; dot: Pt; label: Placed | null }[] = [];
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
    const label: Placed | null =
      specialOf(gd) !== undefined
        ? null
        : {
            tex: angleTex(gd, p.unit, 0),
            size: 11,
            at: [(S + 17) * Math.cos(a), -(S + 17) * Math.sin(a)],
          };
    mirrors.push({ i, line, dot: [gx, gy], label });
  });

  // reference angle: quadrants II–IV get a small arc from the nearest x-axis; in quadrant I the
  // label rides the θ arc. The arc runs from the nearest x-axis (`from`) and swells out of the θ
  // arc (radius `swell`) to its own (`r`).
  let ref: { label: Placed; arc: { from: number; r: number; swell: number } | null } | null = null;
  if (hit !== undefined && p.revealed) {
    const refDeg = refOf(hit),
      r0 = S / 5;
    let mid: number,
      rr = tagT.refRadius,
      arc = null;
    if (hit > 90 && refDeg > 0) {
      const phiA = c >= -1e-9 ? 0 : Math.PI;
      const diff =
        ((((ang - phiA + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
      arc = { from: phiA, r: r0 * 1.3, swell: r0 };
      mid = phiA + diff / 2;
    } else if (hit > 90) {
      mid = (hit * Math.PI) / 180;
    } else {
      mid = ang / 2;
      rr = tagT.refRadius - 4;
    }
    const dy = refDeg === 0 ? -9 : 0;
    ref = {
      label: {
        tex: angleTex(refDeg, p.unit, 0),
        size: tagT.refFont,
        at: [rr * Math.cos(mid), -rr * Math.sin(mid) + dy],
      },
      arc,
    };
  }

  // leg labels sit past a curly brace on the outside of each leg, so they read as lengths
  const ncy = s >= 0 ? 1 : -1,
    ncx = c >= 0 ? 1 : -1;
  const cosCol = p.revealed ? 'var(--cos)' : 'var(--fg)',
    sinCol = p.revealed ? 'var(--sin)' : 'var(--fg)';
  // each leg's label bounces away from its brace; leaving, the cosine label continues that way and
  // the sine label goes right
  const braceC = {
      from: [0, 0],
      to: [x, 0],
      side: [0, ncy],
      minLen: tuning.braceMinPx[0] / p.k,
    } as Leg['brace'],
    braceS = {
      from: [x, 0],
      to: [x, y],
      side: [ncx, 0],
      minLen: tuning.braceMinPx[1] / p.k,
    } as Leg['brace'];
  const shapeC = braceShape(0, 0, x, 0, 0, ncy, braceC.minLen, p.stroke),
    shapeS = braceShape(x, 0, x, y, ncx, 0, braceS.minLen, p.stroke);
  const obstacles: (Rect & { k?: number })[] = [];
  let cos: Leg | null = null,
    sin: Leg | null = null;
  if (shapeC) {
    const h = (texBox('x=\\cos\\theta')?.h ?? 0) * 12 * p.labelBoost;
    cos = {
      brace: braceC,
      label: {
        tex: 'x=\\cos\\theta',
        size: 12,
        at: [x / 2, ncy * (shapeC.m + shapeC.d + 4 * p.stroke + h / 2)],
      },
      dir: [0, ncy],
      exit: [0, ncy],
    };
    obstacles.push({
      x: Math.min(0, x),
      y: Math.min(ncy * shapeC.m, ncy * (shapeC.m + shapeC.d)),
      w: Math.abs(x),
      h: shapeC.d,
    });
  }
  if (shapeS) {
    sin = {
      brace: braceS,
      label: {
        tex: 'y=\\sin\\theta',
        size: 12,
        at: [x + ncx * (shapeS.m + shapeS.d + 5 * p.stroke), y / 2],
        anchor: [ncx > 0 ? 0 : 1, 0.5],
      },
      dir: [ncx, 0],
      exit: [1, 0],
    };
    obstacles.push({
      x: Math.min(x + ncx * shapeS.m, x + ncx * (shapeS.m + shapeS.d)),
      y: Math.min(0, y),
      w: shapeS.d,
      h: Math.abs(y),
    });
  }
  for (const leg of [cos, sin]) {
    const l = leg && labelData({ ...leg.label, color: '' }, ctx);
    if (l) obstacles.push(l.rect);
  }

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

  return {
    ang,
    x,
    y,
    col,
    cosCol,
    sinCol,
    blend: colorOf(deg),
    tail: p.tail,
    revealed: p.revealed,
    sinLeg,
    sinExt,
    guide2,
    mirrors,
    ref,
    legs: { cos, sin },
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
