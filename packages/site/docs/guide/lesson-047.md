---
id: "047"
title: "path simplification"
part: "Part 11. Icon design"
demo: "icon-simplify"
---

# path simplification

Douglas–Peucker로 flatten polyline 점을 줄여 **파일 크기**를 낮춥니다. 곡선은 먼저 [016](./lesson-016.md) flatten합니다.

<LessonDemo id="047" />

## 데모에서 볼 것

dense wavy `d` (24×24 좌표):

```txt
M 0 12 C 3 2, 9 22, 12 12 C 15 2, 21 22, 24 12 … Z
```

- **회색 polyline** — flatten 원본 점들  
- **파란 path** — `simplifyPathD` 결과  
- **tolerance** 슬라이더 0.2–4  

readout:

```txt
Douglas–Peucker tolerance=1.2
87 flatten points → 12 polyline vertices
M 0 12 L … Z
```

## API

```js
import { simplifyPathD, douglasPeucker, flattenPathSegments, parsePathD } from "svg-matrix-core";

const result = simplifyPathD(densePathD, 1.2, { stepsPerCurve: 12 });
// { d, pointCount, originalCount }

const flat = flattenPathSegments(parsePathD(d), { stepsPerCurve: 12 });
const simplified = douglasPeucker(flat, 1.2);
```

## 파이프라인

```txt
cubic/arc d
  → flattenPathSegments (stepsPerCurve)
  → douglasPeucker(tolerance)
  → M … L … L … (polyline only export)
```

고급: simplified polyline → cubic refit (이 코스 범위 밖).

## vs SVGO · [050](./lesson-050.md)

| | 런타임 `simplifyPathD` | 빌드 SVGO |
|---|------------------------|-----------|
| 시점 | 편집기 export preview | CI minify |
| 제어 | tolerance 슬라이더 | plugin preset |

[044](./lesson-044.md) **snap 후** simplify — 순서 중요.

## Core API

| 함수 | 역할 |
|------|------|
| `simplifyPathD` | `d` in/out + counts |
| `douglasPeucker` | points[] |
| `distancePointToSegment` | DP 거리 ([004](./lesson-004.md)) |

## 관련

- [016](./lesson-016.md) · [050](./lesson-050.md) · [052](./lesson-052.md)

## 오늘의 핵심

simplify = **시각 허용 오차** trade-off. tolerance↑ → 점↓·파일↓·형태 단순화.
