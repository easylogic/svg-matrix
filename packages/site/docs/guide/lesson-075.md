---
id: "075"
title: "line ∩ cubic · curve ∩ curve"
part: "Part 16. Intersection & proximity"
demo: "geom-line-cubic-ix"
---

# line ∩ cubic · curve ∩ curve

교점 계산은 스냅, trim, boolean 전처리의 기초입니다.

<LessonDemo id="075" />

## 직선 ∩ cubic

```js
import { lineCubicIntersections } from "svg-matrix-core";

const hits = lineCubicIntersections(p0, p1, p2, p3, lineStart, lineEnd);
// [{ t, point }, ...]
```

샘플링으로 구간을 찾고 구간 안에서 거리를 refine합니다.

## cubic ∩ cubic

```js
import { cubicCubicIntersections } from "svg-matrix-core";

const hits = cubicCubicIntersections(
  a0, a1, a2, a3,
  b0, b1, b2, b3,
  { tolerance: 0.75 }
);
```

양쪽 curve의 bbox가 겹치지 않으면 건너뜁니다. 둘 다 충분히 flat하면 **현(chord)끼리** 교차를 검사하고, 아니면 [068 subdivide](./lesson-068.md)로 2×2 자식 쌍을 재귀합니다.

별도 데모: `geom-curve-curve-ix` (lesson runtime).

## Core API

- `lineCubicIntersections`, `lineQuadraticIntersections`
- `cubicCubicIntersections`
- `lineSegmentIntersection` — [074](./lesson-074.md)

## 오늘의 핵심

곡선–곡선 교차는 전역 방정식보다 **subdivide + flatness**가 편집기 코드와 같은 패턴입니다 (052·069와 동일 계열).
