import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answerOf, domainTex, explain, makeChoices, makeQ, qTex, type IQ } from './quiz.ts';
import { angleTex, type Unit } from '../../core/angles.ts';
import { compose, principal } from './math.ts';

test('answers follow the principal range', () => {
  assert.equal(answerOf({ t: 1, fn: 'asin', v: -0.5 }), -30);
  assert.equal(answerOf({ t: 1, fn: 'acos', v: -0.5 }), 120);
  assert.equal(answerOf({ t: 1, fn: 'atan', v: Math.sqrt(3) }), 60);
  assert.equal(answerOf({ t: 2, fn: 'asin', theta: 210, dom: { lo: 0, hi: 360, tex: '' } }), -30);
  assert.equal(answerOf({ t: 2, fn: 'acos', theta: 300, dom: { lo: 0, hi: 360, tex: '' } }), 60);
  assert.equal(answerOf({ t: 2, fn: 'atan', theta: 135, dom: { lo: 0, hi: 360, tex: '' } }), -45);
  assert.equal(
    answerOf({ t: 2, fn: 'asin', theta: -150, dom: { lo: -180, hi: 180, tex: '' } }),
    -30,
  );
});

test('every generated question is answerable, with four distinct choices that include the answer', () => {
  for (let i = 0; i < 400; i++) {
    const q: IQ = makeQ();
    for (const u of ['deg', 'rad'] as Unit[]) {
      assert.ok(qTex(q, u).length > 0);
      assert.ok(explain(q, u).length > 0);
      assert.ok(!qTex(q, 'rad').includes('circ'), 'radian questions have no degree signs');
    }
    if (q.t === 3) {
      assert.ok(Number.isFinite(q.ang));
      continue;
    }
    const a = answerOf(q);
    assert.ok(Number.isFinite(a), JSON.stringify(q));
    if (q.t === 2) {
      // θ sits in its stated domain, and the answer is what composing gives
      assert.ok(q.theta >= q.dom.lo - 1e-9 && q.theta <= q.dom.hi + 1e-9, JSON.stringify(q));
      assert.ok(Math.abs(a - compose(q.fn, q.theta)!) < 1e-5);
    } else assert.ok(Math.abs(a - principal(q.fn, q.v)) < 1e-5);
    const choices = makeChoices(q);
    assert.equal(choices.length, 4);
    assert.equal(new Set(choices).size, 4, choices.join());
    assert.ok(choices.includes(answerOf(q)), `${choices.join()} should hold ${answerOf(q)}`);
    // written in either unit, the four choices stay distinct
    for (const u of ['deg', 'rad'] as Unit[])
      assert.equal(new Set(choices.map((c) => angleTex(c, u))).size, 4);
  }
});

test('a domain reads in either unit and keeps its open and closed ends', () => {
  assert.equal(
    domainTex({ lo: 0, hi: 360, closed: false }, 'deg'),
    '0^\\circ\\le\\theta<360^\\circ',
  );
  assert.equal(domainTex({ lo: 0, hi: 360, closed: false }, 'rad'), '0\\le\\theta<2\\pi');
  assert.equal(domainTex({ lo: 90, hi: 270, closed: true }, 'rad'), '\\pi/2\\le\\theta\\le3\\pi/2');
  // a question saved before the flag existed still reads the same way
  assert.equal(domainTex({ lo: -180, hi: 180 }, 'deg'), '-180^\\circ\\le\\theta<180^\\circ');
});
