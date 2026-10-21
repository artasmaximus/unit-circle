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

- `src/lib/trig.ts`, `algebra.ts`, `quiz.ts`: pure logic, no Svelte, covered by `logic.test.ts`.
- `src/lib/state.svelte.ts`: all app state (the point and its spring, mode, quiz, equation workshop).
- `src/lib/camera.svelte.ts`: world ↔ screen mapping. The circle is centered in the area the panel leaves free;
  `zoom` and `pan` are already part of the transform, ready for gestures.
- `src/lib/scene.ts`: everything drawn on the plane for one frame, as plain data (including label and chip placement).
- `src/lib/tex.svelte.ts`: LaTeX → SVG via bundled MathJax, sized in em so layout needs no DOM measuring.
- `src/plane/*`: renders the scene. `src/panel/*`: the panel (controls, quiz, csc/sec/cot cards, workshop dialog).
