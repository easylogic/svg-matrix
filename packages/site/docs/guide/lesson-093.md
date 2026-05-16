---
id: "093"
title: "path morph"
part: "Part 23. SVG animation"
demo: "anim-path-morph"
---

# path morph

같은 segment 명령 열(M/L/C/Q)을 가진 두 `d`는 control·anchor를 선형 보간할 수 있습니다. topology가 다르면 불가 — shape tween 한계.

<LessonDemo id="093" />

## Core API

`morphPathDLinear` — `packages/svg-matrix-core/src/animation.js` 또는 `engine.js`

## 관련 강의

- [017 path length](./lesson-017.md) · [018 point at length](./lesson-018.md)
- [051 stroke-dasharray](./lesson-051.md)
- [063 textPath](./lesson-063.md)

## 오늘의 핵심

브라우저가 재생하는 SMIL/CSS와, 편집기가 미리 계산하는 `sampleMotionAlongPath`를 구분하세요. geometry는 svg-matrix, timeline·easing은 css-matrix 부록 B가 담당합니다.
