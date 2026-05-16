---
id: "009"
title: "Q — quadratic Bézier"
part: "Part 1. Path grammar"
demo: "path-quad"
---

# Q — quadratic Bézier

control point **하나**인 quadratic. `Q(t) = (1-t)²·P0 + 2(1-t)t·P1 + t²·P2`. 폰트·아이콘 outline, `T`(smooth) 연속에 자주 나옵니다.

<LessonDemo id="009" />

## 점 평가

```js
import { quadraticBezierPoint } from "svg-matrix-core";

const p = quadraticBezierPoint(p0, p1, p2, t);
```

## cubic과 bbox 공식의 차이

quadratic은 2차식이라 **축당 내부 극값이 최대 1개**입니다. 미분 `B′(t) = 2a·t + b`의 근 하나만 보면 됩니다.

```js
import {
  quadraticBezierPolynomialCoeffs,
  quadraticBezierExtremaTimes1D,
  bboxOfQuadraticBezier,
  bezierControlHullBBox
} from "svg-matrix-core";

const cy = quadraticBezierPolynomialCoeffs(p0.y, p1.y, p2.y);
// B(t) = a·t² + b·t + c

const exact = bboxOfQuadraticBezier(p0, p1, p2);
const hull = bezierControlHullBBox([p0, p1, p2]);
```

데모: 회색 = 세 control의 AABB, 주황 = `bboxOfQuadraticBezier`. 곡선은 hull 안에 있지만, tight bbox가 selection에 더 맞습니다.

## Q는 C의 부분집합이 아님

임의 cubic을 quadratic 하나로 **정확히** 표현할 수는 없습니다. 반대로 quadratic은 동일 곡선을 cubic 두 개로 쪼개 표현하는 것은 가능합니다(degree elevation).

## Core API

- `quadraticBezierPoint`
- `quadraticBezierPolynomialCoeffs`, `quadraticBezierExtremaTimes1D`
- `bboxOfQuadraticBezier`

cubic bbox와 같은 패턴이므로, [008](./lesson-008.md)에서 본 `B′(t)=0` 사고방식을 그대로 적용하면 됩니다.

## 오늘의 핵심

- Q는 제어점 하나, bbox는 **2차 극값 + 끝점**으로 구한다.
- control hull은 여전히 빠른 **상한 근사**가 아니라, 곡선이 밖으로 나가면 **과소 추정**할 수 있다.
- 아이콘 그리드에 Q가 많다면 `bboxOfQuadraticBezier`를 segment 루프에 넣으면 된다.
