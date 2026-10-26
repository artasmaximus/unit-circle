import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFINITIONS,
  apply,
  atom,
  changes,
  eqTex,
  isIdentity,
  num,
  solvedForm,
} from './algebra.ts';

test('workshop operations', () => {
  const flipped = apply(DEFINITIONS.csc, { kind: 'reciprocal' });
  assert.equal(eqTex(flipped), '\\frac{1}{\\csc\\theta}=\\sin\\theta');
  assert.equal(
    eqTex(apply(DEFINITIONS.csc, { kind: 'inSinCos' })),
    '\\frac{1}{\\sin\\theta}=\\frac{1}{\\sin\\theta}',
  );
  assert.ok(isIdentity(apply(flipped, { kind: 'simplify' })));
  const times = apply(DEFINITIONS.csc, { kind: 'times', by: 'sin' });
  assert.equal(eqTex(apply(times, { kind: 'simplify' })), '1=1');
  const cot = apply(DEFINITIONS.cot, { kind: 'inSinCos' });
  assert.ok(isIdentity(apply(cot, { kind: 'simplify' })));
  assert.equal(changes(DEFINITIONS.csc, { kind: 'simplify' }), false);
});

test('solving csc θ = 2 by reciprocal', () => {
  const e = { l: atom('csc'), r: num(2) };
  const r = apply(e, { kind: 'reciprocal' });
  assert.equal(eqTex(r), '\\frac{1}{\\csc\\theta}=\\frac{1}{2}');
  const odd = apply({ l: atom('csc'), r: num(2 / Math.sqrt(3)) }, { kind: 'reciprocal' });
  assert.equal(eqTex(apply(odd, { kind: 'simplify' })), '\\sin\\theta=\\frac{\\sqrt{3}}{2}');
  const s = apply(r, { kind: 'simplify' });
  assert.deepEqual(solvedForm(s), { fn: 'sin', v: 0.5 });
});
