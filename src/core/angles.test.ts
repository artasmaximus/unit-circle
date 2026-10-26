import { test } from 'node:test';
import assert from 'node:assert/strict';
import { angleField, angleText, angleTex, piFraction, trigOf } from './angles.ts';
import { parseAngle } from './trig.ts';

test('radians read as exact multiples of π at the special angles, on one line', () => {
  assert.equal(angleTex(0, 'rad'), '0');
  assert.equal(angleTex(30, 'rad'), '\\pi/6');
  assert.equal(angleTex(45, 'rad'), '\\pi/4');
  assert.equal(angleTex(90, 'rad'), '\\pi/2');
  assert.equal(angleTex(150, 'rad'), '5\\pi/6');
  assert.equal(angleTex(180, 'rad'), '\\pi');
  assert.equal(angleTex(270, 'rad'), '3\\pi/2');
  assert.equal(angleTex(360, 'rad'), '2\\pi');
  assert.equal(angleTex(-30, 'rad'), '-\\pi/6');
  assert.equal(angleTex(-180, 'rad'), '-\\pi');
  assert.equal(angleTex(120, 'rad'), '2\\pi/3');
  assert.equal(angleTex(315, 'rad'), '7\\pi/4');
});

test('other angles are decimal radians with two more places than degrees', () => {
  assert.equal(angleTex(10, 'rad', 0), '0.17\\text{ rad}');
  assert.equal(angleTex(10, 'rad', 1), '0.175\\text{ rad}');
  assert.equal(angleTex(46.1234, 'rad', 3), '0.80501\\text{ rad}');
  assert.equal(angleText(10, 'rad'), '0.17 rad');
});

test('degrees keep the zoom precision and never print -0', () => {
  assert.equal(angleTex(45, 'deg'), '45^\\circ');
  assert.equal(angleTex(46.1234, 'deg', 2), '46.12^\\circ');
  assert.equal(angleTex(-0.2, 'deg', 0), '0^\\circ');
  assert.equal(angleText(210, 'deg'), '210°');
});

test('piFraction finds lowest terms only for multiples of 30° and 45°', () => {
  assert.deepEqual(piFraction(60), [1, 3]);
  assert.deepEqual(piFraction(225), [5, 4]);
  assert.equal(piFraction(15), null);
  assert.equal(piFraction(10), null);
});

test('a trig function of an angle brackets radians so the slash stays readable', () => {
  assert.equal(trigOf('\\sin', 210, 'deg'), '\\sin\\ 210^\\circ');
  assert.equal(trigOf('\\sin', 210, 'rad'), '\\sin\\left(7\\pi/6\\right)');
});

test('the angle box field has no unit mark', () => {
  assert.equal(angleField(135, 'deg'), '135');
  assert.equal(angleField(135, 'rad'), '3π/4');
  assert.equal(angleField(-30, 'rad'), '-π/6');
  assert.equal(angleField(10, 'rad', 0), '0.17');
});

test('typed angles: a bare number follows the unit, anything marked says its own', () => {
  assert.equal(parseAngle('135'), 135);
  assert.equal(parseAngle('3.14159265358979', 'rad')?.toFixed(3), '180.000');
  assert.equal(parseAngle('pi/6', 'rad')?.toFixed(6), '30.000000');
  assert.equal(parseAngle('90°', 'rad'), 90);
  assert.equal(parseAngle('1 rad', 'deg')?.toFixed(3), '57.296');
});
