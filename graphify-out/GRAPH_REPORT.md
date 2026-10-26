# Graph Report - unit-circle  (2026-10-26)

## Corpus Check
- 107 files · ~52,126 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .css 2, .woff2 1)

## Summary
- 765 nodes · 2127 edges · 33 communities (23 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `761f4ddf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- inverse/scene.ts
- Package Dependencies
- algebra.ts
- radians/state.svelte.ts
- Plane.svelte
- Segmented.svelte
- trig.ts
- TypeScript Config
- Unit Circle Quiz page (index.html)
- Artifact Build Script
- Type Check Command
- Dev Server Command
- InversePanel.svelte
- circle/guide.svelte.ts
- Panel.svelte
- app.svelte.ts
- MarkLayer.svelte
- camera
- inverse/quiz.ts
- progress
- .goTo
- InverseGuide
- .prettierrc.json
- point.svelte.ts
- camera.svelte.ts
- npm test (pure-logic tests via node --test)
- src/panel (controls, quiz, csc/sec/cot cards, workshop dialog)
- src/plane (scene renderer)
- App.svelte

## God Nodes (most connected - your core abstractions)
1. `angleTex()` - 40 edges
2. `progress` - 27 edges
3. `rad()` - 26 edges
4. `camera` - 23 edges
5. `norm()` - 22 edges
6. `timing` - 22 edges
7. `Ctx` - 21 edges
8. `Label()` - 21 edges
9. `polar()` - 20 edges
10. `trigTex()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `turn` --calls--> `piFraction()`  [EXTRACTED]
  src/topics/radians/RadiansPanel.svelte → src/core/angles.ts
- `deg()` --calls--> `angleTex()`  [EXTRACTED]
  src/topics/inverse/InversePanel.svelte → src/core/angles.ts
- `trig()` --calls--> `trigOf()`  [EXTRACTED]
  src/topics/inverse/InversePanel.svelte → src/core/angles.ts
- `rExplain()` --calls--> `piFraction()`  [EXTRACTED]
  src/topics/radians/quiz.ts → src/core/angles.ts
- `radiansScene()` --calls--> `piFraction()`  [EXTRACTED]
  src/topics/radians/scene.ts → src/core/angles.ts

## Import Cycles
- None detected.

## Communities (33 total, 10 thin omitted)

### Community 0 - "inverse/scene.ts"
Cohesion: 0.07
Nodes (81): LABEL_R, S, texRect(), colorOf(), rad(), camera, input, pen (+73 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.06
Nodes (33): dependencies, @lucide/svelte, mathjax, mathjs, svelte, devDependencies, prettier, prettier-plugin-svelte (+25 more)

### Community 3 - "algebra.ts"
Cohesion: 0.07
Nodes (43): mathjs, math, morph(), SPECIAL, apply(), AS_POWER, atom, changes() (+35 more)

### Community 4 - "radians/state.svelte.ts"
Cohesion: 0.06
Nodes (42): Rich, GuideRun, i, n, {
    run,
    label,
    color,
    intro,
    exam,
  }, s, Step, t (+34 more)

### Community 5 - "Plane.svelte"
Cohesion: 0.14
Nodes (22): Aim, distance(), Handle, Hit, nearest(), sources, aim(), down() (+14 more)

### Community 6 - "Segmented.svelte"
Cohesion: 0.15
Nodes (10): @lucide/svelte, { label, children }, Box, from, {
    options,
    value,
    onchange,
    label,
    progress = 1,
    stacked = false,
  }, pressed, root, to (+2 more)

### Community 7 - "trig.ts"
Cohesion: 0.05
Nodes (58): COS_E, COT_E, CSC_R, dec(), Fn, nearestSpecial(), Recip, recipTex() (+50 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.14
Nodes (13): @tsconfig/svelte/tsconfig.json, compilerOptions, allowImportingTsExtensions, module, moduleResolution, noEmit, skipLibCheck, strict (+5 more)

### Community 9 - "Unit Circle Quiz page (index.html)"
Cohesion: 0.17
Nodes (8): div#app mount point, IBM Plex Sans (Google Fonts), Unit Circle Quiz page (index.html), dist/artifact.html (build for claude.ai artifact), dist/index.html (single-file build), npm run build, Svelte 5 + Vite + TypeScript stack, Unit Circle (project)

### Community 13 - "InversePanel.svelte"
Cohesion: 0.06
Nodes (40): Swing, norm(), snapDeg(), angleOf(), controlHandle(), inverseHandles(), probeAngle(), probeHandles() (+32 more)

### Community 14 - "circle/guide.svelte.ts"
Cohesion: 0.17
Nodes (13): Mode, topicHooks, wrapPi(), EXAM_FNS, EXAM_STREAK, ValueQ, done, q (+5 more)

### Community 15 - "Panel.svelte"
Cohesion: 0.18
Nodes (10): guideTopics, panel, blurH, blurHead, contentH, h, headH, IN (+2 more)

### Community 16 - "app.svelte.ts"
Cohesion: 0.22
Nodes (12): easeIn(), easeOut(), pen, PEN_MS, penEase(), revealed(), setMode(), setTopic() (+4 more)

### Community 17 - "MarkLayer.svelte"
Cohesion: 0.06
Nodes (32): mathjax, cache, math, Rect, texBox, clamp01(), entries, Entry (+24 more)

### Community 18 - "camera"
Cohesion: 0.14
Nodes (6): camera, marks, dd, deg, r, turn

### Community 19 - "inverse/quiz.ts"
Cohesion: 0.05
Nodes (68): angleField(), angleTex(), angleText(), clean(), gcd(), piFraction(), piTex(), trigOf() (+60 more)

### Community 20 - "progress"
Cohesion: 0.24
Nodes (5): GuideTopic, load(), progress, Saved, marks

### Community 21 - ".goTo"
Cohesion: 0.23
Nodes (4): apply(), Exam, near(), unitGuide

### Community 22 - "InverseGuide"
Cohesion: 0.32
Nodes (4): apply(), InverseGuide, stage(), explorePlane()

### Community 23 - ".prettierrc.json"
Cohesion: 0.29
Nodes (6): objectWrap, overrides, plugins, printWidth, singleQuote, svelteIndentScriptAndStyle

### Community 26 - "point.svelte.ts"
Cohesion: 0.23
Nodes (7): svelte, reduce, RecipKey, HUE, KEYS, NAMES, { trailing }

### Community 28 - "camera.svelte.ts"
Cohesion: 0.18
Nodes (13): penClock, penFrom, point, useHandles(), aim, pointHandle, preview, ringHover (+5 more)

### Community 32 - "App.svelte"
Cohesion: 0.23
Nodes (7): onkeydown(), ui, nudge(), KEYS, w, Saved, marks

## Knowledge Gaps
- **15 isolated node(s):** `@tsconfig/svelte`, `prettier`, `prettier-plugin-svelte`, `svelte-check`, `typescript` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 292 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `svelte` connect `point.svelte.ts` to `App.svelte`, `Package Dependencies`, `algebra.ts`, `radians/state.svelte.ts`, `Plane.svelte`, `Segmented.svelte`, `trig.ts`, `Unit Circle Quiz page (index.html)`, `InversePanel.svelte`, `Panel.svelte`, `app.svelte.ts`, `MarkLayer.svelte`, `inverse/quiz.ts`, `camera.svelte.ts`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **What connects `@tsconfig/svelte`, `prettier`, `prettier-plugin-svelte` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `inverse/scene.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07132188200149366 - nodes in this community are weakly interconnected._
- **Why does `angleTex()` connect `inverse/quiz.ts` to `inverse/scene.ts`, `App.svelte`, `algebra.ts`, `radians/state.svelte.ts`, `trig.ts`, `InversePanel.svelte`, `camera`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05873015873015873 - nodes in this community are weakly interconnected._
- **Why does `rad()` connect `inverse/scene.ts` to `algebra.ts`, `radians/state.svelte.ts`, `trig.ts`, `InversePanel.svelte`, `circle/guide.svelte.ts`, `.goTo`, `point.svelte.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `algebra.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._