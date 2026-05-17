---
id: "102"
title: "evenodd fill + triangle mesh"
part: "Part 25. GPU mesh & WAAPI"
demo: "geom-evenodd-pixel"
---

# evenodd fill + triangle mesh

`fill-rule="evenodd"`는 ray crossing parity로 안/밖을 정합니다. self-intersection·hole이 있는 shape는 **규칙 + mesh**를 함께 이해해야 합니다.

<LessonDemo id="102" />

## parity

```js
import { evenoddParityFromRayCast } from "svg-matrix-core";

const inside = evenoddParityFromRayCast(point, polygon);
```

## mesh

[100](./lesson-100.md) `triangulatePolygonWithHoles`로 GPU에 넘길 triangle list를 만듭니다. evenodd는 **픽셀 래스터** 규칙, triangulation은 **geometry 분해**입니다.

## 오늘의 핵심

bow-tie·donut은 evenodd로 “구멍”을 표현할 수 있지만, GPU path는 hole을 명시적으로 triangulate하는 편이 안전합니다.
