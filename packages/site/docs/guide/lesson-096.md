---
id: "096"
title: "cubic–cubic intersection"
part: "Part 24. Motion precision"
demo: "geom-curve-curve-ix"
---

# cubic–cubic intersection

두 cubic Bézier의 **교차점** — hull 분할 + refinement. [075](./lesson-075.md) 보강·편집기 스냅.

<LessonDemo id="096" />

## 데모에서 볼 것

- 두 cubic path — 교차 영역  
- readout: 교차점 좌표 목록 (데모 `geom-curve-curve-ix`)  
- control hull로 broad-phase 후 subdivision  

```js
import { cubicCubicIntersections } from "svg-matrix-core";

cubicCubicIntersections(curveA, curveB, { tolerance: 1e-3 });
// [{ point, tA, tB }, …]
```

## vs [075](./lesson-075.md)

| | 075 | 096 |
|---|-----|-----|
| 초점 | line∩cubic, 개념 | **cubic∩cubic** 전용 |
| 용도 | trim preview | handle snap·boolean 전처리 |

## Core API

| 함수 | 역할 |
|------|------|
| `cubicCubicIntersections` | 교차점 배열 |

## 관련

- [074](./lesson-074.md) segment · [027](./lesson-027.md) self-intersect

## 오늘의 핵심

곡선∩곡선은 **무한히 촘촘히 샘플하면 안 됨** — hull 분할이 비용·정확도 균형입니다.
