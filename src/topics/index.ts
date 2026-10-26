// The topics, in tab bar order. To add one: write its topic.ts and list it here.
import { registerTopics } from '../core/app.svelte.ts';
import { circleTopic } from './circle/topic.ts';
import { inverseTopic } from './inverse/topic.ts';
import { radiansTopic } from './radians/topic.ts';

registerTopics(circleTopic, inverseTopic, radiansTopic);
