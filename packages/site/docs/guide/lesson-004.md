---
id: "004"
title: "점에서 stroke까지의 거리"
part: "Part 2. Stroke geometry"
demo: "stroke-hit"
---

# 점에서 stroke까지의 거리

얇은 path를 클릭하기 어렵기 때문에, 편집기는 **보이는 stroke**와 **잡히는 stroke**를 분리합니다. fill hit은 “안/밖”(winding)이고, stroke hit은 **점에서 중심선까지의 거리**입니다.

<LessonDemo id="004" />

## 판정식 (직선 segment)

segment `A→B`와 점 `P`에 대해:

```txt
t = clamp( dot(P−A, B−A) / |B−A|² , 0, 1 )
closest = A + t·(B−A)
d = |P − closest|
HIT  ⇔  d ≤ strokeWidth / 2
```

```js
import { distancePointToSegment } from "svg-matrix-core";

const d = distancePointToSegment(point, segment.from, segment.to);
const hit = d <= strokeWidth / 2;
```

`distancePointToSegment`가 위 `t`·`closest`·`d`를 한 번에 구현합니다.

## 곡선 segment (cubic)

데모 path는 **cubic Bézier**입니다. 직선 polyline으로 거리를 재면 hit/miss가 틀어집니다.

```js
import { closestPointOnCubic, parsePathD } from "svg-matrix-core";

const segments = parsePathD("M 60 300 C 160 80, 480 340, 580 120");
let best = { distance: Infinity, point: { x: 0, y: 0 } };

for (const seg of segments) {
  if (seg.type === "C") {
    const r = closestPointOnCubic(point, seg.from, seg.cp1, seg.cp2, seg.to, {
      samples: 64
    });
    if (r.distance < best.distance) best = r;
  }
}

const hitHelper = best.distance <= hitWidth / 2;   // 넓은 helper band
const onVisibleStroke = best.distance <= strokeWidth / 2;
```

`closestPointOnCubic`은 coarse sample + 국소 refine으로 곡선 위 최근접점을 찾습니다. stroke hit의 일반형은 [076](./lesson-076.md)과 같습니다.

## 데모에서 보는 것

| 시각 요소 | 의미 |
|-----------|------|
| **초록/빨강 반투명 밴드** | hit helper (`hitWidth`) — 클릭 잡기 쉬운 영역 |
| **검은 선** | 실제 `strokeWidth` 중심선 |
| **점선** | 포인터 → 곡선 위 최근접점, 길이 = `d` |
| **파란 테두리 점** | centerline 위 foot |
| **포인터 색** | helper 기준 HIT / miss |

## 브라우저 helper stroke (SVG)

DOM에서는 보이지 않는 넓은 stroke로 pointer를 받기도 합니다:

```xml
<path d="..." stroke="#000" stroke-width="2" />
<path d="..." stroke="transparent" stroke-width="20" pointer-events="stroke" />
```

자체 편집기·Canvas 엔진은 **수학 hit** (`distance` 비교)을 쓰는 편이 일관됩니다. [029](./lesson-029.md)에서 fill hit과 우선순위를 봅니다.

## Canvas 2D와의 대응

```js
// 브라우저: isPointInStroke (path + lineWidth)
if (ctx.isPointInStroke(path2d, x, y)) { /* hit */ }

// 편집기 core: segment graph + distance
```

`isPointInStroke`도 내부적으로 path를 flatten·거리장으로 처리합니다. Figma import pipeline은 **segment graph**를 유지하는 쪽이 수정·스냅에 유리합니다.

## Core API

- `distancePointToSegment` — `L`
- `closestPointOnCubic` — `C` ([geometry.js](../../svg-matrix-core/src/geometry.js))
- 데모: `lesson-app.js` → `mountStrokeHitDemo`, `closestPointOnStrokePath`

## 관련 강의

- [005 join/cap](./lesson-005.md) · [006 stroke align](./lesson-006.md)
- [014 fill rule](./lesson-014.md) · [029 hit priority](./lesson-029.md)
- [076 closest point](./lesson-076.md)

## 오늘의 핵심

stroke hit은 fill hit과 **완전히 다른 코드 경로**입니다. 곡선에서는 반드시 **centerline까지의 최단거리**를 쓰고, helper width는 UX용으로 `strokeWidth`와 분리할 수 있습니다.
