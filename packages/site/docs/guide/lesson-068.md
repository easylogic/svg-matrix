---
id: "068"
title: "de Casteljau subdivision"
part: "Part 15. Curve calculus"
demo: "geom-subdivide"
---

# de Casteljau subdivision

cubic Bézier는 control polygon의 **중점을 반복해서 잇는 것**으로, 곡선 위의 점 `B(t)`와 곡선을 둘로 나누는 계산을 **한 번에** 줍니다. [008](./lesson-008.md) `cubicBezierPoint`와 같은 기하입니다.

<LessonDemo id="068" />

## 데모에서 볼 것

- toolbar **split depth** 0–4  
- depth `d` → **2ᵈ**개의 sub-cubic, 색이 구간마다 다름  
- depth 0: 원래 한 곡선 (`M 60 300 C 120 60 520 360 580 120`)  
- readout: `left.p3 === right.p0` — 분할점이 곡선 위의 **t = ½**  

## t = ½에서 나누기

```js
import { subdivideCubicBezier } from "svg-matrix-core";

const { left, right } = subdivideCubicBezier(p0, p1, p2, p3);
// left:  [p0, m01, m012, mid]
// right: [mid, m123, m23, p3]
// left.p3 === right.p0  (곡선 위 동일 점)
```

```txt
P0 ──m01── P1 ──m12── P2 ──m23── P3
      ╲      ╱         ╲      ╱
       m012            m123
          ╲          ╱
            mid  ← B(½)
```

임의 `t` 분할은 de Casteljau를 `t`와 `1−t` 비율로 일반화합니다. core는 **½**만 export — adaptive·교차 알고리즘에 충분.

## quadratic

```js
import { subdivideQuadraticBezier } from "svg-matrix-core";
```

[009](./lesson-009.md) Q segment — `flattenQuadraticAdaptive`([engine.js](../../svg-matrix-core/src/engine.js))도 동일 패턴.

## 어디에 쓰이나

| 용도 | 연결 |
|------|------|
| adaptive flatten | [052](./lesson-052.md) `flattenCubicAdaptive` — err > ε면 split 후 재귀 |
| cubic ∩ cubic | [075](./lesson-075.md) `cubicCubicIntersections` — flat하면 chord 교차, 아니면 subdivide |
| 편집기 knife | segment를 두 개의 `C`로 교체 |
| clip / boolean | 곡선을 직선에 가까운 조각으로 분해 |

[016](./lesson-016.md) **uniform** flatten은 subdivide 없이 `t = k/n`만 샘플 — 다른 알고리즘.

## 재귀 직관

```txt
flattenCubicAdaptive:
  if mid→chord 거리 ≤ tolerance → 끝
  else subdivide → 왼쪽·오른쪽 각각 재귀
```

한 단계 재귀 = `subdivideCubicBezier` 한 번. depth 4 데모 ≈ tolerance를 매우 작게 준 adaptive의 “모든 구간을 쪼갠” 모습.

## Core API

| 함수 | 파일 |
|------|------|
| `subdivideCubicBezier`, `subdivideQuadraticBezier` | `geometry.js` |
| `flattenCubicAdaptive`, `flattenPathSegmentsAdaptive` | `engine.js` |
| `cubicCubicIntersections` | `geometry.js` — 내부 subdivide |

## 관련

- [069](./lesson-069.md) 언제 멈출지 · [052](./lesson-052.md) path 전체 · [008](./lesson-008.md) C

## 오늘의 핵심

de Casteljau는 “그리기”와 “쪼개기”가 같은 연산입니다. adaptive flatten·curve intersection의 재귀 한 단계가 바로 `subdivideCubicBezier`입니다.
