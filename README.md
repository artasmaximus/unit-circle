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
  bundled MathJax, progress saved in the browser, tuning numbers, the shared point
  (`point.svelte.ts`), and which topic and mode the app is in (`app.svelte.ts`). Each topic keeps
  its own state in its folder.
- `src/plane/`: the full-viewport drawing: `Plane.svelte`, the keyed mark model (`marks.ts`) and
  `MarkLayer.svelte` that animates marks in and out, plus the grid and the ring every topic shares.
  What a pointer can grab are handles (`handles.svelte.ts`): each topic's layer offers its own, and
  the plane passes hover, drag and arrow keys to the nearest one.
- `src/figures/`: reusable, topic-free pieces of a drawing (a labelled arc, a brace, a right
  triangle, a number line). Each takes a key, its own options and the zoom, and returns marks.

- `src/guide/`: the Guide engine: the step format (`guide.ts`) and the step-by-step panel (`Guide.svelte`).
- `src/topics/<topic>/`: one folder per topic (`circle`, `inverse`, `radians`): its state, quiz, scene
  (`scene.ts`), Guide steps, panel components and plane layer. The unit circle also has
  `layout.ts`, which places its labels and floating chips.
- `src/solver/`: the equation solver and its test bench (`?lab=solver`).
- Navigation: topics name a `group` (a course or unit, registered in `src/topics/index.ts`), an
  `order` and optional `requires` (prerequisites, locked with `strict`); `core/nav.ts` groups,
  searches and reads/writes the address (`?topic=…&mode=…`, kept in step by `core/route.svelte.ts`),
  and `ui/TopicMenu.svelte` is the switcher (tab bar button, phone title, or `/`).
- `src/panel/`: the floating panel that hosts each topic's views. `src/ui/`: small shared components.
- Tests (`*.test.ts`) sit next to the code they cover.

The drawing is layered **mark → figure → scene**: a mark is one animated shape, a figure is a
self-contained piece built from marks, and each topic's `scene.ts` composes figures from that
topic's state (its Guide steps turn on which parts show).
