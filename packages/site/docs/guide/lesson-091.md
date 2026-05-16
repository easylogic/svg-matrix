---
id: "091"
title: "stroke dash draw-on"
part: "Part 23. SVG animation"
demo: "anim-dash-draw"
---

# stroke dash draw-on

`pathLength` + `stroke-dasharray` = 전체 길이, `stroke-dashoffset`을 0으로 애니하면 **선이 그려지는** 효과입니다. 아이콘 로딩·지도 경로 reveal에 흔합니다.

<LessonDemo id="091" />

## Core API

`strokeDashDrawKeyframes` — `packages/svg-matrix-core/src/animation.js` 또는 `engine.js`

## 관련 강의

- [017 path length](./lesson-017.md) · [018 point at length](./lesson-018.md)
- [051 stroke-dasharray](./lesson-051.md)
- [063 textPath](./lesson-063.md)

## 오늘의 핵심

브라우저가 재생하는 SMIL/CSS와, 편집기가 미리 계산하는 `sampleMotionAlongPath`를 구분하세요. geometry는 svg-matrix, timeline·easing은 css-matrix 부록 B가 담당합니다.
