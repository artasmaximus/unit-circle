// The unit circle itself and its 16 snap points, as keyed marks (see figures/). The ring belongs to
// every topic, so it never asks to leave. During a mode switch the dots pulse in one after another
// around it, each changing color at the peak of its pulse. While the pointer hovers near the ring
// it also shows where a press would put the point.
import { angleTex, type Unit } from '../core/angles.ts';
import { LABEL_R, S } from '../core/camera.svelte.ts';
import type { Mark } from './marks.ts';
import type { Ctx } from '../figures/figure.ts';
import { Circle } from '../figures/circle.ts';
import { Label } from '../figures/label.ts';
import { Point } from '../figures/point.ts';
import { Segment } from '../figures/segment.ts';
import { SPECIAL, colorOf, norm, rad } from '../core/trig.ts';
import { input } from '../core/tuning.ts';

export type RingInput = {
  /**
   * The mode switch's linear clock (1 when idle), whether answers showed before it, and whether
   * they show now.
   */
  t: number;
  wasRevealed: boolean;
  revealed: boolean;
  /**
   * Snap angles drawn larger (the ones a quiz found), the snap angle the pointer is aiming at, and
   * which labels something else is writing.
   */
  highlight: number[];
  aim: number | null;
  taken: (deg: number) => boolean;
  sw: number;
  lb: number;
  /** How angles are written (see core/angles.ts); the ring's labels follow it. */
  unit: Unit;
  /**
   * Whether the labels show at all (Practice in Radians hides them, since they would give the
   * answers away).
   */
  labels?: boolean;
  /**
   * Where a press would put the point (see pointHandle.svelte.ts), with the decimals its angle is
   * written to: a faded ray and dot go there, and its angle label takes the ring label's spot.
   */
  preview: number | null;
  decimals: number;
};

const PULSE = input.pulseShare,
  STEP = (1 - PULSE) / (SPECIAL.length - 1);
const local = (t: number, i: number) => Math.min(1, Math.max(0, (t - i * STEP) / PULSE));

export function ringScene(i: RingInput): Mark[] {
  const ctx: Ctx = { sw: i.sw, lb: i.lb };
  const out: Mark[] = [
    ...Circle('ring', { r: S, color: 'var(--muted)', width: 1, z: 0, dur: 700 }, ctx).marks,
  ];
  SPECIAL.forEach((a, k) => {
    const q = local(i.t, k),
      shown = q >= 0.5 ? i.revealed : i.wasRevealed;
    const c = Math.cos(rad(a)),
      s = -Math.sin(rad(a)),
      color = shown ? colorOf(a) : 'var(--muted)';
    const r =
      (i.highlight.includes(a) ? 6.5 : 3.5) *
      (1 + input.pulseGrow * Math.sin(Math.PI * q)) *
      (i.aim === a ? input.aimGrow : 1);
    // hover growth glides; the mode switch's pulse already moves frame by frame, so it must not be
    // smoothed on top
    out.push(
      ...Point(
        `ring:${a}`,
        {
          at: [c * S, s * S],
          r,
          fill: color,
          stroke: 'var(--bg)',
          width: 1.2,
          z: 1,
          delay: 120 + 35 * k,
          glide: i.t < 1 ? 0 : 140,
        },
        ctx,
      ).marks,
    );
    if (i.labels !== false && i.preview !== a && !i.taken(a))
      out.push(
        ...Label(
          `ring:label:${a}`,
          {
            tex: angleTex(a, i.unit),
            size: 10,
            at: [c * LABEL_R, s * LABEL_R],
            color,
            z: 2,
            enter: 'fade',
            delay: 200 + 35 * k,
            dur: 200,
            exitDur: 120,
          },
          ctx,
        ).marks,
      );
  });

  // ---- the preview of a press: a faded ray to where the point would go, a dot there unless a snap
  // dot already is, and the angle, written where that angle's ring label would be
  const g = i.preview;
  if (g !== null) {
    const a = rad(g),
      special = SPECIAL.includes(g),
      grey = 'var(--muted)',
      at: [number, number] = [S * Math.cos(a), -S * Math.sin(a)],
      q = { z: 8, enter: 'fade', dur: 100, exitDur: 100 } as const;
    out.push(
      ...Segment(
        'ring:preview:ray',
        { from: [0, 0], to: at, color: grey, width: 1, dash: [2, 4], opacity: 0.45, ...q },
        ctx,
      ).marks,
    );
    if (!special)
      out.push(
        ...Point('ring:preview:dot', { at, r: 6, fill: grey, opacity: 0.45, ...q }, ctx).marks,
      );
    if (i.labels !== false)
      out.push(
        ...Label(
          'ring:preview:label',
          {
            tex: angleTex(norm(g), i.unit, i.decimals),
            size: 10,
            at: [LABEL_R * Math.cos(a), -LABEL_R * Math.sin(a)],
            color: special && i.revealed ? colorOf(g) : grey,
            opacity: special ? 1 : 0.45,
            ...q,
          },
          ctx,
        ).marks,
      );
  }
  return out;
}
