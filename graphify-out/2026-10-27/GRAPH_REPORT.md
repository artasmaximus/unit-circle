# Graph Report - unit-circle  (2026-10-26)

## Corpus Check
- 130 files · ~57,273 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .css 3, (none) 2, .woff2 1)

## Summary
- 845 nodes · 2336 edges · 43 communities (30 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `11745edd`
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
- inverse/guide.svelte.ts
- Panel.svelte
- app.svelte.ts
- MarkLayer.svelte
- camera
- inverse/quiz.ts
- progress
- circle/guide.svelte.ts
- InverseGuide
- .prettierrc.json
- camera.svelte.ts
- camera.svelte.ts
- npm test (pure-logic tests via node --test)
- src/panel (controls, quiz, csc/sec/cot cards, workshop dialog)
- src/plane (scene renderer)
- Session
- angleTex
- TopicMenu.svelte
- nav.ts
- norm
- layout.ts
- inverse/quiz.test.ts
- svelte
- gridScene.ts
- Chips.svelte
- MirrorSwitch.svelte

## God Nodes (most connected - your core abstractions)
1. `angleTex()` - 40 edges
2. `progress` - 29 edges
3. `Session` - 28 edges
4. `rad()` - 25 edges
5. `camera` - 24 edges
6. `norm()` - 22 edges
7. `timing` - 22 edges
8. `Ctx` - 21 edges
9. `Label()` - 21 edges
10. `svelte` - 20 edges

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

## Communities (43 total, 13 thin omitted)

### Community 0 - "inverse/scene.ts"
Cohesion: 0.08
Nodes (73): LABEL_R, S, texRect(), colorOf(), rad(), AngleArc(), AngleArcProps, wrap() (+65 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.06
Nodes (33): dependencies, @lucide/svelte, mathjax, mathjs, svelte, devDependencies, prettier, prettier-plugin-svelte (+25 more)

### Community 3 - "algebra.ts"
Cohesion: 0.07
Nodes (45): mathjs, math, morph(), apply(), AS_POWER, atom, changes(), DEFINITIONS (+37 more)

### Community 4 - "radians/state.svelte.ts"
Cohesion: 0.09
Nodes (33): Feature, FEATURES, RADIANS_GUIDE, m(), makeRQ(), pick(), pickRQ(), R_ANGLES (+25 more)

### Community 5 - "Plane.svelte"
Cohesion: 0.11
Nodes (30): Aim, distance(), Handle, Hit, nearest(), sources, aim(), down() (+22 more)

### Community 6 - "Segmented.svelte"
Cohesion: 0.20
Nodes (8): Box, from, {
    options,
    value,
    onchange,
    label,
    progress = 1,
    stacked = false,
  }, pressed, root, to, w, x

### Community 7 - "trig.ts"
Cohesion: 0.08
Nodes (44): COS_E, COT_E, CSC_R, dec(), Fn, nearestSpecial(), Recip, recipTex() (+36 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.14
Nodes (13): @tsconfig/svelte/tsconfig.json, compilerOptions, allowImportingTsExtensions, module, moduleResolution, noEmit, skipLibCheck, strict (+5 more)

### Community 9 - "Unit Circle Quiz page (index.html)"
Cohesion: 0.17
Nodes (8): div#app mount point, IBM Plex Sans (Google Fonts), Unit Circle Quiz page (index.html), dist/artifact.html (build for claude.ai artifact), dist/index.html (single-file build), npm run build, Svelte 5 + Vite + TypeScript stack, Unit Circle (project)

### Community 13 - "InversePanel.svelte"
Cohesion: 0.09
Nodes (22): deg(), dom, fn, FNS, HUE, n, p, range (+14 more)

### Community 14 - "inverse/guide.svelte.ts"
Cohesion: 0.15
Nodes (13): Mode, registerGroups(), registerTopics(), TopicHooks, circleTopic, apply(), inverseGuideRun, inverseHooks (+5 more)

### Community 15 - "Panel.svelte"
Cohesion: 0.13
Nodes (14): panel, angleInput, blurH, blurHead, contentH, folded, h, headH (+6 more)

### Community 16 - "app.svelte.ts"
Cohesion: 0.16
Nodes (19): onkeydown(), defaultMode(), easeIn(), easeOut(), groupList, hasGuide(), HOME, PEN_MS (+11 more)

### Community 17 - "MarkLayer.svelte"
Cohesion: 0.07
Nodes (30): mathjax, cache, math, Rect, texBox, clamp01(), entries, Entry (+22 more)

### Community 19 - "inverse/quiz.ts"
Cohesion: 0.09
Nodes (36): { session = invQuiz, trailing }, unit, view, partnerAt(), anglesIn(), AXIS, Domain, DOMAINS (+28 more)

### Community 20 - "progress"
Cohesion: 0.21
Nodes (6): GuideTopic, load(), progress, Saved, marks, done

### Community 21 - "circle/guide.svelte.ts"
Cohesion: 0.11
Nodes (12): Swing, wrapPi(), Step, Feature, FEATURES, apply(), circleHooks, near() (+4 more)

### Community 23 - ".prettierrc.json"
Cohesion: 0.29
Nodes (6): objectWrap, overrides, plugins, printWidth, singleQuote, svelteIndentScriptAndStyle

### Community 26 - "camera.svelte.ts"
Cohesion: 0.23
Nodes (8): svelte, reduce, camera, figure, nav, pen, point, tag

### Community 28 - "camera.svelte.ts"
Cohesion: 0.15
Nodes (17): pen, penClock, penFrom, revealed(), ui, point, useHandles(), aim (+9 more)

### Community 32 - "Session"
Cohesion: 0.05
Nodes (33): Rich, GuideRun, i, n, {
    run,
    label,
    color,
    intro,
    exam,
  }, s, t, Task (+25 more)

### Community 33 - "angleTex"
Cohesion: 0.15
Nodes (20): angleField(), angleTex(), angleText(), clean(), gcd(), piFraction(), piTex(), trigOf() (+12 more)

### Community 34 - "TopicMenu.svelte"
Cohesion: 0.16
Nodes (18): @lucide/svelte, groups, topicDef, topicStatus(), { label, children }, all, tab(), tabs (+10 more)

### Community 35 - "nav.ts"
Cohesion: 0.18
Nodes (13): Topic, topicSections(), fromSearch(), MODES, NavTopic, search(), Section, sections() (+5 more)

### Community 36 - "norm"
Cohesion: 0.22
Nodes (7): norm(), snapDeg(), inRange(), snapValue(), clamp(), inverse, field()

### Community 37 - "layout.ts"
Cohesion: 0.24
Nodes (11): buildLayout(), clampTo(), LayoutInput, Leg, OFFS, placeChip(), Placed, PlaceOpts (+3 more)

### Community 38 - "inverse/quiz.test.ts"
Cohesion: 0.36
Nodes (9): compose(), otherAngle(), principal(), solutionsIn(), valueTex(), answerOf(), explain(), makeChoices() (+1 more)

### Community 39 - "svelte"
Cohesion: 0.22
Nodes (6): quiz, { trailing }, HUE, KEYS, NAMES, { trailing }

### Community 40 - "gridScene.ts"
Cohesion: 0.36
Nodes (5): GraphPaper(), GraphPaperProps, marks, GridInput, gridScene()

### Community 41 - "Chips.svelte"
Cohesion: 0.25
Nodes (5): { layout }, slopeEl, Chip, CHIP_FONT, Layout

## Knowledge Gaps
- **15 isolated node(s):** `@tsconfig/svelte`, `prettier`, `prettier-plugin-svelte`, `svelte-check`, `typescript` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 314 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `svelte` connect `camera.svelte.ts` to `Session`, `Package Dependencies`, `algebra.ts`, `TopicMenu.svelte`, `Plane.svelte`, `Segmented.svelte`, `svelte`, `Unit Circle Quiz page (index.html)`, `Chips.svelte`, `InversePanel.svelte`, `Panel.svelte`, `app.svelte.ts`, `MarkLayer.svelte`, `inverse/quiz.ts`, `camera.svelte.ts`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **What connects `@tsconfig/svelte`, `prettier`, `prettier-plugin-svelte` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `inverse/scene.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08415147265077139 - nodes in this community are weakly interconnected._
- **Why does `Session` connect `Session` to `inverse/quiz.ts`, `radians/state.svelte.ts`, `trig.ts`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05873015873015873 - nodes in this community are weakly interconnected._
- **Why does `angleTex()` connect `angleTex` to `inverse/scene.ts`, `Session`, `algebra.ts`, `radians/state.svelte.ts`, `layout.ts`, `inverse/quiz.test.ts`, `trig.ts`, `InversePanel.svelte`, `inverse/quiz.ts`, `circle/guide.svelte.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `algebra.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07017543859649122 - nodes in this community are weakly interconnected._