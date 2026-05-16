---
id: "012"
title: "path bounding box"
part: "Part 1. Path grammar"
demo: "path-bbox"
---

# path bounding box

편집기 selection marquee, `viewBox` 자동 맞춤, export crop은 **path 전체를 덮는 axis-aligned bbox**가 필요합니다. [008](./lesson-008.md)·[009](./lesson-009.md)에서 segment 하나의 cubic/quadratic bbox를 봤다면, 이제 **여러 segment를 합치는** 방법입니다.

<LessonDemo id="012" />

## 세 가지 방법

| 방법 | API | 언제 쓰나 |
|------|-----|-----------|
| Control hull (전체) | `bezierControlHullBBox([p0,cp…,p3])` | 안전하지만 **느슨** — handle이 멀면 selection이 큼 |
| Anchor만 | 끝점만 min/max | **과소 추정** — 편집기에서 흔한 실수 |
| 해석 (권장) | `bboxOfCubicBezier` / `bboxOfQuadraticBezier` → `bboxOfPath` | C·Q segment, selection UI |
| Flatten sample | `bboxOfPathSampled` 또는 `bboxOfPath(..., { mode: "sample" })` | 레거시·arc만 있을 때·검증용 |

데모에서 `exact`와 `sample`은 비슷하고, `hull`은 같은 곡선을 더 크게 덮는 경우가 보입니다. anchor만 쓰면 잘리는 이유는 코드에 `bezierControlHullBBox([p0, p3])`처럼 control을 빼면 바로 재현됩니다.

## segment별로 합치기

```js
import { bboxOfPath, bboxOfPathSampled, parsePathD } from "svg-matrix-core";

const segments = parsePathD('M 120 300 C 200 40, 440 360, 520 80');

// 기본: M/L/C/Q는 해석, A(arc)만 sampling
const exact = bboxOfPath(segments);

// 예전 방식: 전부 flatten 후 min/max
const sampled = bboxOfPath(segments, { mode: "sample", stepsPerCurve: 24 });
// bboxOfPathSampled(segments, { stepsPerCurve: 24 }) 와 동일
```

`bboxOfPath` 내부는 segment type별로:

- `L` — 끝점 min/max
- `C` — `bboxOfCubicBezier(from, cp1, cp2, to)`
- `Q` — `bboxOfQuadraticBezier(from, cp, to)`
- `A` — arc를 cubic으로 쪼갠 뒤 sample (`stepsPerArc`)

각 segment bbox를 `union`해 path bbox를 만듭니다.

## cubic 한 segment 전체 코드 (복습)

```js
import {
  cubicBezierExtremaTimes1D,
  cubicBezierPolynomialCoeffs,
  evalCubicPolynomial,
  bboxOfCubicBezier
} from "svg-matrix-core";

function bboxOfCubicBezier(p0, p1, p2, p3) {
  const xC = cubicBezierPolynomialCoeffs(p0.x, p1.x, p2.x, p3.x);
  const yC = cubicBezierPolynomialCoeffs(p0.y, p1.y, p2.y, p3.y);
  const times = [...new Set([
    ...cubicBezierExtremaTimes1D(p0.x, p1.x, p2.x, p3.x),
    ...cubicBezierExtremaTimes1D(p0.y, p1.y, p2.y, p3.y)
  ])];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const t of times) {
    const x = evalCubicPolynomial(xC, t);
    const y = evalCubicPolynomial(yC, t);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
```

(실제 구현은 `packages/svg-matrix-core/src/index.js`에 export되어 있습니다.)

## 실무 팁

- **Padding**: selection UI는 `bbox`에 stroke width·handle radius만큼 `pad`를 더합니다.
- **Arc**: 해석 bbox는 타원 호에 더 복잡합니다. 이 코스는 arc→cubic 후 sample합니다 ([065 arc flatten](./lesson-065.md)).
- **검증**: `bboxOfPath` vs `bboxOfPathSampled(..., { stepsPerCurve: 64 })` 차이가 1px 미만이면 sampling 구현이 맞습니다.

## Core API

- `bboxOfPath`, `bboxOfPathSampled`
- `bboxOfCubicBezier`, `bboxOfQuadraticBezier`
- `bezierControlHullBBox`

## 오늘의 핵심

- tight bbox는 **B′(t)=0 극값**으로 구한다. 네 control AABB는 안전하지만 느슨하다.
- **끝점만** bbox하면 곡선이 잘린다 — control을 반드시 포함하거나 `bboxOfCubicBezier`를 쓴다.
- `bboxOfPath`는 C/Q를 해석으로, arc는 sample로 합친다.
- flatten bbox는 여전히 유용하지만, step이 부족하면 **과소** 추정한다.
