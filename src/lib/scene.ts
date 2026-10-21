// Everything drawn on the plane for one frame, as plain data. Components only render what this returns.
// World units: the circle has radius S, y points down (so sin is drawn as -y).
import { S } from './camera.svelte.ts';
import { colorOf, norm, refOf, specialOf, trigTex, type Fn } from './trig.ts';
import { texBox, texRect, type Rect } from './tex.svelte.ts';

export type Seg = [number, number, number, number];
export type Label = { latex: string; size: number; rect: Rect; color: string };
/** `parts`, when set, render in place of `latex`, each in its own color (it is sized by `latex`). */
export type Chip = { latex: string; parts?: { latex: string; color: string }[]; x: number; y: number; w: number; h: number; ax: number; ay: number; color: string };
export type Scene = ReturnType<typeof buildScene>;

export type SceneInput = {
  ang: number; hit: number | undefined; dotR: number;
  /** Signed arc (radians) of the trail behind the point. */
  tail: number;
  revealed: boolean; mirror: boolean; mirrorOnly: Fn | null;
  showCoords: boolean;
  /** Px per world unit and the uncovered area in world units, for sizing and keeping chips on screen. */
  k: number; bounds: Rect;
  memo: { a: number; b: number };
};

const label = (latex: string, size: number, x: number, y: number, color: string, ax = 0.5, ay = 0.5): Label | null => {
  const rect = texRect(latex, size, x, y, ax, ay);
  return rect && { latex, size, rect, color };
};

// Each reflection keeps one function's value: across the x-axis (cos), the y-axis (sin), through the origin (tan).
const REFL: { ang: (a: number) => number; deg: (d: number) => number; fn: Fn }[] = [
  { ang: (a) => 2 * Math.PI - a, deg: (d) => 360 - d, fn: 'cos' },
  { ang: (a) => Math.PI - a, deg: (d) => 540 - d, fn: 'sin' },
  { ang: (a) => a + Math.PI, deg: (d) => d + 180, fn: 'tan' },
];

/** A curly brace beside segment (x1,y1)-(x2,y2), tip along the outward normal (nx,ny). */
function brace(x1: number, y1: number, x2: number, y2: number, nx: number, ny: number, minLen: number) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < minLen) return null;
  const ux = (x2 - x1) / L, uy = (y2 - y1) / L, d = Math.min(7, L / 6), m = 5, h = L / 2;
  return {
    d, m,
    path: `M 0 0 Q 0 ${-d / 2} ${d} ${-d / 2} H ${h - d} Q ${h} ${-d / 2} ${h} ${-d} Q ${h} ${-d / 2} ${h + d} ${-d / 2} H ${L - d} Q ${L} ${-d / 2} ${L} 0`,
    transform: `matrix(${ux} ${uy} ${-nx} ${-ny} ${x1 + nx * m} ${y1 + ny * m})`,
  };
}

export function buildScene(p: SceneInput) {
  const { ang, hit } = p;
  const c = Math.cos(ang), s = Math.sin(ang), x = c * S, y = -s * S;
  const deg = hit ?? norm((ang * 180) / Math.PI);
  const col = p.revealed ? colorOf(deg) : 'var(--fg)';

  // angle arc with a small open arrowhead whose tip sits on the terminal side
  const r = S / 5;
  const wedge = `M ${r} 0 A ${r} ${r} 0 ${ang > Math.PI ? 1 : 0} 0 ${r * Math.cos(-ang)} ${r * Math.sin(-ang)}`;
  const px = r * c, py = -r * s, tx = -s, ty = -c, L = 4.6, W = 2.6;
  const wedgeHead = ang > 0.16 && ang < 2 * Math.PI - 0.02
    ? `M ${px - tx * L - ty * W} ${py - ty * L + tx * W} L ${px} ${py} L ${px - tx * L + ty * W} ${py - ty * L - tx * W}` : null;

  // legs of the triangle; mirror mode stretches them to the reflected points
  let sinLeg: Seg = [x, 0, x, y];
  let guide2: Seg | null = null;
  const mirrors: { line: Seg | null; dot: [number, number]; label: Label | null }[] = [];
  REFL.forEach((rf, i) => {
    if (!p.mirror || (p.mirrorOnly && p.mirrorOnly !== rf.fn)) return;
    const a = rf.ang(ang), gx = S * Math.cos(a), gy = -S * Math.sin(a), gd = norm(Math.round(rf.deg(deg)));
    let line: Seg | null = null;
    if (i === 0) sinLeg = [x, gy, x, y];
    else if (i === 1) guide2 = [0, y, gx, y];
    else line = [x, y, gx, gy];
    // a ghost on a snap point is already named by the ring label
    const lb = specialOf(gd) !== undefined ? null : label(`${gd}^\\circ`, 11, (S + 17) * Math.cos(a), -(S + 17) * Math.sin(a), col);
    mirrors.push({ line, dot: [gx, gy], label: lb });
  });

  // reference angle: quadrants II–IV get a small arc from the nearest x-axis; in quadrant I the label rides the θ arc
  let refArc: string | null = null, refLabel: Label | null = null;
  if (hit !== undefined && p.revealed) {
    const ref = refOf(hit);
    let mid: number, rr = 50;
    if (hit > 90 && ref > 0) {
      const ra = (S / 5) * 1.3, phiA = c >= -1e-9 ? 0 : Math.PI;
      const diff = ((((ang - phiA + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
      refArc = `M ${ra * Math.cos(phiA)} ${-ra * Math.sin(phiA)} A ${ra} ${ra} 0 0 ${diff > 0 ? 0 : 1} ${ra * c} ${-ra * s}`;
      mid = phiA + diff / 2;
    } else if (hit > 90) mid = (hit * Math.PI) / 180;
    else { mid = ang / 2; rr = 46; }
    refLabel = label(`${ref}^\\circ`, 12, rr * Math.cos(mid), -rr * Math.sin(mid) + (ref === 0 ? -9 : 0), col);
  }

  // leg labels sit past a curly brace on the outside of each leg, so they read as lengths
  const ncy = s >= 0 ? 1 : -1, ncx = c >= 0 ? 1 : -1;
  const braceC = brace(0, 0, x, 0, 0, ncy, 30), braceS = brace(x, 0, x, y, ncx, 0, 24);
  const obstacles: (Rect & { k?: number })[] = [];
  let cosLabel: Label | null = null, sinLabel: Label | null = null;
  if (braceC) {
    const h = (texBox('x=\\cos\\theta')?.h ?? 0) * 12;
    cosLabel = label('x=\\cos\\theta', 12, x / 2, ncy * (braceC.m + braceC.d + 4 + h / 2), p.revealed ? 'var(--cos)' : 'var(--fg)');
    obstacles.push({ x: Math.min(0, x), y: Math.min(ncy * braceC.m, ncy * (braceC.m + braceC.d)), w: Math.abs(x), h: braceC.d });
  }
  if (braceS) {
    sinLabel = label('y=\\sin\\theta', 12, x + ncx * (braceS.m + braceS.d + 5), y / 2, p.revealed ? 'var(--sin)' : 'var(--fg)', ncx > 0 ? 0 : 1, 0.5);
    obstacles.push({ x: Math.min(x + ncx * braceS.m, x + ncx * (braceS.m + braceS.d)), y: Math.min(0, y), w: braceS.d, h: Math.abs(y) });
  }
  if (cosLabel) obstacles.push(cosLabel.rect);
  if (sinLabel) obstacles.push(sinLabel.rect);

  // floating chips: point coordinates and slope
  const cx = trigTex('cos', deg), sx = trigTex('sin', deg), tv = trigTex('tan', deg);
  const segs: Seg[] = [[0, 0, x, y], [0, 0, x, 0], [x, 0, x, y]];
  const onH = Math.abs(s) < 0.02, onV = Math.abs(c) < 0.02;
  const slopeTex = `\\tan\\theta=${tv}`;
  // the working behind it, shown in a tooltip on hover
  const slopeCalc = `\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}=\\frac{${sx}}{${cx}}=${tv}`;
  const place = (o: PlaceOpts, latex: string, padX: number, padY: number, minW: number, key: 'a' | 'b', color: string): Chip | null => {
    const b = texBox(latex);
    if (!b) return null;
    const w = Math.max(b.w * CHIP_FONT + padX, minW) / p.k, h = (b.h * CHIP_FONT + padY) / p.k;
    const at = placeChip(o, w, h, obstacles, p.bounds, p.memo, key);
    return { latex, x: at.x, y: at.y, w, h, ax: o.ax, ay: o.ay, color };
  };
  const slope = p.revealed
    ? place({ ax: x / 2, ay: y / 2, fixed: true, gap: 0, pref: [0, 0], segs, place: onH ? 'above' : onV ? 'left' : undefined }, slopeTex, 28, 16, 0, 'b', 'var(--slope)')
    : null;
  // the point's tag: the θ box always, the coordinates too when they may show. θ sits on the side away
  // from the x-axis: above the coordinates in quadrants I and II, below them in III and IV.
  const THETA_H = 40;
  const coords = place({ ax: x, ay: y, gap: p.dotR + 5, pref: onH ? [0, -1] : [c, -s], up2: onH && slope ? slope.h + 12 : 0, segs,
        extra: slope ? [{ x: slope.x - slope.w / 2, y: slope.y - slope.h / 2, w: slope.w, h: slope.h }] : [] },
        p.showCoords ? `\\left(${cx},\\ ${sx}\\right)` : '\\theta=\\ 000.0^\\circ', 24, p.showCoords ? 16 + THETA_H : 12, 96, 'a', col);
  const tag = coords && { ...coords, values: p.showCoords, thetaAbove: y <= 0 };
  // coordinates read (cos, sin): gray brackets and comma, each value in its function's color
  if (tag?.values) {
    const tall = `\\vphantom{${cx}${sx}}`, gray = 'var(--muted)';
    tag.parts = [
      { latex: `\\left(${tall}\\right.`, color: gray }, { latex: cx, color: 'var(--cos)' }, { latex: ',\\ ', color: gray },
      { latex: sx, color: 'var(--sin)' }, { latex: `\\left.${tall}\\right)`, color: gray },
    ];
  }

  // the trail: short segments from the tail up to the point, thickening and taking the nearest snap color
  const TRAIL_N = 28;
  const trail = p.tail ? Array.from({ length: TRAIL_N }, (_, i) => {
    const u0 = i / TRAIL_N, u1 = (i + 1) / TRAIL_N, a0 = ang - p.tail * (1 - u0), a1 = ang - p.tail * (1 - u1);
    return {
      seg: [S * Math.cos(a0), -S * Math.sin(a0), S * Math.cos(a1), -S * Math.sin(a1)] as Seg,
      color: p.revealed ? colorOf((a1 * 180) / Math.PI) : 'var(--muted)',
      width: 0.8 + 3.4 * u1, opacity: 0.9 * Math.pow(u1, 1.3),
    };
  }) : [];

  return { x, y, col, blend: colorOf(deg), trail, wedge, wedgeHead, sinLeg, guide2, mirrors, refArc, refLabel, braceC, braceS, cosLabel, sinLabel, tag, slope, slopeCalc };
}

/** Chip text size in px; chips keep their size on screen whatever the zoom. */
export const CHIP_FONT = 13;
type PlaceOpts = {
  ax: number; ay: number; gap: number; pref: [number, number]; segs: Seg[];
  fixed?: boolean; place?: 'above' | 'left'; up2?: number; extra?: Rect[];
};
const OFFS = [0, 15, -15, 30, -30, 45, -45, 60, -60, 75, -75, 90, -90, 120, -120, 150, -150, 180];
/** Center of a w×h chip near its anchor: tries spots around it and takes the one that covers the fewest
 *  labels and lines, preferring a direction. Sticks with the last pick unless another is clearly better. */
function placeChip(o: PlaceOpts, w: number, h: number, labels: (Rect & { k?: number })[], B: Rect, memo: { a: number; b: number }, key: 'a' | 'b') {
  const hw = w / 2, hh = h / 2, g = o.gap;
  const cands: [number, number][] = [];
  if (o.fixed) cands.push(o.place === 'above' ? [0, -(hh + 9)] : o.place === 'left' ? [-(hw + 9), 0] : [0, 0]);
  else {
    // hug the anchor at one minimal distance, fanning out from the preferred direction, so it glides instead of hopping
    const a0 = Math.atan2(o.pref[1], o.pref[0]);
    for (const off of OFFS) {
      const an = a0 + (off * Math.PI) / 180, ux = Math.cos(an), uy = Math.sin(an);
      let d = 0;
      for (; d < 300; d += 0.5) if (Math.hypot(Math.max(Math.abs(d * ux) - hw, 0), Math.max(Math.abs(d * uy) - hh, 0)) >= g) break;
      cands.push([d * ux, d * uy]);
    }
    if (o.up2) cands.push([0, -(g + hh) - o.up2]);
  }
  const hits = (rx: number, ry: number, l: Rect, pad: number) => rx < l.x + l.w + pad && rx + w > l.x - pad && ry < l.y + l.h + pad && ry + h > l.y - pad;
  const scores = cands.map((d) => {
    const rx = o.ax + d[0] - hw, ry = o.ay + d[1] - hh;
    let sc = 0;
    if (rx < B.x + 2 || ry < B.y + 2 || rx + w > B.x + B.w - 2 || ry + h > B.y + B.h - 2) sc += 100;
    for (const l of o.extra ?? []) if (hits(rx, ry, l, 8)) sc += 1000;
    for (const l of labels) if (hits(rx, ry, l, 3)) sc += l.k ?? 6;
    for (const sg of o.segs) for (let t = 0; t <= 1.001; t += 0.05) {
      const px = sg[0] + (sg[2] - sg[0]) * t, py = sg[1] + (sg[3] - sg[1]) * t;
      if (px > rx - 2 && px < rx + w + 2 && py > ry - 2 && py < ry + h + 2) sc += 1;
    }
    return sc + 0.8 * (1 - (d[0] * o.pref[0] + d[1] * o.pref[1]) / (Math.hypot(d[0], d[1]) || 1));
  });
  let best = scores.indexOf(Math.min(...scores));
  const prev = memo[key];
  if (prev >= 0 && prev < scores.length && scores[prev] < scores[best] + (o.fixed ? 1.5 : 0.3)) best = prev;
  memo[key] = best;
  return {
    x: Math.max(B.x + 2 + hw, Math.min(B.x + B.w - 2 - hw, o.ax + cands[best][0])),
    y: Math.max(B.y + 2 + hh, Math.min(B.y + B.h - 2 - hh, o.ay + cands[best][1])),
  };
}
