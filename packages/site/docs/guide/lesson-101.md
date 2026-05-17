---
id: "101"
title: "WAAPI + SVG attributes"
part: "Part 25. GPU mesh & WAAPI"
demo: "anim-waapi"
---

# WAAPI + SVG attributes

SMIL이 deprecate 추세인 환경에서는 **`element.animate()`** (Web Animations API)로 SVG 속성을 보간할 수 있습니다. CSS `@keyframes`와 같은 엔진이지만 **DOM 속성**을 직접 건드립니다.

<LessonDemo id="101" />

## Core API

```js
import { startWaapiSvgAnimation, waapiKeyframesForAttribute } from "svg-matrix-core";

const anim = startWaapiSvgAnimation(circleEl, "cx", {
  from: 40,
  to: 600,
  duration: 3000,
  easing: "ease-in-out",
  iterations: Infinity
});
```

## 관련 강의

- [088 SMIL animate](./lesson-088.md)
- css-matrix [048–049 keyframes](../css-matrix) timing

## 오늘의 핵심

WAAPI는 **브라우저 전용**입니다. 오프라인 export·프리뷰는 [094](./lesson-094.md) `sampleMotionAlongPath`처럼 JS 엔진을 씁니다.
