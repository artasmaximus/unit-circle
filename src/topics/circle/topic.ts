// The unit circle, as the shell sees it (see TopicDef in core/app.svelte.ts).
import CircleDot from '@lucide/svelte/icons/circle-dot';
import { circleHooks } from './guide.svelte.ts';
import { ui, type TopicDef } from '../../core/app.svelte.ts';
import { quiz, quizExam } from './quiz.svelte.ts';
import { unitGuide } from './guide.svelte.ts';
import ChipsOverlay from './ChipsOverlay.svelte';
import CircleExplore from './CircleExplore.svelte';
import CircleLayer from './CircleLayer.svelte';
import CirclePractice from './CirclePractice.svelte';
import UnitGuide from './UnitGuide.svelte';
import UnitGuideLayer from './UnitGuideLayer.svelte';

export const circleTopic: TopicDef = {
  id: 'circle',
  title: 'Unit Circle',
  group: 'trig',
  order: 1,
  keywords: 'sine cosine tangent angle degrees',
  tab: { label: 'Unit circle', icon: CircleDot },
  hooks: circleHooks,
  // Practice, or the Guide's exam step
  session: () =>
    ui.mode === 'practice'
      ? quiz
      : ui.mode === 'guide' && unitGuide.step.task.kind === 'exam'
        ? quizExam
        : null,
  views: { guide: UnitGuide, explore: CircleExplore, practice: CirclePractice },
  layers: [{ component: CircleLayer }, { component: UnitGuideLayer }],
  overlay: ChipsOverlay,
  angleInput: () => ({}),
};
