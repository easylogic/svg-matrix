---
id: "019"
title: "linearGradient 좌표"
part: "Part 5. Paint servers"
demo: "gradient-units"
---

# linearGradient 좌표

`linearGradient`는 **축 위 스칼라 t**로 stop 색을 보간합니다. Figma linear fill의 두 handle과 같은 1D 기하입니다 — path segment와는 별개입니다.

<LessonDemo id="019" />

## 데모에서 볼 것

- `rect` fill `url(#grad)` — `userSpaceOnUse`  
- gradient 축: `(x1,y1)=(160,100)` → `(x2,y2)=(480,100)` (수평)  
- stops: `#2563eb` → `#22c55e` → `#f59e0b`  
- **빨간 점** — 포인터 위치  

readout (pointermove):

```txt
userSpace t=0.312 (project onto gradient axis)
objectBoundingBox (0-1)=(0.312, 0.000)
mapped to userSpace=(260.0, 100.0)
```

bbox `{ x:160, y:100, width:320, height:200 }` — [012](./lesson-012.md)와 연결.

## stop 파라미터 t

```js
import { linearGradientStopParameter, sampleLinearGradient } from "svg-matrix-core";

const start = { x: 160, y: 100 };
const end = { x: 480, y: 100 };
const bbox = { x: 160, y: 100, width: 320, height: 200 };

const t = linearGradientStopParameter(point, start, end);
// t = dot(P - start, end - start) / |end - start|²
```

| t | 의미 |
|---|------|
| `0` | start stop 색 |
| `1` | end stop 색 |
| `<0` or `>1` | [034](./lesson-034.md) `spreadMethod` (pad / reflect / repeat) |

## gradientUnits

| 값 | start/end 좌표 |
|----|----------------|
| `userSpaceOnUse` | SVG user space (px) — 데모 |
| `objectBoundingBox` | 0–1 정규화 → bbox로 변환 |

```js
import { objectBoundingBoxToUserSpace } from "svg-matrix-core";

const normalized = { x: 0.5, y: 0 };
const pUser = objectBoundingBoxToUserSpace(normalized, bbox);
// (320, 100) — rect 중앙 상단
```

편집기: handle drag → `x1,y1,x2,y2` 또는 box 좌표 갱신.

## 샘플링

```js
const result = sampleLinearGradient(point, {
  x1: 0, y1: 0, x2: 1, y2: 0,
  gradientUnits: "objectBoundingBox",
  spreadMethod: "pad",
  stops: [
    { offset: 0, color: { r: 37, g: 99, b: 235, a: 1 } },
    { offset: 1, color: { r: 245, g: 158, b: 11, a: 1 } }
  ]
}, bbox);
// { t, mappedT, color, start, end }
```

Figma export: `figmaLinearGradientPaintToSvg` — [040](./lesson-040.md).

## vs path geometry

```txt
path d     → segments → fill-rule, stroke hit
gradient   → (start, end) → t → RGBA
```

같은 rect에 path fill + gradient fill을 겹칠 수 있습니다 ([020](./lesson-020.md) clip 이후).

## Core API

| 함수 | 역할 |
|------|------|
| `linearGradientStopParameter` | 점 → 축 투영 t |
| `objectBoundingBoxToUserSpace` | 0–1 → px |
| `sampleLinearGradient` | t + spread + stops → color |
| `sampleRadialGradient` | [032](./lesson-032.md) |

## 관련

- [012](./lesson-012.md) bbox · [032](./lesson-032.md) radial · [034](./lesson-034.md) spread · [040](./lesson-040.md) Figma paint

## 오늘의 핵심

gradient는 **1D 보간**입니다. 편집기 파이프: handle → (start,end) → `linearGradientStopParameter` / `sampleLinearGradient` → 픽셀 또는 SVG `<stop>`.
