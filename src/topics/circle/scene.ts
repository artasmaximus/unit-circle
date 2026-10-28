// What the unit circle topic puts on the plane, composed from figures (see figures/figure.ts): the
// triangle's legs and their braces and labels, the angle arc, the mirror lines, the reference
// angle, the trail, the point, and (with the Practice hint) the coordinates where a press would go.
// The ring draws the hover preview itself. Where things sit comes from
// the layout (layout.ts); this file decides how each is drawn and how it moves through a mode
// switch. When the topic is not the unit circle it asks for nothing, so every mark plays its exit.
import { S } from '../../core/camera.svelte.ts';
import { DUR, after, figure as F } from '../../core/tuning.ts';
import { colorOf, rad, trigTex } from '../../core/trig.ts';
import type { Mark } from '../../plane/marks.ts';
import { polar, type Ctx, type Look, type Pt } from '../../figures/figure.ts';
import { AngleArc } from '../../figures/angleArc.ts';
import { Brace } from '../../figures/brace.ts';
import { Label } from '../../figures/label.ts';
import { Point } from '../../figures/point.ts';
import { Segment } from '../../figures/segment.ts';
import { Trail } from '../../figures/trail.ts';
import type { Layout, Seg } from './layout.ts';
import { clamp01 } from '../../core/num.ts';

export type CircleInput = {
  active: boolean;
  layout: Layout;
  /**
   * The mode switch's shared motion: its linear clock (1 when idle), the pen curve, and whether
   * answers showed before it.
   */
  t: number;
  pen: number;
  wasRevealed: boolean;
  /** Where a press would put the point, when the Practice hint shows coordinates there; else null. */
  hintAt: number | null;
  dotR: number;
  sw: number;
  lb: number;
  k: number;
};

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
const NOW = { dur: DUR.instant, exitDur: DUR.instant, enter: 'fade' } as const;
const ends = (g: Seg): { from: Pt; to: Pt } => ({ from: [g[0], g[1]], to: [g[2], g[3]] });

export function circleScene(i: CircleInput): Mark[] {
  if (!i.active) return [];
  const { layout: lo } = i,
    ctx: Ctx = { sw: i.sw, lb: i.lb },
    out: Mark[] = [];
  const add = (d: { marks: Mark[] }) => out.push(...d.marks);
  const win = (a: number, b: number) => clamp01((i.t - a) / (b - a));
  const moving = i.t < 1;
  const before = i.wasRevealed ? lo.blend : 'var(--fg)';
  const legBefore = (fn: 'cos' | 'sin') => (i.wasRevealed ? `var(--${fn})` : 'var(--fg)');
  // one dash period per switch, on the pen's own lean-and-snap curve, so the dashes tick like the
  // switch
  const tick = (period: number) => period * i.sw * i.pen;
  const wash = clamp01(i.pen);
  const arcWash = win(...F.arcWash),
    rayWash = win(...F.rayWash),
    braceDraw = win(...F.braceDraw);
  const axisCol = lo.cosCol === 'var(--fg)' ? 'var(--muted)' : lo.cosCol;
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
    exitDelay: after(1),
    exitDur: DUR.base,
  } as const;
  add(
    Segment(
      'guide:x',
      {
        from: [lo.x, lo.y],
        to: [0, lo.y],
        color: axisCol,
        ...legDash,
        z: 3,
        enter: 'draw',
        dur: DUR.base,
      },
      ctx,
    ),
  );
  if (lo.guide2)
    add(
      Segment(
        'mirror:guide',
        { ...ends(lo.guide2), color: axisCol, ...legDash, z: 6, ...mirrorLine },
        ctx,
      ),
    );

  // ---- the angle arc, with the new color washing along it as a mode switch plays
  const wedge = { to: lo.ang, r: S / 5, ccw: true, width: 1.25, z: 4 } as const;
  add(
    AngleArc(
      'wedge',
      {
        ...wedge,
        color: moving ? before : lo.col,
        dur: DUR.draw,
        head: {
          min: 0.16,
          max: 2 * Math.PI - 0.02,
          color: moving && arcWash < 1 ? before : lo.col,
          round: true,
          delay: after(2),
        },
      },
      ctx,
    ),
  );
  if (moving) add(AngleArc('wedge:wash', { ...wedge, color: lo.col, part: arcWash, ...NOW }, ctx));

  // ---- the legs: dashes that tick through a mode switch, the new color filling along each leg in
  // step with it
  const legs = [
    { fn: 'cos' as const, seg: [0, 0, lo.x, 0] as Seg, now: lo.cosCol },
    { fn: 'sin' as const, seg: lo.sinLeg, now: lo.sinCol },
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
            dur: DUR.base,
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
            dur: DUR.base,
          },
          ctx,
        ),
      );
  }
  if (lo.sinExt)
    add(
      Segment(
        'mirror:ext',
        { ...ends(lo.sinExt), color: lo.sinCol, ...legDash, z: 4, ...mirrorLine },
        ctx,
      ),
    );

  // ---- the radius
  const ray = { from: [0, 0] as Pt, width: 1.75, round: true, z: 6 };
  add(
    Segment(
      'ray',
      { ...ray, to: [lo.x, lo.y], color: moving ? before : lo.col, enter: 'draw', dur: DUR.draw },
      ctx,
    ),
  );
  if (moving)
    add(
      Segment(
        'ray:wash',
        { ...ray, to: [lo.x * rayWash, lo.y * rayWash], color: lo.col, ...NOW },
        ctx,
      ),
    );

  // ---- the braces and their labels. A leg too short for a brace simply has none: the brace
  // undraws and its label blurs away.
  for (const fn of ['cos', 'sin'] as const) {
    const leg = lo.legs[fn];
    if (!leg) continue;
    const now = fn === 'cos' ? lo.cosCol : lo.sinCol,
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
  if (lo.ref) {
    const spring = {
      curve: give,
      fadeBy: F.refFadeBy,
      dur: F.refSettle * 1000,
      exitDur: DUR.base,
      delay: moving ? F.refLabel[0] * 460 : 0,
      enter: 'pop',
    } as const;
    const arc = lo.ref.arc;
    if (arc)
      add(
        AngleArc(
          'ref:arc',
          {
            from: arc.from,
            to: lo.ang,
            r: arc.r,
            swell: arc.swell,
            color: lo.col,
            width: 1.75,
            round: true,
            z: 6,
            ...spring,
          },
          ctx,
        ),
      );
    add(Label('ref:label', { ...lo.ref.label, color: lo.col, z: 9, popFrom: 0.3, ...spring }, ctx));
  }

  // ---- the trail behind the point
  add(
    Trail(
      'trail',
      {
        r: S,
        head: lo.ang,
        length: lo.tail,
        steps: 28,
        color: (a) => (lo.revealed ? colorOf((a * 180) / Math.PI) : 'var(--muted)'),
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
  for (const m of lo.mirrors) {
    if (m.line)
      add(
        Segment(
          `mirror:line${m.i}`,
          { ...ends(m.line), color: lo.col, ...legDash, z: 6, ...mirrorLine },
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
          stroke: lo.col,
          width: 1.5,
          z: 7,
          delay: landing,
          dur: F.mirrorMs - landing,
          exitDur: DUR.quick,
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
            color: lo.col,
            z: 9,
            enter: 'fade',
            delay: landing,
            dur: DUR.base,
            exitDur: DUR.blink,
          },
          ctx,
        ),
      );
  }

  // ---- with the hint taken in Practice, the coordinates of the spot a press would go to, just
  // inside the ring (the ring draws the preview itself)
  if (i.hintAt !== null) {
    const d = i.hintAt;
    add(
      Label(
        'preview:coords',
        {
          tex: `\\left(${trigTex('cos', d)},\\ ${trigTex('sin', d)}\\right)`,
          size: 10,
          // its edge nearest the ring sits just inside it, so it never covers the dot
          at: polar(rad(d), S - 14 * i.sw),
          anchor: [(1 + Math.cos(rad(d))) / 2, (1 - Math.sin(rad(d))) / 2],
          color: 'var(--fg)',
          opacity: 0.8,
          back: true,
          z: 9,
          enter: 'fade',
          dur: DUR.blink,
          exitDur: DUR.blink,
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
        at: [lo.x, lo.y],
        r: i.dotR,
        fill: lo.col,
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
