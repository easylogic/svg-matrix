---
id: "068"
title: "de Casteljau subdivision"
part: "Part 15. Curve calculus"
demo: "geom-subdivide"
---

# de Casteljau subdivision

cubic Bézier는 control polygon의 **중점을 반복해서 잇는 것**으로, 곡선 위의 점과 곡선을 둘로 나누는 계산을 동시에 줍니다.

<LessonDemo id="068" />

## 왜 flatten과 연결되나

[016](./lesson-016.md) uniform flatten은 `t`를 균등 분할합니다. [052](./lesson-052.md) adaptive flatten은 **곡선이 아직 휘어 있으면** de Casteljau로 쪼갠 뒤 각 조각을 다시 검사합니다.

```js
import { subdivideCubicBezier } from "svg-matrix-core";

const { left, right } = subdivideCubicBezier(p0, p1, p2, p3);
// left.p3 === right.p0  (t=½ 점)
```

## Core API

- `subdivideCubicBezier`, `subdivideQuadraticBezier`
- 엔진: `flattenCubicAdaptive` — [engine.js](../../svg-matrix-core/src/engine.js)

## 다음

- [069 flatness](./lesson-069.md) — 언제 subdivide를 멈출지
- [052 adaptive flatten](./lesson-052.md) — 전체 path에 적용

## 오늘의 핵심

de Casteljau는 “그리기”와 “쪼개기”가 같은 연산입니다. adaptive flatten의 재귀 한 단계가 바로 이 함수입니다.
