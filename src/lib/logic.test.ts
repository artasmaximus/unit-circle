import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAngle, snapDeg, trigTex, recipTex, specialOf } from './trig.ts';
import { DEFINITIONS, apply, eqTex, isIdentity, changes } from './algebra.ts';
import { explain, hintMsg, hintTip, makeChoices, makeQ, qTex, task } from './quiz.ts';

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

test('workshop operations', () => {
  const flipped = apply(DEFINITIONS.csc, { kind: 'reciprocal' });
  assert.equal(eqTex(flipped), '\\frac{1}{\\csc\\theta}=\\sin\\theta');
  assert.equal(eqTex(apply(DEFINITIONS.csc, { kind: 'inSinCos' })), '\\frac{1}{\\sin\\theta}=\\frac{1}{\\sin\\theta}');
  assert.ok(isIdentity(apply(flipped, { kind: 'simplify' })));
  const times = apply(DEFINITIONS.csc, { kind: 'times', by: 'sin' });
  assert.equal(eqTex(apply(times, { kind: 'simplify' })), '1=1');
  const cot = apply(DEFINITIONS.cot, { kind: 'inSinCos' });
  assert.ok(isIdentity(apply(cot, { kind: 'simplify' })));
  assert.equal(changes(DEFINITIONS.csc, { kind: 'simplify' }), false);
});

test('quiz choices hold the right answer once', () => {
  for (let i = 0; i < 200; i++) {
    const q = makeQ();
    if (q.t !== 1) continue;
    const c = makeChoices(q);
    assert.equal(c.length, 4);
    assert.equal(c.filter((x) => x === trigTex(q.fn, q.a)).length, 1);
  }
});

test('solving csc θ = 2 by reciprocal', async () => {
  const { atom, num, solvedForm } = await import('./algebra.ts');
  const e = { l: atom('csc'), r: num(2) };
  const r = apply(e, { kind: 'reciprocal' });
  assert.equal(eqTex(r), '\\frac{1}{\\csc\\theta}=\\frac{1}{2}');
  const odd = apply({ l: atom('csc'), r: num(2 / Math.sqrt(3)) }, { kind: 'reciprocal' });
  assert.equal(eqTex(apply(odd, { kind: 'simplify' })), '\\sin\\theta=\\frac{\\sqrt{3}}{2}');
  const s = apply(r, { kind: 'simplify' });
  assert.deepEqual(solvedForm(s), { fn: 'sin', v: 0.5 });
});

test('the unit circle quiz writes every angle in the unit asked for, with no degree signs in radians', () => {
  const flat = (r: unknown[]): string => r.map((p) => (typeof p === 'string' ? p : (p as { m: string }).m)).join('');
  for (let i = 0; i < 300; i++) {
    const q = makeQ();
    const texts = [qTex(q, 'rad'), flat(task(q, 'rad')), hintTip(q, 'rad'), flat(hintMsg(q, 'rad')), ...explain(q, 'rad').map(flat)];
    for (const t of texts) assert.ok(!/circ|°/.test(t), `${t} should have no degree signs in radians`);
    assert.ok(/circ/.test(qTex(makeQ_t1(), 'deg')));
  }
});
const makeQ_t1 = () => ({ t: 1 as const, fn: 'sin' as const, a: 30 });
