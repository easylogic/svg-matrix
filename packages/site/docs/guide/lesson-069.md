---
id: "069"
title: "flatness와 chord error"
part: "Part 15. Curve calculus"
demo: "geom-flatness"
---

# flatness와 chord error

곡선 중점 `B(½)`가 끝점 현(chord) `P0–P3`에서 얼마나 떨어져 있는지가 **flatness error**입니다. 이 값이 작으면 “이 구간은 직선으로 봐도 된다”고 말할 수 있습니다.

<LessonDemo id="069" />

## 코드

```js
import { cubicFlatnessError } from "svg-matrix-core";

const err = cubicFlatnessError(p0, p1, p2, p3);
// err ≤ tolerance → flattenCubicAdaptive stops
```

quadratic은 `quadraticFlatnessError` — 같은 아이디어입니다.

## 016 · 052와의 관계

| | 멈춤 기준 |
|---|-----------|
| [016](./lesson-016.md) | 항상 N step |
| [069](./lesson-069.md) | chord error 측정 |
| [052](./lesson-052.md) | error > tolerance면 [068](./lesson-068.md) subdivide 후 재귀 |

## Core API

- `cubicFlatnessError`, `quadraticFlatnessError`
- `flattenCubicAdaptive` (engine.js)

## 오늘의 핵심

flatness는 “곡률이 큰가?”의 저렴한 근사입니다. 정확한 κ는 [070](./lesson-070.md), bbox 극값은 [008](./lesson-008.md)에서 다룹니다.
