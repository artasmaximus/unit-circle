import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trigTex } from '../../core/trig.ts';
import { explain, hintMsg, hintTip, makeChoices, makeQ, qTex, task } from './quiz.ts';

test('quiz choices hold the right answer once', () => {
  for (let i = 0; i < 200; i++) {
    const q = makeQ();
    if (q.t !== 1) continue;
    const c = makeChoices(q);
    assert.equal(c.length, 4);
    assert.equal(c.filter((x) => x === trigTex(q.fn, q.a)).length, 1);
  }
});

test('the unit circle quiz writes every angle in the unit asked for, with no degree signs in radians', () => {
  const flat = (r: unknown[]): string =>
    r.map((p) => (typeof p === 'string' ? p : (p as { m: string }).m)).join('');
  for (let i = 0; i < 300; i++) {
    const q = makeQ();
    const texts = [
      qTex(q, 'rad'),
      flat(task(q, 'rad')),
      hintTip(q, 'rad'),
      flat(hintMsg(q, 'rad')),
      ...explain(q, 'rad').map(flat),
    ];
    for (const t of texts)
      assert.ok(!/circ|°/.test(t), `${t} should have no degree signs in radians`);
    assert.ok(/circ/.test(qTex(makeQ_t1(), 'deg')));
  }
});
const makeQ_t1 = () => ({ t: 1 as const, fn: 'sin' as const, a: 30 });
