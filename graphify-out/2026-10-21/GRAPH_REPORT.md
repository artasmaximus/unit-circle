# Graph Report - unit-circle  (2026-10-21)

## Corpus Check
- 2 files · ~10,854 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 253 nodes · 482 edges · 13 communities (10 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.79)
- Token cost: 72,133 input · 0 output

## Community Hubs (Navigation)
- Scene & MathJax Layout
- App State & Entry
- Package Dependencies
- Workshop Algebra & Tests
- Quiz Content
- Camera Transform
- Equation Workshop UI
- Trig Values & Scene Geometry
- TypeScript Config
- Build & Page Shell
- Artifact Build Script
- Type Check Command
- Dev Server Command

## God Nodes (most connected - your core abstractions)
1. `trigTex()` - 14 edges
2. `Quiz` - 11 edges
3. `buildScene()` - 11 edges
4. `Point` - 10 edges
5. `apply()` - 10 edges
6. `norm()` - 9 edges
7. `recipTex()` - 9 edges
8. `refOf()` - 9 edges
9. `specialOf()` - 9 edges
10. `compilerOptions` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Label` --calls--> `texRect()`  [EXTRACTED]
  src/lib/scene.ts → src/lib/tex.svelte.ts
- `buildScene()` --calls--> `TexBox`  [EXTRACTED]
  src/lib/scene.ts → src/lib/tex.svelte.ts
- `buildScene()` --calls--> `colorOf()`  [EXTRACTED]
  src/lib/scene.ts → src/lib/trig.ts
- `makeChoices()` --calls--> `trigTex()`  [EXTRACTED]
  src/lib/quiz.ts → src/lib/trig.ts
- `makeQ()` --calls--> `trigTex()`  [EXTRACTED]
  src/lib/quiz.ts → src/lib/trig.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Pure logic layer** — src_lib_trig, src_lib_algebra, src_lib_quiz, src_lib_logic_test [EXTRACTED 1.00]
- **State to scene to plane rendering pipeline** — src_lib_state_svelte, src_lib_camera_svelte, src_lib_scene, src_lib_tex_svelte, src_plane, src_panel [INFERRED 0.75]

## Communities (13 total, 3 thin omitted)

### Community 0 - "Scene & MathJax Layout"
Cohesion: 0.08
Nodes (22): mathjax, Chip, CHIP_FONT, Label, OFFS, PlaceOpts, REFL, Scene (+14 more)

### Community 1 - "App State & Entry"
Cohesion: 0.09
Nodes (17): Eq, Question, load(), Point, Quiz, Saved, setMode(), Step (+9 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.07
Nodes (26): dependencies, @lucide/svelte, mathjax, svelte, devDependencies, svelte-check, @sveltejs/vite-plugin-svelte, @tsconfig/svelte (+18 more)

### Community 3 - "Workshop Algebra & Tests"
Cohesion: 0.14
Nodes (24): npm test (pure-logic tests via node --test), apply(), BASE, Canon, changes(), cmul(), DEFINITIONS, eqTex() (+16 more)

### Community 4 - "Quiz Content"
Cohesion: 0.14
Nodes (22): flipSign(), FN_TEX, hintMsg(), hintTip(), m(), MAGS_SC, MAGS_T, makeChoices() (+14 more)

### Community 5 - "Camera Transform"
Cohesion: 0.12
Nodes (15): Camera, NEED, S, revealed(), texRect(), colorOf(), SPECIAL, cols (+7 more)

### Community 6 - "Equation Workshop UI"
Cohesion: 0.11
Nodes (15): @lucide/svelte, Atom, Op, RecipKey, Workshop, color, NAMES, ALL (+7 more)

### Community 7 - "Trig Values & Scene Geometry"
Cohesion: 0.17
Nodes (22): explain(), brace(), buildScene(), placeChip(), COS_E, COT_E, CSC_R, dec() (+14 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.14
Nodes (13): @tsconfig/svelte/tsconfig.json, compilerOptions, allowImportingTsExtensions, module, moduleResolution, noEmit, skipLibCheck, strict (+5 more)

### Community 9 - "Build & Page Shell"
Cohesion: 0.17
Nodes (9): div#app mount point, IBM Plex Sans (Google Fonts), Unit Circle Quiz page (index.html), dist/artifact.html (build for claude.ai artifact), dist/index.html (single-file build), npm run build, Svelte 5 + Vite + TypeScript stack, Unit Circle (project) (+1 more)

## Knowledge Gaps
- **13 isolated node(s):** `svelte-check`, `@tsconfig/svelte`, `typescript`, `@tsconfig/svelte/tsconfig.json`, `Svelte 5 + Vite + TypeScript stack` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 124 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@lucide/svelte` connect `Equation Workshop UI` to `Package Dependencies`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **What connects `svelte-check`, `@tsconfig/svelte`, `typescript` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Scene & MathJax Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.07563025210084033 - nodes in this community are weakly interconnected._
- **Why does `svelte` connect `Build & Page Shell` to `Scene & MathJax Layout`, `Package Dependencies`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `App State & Entry` be split into smaller, more focused modules?**
  _Cohesion score 0.08901515151515152 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07389162561576355 - nodes in this community are weakly interconnected._
- **Should `Workshop Algebra & Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._