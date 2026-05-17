---
id: "077"
title: "normal offset sampling"
part: "Part 17. Offset curves"
demo: "geom-offset-normal"
---

# normal offset sampling

**parallel curve**(offset)는 중심선 위 각 점에서 **단위 법선** 방향으로 거리 `d`만큼 이동한 점들의 궤적입니다. SVG inside stroke·outline expansion의 기하입니다.

<LessonDemo id="077" />

## 한 점 — cubic

```js
import { offsetPointOnCubic } from "svg-matrix-core";

const p = offsetPointOnCubic(p0, p1, p2, p3, t, distance);
// B(t) + distance * N(t)
```

`N(t)`는 [070](./lesson-070.md) `cubicNormalAt` — 접선에 수직, 방향(부호)은 winding에 따라 “왼쪽/오른쪽” offset.

| `distance` | 효과 |
|------------|------|
| `+d` | 한쪽 (예: 바깥 outline) |
| `−d` | 반대쪽 (예: inside) |
| `strokeWidth/2` | centerline stroke의 가장자리 근사 |

## polyline / 전체 path

```js
import { offsetPolyline, offsetPathD } from "svg-matrix-core";

const offsetPts = offsetPolyline(centerline, 16, /* closed */ false);
const offsetD = offsetPathD(pathD, { distance: 8, stepsPerCurve: 24 });
```

엔진: segment별 샘플 → 꼭짓점에서 **이등분 법선** → offset 점열 → `pathDFromSegments`.

데모 **offset** 슬라이더: 회색 cubic + 파란 offset 점열이 실시간 갱신됩니다.

## [006](./lesson-006.md) inside stroke

SVG `stroke-align: inside`는 보통:

```txt
centerline path + offset(−width/2) + clip to fill region
```

수학은 077, 클리핑은 [020](./lesson-020.md).

## 한계 → [078](./lesson-078.md)

- acute corner → cusp·self-intersection  
- 가변 width → 단일 `d`로 표현 불가  
- 긴 curve → 샘플 간격에 따라 offset 울퉁불퉁  

## 데모에서 볼 것

1. **offset** 슬라이더 음/양 — outline이 centerline의 어느 쪽으로 가는지  
2. 곡률 큰 구간 — offset 점 간격이 촘촘한지  
3. readout — `offsetPointOnCubic` / polyline sampling  

## Core API

- `offsetPointOnCubic`, `offsetPolyline`, `offsetPathD`
- `cubicNormalAt` — [070](./lesson-070.md)

## 관련

- [013 miter](./lesson-013.md) · [078 offset cusps](./lesson-078.md) · [051 offset path](./lesson-051.md)

## 오늘의 핵심

offset = **법선 방향 샘플링**. “깨끗한 parallel curve”가 항상 존재하지는 않습니다 — 다음 강에서 cusp를 봅니다.
