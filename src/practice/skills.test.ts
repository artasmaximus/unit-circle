import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SET_SIZE, need, parseSkills, pickByNeed, record, takeDue, weakest } from './skills.ts';

test('a skill that has gone wrong needs more practice than one that has gone right', () => {
  assert.ok(need({ right: 0, wrong: 3 }) > need() && need() > need({ right: 6, wrong: 0 }));
  assert.equal(need(), 0.5);
});

test('record counts answers and fades a long history', () => {
  const s = parseSkills({});
  record(s, 'a', true);
  record(s, 'a', false);
  assert.deepEqual(s.a, { right: 1, wrong: 1 });
  for (let i = 0; i < 40; i++) record(s, 'b', false);
  assert.ok(s.b.wrong < 40 && s.b.wrong > 0);
});

test('parseSkills drops what is not a pair of counts', () => {
  assert.deepEqual(parseSkills(null), {});
  assert.deepEqual(parseSkills({ a: { right: 2, wrong: 1 }, b: 5, c: { right: 'x', wrong: 1 } }), {
    a: { right: 2, wrong: 1 },
  });
});

test('weaker skills are picked more often, and a known one still comes up', () => {
  const skills = { weak: { right: 0, wrong: 6 }, known: { right: 8, wrong: 0 } };
  const cands = ['weak', 'known'];
  const count = { weak: 0, known: 0 };
  let seed = 1;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 2000; i++) count[pickByNeed(cands, (q) => q, skills, rand) as 'weak']++;
  assert.ok(count.weak > 3 * count.known, `${count.weak} vs ${count.known}`);
  assert.ok(count.known > 0);
});

test('pickByNeed follows rand through the weights', () => {
  const pick = (r: number) =>
    pickByNeed(
      ['a', 'b'],
      (q) => q,
      {},
      () => r,
    );
  assert.equal(pick(0), 'a');
  assert.equal(pick(0.99), 'b');
});

test('weakest lists skills with a miss, lowest share right first', () => {
  const w = weakest(
    {
      fine: { right: 5, wrong: 0 },
      mid: { right: 3, wrong: 1 },
      bad: { right: 1, wrong: 4 },
      worse: { right: 0, wrong: 2 },
    },
    2,
  );
  assert.deepEqual(
    w.map((x) => x.name),
    ['worse', 'bad'],
  );
});

test('a missed question waits its turn, once', () => {
  const later = [
    { q: 'x', due: 5 },
    { q: 'y', due: 3 },
  ];
  assert.equal(takeDue(later, 2), null);
  assert.equal(takeDue(later, 4), 'y');
  assert.equal(takeDue(later, 4), null);
  assert.equal(takeDue(later, 5), 'x');
  assert.equal(later.length, 0);
  assert.equal(SET_SIZE, 10);
});
