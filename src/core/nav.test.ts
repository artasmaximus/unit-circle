import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  fromSearch,
  openMode,
  pending,
  search,
  sections,
  statusOf,
  toSearch,
  type NavTopic,
} from './nav.ts';

const t = (id: string, group: string, extra: Partial<NavTopic> = {}): NavTopic => ({
  id,
  title: id.toUpperCase(),
  group,
  tab: { label: id },
  views: { guide: {} },
  ...extra,
});
const groups = [
  { id: 'trig', title: 'Trigonometry' },
  { id: 'calc', title: 'Calculus' },
];
const defs = [
  t('b', 'trig', { order: 2 }),
  t('a', 'trig', { order: 1 }),
  t('d', 'calc', { requires: ['a'], strict: true, keywords: 'derivative slope' }),
  t('c', 'calc', { requires: ['a', 'b'] }),
  t('x', 'oops', { views: {} }),
];

test('sections follow the registered headings and each topic order, and keep stray headings', () => {
  const s = sections(defs, groups);
  assert.deepEqual(
    s.map((s) => [s.id, s.topics.map((t) => t.id)]),
    [
      ['trig', ['a', 'b']],
      ['calc', ['d', 'c']],
      ['oops', ['x']],
    ],
  );
  assert.deepEqual(sections([], groups), []);
});

test('prerequisites lock a strict topic and only recommend for the others', () => {
  const [, , d, c] = defs;
  assert.deepEqual(statusOf(d, {}), { state: 'locked', missing: ['a'] });
  assert.deepEqual(statusOf(c, { a: true }), { state: 'recommended', missing: ['b'] });
  assert.deepEqual(statusOf(d, { a: true }), { state: 'open', missing: [] });
  assert.equal(statusOf(defs[0], {}).state, 'open');
});

test('search needs every word, in any case, across title, heading and keywords', () => {
  const ids = (q: string) => search(defs, groups, q).map((t) => t.id);
  assert.deepEqual(ids(''), ['b', 'a', 'd', 'c', 'x']);
  assert.deepEqual(ids('TRIG'), ['b', 'a']);
  assert.deepEqual(ids('calculus slope'), ['d']);
  assert.deepEqual(ids('slope trig'), []);
});

test('an address names a valid unlocked topic and a mode that topic has', () => {
  assert.deepEqual(fromSearch('?topic=a&mode=practice', defs, {}), {
    topic: 'a',
    mode: 'practice',
  });
  assert.deepEqual(fromSearch('?topic=d&mode=explore', defs, {}), {});
  assert.deepEqual(fromSearch('?topic=d', defs, { a: true }), { topic: 'd', mode: undefined });
  assert.deepEqual(fromSearch('?topic=x&mode=guide', defs, {}), { topic: 'x', mode: undefined });
  assert.deepEqual(fromSearch('?topic=nope&mode=guide', defs, {}), {});
  assert.deepEqual(fromSearch('?lab=solver', defs, {}), {});
});

test('writing the address keeps everything else in it', () => {
  assert.equal(toSearch('', 'a', 'guide'), '?topic=a&mode=guide');
  assert.equal(
    toSearch('?unlock=radians&topic=a&mode=guide&teacher', 'b', 'practice'),
    '?unlock=radians&topic=b&mode=practice&teacher=',
  );
});

test('pending lists the topics not yet completed, and nothing when there are none', () => {
  assert.deepEqual(pending(['a', 'b'], { a: true }), ['b']);
  assert.deepEqual(pending(['a'], { a: true }), []);
  assert.deepEqual(pending(undefined, {}), []);
});

test('a topic opens in its Guide until that is done, then in the mode last used', () => {
  const guided = t('g', 'trig'),
    plain = t('p', 'trig', { views: {} });
  assert.equal(openMode(guided, {}, 'practice'), 'guide');
  assert.equal(openMode(guided, { g: true }, 'practice'), 'practice');
  assert.equal(openMode(guided, { g: true }, 'guide'), 'guide');
  // a topic without a Guide is never in Guide mode
  assert.equal(openMode(plain, {}, 'guide'), 'explore');
  assert.equal(openMode(plain, {}, 'practice'), 'practice');
});
