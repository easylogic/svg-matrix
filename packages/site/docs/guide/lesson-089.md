---
id: "089"
title: "SMIL — animateTransform"
part: "Part 23. SVG animation"
demo: "anim-smil-transform"
---

# SMIL — animateTransform

`<animateTransform>`로 `transform`을 회전·이동·스케일합니다. [002](./lesson-002.md) matrix와 같은 계열입니다.

<LessonDemo id="089" />

## 데모에서 볼 것

- `<g transform="translate(320,100)">` 안 주황 rect  
- **rotate** 0→360, **4s**  
- readout: `buildAnimateTransformMarkup` XML  

```js
import { buildAnimateTransformMarkup } from "svg-matrix-core";

buildAnimateTransformMarkup({
  type: "rotate",
  from: 0,
  to: 360,
  dur: "4s",
  additive: "sum"
});
```

`additive="sum"` — 기존 transform에 **누적** (translate 고정 + rotate).

## type 표

| type | from / to 예 |
|------|----------------|
| translate | `0,0` → `100,0` |
| rotate | `0` → `360` |
| scale | `1` → `1.5` |
| skewX / skewY | 각도 |

## Core API

| 함수 | 역할 |
|------|------|
| `buildAnimateTransformMarkup` | `<animateTransform>` |

## 관련

- [002](./lesson-002.md) · [080](./lesson-080.md) transform path vs group

## 오늘의 핵심

transform 애니는 보통 **`<g>`** 에 둡니다 — `d`는 local, matrix만 시간에 따라 변합니다.
