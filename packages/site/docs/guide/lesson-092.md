---
id: "092"
title: "CSS offset-path motion"
part: "Part 23. SVG animation"
demo: "anim-css-motion"
---

# CSS offset-path motion

모던 CSS `offset-path: path("…")` + `offset-distance`로 SMIL 없이 path motion. [css-matrix Motion path](https://github.com/easylogic/css-graphics-geometry) 050과 짝입니다.

<LessonDemo id="092" />

## Core API

`buildOffsetPathMotionCss` — `packages/svg-matrix-core/src/animation.js` 또는 `engine.js`

## 관련 강의

- [017 path length](./lesson-017.md) · [018 point at length](./lesson-018.md)
- [051 stroke-dasharray](./lesson-051.md)
- [063 textPath](./lesson-063.md)

## 오늘의 핵심

브라우저가 재생하는 SMIL/CSS와, 편집기가 미리 계산하는 `sampleMotionAlongPath`를 구분하세요. geometry는 svg-matrix, timeline·easing은 css-matrix 부록 B가 담당합니다.
