// The parts of the Unit circle Guide's drawing that its steps turn on one at a time (see
// guideScene.ts for what each one draws).
export const FEATURES = [
  'ray', // the point and its radius
  'angle', // the θ arc, labelled
  'shadows', // the point's drop lines and its shadows on the axes, written x and y
  'names', // those shadows named cos θ and sin θ, in their colors
  'exact', // values written exactly at the special angles (decimals otherwise)
  'triangle', // the right triangle under the ray, its upright side the sin leg
  'hyp', // the ray labelled 1
  'equal', // tick marks on the two legs when they are equal (45°)
  'equilateral', // the triangle mirrored below the axis, making the equilateral one at 30°
  'mirror', // the point's reflections in the other quadrants
  'quads', // the right half tinted in cos's color and the top half in sin's: where each is positive
  'ref', // the reference angle back to the nearest x-axis
  'slope', // the legs named run and rise, and tan θ = rise ÷ run beside the ray
  'coords', // the point's coordinates written beside it
] as const;
export type Feature = (typeof FEATURES)[number];
