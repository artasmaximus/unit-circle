// The parts of the Radians drawing that a Guide can turn on one at a time (see radiansMarks.ts for what each one draws).
export const FEATURES = ['ray', 'radius', 'beads', 'half', 'slices', 'readout', 'degrees', 'pi'] as const;
/** ray: the point's radius line · radius: the radius shown as a ruler · beads: radius-lengths laid along the top half of the edge · half: that half turn, marked as π
 *  · slices: the angle shaded as whole pieces of its unit fraction of π (2π/3 is two pieces of π/3) · readout: the shading's name written on it (left off where it would give an answer away)
 *  · degrees / pi: which unit the ring's labels use. */
export type Feature = (typeof FEATURES)[number];
