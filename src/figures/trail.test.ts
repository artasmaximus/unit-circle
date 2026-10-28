import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Trail } from './trail.ts';

const ctx = { sw: 1, lb: 1 };

test('a trail is 28 joined pieces that thicken and strengthen toward the head', () => {
  const [m] = Trail('t', { r: 100, head: 1, length: 1, color: () => 'red' }, ctx).marks;
  assert.ok(m.kind === 'segments');
  assert.equal(m.segs.length, 28);
  assert.equal(m.dur, 0);
  assert.equal(m.exitDur, 0);
  assert.equal(m.enter, 'fade');
  m.segs.forEach((s, i) => {
    if (!i) return;
    assert.equal(s.x1, m.segs[i - 1].x2);
    assert.equal(s.y1, m.segs[i - 1].y2);
    assert.ok(s.width > m.segs[i - 1].width && s.opacity > m.segs[i - 1].opacity);
  });
  const last = m.segs[27];
  assert.ok(Math.abs(last.x2 - 100 * Math.cos(1)) < 1e-9);
  assert.ok(Math.abs(last.y2 + 100 * Math.sin(1)) < 1e-9);
  assert.ok(Math.abs(last.width - 4.2) < 1e-9 && Math.abs(last.opacity - 0.9) < 1e-9);
});

test('a trail with no length draws nothing, and its own steps and timing win', () => {
  assert.equal(Trail('t', { r: 1, head: 0, length: 0, color: () => 'red' }, ctx).marks.length, 0);
  const [m] = Trail(
    't',
    { r: 1, head: 0, length: 1, steps: 5, dur: 300, color: () => 'red' },
    ctx,
  ).marks;
  assert.ok(m.kind === 'segments' && m.segs.length === 5 && m.dur === 300);
});
