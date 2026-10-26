// The unit circle, as the shell sees it (see TopicDef in core/app.svelte.ts).
import CircleDot from '@lucide/svelte/icons/circle-dot';
import type { TopicDef } from '../../core/app.svelte.ts';
import ChipsOverlay from './ChipsOverlay.svelte';
import CircleExplore from './CircleExplore.svelte';
import CircleLayer from './CircleLayer.svelte';
import CirclePractice from './CirclePractice.svelte';
import UnitGuide from './UnitGuide.svelte';
import UnitGuideLayer from './UnitGuideLayer.svelte';

export const circleTopic: TopicDef = {
  id: 'circle',
  title: 'Unit Circle',
  tab: { label: 'Unit circle', icon: CircleDot },
  views: { guide: UnitGuide, explore: CircleExplore, practice: CirclePractice },
  layers: [{ component: CircleLayer }, { component: UnitGuideLayer }],
  overlay: ChipsOverlay,
  angleInput: () => ({}),
};
