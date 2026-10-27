// What the Inverse trig topic puts on the plane, composed from figures (see figures/figure.ts). The
// function is pure: state in, marks out. It never tracks arrivals or exits. A mark that should not
// be there is simply left out, and the mark layer plays its exit. Keys carry the function name
// where a mark belongs to one function (the axis, the handle), so switching functions retires one
// set and brings in the next; the ray, its arc and the point on the circle keep one key, so they
// sweep to their new angle instead.
import { SPECIAL_VALUES, otherAngle, valueTex, type InvFn } from './math.ts';
import { LABEL_R, S } from '../../core/camera.svelte.ts';
import type { Mark } from '../../plane/marks.ts';
import { angleTex, type Unit } from '../../core/angles.ts';
import { rad } from '../../core/trig.ts';
import { polar, type Ctx, type Pt } from '../../figures/figure.ts';
import { AngleArc } from '../../figures/angleArc.ts';
import { Arc } from '../../figures/arc.ts';
import { Label } from '../../figures/label.ts';
import { NumberLine } from '../../figures/numberLine.ts';
import { Tick } from '../../figures/tick.ts';
import { Point } from '../../figures/point.ts';
import { Trail } from '../../figures/trail.ts';
import { Sector } from '../../figures/sector.ts';
import { Segment } from '../../figures/segment.ts';
import { DUR, after } from '../../core/tuning.ts';

export type InvInput = {
  /**
   * Whether the inverse topic is on the plane at all; when it is not, nothing is wanted, and
   * everything leaves.
   */
  active: boolean;
  fn: InvFn;
  angle: number;
  other: number;
  value: number;
  pole: boolean;
  /** The control's destination angle, to tell when the faded preview would change nothing. */
  target: number;
  shown: boolean;
  showOther: boolean;
  showBand: boolean;
  given: number | null;
  domain: { lo: number; hi: number } | null;
  ghost: number | null;
  dragging: boolean;
  /** The free probe point (degrees, not wrapped), or null when there is none. */
  probe: number | null;
  /** The arcs (radians) of the colored tails behind the answer's point and the probe. */
  tail: number;
  probeTail: number;
  /**
   * Line width, label size and decimal places, as camera.stroke, camera.labelBoost and
   * camera.thetaDecimals give them.
   */
  sw: number;
  lb: number;
  decimals: number;
  unit: Unit;
};

const COLORS = { asin: 'var(--sin)', acos: 'var(--cos)', atan: 'var(--slope)' } as const;
/** The dash the topic uses for guide lines, in stroke units. */
const DASH: [number, number] = [3, 4];
/** A trail sticks to the instant it moves: no entrance or exit of its own. */
const NOW = { dur: DUR.instant, exitDur: DUR.instant, enter: 'fade' } as const;
/** A point on a circle at an angle in degrees. */
const at = (deg: number, r = S): Pt => polar(rad(deg), r);
/** Whether two angles are different points on the circle (at ±1 the two crossings meet). */
const apart = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180) > 1;

export function inverseScene(i: InvInput): Mark[] {
  if (!i.active) return [];
  const { fn } = i,
    c = COLORS[fn],
    ctx: Ctx = { sw: i.sw, lb: i.lb },
    sw = i.sw,
    out: Mark[] = [];
  const add = (d: { marks: Mark[] }) => out.push(...d.marks);
  const ang = (a: number) => angleTex(a, i.unit, i.decimals);

  const P = at(i.angle),
    Q = at(i.other),
    twin = apart(i.angle, i.other);
  const probing = i.probe !== null;
  const handle: Pt | null = probing
    ? null
    : fn === 'asin'
      ? [0, -i.value * S]
      : fn === 'acos'
        ? [i.value * S, 0]
        : null;

  // ---- the stage: the shaded range, the stretch θ is drawn from, and the axis the value lives on
  if (i.showBand) {
    const [from, to] = fn === 'acos' ? [0, Math.PI] : [-Math.PI / 2, Math.PI / 2];
    add(
      Sector(
        `band:${fn}`,
        {
          from,
          to,
          r: S,
          fill: c,
          opacity: 0.07,
          z: 0,
          enter: 'fade',
          dur: DUR.draw,
          exitDur: DUR.base,
        },
        ctx,
      ),
    );
  }
  if (i.domain && i.domain.hi - i.domain.lo < 360) {
    add(
      Arc(
        'domain',
        {
          from: rad(i.domain.lo),
          to: rad(i.domain.hi),
          r: S,
          color: 'var(--muted)',
          width: 3.5,
          opacity: 0.35,
          z: 1,
          dur: DUR.draw,
        },
        ctx,
      ),
    );
  }
  if (fn !== 'atan' && !probing) {
    add(
      NumberLine(
        `axis:${fn}`,
        {
          axis: fn === 'asin' ? 'y' : 'x',
          r: S,
          values: SPECIAL_VALUES[fn],
          color: c,
          exit: 'fade',
          tickExitDur: 120,
        },
        ctx,
      ),
    );
  }

  // ---- an angle the question starts from, and how its value carries over to the axis
  if (i.given !== null) {
    const G = at(i.given),
      guide = {
        color: 'var(--muted)',
        width: 1,
        dash: DASH,
        opacity: 0.5,
        z: 4,
        enter: 'draw',
      } as const;
    add(Segment('given:ray', { from: [0, 0], to: G, ...guide, dur: DUR.draw }, ctx));
    if (fn !== 'atan')
      add(
        Segment(
          'given:drop',
          {
            from: G,
            to: fn === 'asin' ? [0, G[1]] : [G[0], 0],
            ...guide,
            delay: after(2),
            dur: DUR.draw,
          },
          ctx,
        ),
      );
    add(
      Point(
        'given:dot',
        {
          at: G,
          r: 5.5,
          fill: 'var(--bg)',
          stroke: 'var(--muted)',
          width: 1.5,
          z: 7,
          delay: after(1),
        },
        ctx,
      ),
    );
    add(
      Label(
        'given:label',
        {
          tex: ang(i.given),
          size: 10,
          at: at(i.given, LABEL_R),
          color: 'var(--muted)',
          z: 9,
          enter: 'fade',
          delay: after(2),
        },
        ctx,
      ),
    );
  }

  // ---- the answer: the guide to the circle, the ray, its arc, the point where it lands, and the
  // angle
  if (i.shown) {
    if (handle)
      add(
        Segment(
          `${fn}:guide`,
          {
            from: handle,
            to: P,
            color: c,
            width: 1.25,
            dash: DASH,
            round: true,
            z: 5,
            enter: 'draw',
            delay: after(1),
            dur: DUR.draw,
          },
          ctx,
        ),
      );
    add(
      Segment(
        'ray',
        {
          from: [0, 0],
          to: P,
          color: c,
          width: 1.75,
          round: true,
          z: 6,
          enter: 'draw',
          dur: DUR.draw,
        },
        ctx,
      ),
    );
    add(
      Trail(
        'trail',
        { r: S, head: rad(i.angle), length: i.tail, steps: 28, color: () => c, z: 3, ...NOW },
        ctx,
      ),
    );
    add(
      AngleArc(
        'arc',
        {
          to: rad(i.angle),
          r: S / 5,
          color: c,
          width: 1.25,
          z: 6,
          delay: after(1),
          dur: DUR.draw,
          head: { min: rad(9), delay: after(3) },
        },
        ctx,
      ),
    );
    add(
      Point(
        'P',
        { at: P, r: 6.5, fill: c, stroke: 'var(--panel)', width: 2, z: 7, delay: after(2) },
        ctx,
      ),
    );
    add(
      Label(
        'P:label',
        {
          tex: ang(i.angle),
          size: 10.5,
          at: at(i.angle / 2, S * 0.36),
          color: c,
          z: 9,
          enter: 'fade',
          delay: after(2),
        },
        ctx,
      ),
    );
    if (fn === 'atan') {
      const mid = at(i.angle, S * 0.62);
      add(
        Label(
          'atan:m',
          {
            tex: i.pole ? 'm\\ \\text{undef.}' : `m=${valueTex('atan', i.value)}`,
            size: 11,
            at: [
              mid[0] + Math.sin(rad(i.angle)) * 15 * sw,
              mid[1] - Math.cos(rad(i.angle)) * 15 * sw,
            ],
            color: c,
            back: true,
            z: 9,
            enter: 'fade',
            delay: after(3),
          },
          ctx,
        ),
      );
    }
  }
  if (handle) {
    add(
      Tick(
        `${fn}:handle`,
        { at: handle, axis: fn === 'asin' ? 'y' : 'x', color: c, z: 7, delay: after(2) },
        ctx,
      ),
    );
    add(
      Label(
        `${fn}:value`,
        {
          tex: `${fn === 'asin' ? 'y' : 'x'}=${valueTex(fn, i.value)}`,
          size: 11,
          at: [
            handle[0] + (fn === 'asin' ? 14 * sw : 0),
            handle[1] + (fn === 'asin' ? 0 : -16 * sw),
          ],
          anchor: fn === 'asin' ? [0, 0.5] : [0.5, 1],
          color: c,
          back: true,
          z: 9,
          enter: 'fade',
          delay: after(2),
        },
        ctx,
      ),
    );
  }

  // ---- the other angle, as a sequence that reads as a consequence: the line carries on from the
  // answer's point to the other crossing, the point lands there, and (for arcsin and arccos) a ray
  // grows from it back to the origin. Leaving runs it backwards.
  if (i.shown && i.showOther && twin) {
    const faint = { color: c, width: 1.25, dash: DASH, opacity: 0.5, enter: 'draw' } as const;
    add(
      Segment(
        'other:chord',
        {
          from: fn === 'atan' ? [0, 0] : P,
          to: Q,
          ...faint,
          z: 5,
          dur: DUR.base,
          exitDelay: after(1),
          exitDur: DUR.quick,
        },
        ctx,
      ),
    );
    add(
      Point(
        'other:dot',
        {
          at: Q,
          r: 5.5,
          fill: 'var(--bg)',
          stroke: c,
          width: 1.5,
          z: 7,
          delay: after(2),
          dur: DUR.quick,
          exitDelay: after(0.5),
          exitDur: DUR.blink,
        },
        ctx,
      ),
    );
    if (fn !== 'atan')
      add(
        Segment(
          'other:ray',
          {
            from: Q,
            to: [0, 0],
            ...faint,
            z: 6,
            delay: after(3),
            dur: DUR.base,
            exitDur: DUR.quick,
          },
          ctx,
        ),
      );
    add(
      Label(
        'other:label',
        {
          tex: ang(i.other),
          size: 10,
          at: at(i.other, LABEL_R),
          color: c,
          opacity: 0.7,
          z: 9,
          enter: 'fade',
          delay: after(3),
          exitDur: DUR.blink,
        },
        ctx,
      ),
    );
  }

  // ---- the free probe: a point you can move by the ring, the y-axis or the x-axis, with what it
  // reads on each
  if (i.probe !== null) {
    const pa = i.probe,
      PP = at(pa),
      Hy: Pt = [0, PP[1]],
      Hx: Pt = [PP[0], 0];
    const ys = Math.sin(rad(pa)),
      xs = Math.cos(rad(pa)),
      fg = 'var(--fg)',
      red = COLORS.asin,
      blue = COLORS.acos;
    add(
      NumberLine('probe:axisY', { axis: 'y', r: S, values: SPECIAL_VALUES.asin, color: red }, ctx),
    );
    add(
      NumberLine('probe:axisX', { axis: 'x', r: S, values: SPECIAL_VALUES.asin, color: blue }, ctx),
    );
    const drop = { width: 1.25, dash: DASH, z: 5, enter: 'draw', dur: DUR.base } as const;
    add(
      Trail(
        'probe:trail',
        { r: S, head: rad(pa), length: i.probeTail, steps: 28, color: () => fg, z: 3, ...NOW },
        ctx,
      ),
    );
    add(Segment('probe:dropY', { from: PP, to: Hy, color: red, ...drop }, ctx));
    add(Segment('probe:dropX', { from: PP, to: Hx, color: blue, ...drop }, ctx));
    add(
      Segment(
        'probe:ray',
        {
          from: [0, 0],
          to: PP,
          color: fg,
          width: 1.75,
          round: true,
          z: 6,
          enter: 'draw',
          dur: DUR.draw,
        },
        ctx,
      ),
    );
    // the angle reads in the stretch the question draws θ from (0° to 360° unless it says
    // otherwise)
    const from = i.domain?.lo ?? 0;
    add(
      AngleArc(
        'probe:arc',
        {
          to: rad(pa),
          r: S / 5,
          ccw: true,
          color: fg,
          width: 1.25,
          z: 6,
          delay: after(1),
          dur: DUR.draw,
        },
        ctx,
      ),
    );
    const knob = { z: 7, delay: after(2) };
    add(Tick('probe:Hy', { at: Hy, axis: 'y', color: red, ...knob }, ctx));
    add(Tick('probe:Hx', { at: Hx, axis: 'x', color: blue, ...knob }, ctx));
    add(
      Point(
        'probe:P',
        { at: PP, r: 6.5, fill: fg, stroke: 'var(--panel)', width: 2, z: 8, delay: after(2) },
        ctx,
      ),
    );
    const reading = { size: 11, back: true, z: 9, enter: 'fade', delay: after(2) } as const;
    add(
      Label(
        'probe:vy',
        {
          tex: `y=${valueTex('asin', ys)}`,
          at: [Hy[0] + 14 * sw, Hy[1]],
          anchor: [0, 0.5],
          color: red,
          ...reading,
        },
        ctx,
      ),
    );
    add(
      Label(
        'probe:vx',
        {
          tex: `x=${valueTex('asin', xs)}`,
          at: [Hx[0], Hx[1] + 16 * sw],
          anchor: [0.5, 0],
          color: blue,
          ...reading,
        },
        ctx,
      ),
    );
    add(
      Label(
        'probe:angle',
        {
          tex: ang(from + ((((pa - from) % 360) + 360) % 360)),
          size: 10.5,
          at: at(pa / 2, S * 0.36),
          color: fg,
          z: 9,
          enter: 'fade',
          delay: after(2),
        },
        ctx,
      ),
    );
  }

  // ---- the faded preview: where a press would put the control, with both angles it would give
  if (i.ghost !== null && !probing && !i.dragging && Math.abs(i.ghost - i.target) > 1e-3) {
    const gP = at(i.ghost),
      go = otherAngle(fn, i.ghost),
      gQ = at(go),
      both = apart(i.ghost, go);
    const g = { z: 8, enter: 'fade', dur: DUR.blink, exitDur: DUR.blink } as const,
      grey = 'var(--muted)',
      ring = { r: 5, fill: 'none', stroke: grey, width: 1.5, opacity: 0.45, ...g };
    add(
      Segment(
        'ghost:line',
        { from: gQ, to: gP, color: grey, width: 1, dash: [2, 4], opacity: 0.45, ...g },
        ctx,
      ),
    );
    if (fn !== 'atan') {
      const v = fn === 'asin' ? Math.sin(rad(i.ghost)) : Math.cos(rad(i.ghost));
      add(
        Tick(
          'ghost:handle',
          {
            at: fn === 'asin' ? [0, -v * S] : [v * S, 0],
            axis: fn === 'asin' ? 'y' : 'x',
            color: grey,
            opacity: 0.45,
            ...g,
          },
          ctx,
        ),
      );
    }
    add(Point('ghost:P', { at: gP, ...ring }, ctx));
    if (both) add(Point('ghost:Q', { at: gQ, ...ring }, ctx));
    const faded = { size: 10, color: grey, opacity: 0.8, ...g };
    add(Label('ghost:lP', { tex: ang(i.ghost), at: at(i.ghost, LABEL_R), ...faded }, ctx));
    if (both) add(Label('ghost:lQ', { tex: ang(go), at: at(go, LABEL_R), ...faded }, ctx));
    if (fn === 'atan') {
      const tex =
        Math.abs(i.ghost) > 89.9
          ? 'm\\ \\text{undef.}'
          : `m=${valueTex('atan', Math.tan(rad(i.ghost)))}`;
      add(Label('ghost:m', { tex, at: at(i.ghost, S * 0.58), ...faded }, ctx));
    }
  }
  return out;
}
