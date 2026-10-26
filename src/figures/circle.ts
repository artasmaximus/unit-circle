// A whole circle outline around the origin, drawn on from its rightmost point.
import type { Ctx, Drawn, Look, Timing } from './figure.ts';
import { dashOf, timing } from './figure.ts';

export type CircleProps = Look & Timing & { r: number };

export function Circle(key: string, p: CircleProps, ctx: Ctx): Drawn {
  const r = p.r;
  return {
    marks: [
      {
        kind: 'path',
        key,
        z: p.z,
        d: `M ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0`,
        color: p.color ?? 'var(--fg)',
        width: (p.width ?? 1) * ctx.sw,
        dash: dashOf(p.dash, ctx.sw),
        round: p.round,
        opacity: p.opacity,
        ...timing(p),
        enter: p.enter ?? 'draw',
      },
    ],
  };
}
