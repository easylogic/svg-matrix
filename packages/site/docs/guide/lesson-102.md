---
id: "102"
title: "evenodd fill + triangle mesh"
part: "Part 25. GPU mesh & WAAPI"
demo: "geom-evenodd-pixel"
---

# evenodd fill + triangle mesh

Part 25 **마무리** — [014](./lesson-014.md) `fill-rule="evenodd"`(픽셀·winding)와 [100](./lesson-100.md) **triangle mesh**(GPU)는 같은 도형을 **다른 방식**으로 채웁니다. 둘 다 알아야 export·렌더 파이프를 고를 수 있습니다.

<LessonDemo id="102" />

## evenodd — ray parity

```js
import { evenoddParityFromRayCast, classifyPointInPath } from "svg-matrix-core";

const polygon = [
  { x: 200, y: 120 },
  { x: 440, y: 120 },
  { x: 440, y: 300 },
  { x: 200, y: 300 }
];

const point = { x: 320, y: 210 };
const insideEo = evenoddParityFromRayCast(point, polygon);
const c = classifyPointInPath(point, parsePathD(`M ${polygon.map(p=>`${p.x} ${p.y}`).join(" L ")} Z`), "evenodd");
// insideEo ≈ c.insideEvenOdd
```

### 알고리즘

수평 ray → edge와 교차할 때마다 crossing +1 → **홀수면 inside**.

[030](./lesson-030.md) scanline fill은 y 고정 후 x를 훑으며 **같은 parity flip**을 합니다 ([084](./lesson-084.md)).

### bow-tie · self-intersect ([027](./lesson-027.md))

```txt
nonzero: winding 누적
evenodd: crossing 홀수/짝수 — 중앙 “리본”이 비는 경우 많음
```

데모는 **단순 사각형** + 중앙 테스트 점 — 초록(inside) / 빨강(outside). 별·8자 path는 [027](./lesson-027.md) 데모와 함께 보세요.

## triangle mesh — GPU path

```js
import { triangulatePolygonWithHoles, earClipTriangulate } from "svg-matrix-core";

// donut
const { triangles } = triangulatePolygonWithHoles(outer, [hole]);

// WebGL: positions buffer → drawArrays(TRIANGLES)
```

[083](./lesson-083.md) 입문 → [100](./lesson-100.md) hole — **명시적** 구멍.

## 두 파이프 비교

```txt
SVG 브라우저 렌더:
  path d + fill-rule → rasterizer (evenodd / nonzero)

편집기 / WebGL:
  path d → polygons → triangulate → GPU triangles
```

| 상황 | 권장 |
|------|------|
| 정적 SVG export | `fill-rule` attribute만 |
| WebGL 게임·지도 | mesh + hole bridge |
| CPU preview 픽셀 | scanline / `evenoddParityFromRayCast` |
| 복잡 self-intersect | evenodd raster **또는** boolean 후 mesh |

## evenodd만으로 hole?

compound path + evenodd([026](./lesson-026.md))로 donut을 **한 path**로 그릴 수 있습니다. GPU는 여전히 **hole을 명시**하는 mesh([100](./lesson-100.md))가 안전합니다 — parity와 triangle winding이 섞이지 않습니다.

## Canvas 2D vs mesh

| API | hole / evenodd |
|-----|----------------|
| `ctx.fill(path, "evenodd")` | 브라우저가 처리 |
| `ctx.fill(triangles)` | 직접 mesh — [085](./lesson-085.md) gaussian 등과 합성 |

[000](./lesson-000.md) — SVG vs Canvas 역할 분담.

## 데모에서 볼 것

- 파란 **사각형** fill  
- 중앙 **점** — `evenoddParityFromRayCast` → inside면 초록, outside면 빨강  
- readout: parity / scanline flip 설명  

## Part 25 학습 순서

```txt
100 triangulation holes → 101 WAAPI (브라우저 애니) → 102 evenodd vs mesh (정리)
```

Part 23–24 애니([088](./lesson-088.md)–[099](./lesson-099.md))와 연결: **공간**은 svg-matrix, **시간** easing은 css-matrix.

## Core API

- `evenoddParityFromRayCast`, `classifyPointInPath`
- `triangulatePolygonWithHoles`, `earClipTriangulate`
- `SVG_ANIMATION_TOPIC_MAP` — [101](./lesson-101.md)

## 오늘의 핵심

evenodd = **픽셀 규칙**, mesh = **기하 분해**. bow-tie는 evenodd가 직관적이고, GPU는 hole을 bridge해서 삼각형으로 넘기세요.
