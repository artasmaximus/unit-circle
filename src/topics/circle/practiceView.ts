// How the unit circle's questions read on the shared Practice screen (practice/Practice.svelte),
// for Practice and for the Guide's exam.
import type { PracticeView } from '../../practice/Practice.svelte';
import { progress } from '../../core/progress.svelte.ts';
import { explain, hintMsg, hintTip, qTex, task, type Question } from './quiz.ts';

export const circleView: PracticeView<Question, string> = {
  ariaLabel: (strict) => (strict ? 'Unit circle exam' : 'Practice'),
  label: (q, s) =>
    q.t === 1
      ? 'Find the value'
      : `Find both angles${s.found.length ? ` · ${s.found.length} of 2 found` : ''}`,
  promptTex: (q) => (q.t === 1 ? `${qTex(q, progress.unit)}=\\ ?` : qTex(q, progress.unit)),
  task: (q) => task(q, progress.unit),
  choiceTex: (_, c) => c,
  explain: (q) => explain(q, progress.unit),
  hintMsg: (q) => hintMsg(q, progress.unit),
  hintTip: (q) => hintTip(q, progress.unit),
  missedTex: (q) => qTex(q, progress.unit),
  checklist: { sin: 'sin', cos: 'cos', tan: 'tan' },
  color: 'var(--cos)',
};
