---
id: "089"
title: "SMIL — animateTransform"
part: "Part 23. SVG animation"
demo: "anim-smil-transform"
---

# SMIL — animateTransform

`<animateTransform>`는 transform 속성을 회전·이동·스케일합니다. `additive="sum"`으로 기존 transform에 누적할 수 있습니다.

<LessonDemo id="089" />

## Core API

`buildAnimateTransformMarkup` — `packages/svg-matrix-core/src/animation.js` 또는 `engine.js`

## 관련 강의

- [017 path length](./lesson-017.md) · [018 point at length](./lesson-018.md)
- [051 stroke-dasharray](./lesson-051.md)
- [063 textPath](./lesson-063.md)

## 오늘의 핵심

브라우저가 재생하는 SMIL/CSS와, 편집기가 미리 계산하는 `sampleMotionAlongPath`를 구분하세요. geometry는 svg-matrix, timeline·easing은 css-matrix 부록 B가 담당합니다.
