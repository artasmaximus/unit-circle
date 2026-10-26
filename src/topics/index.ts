// The topics, in tab bar order. To add one: write its topic.ts and list it here (and
// register its group below if it starts a new course or unit).
import { registerGroups, registerTopics } from '../core/app.svelte.ts';
import { circleTopic } from './circle/topic.ts';
import { inverseTopic } from './inverse/topic.ts';
import { radiansTopic } from './radians/topic.ts';

// The courses or units topics are listed under, in order. Each topic names one in its `group`.
registerGroups({ id: 'trig', title: 'Trigonometry' });

registerTopics(circleTopic, inverseTopic, radiansTopic);
