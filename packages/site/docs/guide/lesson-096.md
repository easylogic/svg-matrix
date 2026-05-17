---
id: "096"
title: "cubic–cubic intersection"
part: "Part 24. Motion precision"
demo: "geom-curve-curve-ix"
---

# cubic–cubic intersection

두 cubic Bézier가 만나는 지점은 벡터 편집기의 **스냅·교차 마커**에 쓰입니다. control hull로 후보 구간을 줄인 뒤 세분·Newton으로 정밀화합니다.

<LessonDemo id="096" />

## Core API

`cubicCubicIntersections` — `packages/svg-matrix-core/src/geometry.js`

## 관련 강의

- [075 line & curve intersection](./lesson-075.md)
- [068 subdivide](./lesson-068.md) · [008 cubic bbox](./lesson-008.md)

## 오늘의 핵심

curve–curve는 line–cubic보다 후보가 많습니다. hull 분할 없이 전 구간을 훑으면 비용이 큽니다. 데모에서 두 곡선을 드래그하며 교차 개수 변화를 관찰하세요.
