// Small number helpers.

/** v held between 0 and 1. */
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
