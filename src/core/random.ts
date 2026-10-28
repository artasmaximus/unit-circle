// Small random helpers shared by the topics' question makers.

/** A whole number from 0 up to, not including, n. */
export const rnd = (n: number) => Math.floor(Math.random() * n);
/** One of the items, chosen at random. */
export const pick = <T>(a: readonly T[]) => a[rnd(a.length)];
/** The array put in a random order, in place. */
export const shuffle = <T>(arr: T[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
