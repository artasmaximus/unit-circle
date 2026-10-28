import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compose, otherAngle, principal, snapValue, valueTex } from './math.ts';

const near = (a: number | null, b: number) =>
  assert.ok(a !== null && Math.abs(a - b) < 1e-9, `${a} should be ${b}`);

test("principal values sit in each inverse's range", () => {
  near(principal('asin', 0.5), 30);
  near(principal('asin', -1), -90);
  near(principal('acos', -0.5), 120);
  near(principal('acos', 1), 0);
  near(principal('atan', 1), 45);
  near(principal('atan', -Math.sqrt(3)), -60);
});

test('the other angle shares the partner value', () => {
  near(otherAngle('asin', 30), 150); // sin 30° = sin 150°
  near(otherAngle('acos', 120), -120); // cos 120° = cos −120°
  near(otherAngle('atan', 45), 225); // tan 45° = tan 225°
});

test('composition hands back the principal angle, not θ', () => {
  near(compose('asin', 210), -30); // arcsin(sin 210°)
  near(compose('asin', 150), 30);
  near(compose('asin', 60), 60);
  near(compose('acos', 300), 60); // arccos(cos 300°)
  near(compose('acos', 100), 100);
  near(compose('atan', 135), -45); // arctan(tan 135°)
  near(compose('atan', 225), 45);
  assert.equal(compose('atan', 90), null);
  assert.equal(compose('atan', 270), null);
});

test('special values snap and read exactly, un-rationalized', () => {
  assert.equal(snapValue('asin', 0.7, 0.02), Math.SQRT2 / 2);
  assert.equal(snapValue('asin', 0.8, 0.02), 0.8);
  assert.equal(valueTex('asin', Math.SQRT2 / 2), '\\frac{1}{\\sqrt{2}}');
  assert.equal(valueTex('acos', -Math.sqrt(3) / 2), '-\\frac{\\sqrt{3}}{2}');
  assert.equal(valueTex('atan', 1 / Math.sqrt(3)), '\\frac{1}{\\sqrt{3}}');
  assert.equal(valueTex('asin', 0.3), '0.300');
});
