// The app's one mathjs instance: the solver's algebra works on its expression trees, and angle
// parsing evaluates typed input like "2pi/3" with it.
import { create, all } from 'mathjs';

export const math = create(all);
