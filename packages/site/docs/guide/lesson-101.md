---
id: "101"
title: "WAAPI + SVG attributes"
part: "Part 25. GPU mesh & WAAPI"
demo: "anim-waapi"
---

# WAAPI + SVG attributes

SMIL([088](./lesson-088.md)–[090](./lesson-090.md))이 브라우저마다 축소되는 추세에서, **Web Animations API** `element.animate()`로 SVG 속성을 보간할 수 있습니다. CSS `@keyframes`와 같은 타이밍 엔진이지만 **DOM 속성**을 직접 건드립니다.

<LessonDemo id="101" />

## 최소 예 — `cx` 이동

```js
import { startWaapiSvgAnimation, waapiKeyframesForAttribute } from "svg-matrix-core";

const circle = document.querySelector("circle");

const anim = startWaapiSvgAnimation(circle, "cx", {
  from: 120,
  to: 520,
  duration: 3000,
  iterations: Infinity,
  easing: "ease-in-out"
});

// anim.pause(); anim.playbackRate = 2;
```

내부:

```js
const keyframes = waapiKeyframesForAttribute("cx", 120, 520);
// [ { cx: 120 }, { cx: 520 } ]

circle.animate(keyframes, {
  duration: 3000,
  iterations: Infinity,
  easing: "ease-in-out",
  fill: "none"
});
```

## 커스텀 keyframes

```js
startWaapiSvgAnimation(el, "opacity", {
  keyframes: [
    { opacity: 0.2, offset: 0 },
    { opacity: 1, offset: 0.5 },
    { opacity: 0.2, offset: 1 }
  ],
  duration: 4000,
  easing: "linear"
});
```

`attributeName`은 keyframes 객체의 키와 맞춥니다 (`cx`, `cy`, `r`, `opacity`, `stroke-width` …).

## SMIL / CSS / WAAPI / JS

| | 선언 | 실행 | 오프라인 |
|---|------|------|----------|
| SMIL | SVG 자식 | 브라우저 | markup만 export |
| CSS | stylesheet | 브라우저 | CSS 파일 |
| WAAPI | JS | 브라우저 | keyframes 재현 필요 |
| JS [094](./lesson-094.md) | rAF | 자체 | 편집기 preview |

## 데모

- 파란 **circle** — `cx` 120↔520 반복  
- readout: `keyframes=[{"cx":120},{"cx":520}]`, `playbackRate`  

`waapiKeyframesForAttribute("cx", 120, 520)` 출력과 일치하는지 확인하세요.

## 한계

- **브라우저 전용** — `startWaapiSvgAnimation`은 `element.animate` 없으면 throw  
- **`d` path morph** — WAAPI로 가능하지만 compatible topology 필요 ([093](./lesson-093.md)); SMIL/CSS path보다 JS morph가 흔함  
- **path along motion** — `animateMotion` 대신 [094](./lesson-094.md) `sampleMotionAlongPath` + `cx`/`cy` 또는 CSS `offset-path`([092](./lesson-092.md))  
- Figma timeline export — 보통 **자체 keyframe 엔진** + css-matrix easing  

## 플러그인에서 쓰는 패턴

```js
// Live preview (브라우저)
startWaapiSvgAnimation(node, "opacity", { from: 0, to: 1, duration: 500 });

// Export to CSS
// @keyframes { from { opacity: 0 } to { opacity: 1 } }
```

## Core API

- `startWaapiSvgAnimation`, `waapiKeyframesForAttribute` — `animation.js`
- `SVG_ANIMATION_TOPIC_MAP` — Part 23–25 인덱스

## 관련

- [088](./lesson-088.md) SMIL · css-matrix timing / easing  
- [094](./lesson-094.md) JS motion (오프라인)

## 오늘의 핵심

WAAPI = **런타임 SVG attribute 애니**. export·프리뷰 타임라인은 [094](./lesson-094.md)처럼 core sampling이 담당합니다.
