---
id: "071"
title: "arc center parameterization"
part: "Part 15. Curve calculus"
demo: "geom-arc-center"
---

# arc center parameterization

SVG `A` 명령은 **끝점·반경·회전·flag**로 타원 호를 정의합니다 ([011](./lesson-011.md)). 편집 UI·디버그·호 길이 계산에는 **중심 (cx, cy), 시작각, sweep 각**이 훨씬 직관적입니다.

<LessonDemo id="071" />

## `A` segment 구조 (파서 출력)

```js
import { parsePathD } from "svg-matrix-core";

const segments = parsePathD("M 80 300 A 120 80 0 0 1 560 120");
const seg = segments.find((s) => s.type === "A");
// {
//   type: "A",
//   from: { x, y },
//   to: { x, y },
//   rx, ry,
//   rotation,      // x-axis rotation (degrees)
//   largeArc,      // 0 | 1
//   sweep          // 0 | 1
// }
```

## 중심 파라미터로 변환

```js
import { svgArcCenterParameters } from "svg-matrix-core";

const arc = svgArcCenterParameters(seg);
// {
//   cx, cy,           // 타원 중심 (user space)
//   rx, ry,           // 반경 (λ>1 보정 후)
//   phi,              // rotation (rad)
//   startAngle,       // 시작 각 (rad)
//   deltaAngle,       // sweep 각 (rad, 부호 있음)
//   degenerate        // rx/ry≈0
// }
```

SVG implementation notes ([W3C elliptical arc](https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes))와 동일 계열 — endpoint → center 변환.

## large-arc / sweep — 호 두 개 중 하나

같은 `from`, `to`, `rx`, `ry`에 대해 **호가 두 개** 있습니다.

| flag | 의미 |
|------|------|
| `large-arc` (0/1) | 작은 호 (<180°) vs 큰 호 |
| `sweep` (0/1) | 진행 방향 (시계 vs 반시계) |

데모 path `M 80 300 A 120 80 0 0 1 560 120` — **파란 arc**, **빨간 점** = `(cx,cy)`, **회색 점선 타원** = `rx, ry`. readout의 `Δθ` = `deltaAngle`.

flag를 바꾸면 중심·호 경로가 바뀝니다 — [011](./lesson-011.md) 데모와 함께 실험하세요.

## cubic-only 엔진과 연결

편집기 handle은 cubic([008](./lesson-008.md))인 경우가 많습니다:

```js
import { arcSegmentToCubics, convertArcsInPathD } from "svg-matrix-core";

const cubics = arcSegmentToCubics(seg);  // ≤90° slice마다 C
const { d } = convertArcsInPathD(pathDWithA);  // 전 path에서 A→C
```

| 단계 | API |
|------|-----|
| UI 표시 | `svgArcCenterParameters` |
| 편집·intersection | `arcSegmentToCubics` → `C` |
| export | `d`에 `A` 유지 또는 `convertArcsInPathD` |

[053](./lesson-053.md) · [065](./lesson-065.md) arc flatten 통합.

## λ 보정

`rx, ry`가 chord에 비해 작으면 수학적으로 타원이 부족합니다. core는 `lambda > 1`일 때 **반경을 키워** 유효한 호를 만듭니다 — Figma/SVG와 같은 보정.

## Core API

- `svgArcCenterParameters` — `arc.js`
- `arcSegmentToCubics`, `convertArcsInPathD` — `arc.js` / `engine.js`

## 관련

- [011](./lesson-011.md) `A` grammar · [070](./lesson-070.md) curvature on cubics · [081](./lesson-081.md) circle κ

## 오늘의 핵심

사용자에게는 **arc(중심·각)**, 엔진에는 **cubic chain** — adapter에서 `svgArcCenterParameters` ↔ `arcSegmentToCubics`를 오갑니다.
