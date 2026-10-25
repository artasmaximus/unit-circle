// What the unit circle topic puts on the plane, as keyed marks (see marks.ts): the triangle, its
// angle arcs, braces and labels, the mirror lines, the reference angle, the trail, the point, and
// the faded preview under the pointer. State in, marks out; nothing here tracks arrivals or exits.
// When the topic is not the unit circle it asks for nothing, so every mark plays its exit.
import { figure as F } from './tuning.ts';
import type { Mark } from './marks.ts';
import type { Label, Scene } from './scene.ts';

export type CircleInput = {
  active: boolean;
  sc: Scene;
  /**
   * The mode switch's shared motion: its linear clock (1 when idle), the pen curve, and whether
   * answers showed before it.
   */
  t: number;
  pen: number;
  wasRevealed: boolean;
  /** The preview under the pointer, already worked out (see Plane.svelte), or null. */
  ghost: { x: number; y: number; special: boolean; label: Label | null } | null;
  dotR: number;
  sw: number;
  lb: number;
  k: number;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/**
 * An underdamped spring sampled as a pop curve (settles in `refSettle` seconds, overshoots a
 * little), for the reference angle.
 */
const WD = F.refFreq * Math.sqrt(1 - F.refDamping ** 2);
export const give = (u: number) => {
  if (u >= 1) return 1;
  const x = u * F.refSettle;
  return (
    1 -
    Math.exp(-F.refDamping * F.refFreq * x) *
      (Math.cos(WD * x) + ((F.refDamping * F.refFreq) / WD) * Math.sin(WD * x))
  );
};
/**
 * Marks that follow a changing value frame by frame (a wash front, the half of a dash pattern left
 * behind) take no time to arrive or leave.
 */
const NOW = { dur: 0, exitDur: 0, enter: 'fade' } as const;

export function circleMarks(i: CircleInput): Mark[] {
  if (!i.active) return [];
  const { sc, sw, lb } = i,
    out: Mark[] = [];
  const win = (a: number, b: number) => clamp01((i.t - a) / (b - a));
  const moving = i.t < 1;
  const before = i.wasRevealed ? sc.blend : 'var(--fg)';
  const legBefore = (fn: 'cos' | 'sin') => (i.wasRevealed ? `var(--${fn})` : 'var(--fg)');
  // one dash period per switch, on the pen's own lean-and-snap curve, so the dashes tick like the
  // switch
  const tick = (period: number) => period * sw * i.pen;
  const wash = clamp01(i.pen);
  const arcWash = win(...F.arcWash),
    rayWash = win(...F.rayWash),
    braceDraw = win(...F.braceDraw);
  const axisCol = sc.cosCol === 'var(--fg)' ? 'var(--muted)' : sc.cosCol;
  const bob = (F.bob / i.k) * Math.sin(Math.PI * win(0, F.bobEnd));
  const label = (m: Omit<Extract<Mark, { kind: 'label' }>, 'kind' | 'label'>, l: Label | null) => {
    if (l) out.push({ kind: 'label', label: l, ...m });
  };

  // ---- the guides to the axes the guides across to the y-axis, and out to the mirrored points,
  // are dashed like the legs so the whole figure reads as one family
  const legDash = {
    width: 2 * sw,
    dash: [3 * sw, 6 * sw] as [number, number],
    round: true,
    opacity: 0.7,
    offset: tick(9),
  };
  out.push({
    kind: 'line',
    key: 'guide:x',
    z: 3,
    x1: sc.x,
    y1: sc.y,
    x2: 0,
    y2: sc.y,
    color: axisCol,
    ...legDash,
    enter: 'draw',
    dur: 350,
  });
  if (sc.guide2) {
    const g = sc.guide2;
    out.push({
      kind: 'line',
      key: 'mirror:guide',
      z: 6,
      x1: g[0],
      y1: g[1],
      x2: g[2],
      y2: g[3],
      color: axisCol,
      ...legDash,
      power: F.mirrorEase,
      enter: 'draw',
      dur: F.mirrorMs * F.mirrorLineShare,
      exitDelay: 150,
      exitDur: 300,
    });
  }

  // ---- the angle arc, with the new color washing along it as a mode switch plays
  out.push({
    kind: 'path',
    key: 'wedge',
    z: 4,
    d: sc.wedge,
    color: moving ? before : sc.col,
    width: 1.25 * sw,
    enter: 'draw',
    dur: 400,
  });
  if (moving)
    out.push({
      kind: 'path',
      key: 'wedge:wash',
      z: 4,
      d: sc.wedge,
      color: sc.col,
      width: 1.25 * sw,
      part: arcWash,
      ...NOW,
    });
  if (sc.wedgeHead)
    out.push({
      kind: 'path',
      key: 'wedge:head',
      z: 4,
      d: sc.wedgeHead,
      color: moving && arcWash < 1 ? before : sc.col,
      width: 1.25 * sw,
      round: true,
      join: true,
      enter: 'fade',
      delay: 250,
    });

  // ---- the legs: dashes that tick through a mode switch, the new color filling along each leg in
  // step with it
  const legs = [
    { fn: 'cos' as const, seg: [0, 0, sc.x, 0], now: sc.cosCol },
    { fn: 'sin' as const, seg: sc.sinLeg as number[], now: sc.sinCol },
  ];
  for (const leg of legs) {
    const [x1, y1, x2, y2] = leg.seg,
      len = Math.hypot(x2 - x1, y2 - y1),
      dash: [number, number] = [3 * sw, 6 * sw];
    const base = { z: 4, width: 2 * sw, dash, round: true, opacity: 0.7 } as const;
    if (moving) {
      // the old color keeps only the part ahead of the wash front (its dashes continue the same
      // pattern), so the two never overlap
      out.push({
        kind: 'line',
        key: `leg:${leg.fn}:rest`,
        ...base,
        x1: x1 + (x2 - x1) * wash,
        y1: y1 + (y2 - y1) * wash,
        x2,
        y2,
        color: legBefore(leg.fn),
        offset: tick(9) + wash * len,
        ...NOW,
      });
      out.push({
        kind: 'line',
        key: `leg:${leg.fn}`,
        ...base,
        x1,
        y1,
        x2: x1 + (x2 - x1) * wash,
        y2: y1 + (y2 - y1) * wash,
        color: leg.now,
        offset: tick(9),
        enter: 'draw',
        dur: 350,
      });
    } else
      out.push({
        kind: 'line',
        key: `leg:${leg.fn}`,
        ...base,
        x1,
        y1,
        x2,
        y2,
        color: leg.now,
        offset: tick(9),
        enter: 'draw',
        dur: 350,
      });
  }
  if (sc.sinExt) {
    const e = sc.sinExt;
    out.push({
      kind: 'line',
      key: 'mirror:ext',
      z: 4,
      x1: e[0],
      y1: e[1],
      x2: e[2],
      y2: e[3],
      color: sc.sinCol,
      width: 2 * sw,
      dash: [3 * sw, 6 * sw],
      round: true,
      opacity: 0.7,
      offset: tick(9),
      power: F.mirrorEase,
      enter: 'draw',
      dur: F.mirrorMs * F.mirrorLineShare,
      exitDelay: 150,
      exitDur: 300,
    });
  }

  // ---- the radius
  out.push({
    kind: 'line',
    key: 'ray',
    z: 6,
    x1: 0,
    y1: 0,
    x2: sc.x,
    y2: sc.y,
    color: moving ? before : sc.col,
    width: 1.75 * sw,
    round: true,
    enter: 'draw',
    dur: 450,
  });
  if (moving)
    out.push({
      kind: 'line',
      key: 'ray:wash',
      z: 6,
      x1: 0,
      y1: 0,
      x2: sc.x * rayWash,
      y2: sc.y * rayWash,
      color: sc.col,
      width: 1.75 * sw,
      round: true,
      ...NOW,
    });

  // ---- the braces and their labels. A leg too short for a brace simply has none: the brace
  // undraws and its label blurs away.
  const sides = [
    {
      fn: 'cos' as const,
      brace: sc.braceC,
      lab: sc.cosLabel,
      dir: sc.cosDir,
      exit: sc.cosExit,
      now: sc.cosCol,
    },
    {
      fn: 'sin' as const,
      brace: sc.braceS,
      lab: sc.sinLabel,
      dir: sc.sinDir,
      exit: sc.sinExit,
      now: sc.sinCol,
    },
  ];
  for (const s of sides) {
    if (!s.brace) continue;
    const bc = {
      z: 5,
      width: 1 * sw,
      round: true,
      join: true,
      opacity: 0.6,
      d: s.brace.path,
      transform: s.brace.transform,
      symmetric: true,
    } as const;
    out.push({
      kind: 'path',
      key: `brace:${s.fn}`,
      ...bc,
      color: moving ? legBefore(s.fn) : s.now,
      enter: 'draw',
      dur: F.legExitMs,
      exitDur: F.legExitMs,
    });
    // the brace stays put; only its new color draws in, from both ends toward the tip
    if (moving)
      out.push({
        kind: 'path',
        key: `brace:${s.fn}:wash`,
        ...bc,
        color: s.now,
        part: braceDraw,
        ...NOW,
      });
    if (s.lab) {
      const l = {
        ...s.lab,
        color: i.t < F.bobEnd ? legBefore(s.fn) : s.lab.color,
        rect: { ...s.lab.rect, x: s.lab.rect.x + s.dir[0] * bob, y: s.lab.rect.y + s.dir[1] * bob },
      };
      label(
        {
          key: `legLabel:${s.fn}`,
          z: 9,
          back: lb,
          enter: 'fade',
          dur: F.legExitMs,
          exit: 'shoot',
          exitDur: F.legExitMs,
          shoot: [s.exit[0] * F.legShoot, s.exit[1] * F.legShoot],
        },
        l,
      );
    }
  }

  // ---- the reference angle: its arc swells out of the θ arc on a spring and the label pops in on
  // the arc's middle. On a mode switch it waits for the switch to get under way.
  const wait = moving ? F.refLabel[0] * 460 : 0;
  const rp = sc.refPolar;
  if (sc.refLabel && rp) {
    const refSpring = {
      curve: give,
      fadeBy: F.refFadeBy,
      dur: F.refSettle * 1000,
      exitDur: 300,
      delay: wait,
      enter: 'pop',
    } as const;
    if (sc.refArcAt)
      out.push({
        kind: 'path',
        key: 'ref:arc',
        z: 6,
        d: sc.refArcAt(1),
        at: sc.refArcAt,
        color: sc.col,
        width: 1.75 * sw,
        round: true,
        ...refSpring,
      });
    label({ key: 'ref:label', z: 9, popFrom: 0.3, ...refSpring }, sc.refLabel);
  }

  // ---- the trail behind the point
  if (sc.trail.length) {
    out.push({
      kind: 'segments',
      key: 'trail',
      z: 3,
      segs: sc.trail.map((tr) => ({
        x1: tr.seg[0],
        y1: tr.seg[1],
        x2: tr.seg[2],
        y2: tr.seg[3],
        color: tr.color,
        width: tr.width * sw,
        opacity: tr.opacity,
      })),
      ...NOW,
    });
  }

  // ---- the mirror points: a line out to each reflected point, the dot where it lands, and its
  // angle. The lines draw first (above), then the dot pops in as they land, and leaving runs it
  // backwards: the dot first, then the line.
  const landing = F.mirrorMs * F.mirrorLineShare * 0.5;
  for (const m of sc.mirrors) {
    if (m.line)
      out.push({
        kind: 'line',
        key: `mirror:line${m.i}`,
        z: 6,
        x1: m.line[0],
        y1: m.line[1],
        x2: m.line[2],
        y2: m.line[3],
        color: sc.col,
        ...legDash,
        power: F.mirrorEase,
        enter: 'draw',
        dur: F.mirrorMs * F.mirrorLineShare,
        exitDelay: 150,
        exitDur: 300,
      });
    out.push({
      kind: 'dot',
      key: `mirror:dot${m.i}`,
      z: 7,
      x: m.dot[0],
      y: m.dot[1],
      r: 4.5 * sw,
      fill: 'var(--bg)',
      stroke: sc.col,
      width: 1.5 * sw,
      enter: 'pop',
      delay: landing,
      dur: F.mirrorMs - landing,
      exitDur: 200,
    });
    label(
      { key: `mirror:label${m.i}`, z: 9, enter: 'fade', delay: landing, dur: 300, exitDur: 150 },
      m.label,
    );
  }

  // ---- the faded preview under the pointer
  if (i.ghost) {
    const g = i.ghost,
      grey = 'var(--muted)',
      q = { z: 8, enter: 'fade', dur: 100, exitDur: 100 } as const;
    out.push({
      kind: 'line',
      key: 'ghost:ray',
      ...q,
      x1: 0,
      y1: 0,
      x2: g.x,
      y2: g.y,
      color: grey,
      width: sw,
      dash: [2 * sw, 4 * sw],
      opacity: 0.45,
    });
    if (!g.special)
      out.push({
        kind: 'dot',
        key: 'ghost:dot',
        ...q,
        x: g.x,
        y: g.y,
        r: 6 * sw,
        fill: grey,
        opacity: 0.45,
      });
    label({ key: 'ghost:label', ...q, opacity: g.special ? 1 : 0.45 }, g.label);
  }

  // ---- the point itself
  out.push({
    kind: 'dot',
    key: 'point',
    z: 10,
    x: sc.x,
    y: sc.y,
    r: i.dotR * sw,
    fill: sc.col,
    stroke: 'var(--panel)',
    width: 2 * sw,
    enter: 'pop',
    delay: 150,
  });
  return out;
}
