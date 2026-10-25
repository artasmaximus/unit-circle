# Graph Report - unit-circle  (2026-10-23)

## Corpus Check
- 73 files · ~43,982 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .css 2, (none) 1, .woff2 1)

## Summary
- 637 nodes · 1631 edges · 27 communities (23 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4b200859`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- state.svelte.ts
- Package Dependencies
- algebra.ts
- unitGuide.svelte.ts
- Plane.svelte
- Segmented.svelte
- TypeScript Config
- Unit Circle Quiz page (index.html)
- Artifact Build Script
- Type Check Command
- Dev Server Command
- inverseQuiz.ts
- Panel.svelte
- inverseQuiz.test.ts
- MarkLayer.svelte
- inverseQuiz.svelte.ts
- quiz.ts
- radians.svelte.ts
- camera
- progress
- norm
- scene.ts
- camera.svelte.ts
- RingLayer.svelte
- InversePanel.svelte
- svelte
- App.svelte

## God Nodes (most connected - your core abstractions)
1. `angleTex()` - 39 edges
2. `camera` - 22 edges
3. `progress` - 22 edges
4. `norm()` - 22 edges
5. `rad()` - 19 edges
6. `svelte` - 18 edges
7. `inverse` - 18 edges
8. `trigTex()` - 16 edges
9. `point` - 15 edges
10. `ui` - 15 edges

## Surprising Connections (you probably didn't know these)
- `unitCircleGuide()` --calls--> `angleTex()`  [EXTRACTED]
  src/guides/unitCircle.ts → src/lib/angles.ts
- `unitCircleGuide()` --calls--> `angleText()`  [EXTRACTED]
  src/guides/unitCircle.ts → src/lib/angles.ts
- `makeProblem()` --calls--> `num()`  [EXTRACTED]
  src/lib/state.svelte.ts → src/lib/algebra.ts
- `radiansMarks()` --calls--> `piFraction()`  [EXTRACTED]
  src/lib/radiansMarks.ts → src/lib/angles.ts
- `rExplain()` --calls--> `piFraction()`  [EXTRACTED]
  src/lib/radiansQuiz.ts → src/lib/angles.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Pure logic layer** — src_lib_trig, src_lib_algebra, src_lib_quiz, src_lib_logic_test [EXTRACTED 1.00]
- **State to scene to plane rendering pipeline** — src_lib_state_svelte, src_lib_camera_svelte, src_lib_scene, src_lib_tex_svelte, src_plane, src_panel [INFERRED 0.75]

## Communities (27 total, 4 thin omitted)

### Community 1 - "state.svelte.ts"
Cohesion: 0.11
Nodes (19): atom, Eq, Op, easeIn(), easeOut(), fnValue(), makeProblem(), PEN_MS (+11 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.07
Nodes (28): dependencies, @lucide/svelte, mathjax, mathjs, svelte, devDependencies, svelte-check, @sveltejs/vite-plugin-svelte (+20 more)

### Community 3 - "algebra.ts"
Cohesion: 0.10
Nodes (33): apply(), AS_POWER, changes(), DEFINITIONS, eqTex(), EXACT, exactTex(), Expr (+25 more)

### Community 4 - "unitGuide.svelte.ts"
Cohesion: 0.07
Nodes (29): m(), unitCircleGuide(), Step, Task, trigTexAnswer(), Mode, topicHooks, wrapPi() (+21 more)

### Community 5 - "Plane.svelte"
Cohesion: 0.14
Nodes (26): nearestSpecial(), snapDeg(), aimAt(), down(), dragging, ghost, ghostAt(), grain() (+18 more)

### Community 6 - "Segmented.svelte"
Cohesion: 0.14
Nodes (12): @lucide/svelte, pen, { label, children }, Box, from, { options, value, onchange, label, progress = 1, stacked = false }, pressed, root (+4 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.14
Nodes (13): @tsconfig/svelte/tsconfig.json, compilerOptions, allowImportingTsExtensions, module, moduleResolution, noEmit, skipLibCheck, strict (+5 more)

### Community 9 - "Unit Circle Quiz page (index.html)"
Cohesion: 0.18
Nodes (8): div#app mount point, IBM Plex Sans (Google Fonts), Unit Circle Quiz page (index.html), dist/artifact.html (build for claude.ai artifact), dist/index.html (single-file build), npm run build, Svelte 5 + Vite + TypeScript stack, Unit Circle (project)

### Community 14 - "inverseQuiz.ts"
Cohesion: 0.12
Nodes (26): partnerAt(), anglesIn(), AXIS, Domain, DOMAINS, domainTex(), FNS, hintMsg() (+18 more)

### Community 15 - "Panel.svelte"
Cohesion: 0.20
Nodes (9): guideTopics, blurH, blurHead, contentH, h, headH, IN, OUT (+1 more)

### Community 16 - "inverseQuiz.test.ts"
Cohesion: 0.18
Nodes (16): compose(), DOMAIN, inRange(), otherAngle(), principal(), R3, SC, solutionsIn() (+8 more)

### Community 17 - "MarkLayer.svelte"
Cohesion: 0.07
Nodes (26): GridInput, gridMarks(), Base, clamp01(), DEFAULTS, DotGridMark, DotMark, drawCurve() (+18 more)

### Community 18 - "inverseQuiz.svelte.ts"
Cohesion: 0.20
Nodes (7): IQ, iqKey(), pickQ(), apply(), invQuiz, load(), Rich

### Community 19 - "quiz.ts"
Cohesion: 0.06
Nodes (48): npm test (pure-logic tests via node --test), angleField(), angleTex(), angleText(), clean(), gcd(), piFraction(), piTex() (+40 more)

### Community 20 - "radians.svelte.ts"
Cohesion: 0.07
Nodes (36): RADIANS_GUIDE, ALL, apply(), EXAM_STREAK, PRACTICE, radians, Session, Feature (+28 more)

### Community 23 - "progress"
Cohesion: 0.29
Nodes (4): GuideTopic, load(), progress, Saved

### Community 24 - "norm"
Cohesion: 0.23
Nodes (4): InvFn, snapValue(), clamp(), inverse

### Community 25 - "scene.ts"
Cohesion: 0.05
Nodes (70): mathjax, Unit, LABEL_R, S, CircleInput, circleMarks(), clamp01(), give() (+62 more)

### Community 26 - "camera.svelte.ts"
Cohesion: 0.19
Nodes (6): svelte, Chip, CHIP_FONT, reduce, { scene }, slopeEl

### Community 28 - "RingLayer.svelte"
Cohesion: 0.22
Nodes (7): Scene, aim, penClock, penFrom, marks, { scene, ghost }, marks

### Community 30 - "InversePanel.svelte"
Cohesion: 0.13
Nodes (15): INV_NAME, PARTNER, RANGE, SPAN, dom, fn, FNS, HUE (+7 more)

### Community 31 - "svelte"
Cohesion: 0.22
Nodes (7): KEYS, w, RecipKey, HUE, KEYS, NAMES, { trailing }

### Community 32 - "App.svelte"
Cohesion: 0.24
Nodes (4): point, ui, marks, { under = false }

## Knowledge Gaps
- **13 isolated node(s):** `@tsconfig/svelte`, `svelte-check`, `typescript`, `@tsconfig/svelte/tsconfig.json`, `src/panel (controls, quiz, csc/sec/cot cards, workshop dialog)` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 254 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `svelte` connect `camera.svelte.ts` to `state.svelte.ts`, `Package Dependencies`, `algebra.ts`, `unitGuide.svelte.ts`, `Plane.svelte`, `Segmented.svelte`, `Unit Circle Quiz page (index.html)`, `inverseQuiz.ts`, `Panel.svelte`, `MarkLayer.svelte`, `quiz.ts`, `InversePanel.svelte`, `svelte`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **What connects `@tsconfig/svelte`, `svelte-check`, `typescript` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11375661375661375 - nodes in this community are weakly interconnected._
- **Why does `angleTex()` connect `quiz.ts` to `state.svelte.ts`, `unitGuide.svelte.ts`, `Plane.svelte`, `inverseQuiz.ts`, `inverseQuiz.test.ts`, `radians.svelte.ts`, `scene.ts`, `InversePanel.svelte`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06881720430107527 - nodes in this community are weakly interconnected._
- **Why does `progress` connect `progress` to `state.svelte.ts`, `unitGuide.svelte.ts`, `Plane.svelte`, `Segmented.svelte`, `inverseQuiz.ts`, `Panel.svelte`, `quiz.ts`, `radians.svelte.ts`, `scene.ts`, `RingLayer.svelte`, `InversePanel.svelte`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Should `algebra.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10420168067226891 - nodes in this community are weakly interconnected._