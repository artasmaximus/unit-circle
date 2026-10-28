// Running text with inline math: plain strings, and `{ m }` parts that are typeset as LaTeX.
// Guides, quizzes and the solver all write their text this way (ui/Rich.svelte renders it).
export type Rich = (string | { m: string })[];
/** An inline-math part of a Rich text. */
export const m = (t: string) => ({ m: t });
