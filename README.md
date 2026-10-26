# Unit Circle

Svelte 5 + Vite + TypeScript. A full-viewport graph-paper plane with the unit circle on it, and a panel
(left on wide screens, bottom on phones) floating over it behind a progressive blur.

```
npm run dev      # dev server
npm test         # pure-logic tests (node --test)
npm run check    # svelte-check
npm run build    # dist/index.html (single file) and dist/artifact.html (for the claude.ai artifact)
```

## Layout of the code

Code is grouped by topic, with shared pieces beside the topics:

- `src/core/`: topic-free building blocks: trig and angle math, the camera (world ↔ screen), LaTeX via
  bundled MathJax, progress saved in the browser, tuning numbers, and app state (`state.svelte.ts`).
- `src/plane/`: the full-viewport drawing: `Plane.svelte`, the keyed mark model (`marks.ts`) and
  `MarkLayer.svelte` that animates marks in and out, plus the grid and the ring every topic shares.
- `src/guide/`: the Guide engine: the step format (`guide.ts`) and the step-by-step panel (`Guide.svelte`).
- `src/topics/<topic>/`: one folder per topic (`circle`, `inverse`, `radians`): its state, quiz, drawing,
  Guide steps, panel components and plane layer.
- `src/solver/`: the equation solver and its test bench (`?lab=solver`).
- `src/panel/`: the floating panel that hosts each topic's views. `src/ui/`: small shared components.
- Tests (`*.test.ts`) sit next to the code they cover.
