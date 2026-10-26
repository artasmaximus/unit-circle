// What the unit circle topic puts on the plane, composed from figures (see figures/figure.ts): the
// triangle's legs and their braces and labels, the angle arc, the mirror lines, the reference angle,
// the trail, the point, and the faded preview under the pointer. Where things sit comes from the
// scene (scene.ts); this file decides how each is drawn and how it moves through a mode switch.
// When the topic is not the unit circle it asks for nothing, so every mark plays its exit.
import { LABEL_R, S } from '../../core/camera.svelte.ts';
import { figure as F } from '../../core/tuning.ts';
import { colorOf, rad } from '../../core/trig.ts';
import type { Mark } from '../../plane/marks.ts';
import { polar, type Ctx, type Look, type Pt } from '../../figures/figure.ts';
import { AngleArc } from '../../figures/angleArc.ts';
import { Brace } from '../../figures/brace.ts';
import { Label } from '../../figures/label.ts';
import { Point } from '../../figures/point.ts';
import { Segment } from '../../figures/segment.ts';
import { Trail } from '../../figures/trail.ts';
import type { Scene, Seg } from './scene.ts';

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
  /** The preview under the pointer (see Plane.svelte), or null. */
  ghost: { x: number; y: number; deg: number; special: boolean; tex: string; color: string } | null;
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
const ends = (g: Seg): { from: Pt; to: Pt } => ({ from: [g[0], g[1]], to: [g[2], g[3]] });

export function circleMarks(i: CircleInput): Mark[] {
  if (!i.active) return [];
  const { sc } = i,
    ctx: Ctx = { sw: i.sw, lb: i.lb },
    out: Mark[] = [];
  const add = (d: { marks: Mark[] }) => out.push(...d.marks);
  const win = (a: number, b: number) => clamp01((i.t - a) / (b - a));
  const moving = i.t < 1;
  const before = i.wasRevealed ? sc.blend : 'var(--fg)';
  const legBefore = (fn: 'cos' | 'sin') => (i.wasRevealed ? `var(--${fn})` : 'var(--fg)');
  // one dash period per switch, on the pen's own lean-and-snap curve, so the dashes tick like the
  // switch
  const tick = (period: number) => period * i.sw * i.pen;
  const wash = clamp01(i.pen);
  const arcWash = win(...F.arcWash),
    rayWash = win(...F.rayWash),
    braceDraw = win(...F.braceDraw);
  const axisCol = sc.cosCol === 'var(--fg)' ? 'var(--muted)' : sc.cosCol;
  const bob = (F.bob / i.k) * Math.sin(Math.PI * win(0, F.bobEnd));

  // ---- the guides across to the y-axis, and out to the mirrored points, are dashed like the legs
  // so the whole figure reads as one family
  const legDash: Look & { dashOffset: number } = {
    width: 2,
    dash: [3, 6],
    round: true,
    opacity: 0.7,
    dashOffset: tick(9),
  };
  const mirrorLine = {
    power: F.mirrorEase,
    enter: 'draw',
    dur: F.mirrorMs * F.mirrorLineShare,
    exitDelay: 150,
    exitDur: 300,
  } as const;
  add(
    Segment(
      'guide:x',
      {
        from: [sc.x, sc.y],
        to: [0, sc.y],
        color: axisCol,
        ...legDash,
        z: 3,
        enter: 'draw',
        dur: 350,
      },
      ctx,
    ),
  );
  if (sc.guide2)
    add(
      Segment(
        'mirror:guide',
        { ...ends(sc.guide2), color: axisCol, ...legDash, z: 6, ...mirrorLine },
        ctx,
      ),
    );

  // ---- the angle arc, with the new color washing along it as a mode switch plays
  const wedge = { to: sc.ang, r: S / 5, ccw: true, width: 1.25, z: 4 } as const;
  add(
    AngleArc(
      'wedge',
      {
        ...wedge,
        color: moving ? before : sc.col,
        dur: 400,
        head: {
          min: 0.16,
          max: 2 * Math.PI - 0.02,
          color: moving && arcWash < 1 ? before : sc.col,
          round: true,
          delay: 250,
        },
      },
      ctx,
    ),
  );
  if (moving) add(AngleArc('wedge:wash', { ...wedge, color: sc.col, part: arcWash, ...NOW }, ctx));

  // ---- the legs: dashes that tick through a mode switch, the new color filling along each leg in
  // step with it
  const legs = [
    { fn: 'cos' as const, seg: [0, 0, sc.x, 0] as Seg, now: sc.cosCol },
    { fn: 'sin' as const, seg: sc.sinLeg, now: sc.sinCol },
  ];
  for (const leg of legs) {
    const [x1, y1, x2, y2] = leg.seg,
      len = Math.hypot(x2 - x1, y2 - y1),
      look: Look = { width: 2, dash: [3, 6], round: true, opacity: 0.7, z: 4 },
      front: Pt = [x1 + (x2 - x1) * wash, y1 + (y2 - y1) * wash];
    if (moving) {
      // the old color keeps only the part ahead of the wash front (its dashes continue the same
      // pattern), so the two never overlap
      add(
        Segment(
          `leg:${leg.fn}:rest`,
          {
            from: front,
            to: [x2, y2],
            ...look,
            color: legBefore(leg.fn),
            dashOffset: tick(9) + wash * len,
            ...NOW,
          },
          ctx,
        ),
      );
      add(
        Segment(
          `leg:${leg.fn}`,
          {
            from: [x1, y1],
            to: front,
            ...look,
            color: leg.now,
            dashOffset: tick(9),
            enter: 'draw',
            dur: 350,
          },
          ctx,
        ),
      );
    } else
      add(
        Segment(
          `leg:${leg.fn}`,
          {
            from: [x1, y1],
            to: [x2, y2],
            ...look,
            color: leg.now,
            dashOffset: tick(9),
            enter: 'draw',
            dur: 350,
          },
          ctx,
        ),
      );
  }
  if (sc.sinExt)
    add(
      Segment(
        'mirror:ext',
        { ...ends(sc.sinExt), color: sc.sinCol, ...legDash, z: 4, ...mirrorLine },
        ctx,
      ),
    );

  // ---- the radius
  const ray = { from: [0, 0] as Pt, width: 1.75, round: true, z: 6 };
  add(
    Segment(
      'ray',
      { ...ray, to: [sc.x, sc.y], color: moving ? before : sc.col, enter: 'draw', dur: 450 },
      ctx,
    ),
  );
  if (moving)
    add(
      Segment(
        'ray:wash',
        { ...ray, to: [sc.x * rayWash, sc.y * rayWash], color: sc.col, ...NOW },
        ctx,
      ),
    );

  // ---- the braces and their labels. A leg too short for a brace simply has none: the brace
  // undraws and its label blurs away.
  for (const fn of ['cos', 'sin'] as const) {
    const leg = sc.legs[fn];
    if (!leg) continue;
    const now = fn === 'cos' ? sc.cosCol : sc.sinCol,
      brace = { ...leg.brace, width: 1, opacity: 0.6, z: 5 };
    add(
      Brace(
        `brace:${fn}`,
        {
          ...brace,
          color: moving ? legBefore(fn) : now,
          enter: 'draw',
          dur: F.legExitMs,
          exitDur: F.legExitMs,
        },
        ctx,
      ),
    );
    // the brace stays put; only its new color draws in, from both ends toward the tip
    if (moving)
      add(Brace(`brace:${fn}:wash`, { ...brace, color: now, part: braceDraw, ...NOW }, ctx));
    const { at } = leg.label;
    add(
      Label(
        `legLabel:${fn}`,
        {
          ...leg.label,
          at: [at[0] + leg.dir[0] * bob, at[1] + leg.dir[1] * bob],
          color: i.t < F.bobEnd ? legBefore(fn) : now,
          back: true,
          z: 9,
          enter: 'fade',
          dur: F.legExitMs,
          exit: 'shoot',
          exitDur: F.legExitMs,
          shoot: [leg.exit[0] * F.legShoot, leg.exit[1] * F.legShoot],
        },
        ctx,
      ),
    );
  }

  // ---- the reference angle: its arc swells out of the θ arc on a spring and the label pops in on
  // the arc's middle. On a mode switch it waits for the switch to get under way.
  if (sc.ref) {
    const spring = {
      curve: give,
      fadeBy: F.refFadeBy,
      dur: F.refSettle * 1000,
      exitDur: 300,
      delay: moving ? F.refLabel[0] * 460 : 0,
      enter: 'pop',
    } as const;
    const arc = sc.ref.arc;
    if (arc)
      add(
        AngleArc(
          'ref:arc',
          {
            from: arc.from,
            to: sc.ang,
            r: arc.r,
            swell: arc.swell,
            color: sc.col,
            width: 1.75,
            round: true,
            z: 6,
            ...spring,
          },
          ctx,
        ),
      );
    add(Label('ref:label', { ...sc.ref.label, color: sc.col, z: 9, popFrom: 0.3, ...spring }, ctx));
  }

  // ---- the trail behind the point
  add(
    Trail(
      'trail',
      {
        r: S,
        head: sc.ang,
        length: sc.tail,
        steps: 28,
        color: (a) => (sc.revealed ? colorOf((a * 180) / Math.PI) : 'var(--muted)'),
        z: 3,
        ...NOW,
      },
      ctx,
    ),
  );

  // ---- the mirror points: a line out to each reflected point, the dot where it lands, and its
  // angle. The lines draw first (above), then the dot pops in as they land, and leaving runs it
  // backwards: the dot first, then the line.
  const landing = F.mirrorMs * F.mirrorLineShare * 0.5;
  for (const m of sc.mirrors) {
    if (m.line)
      add(
        Segment(
          `mirror:line${m.i}`,
          { ...ends(m.line), color: sc.col, ...legDash, z: 6, ...mirrorLine },
          ctx,
        ),
      );
    add(
      Point(
        `mirror:dot${m.i}`,
        {
          at: m.dot,
          r: 4.5,
          fill: 'var(--bg)',
          stroke: sc.col,
          width: 1.5,
          z: 7,
          delay: landing,
          dur: F.mirrorMs - landing,
          exitDur: 200,
        },
        ctx,
      ),
    );
    if (m.label)
      add(
        Label(
          `mirror:label${m.i}`,
          {
            ...m.label,
            color: sc.col,
            z: 9,
            enter: 'fade',
            delay: landing,
            dur: 300,
            exitDur: 150,
          },
          ctx,
        ),
      );
  }

  // ---- the faded preview under the pointer
  if (i.ghost) {
    const g = i.ghost,
      grey = 'var(--muted)',
      q = { z: 8, enter: 'fade', dur: 100, exitDur: 100 } as const;
    add(
      Segment(
        'ghost:ray',
        { from: [0, 0], to: [g.x, g.y], color: grey, width: 1, dash: [2, 4], opacity: 0.45, ...q },
        ctx,
      ),
    );
    if (!g.special)
      add(Point('ghost:dot', { at: [g.x, g.y], r: 6, fill: grey, opacity: 0.45, ...q }, ctx));
    add(
      Label(
        'ghost:label',
        {
          tex: g.tex,
          size: 10,
          at: polar(rad(g.deg), LABEL_R),
          color: g.color,
          opacity: g.special ? 1 : 0.45,
          ...q,
        },
        ctx,
      ),
    );
  }

  // ---- the point itself
  add(
    Point(
      'point',
      {
        at: [sc.x, sc.y],
        r: i.dotR,
        fill: sc.col,
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
