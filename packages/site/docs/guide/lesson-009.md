---
id: "009"
title: "Q — quadratic Bézier"
part: "Part 1. Path grammar"
demo: "path-quad"
---

# Q — quadratic Bézier

control point **하나**인 2차 Bézier. SVG `Q`는 `P0`(시작), `P1`(control), `P2`(끝)로 정의됩니다. 폰트 glyph·아이콘·`T` smooth([010](./lesson-010.md))에 자주 나옵니다.

<LessonDemo id="009" />

## 문법

```txt
Q cpx cpy, x y
```

```js
import { parsePathD } from "svg-matrix-core";

const segments = parsePathD("M 80 320 Q 200 40 360 320");
const q = segments.find((s) => s.type === "Q");
// { type: "Q", from, cp, to }
```

## 점 평가

```js
import { quadraticBezierPoint } from "svg-matrix-core";

const p = quadraticBezierPoint(p0, p1, p2, t);
// Q(t) = (1-t)²·P0 + 2(1-t)t·P1 + t²·P2
```

[008](./lesson-008.md) `cubicBezierPoint`와 같은 de Casteljau 패턴, control이 하나 적습니다.

## bbox — 2차라 더 단순

quadratic은 축당 **내부 극값이 최대 1개** (`B′(t)=0` 근 하나).

```js
import {
  quadraticBezierPolynomialCoeffs,
  quadraticBezierExtremaTimes1D,
  bboxOfQuadraticBezier,
  bezierControlHullBBox
} from "svg-matrix-core";

const exact = bboxOfQuadraticBezier(p0, p1, p2);
const hull = bezierControlHullBBox([p0, p1, p2]);
```

### 데모에서 볼 것

- 파란 **Q 곡선**  
- **회색 점선** — control hull (세 점 AABB)  
- **주황 실선** — `bboxOfQuadraticBezier` tight box  
- readout: 두 bbox 크기 비교 — hull이 더 크거나 같음  

곡선이 hull **밖**으로 나가면 hull은 과소 추정이 아니라 여전히 상한입니다. anchor만 min/max할 때만 위험([008](./lesson-008.md)).

## stroke / hit

```js
import { closestPointOnQuadratic } from "svg-matrix-core";

const { t, point, distance } = closestPointOnQuadratic(P, p0, p1, p2, { samples: 32 });
```

[004](./lesson-004.md) cubic은 `closestPointOnCubic` — Q segment는 전용 함수.

## Q ↔ C

| | quadratic | cubic |
|---|-----------|-------|
| control 수 | 1 | 2 |
| 임의 곡선 표현 | 제한적 | 대부분 path |
| 정확 변환 | → cubic **elevation** ([099](./lesson-099.md)) | → Q downgrade는 비일반적 |

```js
import { elevateQuadraticToCubic } from "svg-matrix-core";
// 동일 곡선의 C segment 하나
```

편집기 storage는 cubic-only, import에 Q가 있으면 elevation 또는 그대로 Q segment 유지.

## flatten

[016](./lesson-016.md) — `flattenPathSegments`가 Q마다 `stepsPerCurve` 샘플.

## Core API

- `quadraticBezierPoint`, `closestPointOnQuadratic`
- `bboxOfQuadraticBezier`, `quadraticBezierExtremaTimes1D`
- `elevateQuadraticToCubic` — [099](./lesson-099.md)

## 관련

- [008](./lesson-008.md) C · [010](./lesson-010.md) T · [072](./lesson-072.md) G¹ reflect

## 오늘의 핵심

Q = 제어점 하나. bbox는 2차 극값 + 끝점. 아이콘·폰트 path에 Q가 많으면 segment 루프에 `bboxOfQuadraticBezier`를 넣으면 selection이 정확해집니다.
