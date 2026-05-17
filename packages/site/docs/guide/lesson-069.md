---
id: "069"
title: "flatness와 chord error"
part: "Part 15. Curve calculus"
demo: "geom-flatness"
---

# flatness와 chord error

곡선 **중점** `B(½)`가 끝점 **현(chord)** `P0–P3`에서 얼마나 떨어져 있는지가 **flatness error**입니다. 이 값이 tolerance 이하면 “이 구간은 직선으로 봐도 된다”고 말할 수 있습니다.

<LessonDemo id="069" />

## 데모에서 볼 것

- 회색 **cubic** + 점선 **chord** (`P0`–`P3`)  
- toolbar **tolerance** 0–20 px  
- readout: `cubicFlatnessError = … px` — chord에 대한 **수직 거리**(cross/chordLen)  

tolerance를 **낮추면** adaptive flatten([052](./lesson-052.md))이 더 많이 subdivide([068](./lesson-068.md))합니다.

## 측정 — `cubicFlatnessError`

```js
import { cubicFlatnessError } from "svg-matrix-core";

const err = cubicFlatnessError(p0, p1, p2, p3);
// B(½)에서 chord P0→P3까지의 수직 거리 (px)
```

```txt
err = |(mid − P0) × chord| / |chord|
```

`chordLen ≈ 0`이면 끝점 거리로 fallback — degenerate segment.

quadratic:

```js
import { quadraticFlatnessError } from "svg-matrix-core";
```

## adaptive flatten과의 관계

`engine.js`의 `flattenCubicAdaptive`는 **동일한 기하**를 `distancePointToSegment(B(½), P0, P3)`로 검사합니다.

```js
import { flattenCubicAdaptive, flattenPathSegmentsAdaptive } from "svg-matrix-core";

flattenCubicAdaptive(p0, p1, p2, p3, tolerance, points);
flattenPathSegmentsAdaptive(segments, { tolerance: 0.5 });
```

| 강의 | 멈춤 기준 | 점 개수 |
|------|-----------|---------|
| [016](./lesson-016.md) | 고정 `stepsPerCurve` | 예측 가능·항상 많음 |
| **069 (여기)** | chord error ≤ ε | 곡률에 비례 |
| [052](./lesson-052.md) | 전체 path + `compareFlattenMethods` | fixed vs adaptive 비교 데모 |

## flatness vs 다른 “곡률” 지표

| 지표 | 비용 | 의미 |
|------|------|------|
| **flatness (chord)** | 매우 저렴 | “직선으로 대체해도 되나?” |
| [070](./lesson-070.md) `cubicCurvatureAt` κ | 미분 2회 | offset·법선·화살표 |
| [008](./lesson-008.md) bbox 극값 | 중간 | selection tight box |

급격한 코너는 flatness가 크게 나와 subdivide가 깊어집니다 — [078](./lesson-078.md) offset cusp와는 다른 현상.

## 교차 알고리즘

[075](./lesson-075.md) `cubicCubicIntersections` — 두 cubic이 각각 flat하면 control hull chord로 교차 검사, 아니면 [068](./lesson-068.md) subdivide. flatness가 **broad-phase** 역할.

## 함정

- **픽셀 tolerance** — zoom·viewBox에 맞게 ε 스케일 (world units vs screen px)  
- flatness는 **전역 최대 오차** 보장이 아님 — 구간 중점만 검사; 극히 pathological handle에서는 subdivide depth로 수렴  
- arc `A` — `arcSegmentToCubics` 후 cubic에 동일 adaptive ([053](./lesson-053.md))

## Core API

- `cubicFlatnessError`, `quadraticFlatnessError` — `geometry.js`
- `flattenCubicAdaptive`, `flattenPathSegmentsAdaptive` — `engine.js`

## 관련

- [068](./lesson-068.md) subdivide · [052](./lesson-052.md) · [017](./lesson-017.md) length sampling 품질

## 오늘의 핵심

flatness는 “곡률이 큰가?”의 **저렴한 근사**입니다. flatten·intersection·boolean에서 ε 하나로 품질–성능을 맞추고, 정밀 법선·κ는 [070](./lesson-070.md)으로 넘기세요.
