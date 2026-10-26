// Inverse trig, as the shell sees it (see TopicDef in core/app.svelte.ts).
import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
import { inverseHooks } from './guide.svelte.ts';
import { ui, type TopicDef } from '../../core/app.svelte.ts';
import { invExam, invQuiz } from './quiz.svelte.ts';
import { inverseGuideRun } from './guide.svelte.ts';
import InverseExplore from './InverseExplore.svelte';
import InverseGuide from './InverseGuide.svelte';
import InverseLayer from './InverseLayer.svelte';
import InverseQuiz from './InverseQuiz.svelte';
import { inverse } from './state.svelte.ts';

export const inverseTopic: TopicDef = {
  id: 'inverse',
  title: 'Inverse Trig',
  group: 'trig',
  order: 2,
  requires: ['circle'],
  keywords: 'arcsin arccos arctan',
  tab: { label: 'Inverse trig', icon: ArrowLeftRight },
  hooks: inverseHooks,
  session: () =>
    ui.mode === 'practice'
      ? invQuiz
      : ui.mode === 'guide' && inverseGuideRun.step.task.kind === 'exam'
        ? invExam
        : null,
  views: { guide: InverseGuide, explore: InverseExplore, practice: InverseQuiz },
  layers: [{ component: InverseLayer }],
  // the topic writes the label for the angles it marks, so the ring leaves those out
  ring: () => ({
    taken: (a) =>
      inverse.marked.some((m) => Math.abs(m - a) < 1e-4 || Math.abs(Math.abs(m - a) - 360) < 1e-4),
  }),
};
