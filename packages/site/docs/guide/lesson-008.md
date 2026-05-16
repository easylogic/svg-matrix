---
id: "008"
title: "C — cubic Bézier"
part: "Part 1. Path grammar"
demo: "path-cubic"
---

# C — cubic Bézier

네 점 `P0, P1, P2, P3`로 정의되는 cubic Bézier. SVG `C` 명령은 **시작점·제어점 두 개·끝점**을 이어 한 segment를 만듭니다. 렌더·hit test는 보통 `flattenPathSegments`로 polyline을 만든 뒤 처리하지만, **selection bbox**처럼 “곡선이 실제로 차지하는 영역”이 필요할 때는 flatten만으로는 느리거나 부정확할 수 있습니다.

<LessonDemo id="008" />

## 곡선 위의 점: `cubicBezierPoint`

```js
import { cubicBezierPoint } from "svg-matrix-core";

// t ∈ [0, 1]
const p = cubicBezierPoint(p0, p1, p2, p3, t);
```

de Casteljau로 `(1-t)`와 `t`를 반복 섞는 방식과 동일합니다. 편집기 handle을 드래그할 때마다 이 함수로 preview curve를 그립니다.

## flatten과 bbox는 다른 문제

| 목적 | 방법 | 특징 |
|------|------|------|
| 화면에 그리기 | `flattenPathSegments` | step 수에 따라 근사 오차 |
| selection / export crop | **bbox** | 곡선 전체를 덮는 axis-aligned 사각형 |

flatten step을 키우면 bbox도 정확해지지만, 편집기에서는 **매 프레임** bbox를 쓰는 경우가 많아 segment마다 해석적 bbox가 낫습니다.

## control hull vs tight bbox

네 control point 전체의 axis-aligned bbox(**control hull**)는 구현이 쉽고, Bézier 곡선은 네 점의 **convex hull 안**에 들어가므로 이 박스는 곡선을 **항상 덮습니다**(과대 추정). 다만 handle이 멀리 있으면 selection rect가 **불필요하게 큽니다**. 데모 회색 박스가 그 느슨한 상한입니다.

**위험한 경우**는 anchor `P0·P3`만 min/max 할 때입니다. control을 빼면 곡선이 박스 밖으로 나가는데도 rect가 작아집니다.

**tight bbox**는 곡선이 x·y 각 축에서 실제로 도달하는 최소·최대입니다. 끝점 `t=0,1`과, `B′(t)=0`인 내부 `t`만 보면 됩니다. 주황 박스·주황 점이 그 극값들입니다.

## 1차원으로 줄이기: 다항식 계수

x좌표만 보면 `B(t)`는 3차 다항식입니다.

```js
import { cubicBezierPolynomialCoeffs, evalCubicPolynomial } from "svg-matrix-core";

// B(t) = a·t³ + b·t² + c·t + d
const cx = cubicBezierPolynomialCoeffs(p0.x, p1.x, p2.x, p3.x);
const xAt05 = evalCubicPolynomial(cx, 0.5);
```

y도 같은 계수 공식을 y값에 적용합니다.

## 극값: `B′(t) = 0`

미분하면 2차식이 됩니다. `t ∈ (0,1)` 안의 실근을 구한 뒤, 그 `t`와 `0, 1`에서 `B(t)`를 평가해 min/max를 잡습니다.

```js
import {
  cubicBezierExtremaTimes1D,
  bboxOfCubicBezier,
  bezierControlHullBBox
} from "svg-matrix-core";

const times = [
  ...new Set([
    ...cubicBezierExtremaTimes1D(p0.x, p1.x, p2.x, p3.x),
    ...cubicBezierExtremaTimes1D(p0.y, p1.y, p2.y, p3.y)
  ])
];

const exact = bboxOfCubicBezier(p0, p1, p2, p3);
const hull = bezierControlHullBBox([p0, p1, p2, p3]);
// exact ⊆ hull AABB (같거나 더 작은 tight rect)
```

`bboxOfCubicBezier`는 위 후보 `t` 전부에서 `(x,y)`를 평가해 `{ x, y, width, height }`를 반환합니다. 데모 주황 박스·주황 점이 이 극값들입니다.

## Core API

- `cubicBezierPoint`, `cubicBezierTangent`
- `cubicBezierPolynomialCoeffs`, `evalCubicPolynomial`
- `cubicBezierExtremaTimes1D`
- `bboxOfCubicBezier`, `bezierControlHullBBox`

전체 path에 합치는 방법은 [012 path bounding box](./lesson-012.md)에서 `bboxOfPath`로 이어집니다.

## 오늘의 핵심

- cubic은 **네 점**으로 정의되고, 화면용 flatten과 **bbox용 극값**은 별도 계산이다.
- bbox는 control hull이 아니라 **`B′(t)=0` + 끝점**으로 구한다.
- `svg-matrix-core`에 위 함수가 그대로 들어 있으니, 편집기 selection rect에 복사해 쓸 수 있다.
