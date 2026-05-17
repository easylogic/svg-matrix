---
id: "076"
title: "closest point on curve"
part: "Part 16. Intersection & proximity"
demo: "geom-closest"
---

# closest point on curve

점 `P`에서 곡선까지 **최단거리**와 **foot point**(곡선 위 최근접점)는 stroke hit·스냅·치수·거리 읽기의 공통 형태입니다. 교차([075](./lesson-075.md))와 달리 “곡선 위 어디가 가장 가까운가”만 묻습니다.

<LessonDemo id="076" />

## cubic — `closestPointOnCubic`

```js
import { closestPointOnCubic } from "svg-matrix-core";

const { t, point, distance } = closestPointOnCubic(P, p0, p1, p2, p3, {
  samples: 48
});
```

### 2단계 (core)

1. **Coarse** — `t ∈ [0,1]`을 `samples`등분, `distanceSquared` 최소인 `bestT`  
2. **Refine** — `bestT ± span`을 8회 좁혀 감 (이분에 가까운 국소 탐색)  

S형 곡선처럼 coarse만으로는 잘못된 국소 최소에 걸릴 수 있어 `samples: 48` 이상을 권장합니다.

## quadratic

```js
import { closestPointOnQuadratic } from "svg-matrix-core";
```

동일 패턴, control 점 하나 적음.

## 직선 segment

```js
import { distancePointToSegment } from "svg-matrix-core";
// { distance, t, point } — [004](./lesson-004.md) stroke hit
```

## stroke hit = closest + threshold

[004](./lesson-004.md) 전체 루프:

```js
import { parsePathD, closestPointOnCubic } from "svg-matrix-core";

let best = { distance: Infinity, point: null, t: 0 };

for (const seg of parsePathD(pathD)) {
  if (seg.type === "C") {
    const r = closestPointOnCubic(P, seg.from, seg.cp1, seg.cp2, seg.to, { samples: 64 });
    if (r.distance < best.distance) best = r;
  }
  // L → distancePointToSegment
}

const hit = best.distance <= strokeWidth / 2;
```

| 실수 | 결과 |
|------|------|
| cubic을 polyline으로만 근사 후 거리 | hit 밴드 어긋남 |
| `samples` 너무 작음 | S곡선에서 miss |
| world/local 혼동 | [079](./lesson-079.md) unproject 누락 |

## vs 접선 / 법선

[018](./lesson-018.md) `pointAtPathLength`의 tangent는 **flatten polyline** 방향.  
법선·곡률은 [070](./lesson-070.md) `cubicNormalAt` — foot point와 직교하는 “진짜” 법선.

## 데모에서 볼 것

- **빨간 점** — query `P`  
- **파란 점** — `closestPointOnCubic` foot  
- **주황 선** — 거리 `distance` (readout에 숫자)  

## Core API

- `closestPointOnCubic`, `closestPointOnQuadratic`
- `distancePointToSegment` — `geometry.js` / `index.js`

## 관련

- [004 stroke hit](./lesson-004.md) · [096 intersection](./lesson-096.md)

## 오늘의 핵심

stroke hit = **모든 segment에 closest**, 최솟값이 `strokeWidth/2` 이하인지. cubic은 반드시 `closestPointOnCubic` — flatten polyline 거리로 대체하지 마세요.
