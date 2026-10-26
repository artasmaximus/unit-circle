// The unit circle itself and its 16 snap points, as keyed marks (see marks.ts). The ring belongs to
// every topic, so it never asks to leave. During a mode switch the dots pulse in one after another
// around it, each changing color at the peak of its pulse.
import { angleTex, type Unit } from '../core/angles.ts';
import { LABEL_R, S } from '../core/camera.svelte.ts';
import type { Mark } from './marks.ts';
import { texRect } from '../core/tex.svelte.ts';
import { SPECIAL, colorOf, rad } from '../core/trig.ts';
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
   * False where nothing else writes the label of the angle being aimed at, so the ring keeps it
   * (only the unit circle's hover ghost writes it).
   */
  writesAim?: boolean;
};

const PULSE = input.pulseShare,
  STEP = (1 - PULSE) / (SPECIAL.length - 1);
const local = (t: number, i: number) => Math.min(1, Math.max(0, (t - i * STEP) / PULSE));

export function ringScene(i: RingInput): Mark[] {
  const out: Mark[] = [
    {
      kind: 'path',
      key: 'ring',
      z: 0,
      d: `M ${S} 0 A ${S} ${S} 0 1 0 ${-S} 0 A ${S} ${S} 0 1 0 ${S} 0`,
      color: 'var(--muted)',
      width: 1 * i.sw,
      enter: 'draw',
      dur: 700,
    },
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
      (i.aim === a ? input.aimGrow : 1) *
      i.sw;
    // hover growth glides; the mode switch's pulse already moves frame by frame, so it must not be
    // smoothed on top
    out.push({
      kind: 'dot',
      key: `ring:${a}`,
      z: 1,
      x: c * S,
      y: s * S,
      r,
      fill: color,
      stroke: 'var(--bg)',
      width: 1.2 * i.sw,
      enter: 'pop',
      delay: 120 + 35 * k,
      glide: i.t < 1 ? 0 : 140,
    });
    if (i.labels !== false && (i.aim !== a || i.writesAim === false) && !i.taken(a)) {
      const latex = angleTex(a, i.unit),
        rect = texRect(latex, 10 * i.lb, c * LABEL_R, s * LABEL_R);
      if (rect)
        out.push({
          kind: 'label',
          key: `ring:label:${a}`,
          z: 2,
          label: { latex, size: 10 * i.lb, rect, color },
          enter: 'fade',
          delay: 200 + 35 * k,
          dur: 200,
          exitDur: 120,
        });
    }
  });
  return out;
}
