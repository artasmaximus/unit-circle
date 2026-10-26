// The parts of the Radians drawing that a Guide can turn on one at a time (see drawing.ts for
// what each one draws).
export const FEATURES = [
  'ray', // the point's radius line
  'radius', // the radius shown as a ruler
  'beads', // radius-lengths laid along the top half of the edge
  'half', // that half turn, marked as π
  'slices', // the angle shaded as whole pieces of its unit fraction of π (2π/3 is two of π/3)
  'readout', // the shading's name written on it (left off where it would give an answer away)
  'degrees', // the ring's labels in degrees
  'pi', // the ring's labels in radians
] as const;
export type Feature = (typeof FEATURES)[number];
