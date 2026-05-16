---
id: "083"
title: "convex triangulation · ear clipping"
part: "Part 20. Tessellation & pixels"
demo: "geom-triangulate"
---

# convex triangulation · ear clipping

SVG fill을 GPU/Canvas로 그리려면 path를 **삼각형 mesh**로 바꿔야 합니다. convex는 fan, concave는 ear clipping이 고전 해법입니다.

<LessonDemo id="083" />

## convex — fan

```js
import { fanTriangulateConvex } from "svg-matrix-core";

const triangles = fanTriangulateConvex(convexPolygon);
```

첫 꼭짓점을 기준으로 `(v0, vi, vi+1)` 삼각형을 쌓습니다. **오목(concave) 다각형에는 틀립니다.**

## concave — ear clipping

```js
import { earClipTriangulate } from "svg-matrix-core";

const triangles = earClipTriangulate(concavePolygon);
```

“귀(ear)” — 볼록한 꼭짓점 `b`에서 `(a,b,c)` 삼각형 안에 다른 점이 없으면 잘라냅니다. 데모에서 L자형 polygon + `ear` 모드를 선택하세요.

## fill rule과 연결

- [084 evenodd parity](./lesson-084.md) — 픽셀 규칙
- [025–027](./lesson-025.md) — 복잡 path·hole은 libtess급 tessellator가 필요할 수 있음

## Core API

- `fanTriangulateConvex`, `earClipTriangulate`

## 오늘의 핵심

083은 “삼각형으로 쪼개기” 입문입니다. evenodd·hole이 있으면 subpath별 ear clip + winding 정책이 추가됩니다.
