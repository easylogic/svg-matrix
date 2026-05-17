---
id: "100"
title: "triangulation with holes"
part: "Part 25. GPU mesh & WAAPI"
demo: "geom-triangulate-holes"
---

# triangulation with holes

GPU·Canvas2D fill은 **삼각형 mesh**가 필요합니다. 구멍이 있는 polygon은 outer와 hole을 **bridge**로 이어 하나의 ring으로 만든 뒤 ear clipping합니다.

<LessonDemo id="100" />

## Core API

```js
import { triangulatePolygonWithHoles } from "svg-matrix-core";

const outer = [/* CCW */];
const hole = [/* CW, or opposite winding */];
const { triangles, mergedRing } = triangulatePolygonWithHoles(outer, [hole]);
```

## 관련 강의

- [083 triangulation](./lesson-083.md)
- [014 evenodd / nonzero](./lesson-014.md)

## 오늘의 핵심

hole winding은 outer와 **반대**여야 합니다. libtess·earcut 같은 라이브러리도 같은 아이디어입니다.
