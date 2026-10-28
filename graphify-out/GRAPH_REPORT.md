# Graph Report - unit-circle  (2026-10-28)

## Corpus Check
- 145 files · ~60,983 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .css 4, (none) 2, .woff2 1)

## Summary
- 920 nodes · 2667 edges · 50 communities (37 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `727e4382`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- inverse/scene.ts
- Package Dependencies
- algebra.ts
- radians/state.svelte.ts
- Plane.svelte
- MarkLayer.svelte
- trig.ts
- TypeScript Config
- Unit Circle Quiz page (index.html)
- Artifact Build Script
- Type Check Command
- Dev Server Command
- InversePanel.svelte
- inverse/guide.svelte.ts
- Panel.svelte
- CircleLayer.svelte
- marks.ts
- svelte
- inverse/quiz.ts
- progress
- UnitGuideLayer.svelte
- inverse/quiz.svelte.ts
- .prettierrc.json
- solver.svelte.ts
- motion.ts
- npm test (pure-logic tests via node --test)
- src/panel (controls, quiz, csc/sec/cot cards, workshop dialog)
- src/plane (scene renderer)
- Session
- ref_node_assert
- TopicMenu.svelte
- app.svelte.ts
- inverse/state.svelte.ts
- layout.ts
- handles.ts
- InverseLayer.svelte
- matrix.ts
- Segmented.svelte
- Practice.svelte
- Solver.svelte
- Grid.svelte
- camera.svelte.ts
- Swing
- camera
- gridWindow.ts
- Reciprocals.svelte

## God Nodes (most connected - your core abstractions)
1. `angleTex()` - 40 edges
2. `rad()` - 30 edges
3. `progress` - 29 edges
4. `Session` - 26 edges
5. `norm()` - 25 edges
6. `ui` - 24 edges
7. `timing` - 24 edges
8. `camera` - 23 edges
9. `svelte` - 21 edges
10. `Ctx` - 21 edges

## Surprising Connections (you probably didn't know these)
- `deg()` --calls--> `angleTex()`  [EXTRACTED]
  src/topics/inverse/InversePanel.svelte → src/core/angles.ts
- `trig()` --calls--> `trigOf()`  [EXTRACTED]
  src/topics/inverse/InversePanel.svelte → src/core/angles.ts
- `halves` --calls--> `radiansScene()`  [EXTRACTED]
  src/topics/radians/marks.svelte.ts → src/topics/radians/scene.ts
- `rExplain()` --calls--> `piFraction()`  [EXTRACTED]
  src/topics/radians/quiz.ts → src/core/angles.ts
- `turn` --calls--> `piFraction()`  [EXTRACTED]
  src/topics/radians/RadiansPanel.svelte → src/core/angles.ts

## Import Cycles
- None detected.

## Communities (50 total, 13 thin omitted)

### Community 0 - "inverse/scene.ts"
Cohesion: 0.08
Nodes (80): LABEL_R, S, rad(), wrapTau(), after(), DUR, figure, input (+72 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.06
Nodes (34): dependencies, @lucide/svelte, mathjax, mathjs, svelte, devDependencies, prettier, prettier-plugin-svelte (+26 more)

### Community 3 - "algebra.ts"
Cohesion: 0.14
Nodes (26): mathjs, math, apply(), AS_POWER, atom, DEFINITIONS, eqTex(), EXACT (+18 more)

### Community 4 - "radians/state.svelte.ts"
Cohesion: 0.06
Nodes (46): TopicHooks, GuideTopic, m(), Step, Task, Exam, GuideState, trackDrag() (+38 more)

### Community 5 - "Plane.svelte"
Cohesion: 0.21
Nodes (16): aim(), down(), held, hover(), hovered, last, { layers, overlay }, letGo() (+8 more)

### Community 6 - "MarkLayer.svelte"
Cohesion: 0.13
Nodes (10): switchJustBegan(), SWITCH, recordLead(), entries, Entry, gone(), live, { marks, name = '' } (+2 more)

### Community 7 - "trig.ts"
Cohesion: 0.06
Nodes (65): angleField(), angleTex(), angleText(), clean(), gcd(), piFraction(), piTex(), trigOf() (+57 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.14
Nodes (13): @tsconfig/svelte/tsconfig.json, compilerOptions, allowImportingTsExtensions, module, moduleResolution, noEmit, skipLibCheck, strict (+5 more)

### Community 9 - "Unit Circle Quiz page (index.html)"
Cohesion: 0.17
Nodes (8): div#app mount point, IBM Plex Sans (Google Fonts), Unit Circle Quiz page (index.html), dist/artifact.html (build for claude.ai artifact), dist/index.html (single-file build), npm run build, Svelte 5 + Vite + TypeScript stack, Unit Circle (project)

### Community 13 - "InversePanel.svelte"
Cohesion: 0.09
Nodes (21): deg(), dom, fn, FNS, HUE, n, p, range (+13 more)

### Community 14 - "inverse/guide.svelte.ts"
Cohesion: 0.27
Nodes (8): inverseGuideRun, SETUP, Domain, invExam, invQuiz, declare(), inverseSession(), StageState

### Community 15 - "Panel.svelte"
Cohesion: 0.10
Nodes (22): onkeydown(), pen, ui, nav, panel, angleInput, blurH, blurHead (+14 more)

### Community 16 - "CircleLayer.svelte"
Cohesion: 0.17
Nodes (11): penClock, penFrom, point, aim, pointHandle, preview, marks, ring (+3 more)

### Community 17 - "marks.ts"
Cohesion: 0.16
Nodes (14): clamp01(), view(), Base, DEFAULTS, DotGridMark, DotMark, drawCurve(), LabelMark (+6 more)

### Community 18 - "svelte"
Cohesion: 0.12
Nodes (15): svelte, registerGroups(), topicDef, done, {
    topic,
    passed,
    message,
    children,
  }, GuideRun, i, n (+7 more)

### Community 19 - "inverse/quiz.ts"
Cohesion: 0.15
Nodes (24): Unit, pick(), rnd(), shuffle(), { session = invQuiz, trailing }, unit, view, valueTex() (+16 more)

### Community 20 - "progress"
Cohesion: 0.33
Nodes (3): load(), progress, Saved

### Community 21 - "UnitGuideLayer.svelte"
Cohesion: 0.27
Nodes (8): revealed(), unitGuide, circleSession(), declare(), stage, StageState, marks, on

### Community 22 - "inverse/quiz.svelte.ts"
Cohesion: 0.16
Nodes (12): EXAM_STREAK, partnerAt(), FNS, iqKey(), pickQ(), skillOf(), adapter, EXAM_NEEDS (+4 more)

### Community 23 - ".prettierrc.json"
Cohesion: 0.29
Nodes (6): objectWrap, overrides, plugins, printWidth, singleQuote, svelteIndentScriptAndStyle

### Community 26 - "solver.svelte.ts"
Cohesion: 0.16
Nodes (10): Eq, Op, fnValue(), makeProblem(), RECIP_FN, RecipKey, solver, Step (+2 more)

### Community 28 - "motion.ts"
Cohesion: 0.18
Nodes (10): Frame, frames, kind(), kinds(), LayerNow, led, motion, probes (+2 more)

### Community 32 - "Session"
Cohesion: 0.06
Nodes (15): ExamRun, Mode, PracticeRun, Result, Session, Later, need(), parseSkills() (+7 more)

### Community 34 - "TopicMenu.svelte"
Cohesion: 0.21
Nodes (14): groups, topicStatus(), search(), tab(), close(), first, hint(), input (+6 more)

### Community 35 - "app.svelte.ts"
Cohesion: 0.12
Nodes (26): defaultMode(), easeIn(), easeOut(), groupList, Mode, PEN_MS, penEase(), registerTopics() (+18 more)

### Community 36 - "inverse/state.svelte.ts"
Cohesion: 0.21
Nodes (8): compose(), otherAngle(), principal(), answerOf(), makeChoices(), r(), clamp(), inverse

### Community 37 - "layout.ts"
Cohesion: 0.07
Nodes (31): cache, math, Rect, texBox, texRect(), colorOf(), wrapPi(), tag (+23 more)

### Community 38 - "handles.ts"
Cohesion: 0.32
Nodes (11): deg(), Handle, angleOf(), ringHover, controlHandle(), inverseHandles(), probeAngle(), probeHandles() (+3 more)

### Community 39 - "InverseLayer.svelte"
Cohesion: 0.14
Nodes (13): Aim, distance(), Hit, nearest(), sources, useHandles(), NO_MARKS, marks (+5 more)

### Community 40 - "matrix.ts"
Cohesion: 0.22
Nodes (16): hasGuide(), setMode(), setTopic(), topics, withPen(), toSearch(), followAddress(), finish() (+8 more)

### Community 41 - "Segmented.svelte"
Cohesion: 0.15
Nodes (10): @lucide/svelte, { label, children }, Box, from, {
    options,
    value,
    onchange,
    label,
    progress = 1,
    stacked = false,
  }, pressed, root, to (+2 more)

### Community 42 - "Practice.svelte"
Cohesion: 0.20
Nodes (10): Rich, placing, q, {
    session,
    view,
    trailing,
  }, showMissed, { parts }, segs, b (+2 more)

### Community 43 - "Solver.svelte"
Cohesion: 0.29
Nodes (9): morph(), changes(), { bare = false }, enabled(), fn, Key, KEYS, onkeydown() (+1 more)

### Community 44 - "Grid.svelte"
Cohesion: 0.24
Nodes (8): GraphPaper(), h, marks, w, x, y, GridInput, gridScene()

### Community 45 - "camera.svelte.ts"
Cohesion: 0.33
Nodes (4): reduce, BEAT, camera, EASE_POP

### Community 48 - "gridWindow.ts"
Cohesion: 0.70
Nodes (3): gridWindow(), snapDown(), Window

### Community 49 - "Reciprocals.svelte"
Cohesion: 0.40
Nodes (4): HUE, KEYS, NAMES, { trailing }

## Knowledge Gaps
- **15 isolated node(s):** `@tsconfig/svelte`, `prettier`, `prettier-plugin-svelte`, `svelte-check`, `typescript` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 340 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `svelte` connect `svelte` to `Package Dependencies`, `app.svelte.ts`, `TopicMenu.svelte`, `Plane.svelte`, `MarkLayer.svelte`, `layout.ts`, `trig.ts`, `Unit Circle Quiz page (index.html)`, `Practice.svelte`, `Solver.svelte`, `Segmented.svelte`, `camera.svelte.ts`, `InversePanel.svelte`, `Panel.svelte`, `Reciprocals.svelte`, `inverse/quiz.ts`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **What connects `@tsconfig/svelte`, `prettier`, `prettier-plugin-svelte` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `inverse/scene.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07940205785284411 - nodes in this community are weakly interconnected._
- **Why does `Session` connect `Session` to `Practice.svelte`, `radians/state.svelte.ts`, `inverse/quiz.svelte.ts`, `trig.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.057057057057057055 - nodes in this community are weakly interconnected._
- **Why does `angleTex()` connect `trig.ts` to `inverse/scene.ts`, `ref_node_assert`, `radians/state.svelte.ts`, `layout.ts`, `InversePanel.svelte`, `inverse/quiz.ts`, `solver.svelte.ts`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Should `algebra.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13793103448275862 - nodes in this community are weakly interconnected._