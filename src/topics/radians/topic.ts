// Radians, as the shell sees it (see TopicDef in core/app.svelte.ts).
import Ruler from '@lucide/svelte/icons/ruler';
import { radiansHooks } from './state.svelte.ts';
import { ui, type TopicDef } from '../../core/app.svelte.ts';
import RadiansGuide from './RadiansGuide.svelte';
import RadiansLayer from './RadiansLayer.svelte';
import RadiansPanel from './RadiansPanel.svelte';
import RadiansPractice from './RadiansPractice.svelte';
import { radians } from './state.svelte.ts';

export const radiansTopic: TopicDef = {
  id: 'radians',
  title: 'Radians',
  group: 'trig',
  order: 3,
  requires: ['circle'],
  keywords: 'pi arc length',
  tab: { label: 'Radians', icon: Ruler },
  hooks: radiansHooks,
  session: () =>
    ui.mode === 'practice'
      ? radians.practice
      : ui.mode === 'guide' && radians.step.task.kind === 'exam'
        ? radians.exam
        : null,
  views: { guide: RadiansGuide, explore: RadiansPanel, practice: RadiansPractice },
  layers: [
    { component: RadiansLayer, props: { under: true }, under: true },
    { component: RadiansLayer },
  ],
  // no angle readout while a question is being asked: it would give the answer away
  angleInput: () => (radians.asking ? null : { unit: 'rad' }),
  ring: () => ({ unit: radians.ringUnit, labels: radians.ringLabels }),
};
