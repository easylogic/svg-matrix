---
id: "094"
title: "JS motion along path"
part: "Part 23. SVG animation"
demo: "anim-js-motion"
---

# JS motion along path

`progress∈[0,1]`을 **arc length**로 변환해 점·접선을 반환합니다. rAF·편집기·게임 루프용. timing/easing은 [css-matrix 048–049](https://github.com/easylogic/css-graphics-geometry).

<LessonDemo id="094" />

## Core API

`sampleMotionAlongPath` — `packages/svg-matrix-core/src/animation.js` 또는 `engine.js`

## 관련 강의

- [017 path length](./lesson-017.md) · [018 point at length](./lesson-018.md)
- [051 stroke-dasharray](./lesson-051.md)
- [063 textPath](./lesson-063.md)

## 오늘의 핵심

브라우저가 재생하는 SMIL/CSS와, 편집기가 미리 계산하는 `sampleMotionAlongPath`를 구분하세요. geometry는 svg-matrix, timeline·easing은 css-matrix 부록 B가 담당합니다.
