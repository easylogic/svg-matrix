---
id: "090"
title: "SMIL — animateMotion"
part: "Part 23. SVG animation"
demo: "anim-smil-motion"
---

# SMIL — animateMotion

객체가 path를 따라 이동합니다. `path` 속성 또는 `<mpath href="#id">`. 위치는 [017–018](./lesson-017.md) path length sampling과 같은 계열입니다.

<LessonDemo id="090" />

## Core API

`buildAnimateMotionMarkup` — `packages/svg-matrix-core/src/animation.js` 또는 `engine.js`

## 관련 강의

- [017 path length](./lesson-017.md) · [018 point at length](./lesson-018.md)
- [051 stroke-dasharray](./lesson-051.md)
- [063 textPath](./lesson-063.md)

## 오늘의 핵심

브라우저가 재생하는 SMIL/CSS와, 편집기가 미리 계산하는 `sampleMotionAlongPath`를 구분하세요. geometry는 svg-matrix, timeline·easing은 css-matrix 부록 B가 담당합니다.
