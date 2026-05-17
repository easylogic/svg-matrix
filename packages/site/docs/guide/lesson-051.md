---
id: "051"
title: "dash offset animation"
part: "Part 12. Engine utilities"
demo: "engine-dash-offset"
---

# dash offset animation

`stroke-dasharray` / `stroke-dashoffset`과 **flatten 기반 offset path**를 엔진으로 계산합니다.

<LessonDemo id="051" />

## 데모에서 볼 것

```txt
baseD = M 80 300 C 160 80, 480 360, 560 120
```

| 컨트롤 | 효과 |
|--------|------|
| **dasharray** 텍스트 | `16 8` 등 |
| **dashoffset** | 파란 dashed path phase |
| **path offset** | 주황 `offsetPathD` (법선 방향) |

readout: `length=…`, `dash on-intervals=…`, offset path `pointCount`.

## dash API

```js
import {
  parseDashArray,
  formatDashArray,
  strokeDashIntervals,
  dashPatternPhaseAtLength,
  pathLength,
  pathFromD
} from "svg-matrix-core";

const pattern = parseDashArray("16 8");
const total = pathLength(pathFromD(baseD).segments);
const intervals = strokeDashIntervals(total, pattern, Number(offset));
// [{ start, end }, …] — “on” 구간

dashPatternPhaseAtLength(12, pattern, 0); // { on: true|false, … }
```

브라우저 렌더:

```js
path.setAttribute("stroke-dasharray", formatDashArray(pattern));
path.setAttribute("stroke-dashoffset", String(offset));
```

## offset path

```js
import { offsetPathD } from "svg-matrix-core";

const offset = offsetPathD(baseD, 6);
// { d, pointCount }
```

flatten polyline + 법선 — stroke **centerline** 확장/축소와 연결 ([004](./lesson-004.md)).

## path length

```js
pathLength(segments);                    // [017](./lesson-017.md)
pointAtPathLength(segments, s, opts);    // [018](./lesson-018.md)
```

## Core API

| 함수 | 역할 |
|------|------|
| `parseDashArray` / `formatDashArray` | 패턴 문자열 |
| `strokeDashIntervals` | on 구간 목록 |
| `dashPatternPhaseAtLength` | 길이 s에서 on/off |
| `offsetPathD` | 평행 곡선 `d` |
| `pathLength` | 총 길이 |

## 관련

- [017](./lesson-017.md) · [018](./lesson-018.md) · [094](./lesson-094.md) anim-dash

## 오늘의 핵심

dash = **pattern phase on arc length**; offset path = 별도 geometry. 애니 전에 `pathLength`로 period를 맞춥니다.
