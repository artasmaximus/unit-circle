// Inverse trig, as the shell sees it (see TopicDef in core/app.svelte.ts).
import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
import type { TopicDef } from '../../core/app.svelte.ts';
import InverseExplore from './InverseExplore.svelte';
import InverseGuide from './InverseGuide.svelte';
import InverseLayer from './InverseLayer.svelte';
import InverseQuiz from './InverseQuiz.svelte';
import { inverse } from './state.svelte.ts';

export const inverseTopic: TopicDef = {
  id: 'inverse',
  title: 'Inverse Trig',
  tab: { label: 'Inverse trig', icon: ArrowLeftRight },
  views: { guide: InverseGuide, explore: InverseExplore, practice: InverseQuiz },
  layers: [{ component: InverseLayer }],
  // the topic writes the label for the angles it marks, so the ring leaves those out
  ring: () => ({
    taken: (a) =>
      inverse.marked.some((m) => Math.abs(m - a) < 1e-4 || Math.abs(Math.abs(m - a) - 360) < 1e-4),
  }),
};
