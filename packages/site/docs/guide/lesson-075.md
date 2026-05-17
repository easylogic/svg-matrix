---
id: "075"
title: "line ∩ cubic · curve ∩ curve"
part: "Part 16. Intersection & proximity"
demo: "geom-line-cubic-ix"
---

# line ∩ cubic · curve ∩ curve

교점은 **스냅 마커**, **trim**, **boolean 전처리**, **가이드 교차**의 기초입니다. 3차 방정식을 푸는 대신, 편집기와 같이 **샘플 + subdivide**가 실용적입니다.

<LessonDemo id="075" />

## 직선 ∩ cubic

```js
import { lineCubicIntersections } from "svg-matrix-core";

const hits = lineCubicIntersections(p0, p1, p2, p3, lineStart, lineEnd);
// [{ t, point }, ...]
```

### 알고리즘 (core)

1. `t = 0…1`을 `steps`(기본 48)로 샘플  
2. 각 점에서 **직선까지 거리** — `distancePointToLine`  
3. 거리가 `tol`(0.75px) 안에 들어오는 구간을 찾음  
4. 구간 안에서 `refineCubicLineHit`으로 `t` 정밀화  

데모: 세로 **초록 점선**과 파란 cubic — 주황 점이 교차, readout에 `t=…` 개수.

| 함정 | 설명 |
|------|------|
| `tol` 너무 큼 | 가짜 교차 |
| `tol` 너무 작음 | 접선 근처 miss |
| 짧은 curve | `steps` 늘리기 |

```js
import { lineQuadraticIntersections } from "svg-matrix-core";
// Q segment용 동일 패턴
```

## cubic ∩ cubic

```js
import { cubicCubicIntersections } from "svg-matrix-core";

const hits = cubicCubicIntersections(
  a0, a1, a2, a3,
  b0, b1, b2, b3,
  { tolerance: 0.75 }
);
// [{ point, tA, tB }, ...] — 중복 제거 후
```

### 재귀 subdivide ([068](./lesson-068.md))

```txt
bbox(A) ∩ bbox(B) = ∅  →  skip
둘 다 flat enough     →  chord끼리 lineSegmentIntersection (074)
아니면                →  각각 subdivide → 4쌍 자식 재귀
```

flat 판정은 chord error([069](./lesson-069.md)) 계열. [096](./lesson-096.md) 강의·`geom-curve-curve-ix` 데모에서 두 곡선을 드래그하며 **교차 개수 변화**를 볼 수 있습니다.

## 난이도 비교

| 문제 | 후보 수 | typical 방법 |
|------|---------|----------------|
| segment ∩ segment | 1 | closed form (074) |
| line ∩ cubic | 0–3 | sample + refine |
| cubic ∩ cubic | 0–9 | subdivide + 074 |

## 데모에서 볼 것

1. **075 데모** — 수직선과 cubic, hit 개수·`t`  
2. **096 / geom-curve-curve-ix** — 두 cubic, 주황 교차점  

## Core API

| 함수 | 용도 |
|------|------|
| `lineCubicIntersections` | 가이드·칼라 |
| `lineQuadraticIntersections` | Q path |
| `cubicCubicIntersections` | 스냅·boolean |
| `lineSegmentIntersection` | [074](./lesson-074.md) |

## 관련

- [068 subdivide](./lesson-068.md) · [069 flatness](./lesson-069.md) · [052 adaptive flatten](./lesson-052.md)

## 오늘의 핵심

곡선–곡선은 **전역 대수식보다 subdivide + flat chord**가 svg-matrix·편집기와 같은 패턴입니다. tolerance는 zoom·단위에 맞게 조정하세요.
