---
id: "056"
title: "coordinate stack"
part: "Part 12. Primer"
demo: "primer-coordinate-stack"
---

# coordinate stack

포인터를 **viewport px → user space (viewBox)** 로 옮기는 체인입니다.

<LessonDemo id="056" />

## 데모에서 볼 것

- 640×420 SVG — **mousemove** 시 파란 원  
- readout:
  - `explainCoordinateStack`의 `note`  
  - `pointer(px)=(…)`  
  - `user=(…)` — `svgPoint`와 동일 user space  

## API

```js
import { explainCoordinateStack } from "svg-matrix-core";

explainCoordinateStack(
  { x: 320, y: 210 },              // pointer in viewport px
  { width: 640, height: 420 },
  { x: 0, y: 0, width: 640, height: 420 }
);
// { pointer, viewport, viewBox, userSpace, scale, note }
```

데모는 client 대신 **SVG element 기준 px**를 pointer로 넘깁니다. 실제 앱에서는 `getBoundingClientRect()` + `createSVGPoint()` + `matrixTransform`이 동일 역할입니다.

## 스택

```txt
pointer (viewport px)
  → userSpace (viewBox units)
  → (optional) local path transform
```

[015](./lesson-015.md) fill hit · [021](./lesson-021.md) handle drag는 **user space** 좌표.

## 흔한 버그

| 증상 | 원인 |
|------|------|
| hit 어긋남 | viewBox ≠ CSS width/height |
| retina blur | devicePixelRatio vs viewBox |

## Core API

| 함수 | 역할 |
|------|------|
| `explainCoordinateStack` | pointer·userSpace·scale·note |

## 관련

- [001](./lesson-001.md) · [015](./lesson-015.md) · [055](./lesson-055.md)

## 오늘의 핵심

hit test 전에 **한 user-space**로 통일 — client px를 그대로 쓰지 마세요.
