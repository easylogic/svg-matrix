---
id: "099"
title: "degree elevation Q→C"
part: "Part 24. Motion precision"
demo: "geom-degree-elevate"
---

# degree elevation Q→C

quadratic 하나는 **동일 곡선**의 cubic segment로 올릴 수 있습니다 — export를 cubic-only로 통일.

<LessonDemo id="099" />

## 데모에서 볼 것

```txt
Q: M 80 140  Q 200 30  520 140   (주황 dash)
C: elevateQuadraticToCubic → 파랑 실선 + cp1·cp2 점
```

- readout: Q vs C **최대 오차** (~1e-15 수준)  
- control **p1·p2** (연한 파랑 원) — 직관과 다른 위치, 형태 동일  

```js
import { elevateQuadraticToCubic, cubicBezierPoint } from "svg-matrix-core";

const { p0, p1, p2, p3 } = elevateQuadraticToCubic(p0, p1, p2);
```

## 수식

```txt
p1' = p0 + (2/3)(p1 − p0)
p2' = p2 + (2/3)(p1 − p2)
p3  = p2
```

임의 t에서 Q(t) = C(t).

## UI 패턴

UI는 **3점 quadratic handle**, storage는 cubic segments ([021](./lesson-021.md)).

## vs subdivide

[068](./lesson-068.md) — C를 잘게 쪼개기. C→Q downgrade는 비표준.

## Core API

| 함수 | 역할 |
|------|------|
| `elevateQuadraticToCubic` | `{ p0, p1, p2, p3 }` |

## 관련

- [009](./lesson-009.md) Q · [008](./lesson-008.md) C · [040](./lesson-040.md) Figma cubic

## 오늘의 핵심

제어점은 직관적이지 않아도 **형태는 보존** — [009](./lesson-009.md) 후 elevation으로 파이프라인 하나로.
