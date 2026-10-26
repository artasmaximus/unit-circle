import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAngle, recipTex, snapDeg, specialOf, trigTex } from './trig.ts';

test('angles', () => {
  assert.equal(parseAngle('pi/6')?.toFixed(6), '30.000000');
  assert.equal(parseAngle('2π/3')?.toFixed(6), '120.000000');
  assert.equal(parseAngle('135°'), 135);
  assert.equal(parseAngle('abc'), null);
  assert.equal(parseAngle('process.exit()'), null);
  assert.equal(parseAngle('0.5 rad')?.toFixed(3), '28.648');
  assert.equal(snapDeg(358.5), 0);
  assert.equal(snapDeg(50), 50);
  assert.equal(specialOf(359.98), 0);
});

test('exact values', () => {
  assert.equal(trigTex('sin', 210), '-\\frac{1}{2}');
  assert.equal(trigTex('tan', 90), '\\text{undefined}');
  assert.equal(recipTex('csc', 45).r, '\\sqrt{2}');
  // un-rationalized, so a reciprocal reads as the flip of its partner
  assert.equal(trigTex('sin', 45), '\\frac{1}{\\sqrt{2}}');
  assert.equal(recipTex('csc', 60).r, '\\frac{2}{\\sqrt{3}}');
  assert.equal(trigTex('tan', 30), '\\frac{1}{\\sqrt{3}}');
  assert.equal(recipTex('cot', 135).r, '-1');
});
