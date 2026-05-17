---
id: "100"
title: "triangulation with holes"
part: "Part 25. GPU mesh & WAAPI"
demo: "geom-triangulate-holes"
---

# triangulation with holes

브라우저 SVG는 `fill-rule`로 hole을 그려 주지만, **WebGL·Canvas mesh·물리 엔진**은 보통 **삼각형 리스트**가 필요합니다. donut(outer + hole)은 [083](./lesson-083.md) ear clipping을 **bridge**로 확장합니다.

<LessonDemo id="100" />

## 문제 정의

```txt
outer: CCW 사각형 (바깥)
hole:  CW 또는 CCW (안쪽 구멍)
목표: GPU에 넘길 Triangle[]  — 각 항목 [p0, p1, p2]
```

SVG `M … Z M … Z` compound([026](./lesson-026.md))와 같지만, GPU는 **한 번에** 삼각형으로 쪼갭니다.

## API

```js
import { triangulatePolygonWithHoles } from "svg-matrix-core";

const outer = [
  { x: 120, y: 40 },
  { x: 520, y: 40 },
  { x: 520, y: 360 },
  { x: 120, y: 360 }
];
const hole = [
  { x: 220, y: 140 },
  { x: 420, y: 140 },
  { x: 420, y: 260 },
  { x: 220, y: 260 }
];

const { triangles, mergedRing } = triangulatePolygonWithHoles(outer, [hole]);
// triangles: Array<[ {x,y}, {x,y}, {x,y} ]>
// mergedRing: bridge 후 단일 ring (디버그용)
```

여러 hole:

```js
triangulatePolygonWithHoles(outer, [hole1, hole2]);
```

## 알고리즘 (core)

```txt
1. outer shoelace 부호 확인
2. 각 hole — outer와 같은 부호면 reverse (반대 winding 강제)
3. findHoleBridge — outer·hole 꼭짓점 쌍 중 최단 거리
4. mergeHoleIntoRing — bridge edge로 hole을 ring에 “봉합”
5. earClipTriangulate(mergedRing) — [083](./lesson-083.md)
```

bridge 직관:

```txt
outer ──►──┐
           │ bridge (같은 점 두 번 방문)
           hole loop
           └──►── outer 계속
```

## winding

| ring | 관례 |
|------|------|
| outer | CCW (양수 shoelace) |
| hole | **반대** (CW) |

규칙이 어긋나면 ear clip이 잘못된 삼각형을 냅니다. Figma export도 hole subpath 방향을 맞춥니다 ([026](./lesson-026.md)).

## GPU로 넘기기

```js
// WebGL 예 (개념)
const positions = [];
for (const [a, b, c] of triangles) {
  positions.push(a.x, a.y, b.x, b.y, c.x, c.y);
}
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
// gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2)
```

path `d` → flatten segments → outer/hole polygon 추출 → `triangulatePolygonWithHoles` — 편집기 export 파이프의 마지막 단계.

## vs evenodd raster

| | evenodd fill ([014](./lesson-014.md), [102](./lesson-102.md)) | mesh (여기) |
|---|------------------------------|-------------|
| 표현 | 픽셀 parity | 명시적 triangle |
| hole | crossing parity | bridge + ear |
| self-intersect | evenodd 직관적 | 별도 처리 필요 |

실무: **복잡 path**는 libtess.js / earcut — 같은 bridge·ear 아이디어, 더 robust.

## 데모에서 볼 것

- **파란 fill** 삼각형들 — mesh 조각  
- **파란 실선** — outer, **주황 점선** — hole  
- readout: `N triangles`, `mergedRing vertices: …`  

## Core API

- `triangulatePolygonWithHoles`, `earClipTriangulate`, `fanTriangulateConvex`
- `shoelaceArea`, `findHoleBridge` (내부) — `geometry.js`

## 관련

- [083](./lesson-083.md) ear · [084](./lesson-084.md) evenodd · [102](./lesson-102.md) mesh + parity

## 오늘의 핵심

GPU fill = **삼각형 리스트**. hole은 winding 반대 + bridge로 하나의 ring 만든 뒤 ear clip합니다.
