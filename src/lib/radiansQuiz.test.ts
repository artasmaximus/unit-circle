import { test } from 'node:test';
import assert from 'node:assert/strict';
import { R_ANGLES, makeRQ, rChoiceTex, rChoices, rExplain, rLabel, rPromptTex, rTask, rqKey, type RQ } from './radiansQuiz.ts';
import { RADIANS_GUIDE } from '../guides/radians.ts';
import { FEATURES } from './radiansFeatures.ts';

test('every Radians question has four distinct choices that include the answer, written distinctly', () => {
  for (let i = 0; i < 600; i++) {
    const q = makeRQ();
    assert.ok(R_ANGLES.includes(q.deg));
    assert.ok(rPromptTex(q).length > 0 && rLabel(q).length > 0 && rTask(q).length > 0 && rExplain(q).length > 0);
    if (q.t === 3) continue;
    const c = rChoices(q as RQ & { t: 1 | 2 });
    assert.equal(c.length, 4, `${rqKey(q)}: ${c}`);
    assert.equal(new Set(c).size, 4);
    assert.ok(c.includes(q.deg));
    assert.equal(new Set(c.map((d) => rChoiceTex(q, d))).size, 4, `texts for ${rqKey(q)}`);
    for (const d of c) assert.ok(Number.isInteger(d) && d > 0);
  }
});

test('conversion answers read as the right radians and degrees', () => {
  assert.equal(rChoiceTex({ t: 1, deg: 150 }, 150), '5\\pi/6');
  assert.equal(rChoiceTex({ t: 1, deg: 216 }, 216), '6\\pi/5');
  assert.equal(rChoiceTex({ t: 2, deg: 150 }, 150), '150^\\circ');
  assert.equal(rPromptTex({ t: 2, deg: 150 }), '5\\pi/6\\text{ rad}=\\ ?^\\circ');
});

test('the Guide is well formed: unique steps, real features, and answerable tasks', () => {
  const ids = new Set<string>();
  for (const s of RADIANS_GUIDE) {
    assert.ok(!ids.has(s.id), `duplicate step ${s.id}`); ids.add(s.id);
    assert.ok(s.title && s.say.length > 0);
    for (const f of s.features) assert.ok((FEATURES as readonly string[]).includes(f), `${s.id}: unknown feature ${f}`);
    if (s.task.kind === 'choice') assert.ok(s.task.answer >= 0 && s.task.answer < s.task.choices.length);
    if (s.task.kind === 'drag') assert.ok(s.task.deg > 0 && s.task.deg < 360 && s.task.tol > 0);
  }
  assert.equal(RADIANS_GUIDE.at(-1)?.task.kind, 'exam', 'the Guide ends with its exam');
  assert.equal(RADIANS_GUIDE.filter((s) => s.task.kind === 'exam').length, 1);
});
