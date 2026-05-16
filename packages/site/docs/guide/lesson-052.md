---
id: "052"
title: "adaptive flatten"
part: "Appendix B. Engine extras"
demo: "engine-adaptive-flatten"
---

# adaptive flatten

허용 오차(tolerance) 안에서만 곡선을 직선으로 볼 수 있을 때 멈추는 flatten입니다. [016 flatten tolerance](./lesson-016.md)의 고정 step 방식보다 **같은 정확도에 점이 적은** 경우가 많습니다.

<LessonDemo id="052" />

## 알고리즘

1. cubic의 중점 `B(½)`와 현 `P0–P3` 사이 거리 = `cubicFlatnessError` ([069](./lesson-069.md))
2. `error ≤ tolerance` → `P3`만 추가하고 종료
3. 아니면 `subdivideCubicBezier` ([068](./lesson-068.md))로 둘로 나누고 각각 재귀

```js
import { flattenCubicAdaptive, flattenPathSegmentsAdaptive, compareFlattenMethods } from "svg-matrix-core";

const points = flattenPathSegmentsAdaptive(segments, { tolerance: 0.5 });
```

`compareFlattenMethods`는 uniform vs adaptive 점 개수를 나란히 비교하는 엔진 유틸입니다.

## Core API

- `flattenCubicAdaptive`, `flattenQuadraticAdaptive`
- `flattenPathSegmentsAdaptive`
- `compareFlattenMethods`

## 오늘의 핵심

052는 016의 엔진 구현체이고, 수학 근거는 068–069에 있습니다. 세 강의를 같이 보면 flatten 전체 그림이 맞습니다.
