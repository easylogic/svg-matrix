---
id: "097"
title: "SVGPathElement length API"
part: "Part 24. Motion precision"
demo: "anim-path-api"
---

# SVGPathElement length API

브라우저 `getTotalLength` / `getPointAtLength`와 core `pathLength` / `pointAtPathLength`를 **나란히** 비교합니다.

<LessonDemo id="097" />

## 데모에서 볼 것

```txt
pathD = M 80 120 C 200 20, 440 220, 560 80
```

- readout:
  - `getTotalLength()` vs `pathLength(core)`  
  - `getPointAtLength(50%)` 좌표  
  - `svgPathElementApiGuide()` — native vs core API 목록  

```js
import {
  pathLength,
  pointAtPathLength,
  parsePathD,
  svgPathElementApiGuide
} from "svg-matrix-core";

const segments = parsePathD(pathD);
pathLength(segments, { stepsPerCurve: 32 });
pointAtPathLength(segments, len * 0.5, { stepsPerCurve: 32 });
```

## 차이

| | native | core |
|---|--------|------|
| 환경 | DOM `<path>` | Node·편집기·export |
| arc | 브라우저 내부 | flatten steps 제어 |
| tangent | `getPointAtLength` + 미소 ε | polyline / [070](./lesson-070.md) |

## Core API

| export | 역할 |
|--------|------|
| `pathLength` | segments → length |
| `pointAtPathLength` | distance → point |
| `svgPathElementApiGuide` | 대응 표 문자열 |

## 관련

- [017](./lesson-017.md) · [018](./lesson-018.md) · [094](./lesson-094.md)

## 오늘의 핵심

오프라인·테스트는 **core** — 브라우저 수치와 steps를 맞춰 검증하세요.
