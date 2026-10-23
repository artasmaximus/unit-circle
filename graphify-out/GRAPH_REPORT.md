# Graph Report - unit-circle  (2026-10-23)

## Corpus Check
- 66 files · ~38,544 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .css 2, (none) 1, .woff2 1)

## Summary
- 600 nodes · 1489 edges · 34 communities (31 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `90cee688`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tex.svelte.ts
- state.svelte.ts
- Package Dependencies
- algebra.ts
- angleTex
- Plane.svelte
- Segmented.svelte
- camera.svelte.ts
- TypeScript Config
- Unit Circle Quiz page (index.html)
- Artifact Build Script
- Type Check Command
- Dev Server Command
- marks.ts
- inverseQuiz.ts
- Panel.svelte
- inverse.ts
- MarkLayer.svelte
- inverseQuiz.svelte.ts
- trig.ts
- radians.svelte.ts
- camera
- scene.ts
- progress
- InverseQuiz.svelte
- inverseMarks.ts
- Solver.svelte
- ringMarks.ts
- solver
- RadiansGuide.svelte
- InversePanel.svelte
- svelte
- App.svelte
- radiansMarks.ts

## God Nodes (most connected - your core abstractions)
1. `angleTex()` - 35 edges
2. `camera` - 21 edges
3. `norm()` - 20 edges
4. `progress` - 19 edges
5. `svelte` - 18 edges
6. `inverse` - 18 edges
7. `rad()` - 17 edges
8. `trigTex()` - 14 edges
9. `invQuiz` - 13 edges
10. `buildScene()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `turn` --calls--> `piFraction()`  [EXTRACTED]
  src/panel/RadiansPanel.svelte → src/lib/angles.ts
- `deg()` --calls--> `angleTex()`  [EXTRACTED]
  src/panel/InversePanel.svelte → src/lib/angles.ts
- `makeProblem()` --calls--> `num()`  [EXTRACTED]
  src/lib/state.svelte.ts → src/lib/algebra.ts
- `enabled()` --calls--> `changes()`  [EXTRACTED]
  src/solver/Solver.svelte → src/lib/algebra.ts
- `radiansMarks()` --calls--> `piFraction()`  [EXTRACTED]
  src/lib/radiansMarks.ts → src/lib/angles.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Pure logic layer** — src_lib_trig, src_lib_algebra, src_lib_quiz, src_lib_logic_test [EXTRACTED 1.00]
- **State to scene to plane rendering pipeline** — src_lib_state_svelte, src_lib_camera_svelte, src_lib_scene, src_lib_tex_svelte, src_plane, src_panel [INFERRED 0.75]

## Communities (34 total, 3 thin omitted)

### Community 0 - "tex.svelte.ts"
Cohesion: 0.15
Nodes (10): mathjax, Label, cache, math, Rect, texBox, b, { label, style = '' } (+2 more)

### Community 1 - "state.svelte.ts"
Cohesion: 0.13
Nodes (19): atom, aim, easeIn(), easeOut(), fnValue(), makeProblem(), PEN_MS, penClock (+11 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.07
Nodes (28): dependencies, @lucide/svelte, mathjax, mathjs, svelte, devDependencies, svelte-check, @sveltejs/vite-plugin-svelte (+20 more)

### Community 3 - "algebra.ts"
Cohesion: 0.15
Nodes (25): npm test (pure-logic tests via node --test), apply(), AS_POWER, changes(), DEFINITIONS, eqTex(), EXACT, exactTex() (+17 more)

### Community 4 - "angleTex"
Cohesion: 0.30
Nodes (12): angleField(), angleTex(), angleText(), clean(), gcd(), piFraction(), piTex(), trigOf() (+4 more)

### Community 5 - "Plane.svelte"
Cohesion: 0.10
Nodes (27): snapValue(), clamp(), inverse, aimAt(), down(), dragging, ghost, ghostAt() (+19 more)

### Community 6 - "Segmented.svelte"
Cohesion: 0.14
Nodes (12): @lucide/svelte, pen, { label, children }, Box, from, { options, value, onchange, label, progress = 1, stacked = false }, pressed, root (+4 more)

### Community 7 - "camera.svelte.ts"
Cohesion: 0.27
Nodes (5): LABEL_R, S, GridInput, gridMarks(), marks

### Community 8 - "TypeScript Config"
Cohesion: 0.14
Nodes (13): @tsconfig/svelte/tsconfig.json, compilerOptions, allowImportingTsExtensions, module, moduleResolution, noEmit, skipLibCheck, strict (+5 more)

### Community 9 - "Unit Circle Quiz page (index.html)"
Cohesion: 0.18
Nodes (8): div#app mount point, IBM Plex Sans (Google Fonts), Unit Circle Quiz page (index.html), dist/artifact.html (build for claude.ai artifact), dist/index.html (single-file build), npm run build, Svelte 5 + Vite + TypeScript stack, Unit Circle (project)

### Community 13 - "marks.ts"
Cohesion: 0.15
Nodes (13): Base, clamp01(), DEFAULTS, DotGridMark, DotMark, drawCurve(), LabelMark, LineMark (+5 more)

### Community 14 - "inverseQuiz.ts"
Cohesion: 0.19
Nodes (16): Unit, anglesIn(), AXIS, Domain, DOMAINS, FNS, inDomain(), iqKey() (+8 more)

### Community 15 - "Panel.svelte"
Cohesion: 0.20
Nodes (9): guideTopics, blurH, blurHead, contentH, h, headH, IN, OUT (+1 more)

### Community 16 - "inverse.ts"
Cohesion: 0.14
Nodes (21): compose(), DOMAIN, inRange(), INV_NAME, InvFn, otherAngle(), PARTNER, partnerAt() (+13 more)

### Community 17 - "MarkLayer.svelte"
Cohesion: 0.14
Nodes (10): verbFor(), clamp01(), entries, Entry, gone(), live, { marks }, order() (+2 more)

### Community 18 - "inverseQuiz.svelte.ts"
Cohesion: 0.24
Nodes (4): IQ, apply(), invQuiz, load()

### Community 19 - "trig.ts"
Cohesion: 0.09
Nodes (26): flipSign(), FN_TEX, hintMsg(), hintTip(), m(), MAGS_SC, MAGS_T, makeChoices() (+18 more)

### Community 20 - "radians.svelte.ts"
Cohesion: 0.08
Nodes (35): RADIANS_GUIDE, Step, Task, ALL, apply(), EXAM_STREAK, PRACTICE, radians (+27 more)

### Community 21 - "camera"
Cohesion: 0.17
Nodes (5): camera, dd, deg, r, turn

### Community 22 - "scene.ts"
Cohesion: 0.06
Nodes (53): math, CircleInput, circleMarks(), clamp01(), give(), NOW, explain(), brace() (+45 more)

### Community 23 - "progress"
Cohesion: 0.14
Nodes (12): GuideTopic, load(), progress, Saved, parseAngle(), draft, editing, field() (+4 more)

### Community 24 - "InverseQuiz.svelte"
Cohesion: 0.18
Nodes (12): domainTex(), hintMsg(), hintTip(), m(), NOUN, task(), named, q (+4 more)

### Community 25 - "inverseMarks.ts"
Cohesion: 0.43
Nodes (6): apart(), at(), COLORS, DASH(), inverseMarks(), InvInput

### Community 26 - "Solver.svelte"
Cohesion: 0.24
Nodes (9): svelte, morph(), { bare = false }, enabled(), fn, Key, KEYS, onkeydown() (+1 more)

### Community 27 - "ringMarks.ts"
Cohesion: 0.60
Nodes (4): local(), RingInput, ringMarks(), texRect()

### Community 28 - "solver"
Cohesion: 0.24
Nodes (4): Eq, Op, setMode(), solver

### Community 29 - "RadiansGuide.svelte"
Cohesion: 0.33
Nodes (5): done, i, n, s, t

### Community 30 - "InversePanel.svelte"
Cohesion: 0.14
Nodes (12): deg(), dom, fn, FNS, HUE, n, p, range (+4 more)

### Community 31 - "svelte"
Cohesion: 0.40
Nodes (4): HUE, KEYS, NAMES, { trailing }

### Community 32 - "App.svelte"
Cohesion: 0.22
Nodes (5): KEYS, w, RecipKey, ui, marks

### Community 33 - "radiansMarks.ts"
Cohesion: 0.29
Nodes (8): Mark, FEATURES, arcPath(), at(), RadiansInput, radiansMarks(), marks, { under = false }

## Knowledge Gaps
- **13 isolated node(s):** `@tsconfig/svelte`, `svelte-check`, `typescript`, `@tsconfig/svelte/tsconfig.json`, `src/panel (controls, quiz, csc/sec/cot cards, workshop dialog)` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 243 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `svelte` connect `Solver.svelte` to `state.svelte.ts`, `Package Dependencies`, `Plane.svelte`, `Segmented.svelte`, `camera.svelte.ts`, `Unit Circle Quiz page (index.html)`, `Panel.svelte`, `inverse.ts`, `MarkLayer.svelte`, `trig.ts`, `scene.ts`, `InverseQuiz.svelte`, `RadiansGuide.svelte`, `InversePanel.svelte`, `svelte`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **What connects `@tsconfig/svelte`, `svelte-check`, `typescript` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12648221343873517 - nodes in this community are weakly interconnected._
- **Why does `angleTex()` connect `angleTex` to `state.svelte.ts`, `Plane.svelte`, `inverseQuiz.ts`, `inverse.ts`, `trig.ts`, `radians.svelte.ts`, `camera`, `scene.ts`, `InverseQuiz.svelte`, `inverseMarks.ts`, `ringMarks.ts`, `solver`, `InversePanel.svelte`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06881720430107527 - nodes in this community are weakly interconnected._
- **Why does `camera` connect `camera` to `App.svelte`, `radiansMarks.ts`, `state.svelte.ts`, `Plane.svelte`, `camera.svelte.ts`, `Panel.svelte`, `scene.ts`, `progress`, `InversePanel.svelte`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `algebra.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1455026455026455 - nodes in this community are weakly interconnected._