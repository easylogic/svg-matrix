---
id: "083"
title: "convex triangulation · ear clipping"
part: "Part 20. Tessellation & pixels"
demo: "geom-triangulate"
---

# convex triangulation · ear clipping

path fill을 **삼각형 mesh**로 — GPU/Canvas raster의 전단계입니다.

<LessonDemo id="083" />

## 데모에서 볼 것

- **mode**: `convex fan` | `ear clipping`  
- fan: 볼록 사각형 4점 → `fanTriangulateConvex`  
- ear: **L자 오목** 6점 → `earClipTriangulate`  
- 삼각형마다 다른 fill opacity — 개수 readout  

```txt
fanTriangulateConvex — N triangles
earClipTriangulate — N triangles (L-shaped concave)
```

## API

```js
import { fanTriangulateConvex, earClipTriangulate } from "svg-matrix-core";

fanTriangulateConvex(convexPolygon);
// (v0, vi, vi+1) fan — 오목에 사용 금지

earClipTriangulate(concavePolygon);
// ear = 볼록 꼭짓점 b, (a,b,c) 안에 다른 점 없음
```

## hole

복합 영역 — [100](./lesson-100.md) `triangulatePolygonWithHoles` (bridge + ear clip).

## Core API

| 함수 | 역할 |
|------|------|
| `fanTriangulateConvex` | 볼록 fan |
| `earClipTriangulate` | 오목 ear clip |

## 관련

- [084](./lesson-084.md) parity · [025](./lesson-025.md)–[027](./lesson-027.md) compound

## 오늘의 핵심

083 = **쪼개기 입문**. hole·evenodd는 subpath·winding 정책이 추가됩니다.
