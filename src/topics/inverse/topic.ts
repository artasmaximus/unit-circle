// Inverse trig, as the shell sees it (see TopicDef in core/app.svelte.ts).
import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
import { inverseHooks } from './guide.svelte.ts';
import type { TopicDef } from '../../core/app.svelte.ts';
import { inverseSession, stage } from './stage.svelte.ts';
import { angDist } from '../../core/trig.ts';
import InverseExplore from './InverseExplore.svelte';
import InverseGuide from './InverseGuide.svelte';
import InverseLayer from './InverseLayer.svelte';
import InverseQuiz from './InverseQuiz.svelte';

export const inverseTopic: TopicDef = {
  id: 'inverse',
  title: 'Inverse Trig',
  group: 'trig',
  order: 2,
  requires: ['circle'],
  color: 'var(--slope)',
  keywords: 'arcsin arccos arctan',
  tab: { label: 'Inverse trig', icon: ArrowLeftRight },
  hooks: inverseHooks,
  session: inverseSession,
  views: { guide: InverseGuide, explore: InverseExplore, practice: InverseQuiz },
  layers: [{ component: InverseLayer }],
  // the topic writes the label for the angles it marks, so the ring leaves those out
  ring: () => ({
    taken: (a) => stage.marked.some((m) => angDist(m, a) < 1e-4),
  }),
};
