// What a pointer can grab in Inverse trig. Normally that is the function's control: the value on
// its axis for arcsin (y-axis) and arccos (x-axis), or the ray's angle by the ring for arctan; a
// quiz that sets the value itself offers nothing. A free probe (a composition question) can instead
// be moved three ways, by the ring, the y-axis or the x-axis: a press takes whichever is closest.
import { S } from '../../core/camera.svelte.ts';
import { deg, rad, snapDeg } from '../../core/trig.ts';
import type { Aim, Handle } from '../../plane/handles.svelte.ts';
import { angleOf } from '../../plane/pointHandle.svelte.ts';
import { snapValue } from './math.ts';
import { inverse } from './state.svelte.ts';
import { stage } from './stage.svelte.ts';

const snapOf = (a: Aim) => ({ value: a.valueRange, angle: a.angleRange });
const step = (big: boolean, small: number, large: number) => (big ? large : small);

/** The probe's angle for a pointer at `[x, y]`, moved by the ring or by one axis. */
function probeAngle(by: 'ring' | 'y' | 'x', [x, y]: [number, number], a: Aim) {
  if (by === 'ring') return snapDeg(a.grain(angleOf([x, y])), a.angleRange);
  const cur = rad(inverse.probeTo),
    v = snapValue('asin', Math.max(-1, Math.min(1, by === 'y' ? -y / S : x / S)), a.valueRange);
  // a value sits at two angles; keep to the side the probe is already on
  if (by === 'y') {
    const d = deg(Math.asin(v));
    return Math.cos(cur) >= 0 ? d : 180 - d;
  }
  const d = deg(Math.acos(v));
  return Math.sin(cur) >= 0 ? d : -d;
}

function probeHandles(): Handle[] {
  const grip = (by: 'ring' | 'y' | 'x'): Handle => ({
    key: `probe:${by}`,
    hit: by === 'ring' ? { kind: 'ring', r: S } : { kind: 'axis', axis: by, r: S },
    drag: (at, a) => inverse.moveProbe(probeAngle(by, at, a)),
  });
  return [
    {
      ...grip('ring'),
      nudge: (dir, big) => inverse.moveProbe(inverse.probeTo + dir * step(big, 1, 15)),
    },
    grip('y'),
    grip('x'),
  ];
}

function controlHandle(): Handle {
  const fn = inverse.fn;
  return {
    key: `control:${fn}`,
    hit:
      fn === 'atan'
        ? { kind: 'ring', r: S }
        : { kind: 'axis', axis: fn === 'asin' ? 'y' : 'x', r: S },
    hover: (at, a) =>
      (inverse.ghost = at ? inverse.angleAt(at[0], at[1], S, snapOf(a), a.grain) : null),
    press: () => (inverse.dragging = true),
    drag: (at, a) => inverse.setFromWorld(at[0], at[1], S, snapOf(a), a.grain),
    release: () => (inverse.dragging = false),
    nudge: (dir, big) =>
      fn === 'atan'
        ? inverse.setAngle(inverse.target + dir * step(big, 1, 15))
        : inverse.setValue(inverse.valueTo + dir * step(big, 0.01, 0.1)),
  };
}

/** The handles Inverse trig offers right now. */
export function inverseHandles(): Handle[] {
  if (stage.now.probing) return probeHandles();
  if (stage.now.locked) return [];
  return [controlHandle()];
}
