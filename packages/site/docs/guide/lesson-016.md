---
id: "016"
title: "flatten tolerance"
part: "Part 4. Path sampling"
demo: "path-flatten"
---

# flatten tolerance

`stepsPerCurve`로 곡선을 polyline으로 근사할 때 **얼마나 촘촘히 샘플할지**를 정합니다. step이 적으면 빠르지만 stroke·fill·bbox가 틀어질 수 있습니다.

<LessonDemo id="016" />

## uniform flatten

```js
flattenPathSegments(segments, { stepsPerCurve: 12 });
```

`t = 0, 1/n, 2/n, …`에 `cubicBezierPoint`를 찍는 방식입니다. 구현은 단순하지만, 곡선이 급격히 휘는 구간에서는 같은 step으로는 **오차가 큽니다**.

## adaptive flatten — 같은 원리, 다른 멈춤 조건

[052 adaptive flatten](./lesson-052.md)과 [068 de Casteljau](./lesson-068.md)·[069 flatness](./lesson-069.md)는 한 계열입니다.

| 강의 | 멈춤 조건 |
|------|-----------|
| 016 (여기) | 고정 step 수 |
| 069 | `cubicFlatnessError` ≤ tolerance |
| 052 | 069 + `flattenCubicAdaptive` 재귀 분할 |

```js
import { flattenPathSegmentsAdaptive } from "svg-matrix-core";

flattenPathSegmentsAdaptive(segments, { tolerance: 0.5 });
```

`flattenCubicAdaptive`는 중점이 현(chord)에서 tolerance보다 멀면 `subdivideCubicBezier`로 쪼개고 다시 시도합니다.

## 언제 무엇을 쓰나

- **편집 중 preview** — coarse step (016 데모 슬라이더)
- **export / hit test** — adaptive (052) 또는 해석 bbox (012, 008)
- **motion path 균일 속도** — arc length 재매개화 ([017](./lesson-017.md), [018](./lesson-018.md); css-matrix [Motion path](https://github.com/easylogic/css-graphics-geometry) 부록)

## Core API

- `flattenPathSegments`, `flattenPathSegmentsAdaptive`
- `cubicFlatnessError`, `subdivideCubicBezier` — [geometry.js](../../svg-matrix-core/src/geometry.js)

## 오늘의 핵심

고정 step과 adaptive flatten의 차이는 **“몇 점을 찍느냐”**가 아니라 **“언 멈추느냐”**입니다. 068–069에서 그 멈춤 조건을 수식으로 봅니다.
