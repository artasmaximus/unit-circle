import test from 'node:test';
import assert from 'node:assert/strict';
import { gridWindow, snapDown } from './gridWindow.ts';

const GRID_PITCH = 150;

test('snapDown floors to a multiple of the pitch, negatives included', () => {
  assert.equal(snapDown(0, GRID_PITCH), 0);
  assert.equal(snapDown(GRID_PITCH - 0.001, GRID_PITCH), 0);
  assert.equal(snapDown(GRID_PITCH, GRID_PITCH), GRID_PITCH);
  assert.equal(snapDown(-0.001, GRID_PITCH), -GRID_PITCH);
  assert.equal(snapDown(-GRID_PITCH, GRID_PITCH), -GRID_PITCH);
  assert.equal(snapDown(-GRID_PITCH - 1, GRID_PITCH), -2 * GRID_PITCH);
});

test('the window always covers the viewport and only moves in whole pitches', () => {
  for (const [x, y, w, h] of [
    [-512, -384, 1024, 768],
    [-0.5, 0.5, 300.25, 200.75],
    [-3000.1, 2999.9, 5000, 4000],
    [149.99, -149.99, 10, 10],
  ]) {
    const g = gridWindow({ x, y, w, h }, GRID_PITCH);
    assert.ok(g.x <= x && g.y <= y);
    assert.ok(g.x + g.w >= x + w && g.y + g.h >= y + h);
    assert.ok(g.x % GRID_PITCH === 0);
    assert.ok(g.y % GRID_PITCH === 0);
  }
  const a = gridWindow({ x: 10, y: 10, w: 400, h: 300 }, GRID_PITCH),
    b = gridWindow({ x: 100, y: 140, w: 400, h: 300 }, GRID_PITCH);
  assert.deepEqual(a, b);
});
