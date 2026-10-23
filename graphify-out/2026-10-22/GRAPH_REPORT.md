# Graph Report - unit-circle  (2026-10-22)

## Corpus Check
- 52 files · ~28,653 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 1, .css 1, .woff2 1)

## Summary
- 484 nodes · 1096 edges · 15 communities (12 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7c12551a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scene.ts
- state.svelte.ts
- Package Dependencies
- Workshop Algebra & Tests
- trig.ts
- Plane.svelte
- Panel.svelte
- TypeScript Config
- Unit Circle Quiz page (index.html)
- Artifact Build Script
- Type Check Command
- Dev Server Command
- inverseQuiz.ts
- InversePanel.svelte
- MarkLayer.svelte

## God Nodes (most connected - your core abstractions)
1. `camera` - 18 edges
2. `svelte` - 16 edges
3. `norm()` - 16 edges
4. `inverse` - 15 edges
5. `rad()` - 14 edges
6. `trigTex()` - 14 edges
7. `invQuiz` - 13 edges
8. `buildScene()` - 12 edges
9. `principal()` - 11 edges
10. `ui` - 11 edges

## Surprising Connections (you probably didn't know these)
- `makeProblem()` --calls--> `num()`  [EXTRACTED]
  src/lib/state.svelte.ts → src/lib/algebra.ts
- `answerOf()` --calls--> `principal()`  [EXTRACTED]
  src/lib/inverseQuiz.ts → src/lib/inverse.ts
- `inverseMarks()` --calls--> `otherAngle()`  [EXTRACTED]
  src/lib/inverseMarks.ts → src/lib/inverse.ts
- `valueTex()` --calls--> `dec()`  [EXTRACTED]
  src/lib/inverse.ts → src/lib/trig.ts
- `inverseMarks()` --calls--> `valueTex()`  [EXTRACTED]
  src/lib/inverseMarks.ts → src/lib/inverse.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Pure logic layer** — src_lib_trig, src_lib_algebra, src_lib_quiz, src_lib_logic_test [EXTRACTED 1.00]
- **State to scene to plane rendering pipeline** — src_lib_state_svelte, src_lib_camera_svelte, src_lib_scene, src_lib_tex_svelte, src_plane, src_panel [INFERRED 0.75]

## Communities (15 total, 3 thin omitted)

### Community 0 - "scene.ts"
Cohesion: 0.06
Nodes (41): mathjax, CircleInput, circleMarks(), clamp01(), give(), NOW, brace(), buildScene() (+33 more)

### Community 1 - "state.svelte.ts"
Cohesion: 0.07
Nodes (28): atom, Eq, Op, Question, trigTexAnswer(), aim, easeIn(), easeOut() (+20 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.07
Nodes (28): dependencies, @lucide/svelte, mathjax, mathjs, svelte, devDependencies, svelte-check, @sveltejs/vite-plugin-svelte (+20 more)

### Community 3 - "Workshop Algebra & Tests"
Cohesion: 0.09
Nodes (35): @lucide/svelte, apply(), AS_POWER, changes(), DEFINITIONS, eqTex(), EXACT, exactTex() (+27 more)

### Community 4 - "trig.ts"
Cohesion: 0.08
Nodes (42): npm test (pure-logic tests via node --test), explain(), flipSign(), FN_TEX, hintMsg(), hintTip(), m(), MAGS_SC (+34 more)

### Community 5 - "Plane.svelte"
Cohesion: 0.17
Nodes (20): aimAt(), down(), dragging, ghost, ghostAt(), grain(), inInverse, invPos() (+12 more)

### Community 6 - "Panel.svelte"
Cohesion: 0.05
Nodes (28): KEYS, w, camera, point, RecipKey, ui, wrapPi(), blurH (+20 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.14
Nodes (13): @tsconfig/svelte/tsconfig.json, compilerOptions, allowImportingTsExtensions, module, moduleResolution, noEmit, skipLibCheck, strict (+5 more)

### Community 9 - "Unit Circle Quiz page (index.html)"
Cohesion: 0.18
Nodes (8): div#app mount point, IBM Plex Sans (Google Fonts), Unit Circle Quiz page (index.html), dist/artifact.html (build for claude.ai artifact), dist/index.html (single-file build), npm run build, Svelte 5 + Vite + TypeScript stack, Unit Circle (project)

### Community 14 - "inverseQuiz.ts"
Cohesion: 0.09
Nodes (39): compose(), otherAngle(), partnerAt(), valueTex(), anglesIn(), answerOf(), answerTex(), AXIS (+31 more)

### Community 16 - "InversePanel.svelte"
Cohesion: 0.08
Nodes (31): DOMAIN, inRange(), INV_NAME, InvFn, PARTNER, principal(), R3, RANGE (+23 more)

### Community 17 - "MarkLayer.svelte"
Cohesion: 0.06
Nodes (46): svelte, LABEL_R, S, GridInput, gridMarks(), apart(), at(), COLORS (+38 more)

## Knowledge Gaps
- **13 isolated node(s):** `@tsconfig/svelte`, `svelte-check`, `typescript`, `@tsconfig/svelte/tsconfig.json`, `src/plane (scene renderer)` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 203 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `svelte` connect `MarkLayer.svelte` to `scene.ts`, `state.svelte.ts`, `Package Dependencies`, `Workshop Algebra & Tests`, `trig.ts`, `Plane.svelte`, `Panel.svelte`, `Unit Circle Quiz page (index.html)`, `inverseQuiz.ts`, `InversePanel.svelte`?**
  _High betweenness centrality (0.148) - this node is a cross-community bridge._
- **What connects `@tsconfig/svelte`, `svelte-check`, `typescript` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `scene.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.057329462989840346 - nodes in this community are weakly interconnected._
- **Why does `camera` connect `Panel.svelte` to `scene.ts`, `state.svelte.ts`, `trig.ts`, `Plane.svelte`, `InversePanel.svelte`, `MarkLayer.svelte`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `state.svelte.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07053140096618357 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06881720430107527 - nodes in this community are weakly interconnected._
- **Should `Workshop Algebra & Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.08846153846153847 - nodes in this community are weakly interconnected._