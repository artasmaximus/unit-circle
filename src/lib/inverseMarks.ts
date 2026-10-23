// What the Inverse trig topic puts on the plane, as keyed marks (see marks.ts). The function is pure: state in, marks out. It never
// tracks arrivals or exits. A mark that should not be there is simply left out, and the mark layer plays its exit.
// Keys carry the function name where a mark belongs to one function (the axis, the handle), so switching functions retires one
// set and brings in the next; the ray, its arc and the point on the circle keep one key, so they sweep to their new angle instead.
import { INV_NAME, SPECIAL_VALUES, otherAngle, valueTex, type InvFn } from './inverse.ts';
import { LABEL_R, S } from './camera.svelte.ts';
import type { Mark } from './marks.ts';
import type { Label } from './scene.ts';
import { texRect } from './tex.svelte.ts';
import { angleTex, type Unit } from './angles.ts';
import { rad } from './trig.ts';

export type InvInput = {
  /** Whether the inverse topic is on the plane at all; when it is not, nothing is wanted, and everything leaves. */
  active: boolean;
  fn: InvFn;
  angle: number; other: number; value: number; pole: boolean;
  /** The control's destination angle, to tell when the faded preview would change nothing. */
  target: number;
  shown: boolean; showOther: boolean; showBand: boolean;
  given: number | null; domain: { lo: number; hi: number } | null;
  ghost: number | null; dragging: boolean;
  /** The free probe point (degrees, not wrapped), or null when there is none. */
  probe: number | null;
  /** Line width, label size and decimal places, as camera.stroke, camera.labelBoost and camera.thetaDecimals give them. */
  sw: number; lb: number; decimals: number;
  unit: Unit;
};

const COLORS = { asin: 'var(--sin)', acos: 'var(--cos)', atan: 'var(--slope)' } as const;
const DASH = (sw: number, a = 3, b = 4): [number, number] => [a * sw, b * sw];
const at = (deg: number, r = S): [number, number] => [r * Math.cos(rad(deg)), -r * Math.sin(rad(deg))];
/** Whether two angles are different points on the circle (at ±1 the two crossings meet). */
const apart = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180) > 1;

export function inverseMarks(i: InvInput): Mark[] {
  if (!i.active) return [];
  const { fn, sw, lb } = i, c = COLORS[fn], out: Mark[] = [];
  const lab = (latex: string, size: number, x: number, y: number, color: string, ax = 0.5, ay = 0.5): Label | null => {
    const rect = texRect(latex, size * lb, x, y, ax, ay);
    return rect && { latex, size: size * lb, rect, color };
  };
  const ang = (a: number) => angleTex(a, i.unit, i.decimals);
  const label = (m: Omit<Extract<Mark, { kind: 'label' }>, 'kind' | 'label'>, l: Label | null) => { if (l) out.push({ kind: 'label', label: l, ...m }); };

  const P = at(i.angle), Q = at(i.other), twin = apart(i.angle, i.other);
  const probing = i.probe !== null;
  const handle: [number, number] | null = probing ? null : fn === 'asin' ? [0, -i.value * S] : fn === 'acos' ? [i.value * S, 0] : null;

  // ---- the stage: the shaded range, the stretch θ is drawn from, and the axis the value lives on
  if (i.showBand) {
    const d = fn === 'acos' ? `M ${-S} 0 A ${S} ${S} 0 0 1 ${S} 0 Z` : `M 0 ${-S} A ${S} ${S} 0 0 1 0 ${S} Z`;
    out.push({ kind: 'path', key: `band:${fn}`, z: 0, d, color: 'none', width: 0, fill: c, opacity: 0.07, enter: 'fade', dur: 450, exitDur: 300 });
  }
  if (i.domain && i.domain.hi - i.domain.lo < 360) {
    const [x1, y1] = at(i.domain.lo), [x2, y2] = at(i.domain.hi);
    out.push({ kind: 'path', key: 'domain', z: 1, d: `M ${x1} ${y1} A ${S} ${S} 0 ${i.domain.hi - i.domain.lo > 180 ? 1 : 0} 0 ${x2} ${y2}`, color: 'var(--muted)', width: 3.5 * sw, opacity: 0.35, enter: 'draw', dur: 500 });
  }
  if (fn !== 'atan' && !probing) {
    const [x1, y1, x2, y2] = fn === 'asin' ? [0, -S, 0, S] : [-S, 0, S, 0];
    out.push({ kind: 'line', key: `axis:${fn}`, z: 2, x1, y1, x2, y2, color: c, width: 1.5 * sw, opacity: 0.55, enter: 'draw', dur: 500, exit: 'fade' });
    SPECIAL_VALUES[fn].forEach(([v, tex], k) => {
      const [x, y] = fn === 'asin' ? [0, -v * S] : [v * S, 0];
      out.push({ kind: 'dot', key: `tick:${fn}:${k}`, z: 3, x, y, r: 2.2 * sw, fill: c, opacity: 0.8, enter: 'pop', delay: 220 + 25 * k, dur: 220, exitDur: 120 });
      label({ key: `tickl:${fn}:${k}`, z: 3, enter: 'fade', delay: 260 + 25 * k, exitDur: 120 },
        fn === 'asin' ? lab(tex, 8.5, -7 * sw, y, 'var(--muted)', 1, 0.5) : lab(tex, 8.5, x, 8 * sw, 'var(--muted)', 0.5, 0));
    });
  }

  // ---- an angle the question starts from, and how its value carries over to the axis
  if (i.given !== null) {
    const G = at(i.given);
    out.push({ kind: 'line', key: 'given:ray', z: 4, x1: 0, y1: 0, x2: G[0], y2: G[1], color: 'var(--muted)', width: sw, dash: DASH(sw), opacity: 0.5, enter: 'draw', dur: 400 });
    if (fn !== 'atan') {
      const A: [number, number] = fn === 'asin' ? [0, G[1]] : [G[0], 0];
      out.push({ kind: 'line', key: 'given:drop', z: 4, x1: G[0], y1: G[1], x2: A[0], y2: A[1], color: 'var(--muted)', width: sw, dash: DASH(sw), opacity: 0.5, enter: 'draw', delay: 300, dur: 400 });
    }
    out.push({ kind: 'dot', key: 'given:dot', z: 7, x: G[0], y: G[1], r: 5.5 * sw, fill: 'var(--bg)', stroke: 'var(--muted)', width: 1.5 * sw, enter: 'pop', delay: 200 });
    label({ key: 'given:label', z: 9, enter: 'fade', delay: 300 }, lab(ang(i.given), 10, ...at(i.given, LABEL_R), 'var(--muted)'));
  }

  // ---- the answer: the guide to the circle, the ray, its arc, the point where it lands, and the angle
  if (i.shown) {
    if (handle) out.push({ kind: 'line', key: `${fn}:guide`, z: 5, x1: handle[0], y1: handle[1], x2: P[0], y2: P[1], color: c, width: 1.25 * sw, dash: DASH(sw), round: true, enter: 'draw', delay: 150, dur: 450 });
    out.push({ kind: 'line', key: 'ray', z: 6, x1: 0, y1: 0, x2: P[0], y2: P[1], color: c, width: 1.75 * sw, round: true, enter: 'draw', dur: 450 });
    const r = S / 5, [ax, ay] = at(i.angle, r);
    out.push({ kind: 'path', key: 'arc', z: 6, d: `M ${r} 0 A ${r} ${r} 0 0 ${i.angle >= 0 ? 0 : 1} ${ax} ${ay}`, color: c, width: 1.25 * sw, enter: 'draw', delay: 120, dur: 400 });
    if (Math.abs(i.angle) >= 9) {
      const sgn = i.angle >= 0 ? 1 : -1, tx = -Math.sin(rad(i.angle)) * sgn, ty = -Math.cos(rad(i.angle)) * sgn, L = 4.6 * sw, W = 2.6 * sw;
      out.push({ kind: 'path', key: 'arc:head', z: 6, d: `M ${ax - tx * L - ty * W} ${ay - ty * L + tx * W} L ${ax} ${ay} L ${ax - tx * L + ty * W} ${ay - ty * L - tx * W}`, color: c, width: 1.25 * sw, join: true, enter: 'fade', delay: 380 });
    }
    out.push({ kind: 'dot', key: 'P', z: 7, x: P[0], y: P[1], r: 6.5 * sw, fill: c, stroke: 'var(--panel)', width: 2 * sw, enter: 'pop', delay: 300 });
    label({ key: 'P:label', z: 9, enter: 'fade', delay: 350 }, lab(ang(i.angle), 10.5, ...at(i.angle / 2, S * 0.36), c));
    if (fn === 'atan') {
      const mid = at(i.angle, S * 0.62);
      label({ key: 'atan:m', z: 9, back: lb, enter: 'fade', delay: 380 },
        lab(i.pole ? 'm\\ \\text{undef.}' : `m=${valueTex('atan', i.value)}`, 11, mid[0] + Math.sin(rad(i.angle)) * 15 * sw, mid[1] - Math.cos(rad(i.angle)) * 15 * sw, c));
    }
  }
  if (handle) {
    out.push({ kind: 'dot', key: `${fn}:handle`, z: 7, x: handle[0], y: handle[1], r: 5 * sw, fill: c, stroke: 'var(--panel)', width: 2 * sw, enter: 'pop', delay: 250 });
    label({ key: `${fn}:value`, z: 9, back: lb, enter: 'fade', delay: 300 },
      lab(`${fn === 'asin' ? 'y' : 'x'}=${valueTex(fn, i.value)}`, 11, handle[0] + (fn === 'asin' ? 10 * sw : 0), handle[1] + (fn === 'asin' ? 0 : -12 * sw), c, fn === 'asin' ? 0 : 0.5, fn === 'asin' ? 0.5 : 1));
  }

  // ---- the other angle, as a sequence that reads as a consequence: the line carries on from the answer's point to the other
  // crossing, the point lands there, and (for arcsin and arccos) a ray grows from it back to the origin. Leaving runs it backwards.
  if (i.shown && i.showOther && twin) {
    const from: [number, number] = fn === 'atan' ? [0, 0] : P;
    out.push({ kind: 'line', key: 'other:chord', z: 5, x1: from[0], y1: from[1], x2: Q[0], y2: Q[1], color: c, width: 1.25 * sw, dash: DASH(sw), opacity: 0.5, enter: 'draw', dur: 320, exitDelay: 160, exitDur: 220 });
    out.push({ kind: 'dot', key: 'other:dot', z: 7, x: Q[0], y: Q[1], r: 5.5 * sw, fill: 'var(--bg)', stroke: c, width: 1.5 * sw, enter: 'pop', delay: 300, dur: 250, exitDelay: 80, exitDur: 160 });
    if (fn !== 'atan') out.push({ kind: 'line', key: 'other:ray', z: 6, x1: Q[0], y1: Q[1], x2: 0, y2: 0, color: c, width: 1.25 * sw, dash: DASH(sw), opacity: 0.5, enter: 'draw', delay: 420, dur: 320, exitDur: 200 });
    label({ key: 'other:label', z: 9, opacity: 0.7, enter: 'fade', delay: 380, exitDur: 120 }, lab(ang(i.other), 10, ...at(i.other, LABEL_R), c));
  }

  // ---- the free probe: a point you can move by the ring, the y-axis or the x-axis, with what it reads on each
  if (i.probe !== null) {
    const pa = i.probe, PP = at(pa), Hy: [number, number] = [0, PP[1]], Hx: [number, number] = [PP[0], 0];
    const ys = Math.sin(rad(pa)), xs = Math.cos(rad(pa)), fg = 'var(--fg)', red = COLORS.asin, blue = COLORS.acos;
    out.push({ kind: 'line', key: 'probe:axisY', z: 2, x1: 0, y1: -S, x2: 0, y2: S, color: red, width: 1.5 * sw, opacity: 0.55, enter: 'draw', dur: 500 });
    out.push({ kind: 'line', key: 'probe:axisX', z: 2, x1: -S, y1: 0, x2: S, y2: 0, color: blue, width: 1.5 * sw, opacity: 0.55, enter: 'draw', dur: 500 });
    SPECIAL_VALUES.asin.forEach(([v, tex], k) => {
      out.push({ kind: 'dot', key: `probe:ty:${k}`, z: 3, x: 0, y: -v * S, r: 2.2 * sw, fill: red, opacity: 0.8, enter: 'pop', delay: 220 + 25 * k, dur: 220 });
      out.push({ kind: 'dot', key: `probe:tx:${k}`, z: 3, x: v * S, y: 0, r: 2.2 * sw, fill: blue, opacity: 0.8, enter: 'pop', delay: 220 + 25 * k, dur: 220 });
      label({ key: `probe:tyl:${k}`, z: 3, enter: 'fade', delay: 260 + 25 * k }, lab(tex, 8.5, -7 * sw, -v * S, 'var(--muted)', 1, 0.5));
      label({ key: `probe:txl:${k}`, z: 3, enter: 'fade', delay: 260 + 25 * k }, lab(tex, 8.5, v * S, 8 * sw, 'var(--muted)', 0.5, 0));
    });
    out.push({ kind: 'line', key: 'probe:dropY', z: 5, x1: PP[0], y1: PP[1], x2: Hy[0], y2: Hy[1], color: red, width: 1.25 * sw, dash: DASH(sw), enter: 'draw', dur: 350 });
    out.push({ kind: 'line', key: 'probe:dropX', z: 5, x1: PP[0], y1: PP[1], x2: Hx[0], y2: Hx[1], color: blue, width: 1.25 * sw, dash: DASH(sw), enter: 'draw', dur: 350 });
    out.push({ kind: 'line', key: 'probe:ray', z: 6, x1: 0, y1: 0, x2: PP[0], y2: PP[1], color: fg, width: 1.75 * sw, round: true, enter: 'draw', dur: 450 });
    // the angle reads in the stretch the question draws θ from (0° to 360° unless it says otherwise)
    const from = i.domain?.lo ?? 0;
    const wr = S / 5, [wx, wy] = at(pa, wr), wrap = ((pa % 360) + 360) % 360;
    out.push({ kind: 'path', key: 'probe:arc', z: 6, d: `M ${wr} 0 A ${wr} ${wr} 0 ${wrap > 180 ? 1 : 0} 0 ${wx} ${wy}`, color: fg, width: 1.25 * sw, enter: 'draw', delay: 120, dur: 400 });
    out.push({ kind: 'dot', key: 'probe:Hy', z: 7, x: Hy[0], y: Hy[1], r: 5 * sw, fill: red, stroke: 'var(--panel)', width: 2 * sw, enter: 'pop', delay: 250 });
    out.push({ kind: 'dot', key: 'probe:Hx', z: 7, x: Hx[0], y: Hx[1], r: 5 * sw, fill: blue, stroke: 'var(--panel)', width: 2 * sw, enter: 'pop', delay: 250 });
    out.push({ kind: 'dot', key: 'probe:P', z: 8, x: PP[0], y: PP[1], r: 6.5 * sw, fill: fg, stroke: 'var(--panel)', width: 2 * sw, enter: 'pop', delay: 300 });
    label({ key: 'probe:vy', z: 9, back: lb, enter: 'fade', delay: 300 }, lab(`y=${valueTex('asin', ys)}`, 11, Hy[0] + 10 * sw, Hy[1], red, 0, 0.5));
    label({ key: 'probe:vx', z: 9, back: lb, enter: 'fade', delay: 300 }, lab(`x=${valueTex('asin', xs)}`, 11, Hx[0], Hx[1] + 12 * sw, blue, 0.5, 0));
    label({ key: 'probe:angle', z: 9, enter: 'fade', delay: 350 }, lab(ang(from + ((((pa - from) % 360) + 360) % 360)), 10.5, ...at(pa / 2, S * 0.36), fg));
  }

  // ---- the faded preview: where a press would put the control, with both angles it would give
  if (i.ghost !== null && !probing && !i.dragging && Math.abs(i.ghost - i.target) > 1e-3) {
    const gP = at(i.ghost), go = otherAngle(fn, i.ghost), gQ = at(go), both = apart(i.ghost, go);
    const g = { z: 8, enter: 'fade', dur: 120, exitDur: 120 } as const, grey = 'var(--muted)';
    out.push({ kind: 'line', key: 'ghost:line', ...g, x1: gQ[0], y1: gQ[1], x2: gP[0], y2: gP[1], color: grey, width: sw, dash: DASH(sw, 2, 4), opacity: 0.45 });
    if (fn !== 'atan') {
      const v = fn === 'asin' ? Math.sin(rad(i.ghost)) : Math.cos(rad(i.ghost));
      out.push({ kind: 'dot', key: 'ghost:handle', ...g, x: fn === 'asin' ? 0 : v * S, y: fn === 'asin' ? -v * S : 0, r: 5 * sw, fill: grey, opacity: 0.45 });
    }
    out.push({ kind: 'dot', key: 'ghost:P', ...g, x: gP[0], y: gP[1], r: 5 * sw, fill: 'none', stroke: grey, width: 1.5 * sw, opacity: 0.45 });
    if (both) out.push({ kind: 'dot', key: 'ghost:Q', ...g, x: gQ[0], y: gQ[1], r: 5 * sw, fill: 'none', stroke: grey, width: 1.5 * sw, opacity: 0.45 });
    label({ key: 'ghost:lP', ...g, opacity: 0.8 }, lab(ang(i.ghost), 10, ...at(i.ghost, LABEL_R), grey));
    if (both) label({ key: 'ghost:lQ', ...g, opacity: 0.8 }, lab(ang(go), 10, ...at(go, LABEL_R), grey));
    if (fn === 'atan') {
      const gm = at(i.ghost, S * 0.58);
      label({ key: 'ghost:m', ...g, opacity: 0.8 }, lab(Math.abs(i.ghost) > 89.9 ? 'm\\ \\text{undef.}' : `m=${valueTex('atan', Math.tan(rad(i.ghost)))}`, 10, gm[0], gm[1], grey));
    }
  }
  void INV_NAME;
  return out;
}
