# Graph Report - unit-circle  (2026-10-27)

## Corpus Check
- 138 files · ~60,470 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .css 3, (none) 2, .woff2 1)

## Summary
- 898 nodes · 2557 edges · 44 communities (32 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c6eef787`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- inverse/scene.ts
- Package Dependencies
- algebra.ts
- radians/state.svelte.ts
- Plane.svelte
- MarkLayer.svelte
- circle/quiz.ts
- TypeScript Config
- Unit Circle Quiz page (index.html)
- Artifact Build Script
- Type Check Command
- Dev Server Command
- InversePanel.svelte
- inverse/guide.svelte.ts
- Panel.svelte
- app.svelte.ts
- marks.ts
- trig.ts
- inverse/quiz.ts
- progress
- circle/guide.svelte.ts
- inverse/quiz.svelte.ts
- .prettierrc.json
- App.svelte
- motion.ts
- npm test (pure-logic tests via node --test)
- src/panel (controls, quiz, csc/sec/cot cards, workshop dialog)
- src/plane (scene renderer)
- Session
- angleTex
- TopicMenu.svelte
- nav.ts
- norm
- layout.ts
- inverse/math.ts
- tex.svelte.ts
- matrix.ts
- circle/quiz.svelte.ts
- AngleInput.svelte
- Entry

## God Nodes (most connected - your core abstractions)
1. `angleTex()` - 40 edges
2. `Session` - 30 edges
3. `progress` - 29 edges
4. `rad()` - 28 edges
5. `camera` - 25 edges
6. `ui` - 24 edges
7. `norm()` - 23 edges
8. `Ctx` - 22 edges
9. `timing` - 22 edges
10. `polar()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `deg()` --calls--> `angleTex()`  [EXTRACTED]
  src/topics/inverse/InversePanel.svelte → src/core/angles.ts
- `trig()` --calls--> `trigOf()`  [EXTRACTED]
  src/topics/inverse/InversePanel.svelte → src/core/angles.ts
- `rExplain()` --calls--> `piFraction()`  [EXTRACTED]
  src/topics/radians/quiz.ts → src/core/angles.ts
- `turn` --calls--> `piFraction()`  [EXTRACTED]
  src/topics/radians/RadiansPanel.svelte → src/core/angles.ts
- `radiansScene()` --calls--> `piFraction()`  [EXTRACTED]
  src/topics/radians/scene.ts → src/core/angles.ts

## Import Cycles
- None detected.

## Communities (44 total, 12 thin omitted)

### Community 0 - "inverse/scene.ts"
Cohesion: 0.07
Nodes (88): LABEL_R, S, texRect(), colorOf(), rad(), after(), camera, DUR (+80 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.06
Nodes (33): dependencies, @lucide/svelte, mathjax, mathjs, svelte, devDependencies, prettier, prettier-plugin-svelte (+25 more)

### Community 3 - "algebra.ts"
Cohesion: 0.05
Nodes (57): mathjs, math, morph(), SPECIAL, GuideRun, i, n, {
    run,
    label,
    color,
    intro,
    exam,
  } (+49 more)

### Community 4 - "radians/state.svelte.ts"
Cohesion: 0.06
Nodes (46): registerGroups(), registerTopics(), Rich, Step, Task, pointHandle, circleTopic, Feature (+38 more)

### Community 5 - "Plane.svelte"
Cohesion: 0.08
Nodes (35): camera, snapDeg(), Aim, distance(), Handle, Hit, nearest(), sources (+27 more)

### Community 6 - "MarkLayer.svelte"
Cohesion: 0.15
Nodes (12): switchJustBegan(), SWITCH, recordLead(), clamp01(), entries, gone(), live, { marks, name = '' } (+4 more)

### Community 7 - "circle/quiz.ts"
Cohesion: 0.21
Nodes (17): trigOf(), explain(), flipSign(), FN_TEX, hintMsg(), hintTip(), m(), MAGS_SC (+9 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.14
Nodes (13): @tsconfig/svelte/tsconfig.json, compilerOptions, allowImportingTsExtensions, module, moduleResolution, noEmit, skipLibCheck, strict (+5 more)

### Community 9 - "Unit Circle Quiz page (index.html)"
Cohesion: 0.17
Nodes (8): div#app mount point, IBM Plex Sans (Google Fonts), Unit Circle Quiz page (index.html), dist/artifact.html (build for claude.ai artifact), dist/index.html (single-file build), npm run build, Svelte 5 + Vite + TypeScript stack, Unit Circle (project)

### Community 13 - "InversePanel.svelte"
Cohesion: 0.12
Nodes (13): deg(), dom, fn, FNS, HUE, n, p, range (+5 more)

### Community 14 - "inverse/guide.svelte.ts"
Cohesion: 0.15
Nodes (14): TopicHooks, apply(), InverseGuide, inverseGuideRun, inverseHooks, stage(), SETUP, Domain (+6 more)

### Community 15 - "Panel.svelte"
Cohesion: 0.07
Nodes (25): @lucide/svelte, pen, panel, angleInput, blurH, blurHead, contentH, folded (+17 more)

### Community 16 - "app.svelte.ts"
Cohesion: 0.15
Nodes (15): defaultMode(), easeIn(), easeOut(), groupList, HOME, PEN_MS, penClock, penEase() (+7 more)

### Community 17 - "marks.ts"
Cohesion: 0.17
Nodes (12): Base, clamp01(), DEFAULTS, DotGridMark, DotMark, drawCurve(), LabelMark, LineMark (+4 more)

### Community 18 - "trig.ts"
Cohesion: 0.22
Nodes (14): COS_E, COT_E, CSC_R, dec(), nearestSpecial(), parseAngle(), Recip, recipTex() (+6 more)

### Community 19 - "inverse/quiz.ts"
Cohesion: 0.12
Nodes (29): { session = invQuiz, trailing }, unit, view, anglesIn(), answerOf(), AXIS, DOMAINS, domainTex() (+21 more)

### Community 20 - "progress"
Cohesion: 0.16
Nodes (12): setMode(), setTopic(), withPen(), toSearch(), GuideTopic, load(), progress, Saved (+4 more)

### Community 21 - "circle/guide.svelte.ts"
Cohesion: 0.06
Nodes (33): svelte, revealed(), ui, point, Swing, reduce, wrapPi(), BEAT (+25 more)

### Community 22 - "inverse/quiz.svelte.ts"
Cohesion: 0.18
Nodes (11): Adapter, partnerAt(), FNS, skillOf(), adapter, EXAM_NEEDS, EXAM_STREAK, Need (+3 more)

### Community 23 - ".prettierrc.json"
Cohesion: 0.29
Nodes (6): objectWrap, overrides, plugins, printWidth, singleQuote, svelteIndentScriptAndStyle

### Community 26 - "App.svelte"
Cohesion: 0.25
Nodes (7): onkeydown(), topics, nav, nudge(), all, tabs, topicMenu

### Community 28 - "motion.ts"
Cohesion: 0.18
Nodes (10): Frame, frames, kind(), kinds(), LayerNow, led, motion, probes (+2 more)

### Community 32 - "Session"
Cohesion: 0.08
Nodes (17): placing, PracticeView, q, {
    session,
    view,
    trailing,
  }, showMissed, Result, Session, Later (+9 more)

### Community 33 - "angleTex"
Cohesion: 0.20
Nodes (16): angleField(), angleTex(), angleText(), clean(), gcd(), piFraction(), piTex(), Unit (+8 more)

### Community 34 - "TopicMenu.svelte"
Cohesion: 0.20
Nodes (15): groups, topicDef, topicStatus(), marks, miss, tab(), close(), first (+7 more)

### Community 35 - "nav.ts"
Cohesion: 0.17
Nodes (14): Mode, Topic, topicSections(), fromSearch(), MODES, NavTopic, search(), Section (+6 more)

### Community 37 - "layout.ts"
Cohesion: 0.13
Nodes (17): tag, { layout }, slopeEl, buildLayout(), Chip, CHIP_FONT, clampTo(), Layout (+9 more)

### Community 38 - "inverse/math.ts"
Cohesion: 0.17
Nodes (17): norm(), compose(), DOMAIN, inRange(), INV_NAME, InvFn, otherAngle(), PARTNER (+9 more)

### Community 39 - "tex.svelte.ts"
Cohesion: 0.20
Nodes (8): mathjax, cache, math, Rect, texBox, Label, b, { label, style = '' }

### Community 40 - "matrix.ts"
Cohesion: 0.31
Nodes (10): hasGuide(), finish(), go(), matrix(), name(), OWNER, Row, sleep() (+2 more)

### Community 41 - "circle/quiz.svelte.ts"
Cohesion: 0.29
Nodes (10): Fn, pickQ(), qKey(), skillOf(), adapter(), EXAM_FNS, EXAM_STREAK, QuizSession (+2 more)

### Community 42 - "AngleInput.svelte"
Cohesion: 0.25
Nodes (7): draft, editing, field(), mark, shown, unit, { unit: forced }

## Knowledge Gaps
- **15 isolated node(s):** `@tsconfig/svelte`, `prettier`, `prettier-plugin-svelte`, `svelte-check`, `typescript` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 325 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `svelte` connect `circle/guide.svelte.ts` to `inverse/scene.ts`, `Session`, `Package Dependencies`, `algebra.ts`, `TopicMenu.svelte`, `Plane.svelte`, `MarkLayer.svelte`, `layout.ts`, `Unit Circle Quiz page (index.html)`, `InversePanel.svelte`, `Panel.svelte`, `app.svelte.ts`, `inverse/quiz.ts`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **What connects `@tsconfig/svelte`, `prettier`, `prettier-plugin-svelte` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `inverse/scene.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06986492780624126 - nodes in this community are weakly interconnected._
- **Why does `Session` connect `Session` to `circle/quiz.svelte.ts`, `radians/state.svelte.ts`, `inverse/quiz.svelte.ts`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05873015873015873 - nodes in this community are weakly interconnected._
- **Why does `angleTex()` connect `angleTex` to `inverse/scene.ts`, `algebra.ts`, `radians/state.svelte.ts`, `layout.ts`, `circle/quiz.ts`, `circle/quiz.svelte.ts`, `InversePanel.svelte`, `inverse/quiz.ts`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `algebra.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05136986301369863 - nodes in this community are weakly interconnected._