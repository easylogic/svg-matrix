---
id: "088"
title: "SMIL — animate 속성"
part: "Part 23. SVG animation"
demo: "anim-smil-attribute"
---

# SMIL — animate 속성

SVG 네이티브 SMIL `<animate>`는 opacity·fill·cx 같은 **스칼라 속성**을 from→to로 보간합니다. CSS transition과 비슷하지만 **SVG 요소 안**에 선언합니다.

<LessonDemo id="088" />

## Core API

`buildAnimateMarkup` — `packages/svg-matrix-core/src/animation.js` 또는 `engine.js`

## 관련 강의

- [017 path length](./lesson-017.md) · [018 point at length](./lesson-018.md)
- [051 stroke-dasharray](./lesson-051.md)
- [063 textPath](./lesson-063.md)

## 오늘의 핵심

브라우저가 재생하는 SMIL/CSS와, 편집기가 미리 계산하는 `sampleMotionAlongPath`를 구분하세요. geometry는 svg-matrix, timeline·easing은 css-matrix 부록 B가 담당합니다.
