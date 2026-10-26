import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inverseGuide } from './guideSteps.ts';
import { makeQ } from './quiz.ts';

test('the Guide is well formed in both units: unique steps, distinct choices, answerable tasks', () => {
  for (const u of ['deg', 'rad'] as const) {
    const steps = inverseGuide(u),
      ids = new Set<string>();
    for (const s of steps) {
      assert.ok(!ids.has(s.id), `duplicate step ${s.id}`);
      ids.add(s.id);
      assert.ok(s.title && s.say.length > 0);
      const t = s.task;
      if (t.kind === 'choice') {
        assert.ok(t.answer >= 0 && t.answer < t.choices.length);
        assert.equal(new Set(t.choices).size, t.choices.length, `${s.id}: repeated choice in ${u}`);
      }
      if (t.kind === 'drag') assert.ok(t.deg > -180 && t.deg <= 180 && t.tol > 0);
    }
    assert.equal(steps.at(-1)?.task.kind, 'exam', 'the Guide ends with its exam');
    assert.equal(steps.filter((s) => s.task.kind === 'exam').length, 1);
  }
});

test('questions can be asked for by function or by type, as the exam steers them', () => {
  for (let i = 0; i < 50; i++) {
    assert.equal(makeQ({ fn: 'acos' }).fn, 'acos');
    assert.equal(makeQ({ t: 2 }).t, 2);
    assert.equal(makeQ({ t: 3, fn: 'atan' }).t, 3);
  }
});
