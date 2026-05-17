---
id: "011"
title: "A — elliptical arc"
part: "Part 1. Path grammar"
demo: "path-arc"
---

# A — elliptical arc

`A` 명령은 **타원 호 하나**를 정의합니다. [008](./lesson-008.md) `C`와 달리 제어점이 아니라 **반경·회전·flag·끝점**으로 호를 고릅니다. SVG 스펙상 타원 호는 **정확**하고, cubic-only 엔진은 보통 내부에서 `C` chain으로 바꿉니다.

<LessonDemo id="011" />

## 문법

```txt
A rx ry x-axis-rotation large-arc-flag sweep-flag x y
```

상대 좌표면 `a` — `to`만 현재점 기준 offset.

```js
import { parsePathD } from "svg-matrix-core";

const segments = parsePathD("M 80 300 A 120 80 0 0 1 560 120");
const arc = segments.find((s) => s.type === "A");
// {
//   type: "A",
//   from, to,
//   rx: 120, ry: 80,
//   rotation: 0,
//   largeArc: false,
//   sweep: true
// }
```

데모 path가 위와 동일합니다. `mountPathCommandDemo` — segment 리스트 + `pathDFromSegments` rebuild readout ([003](./lesson-003.md) grammar 데모와 동일 패턴).

## 파라미터 직관

| 필드 | 의미 |
|------|------|
| `rx`, `ry` | 타원 반경 (음수면 절댓값; chord가 너무 길면 스펙상 **확대** — `svgArcCenterParameters`의 λ 보정) |
| `rotation` | 타원 축 회전 (도) |
| `largeArc` | 같은 끝점 사이 **큰 호** vs 작은 호 (180° 기준) |
| `sweep` | 진행 방향 — SVG 좌표계에서 **시계** vs 반시계 |

```txt
        P0 (from)                    P1 (to)
           ●────────────────────────────●
              ╲    호 A (2개 후보)    ╱
               ╲  large/sweep 고름 ╱
                ●───────────────●
                   타원 위
```

flag를 바꾸면 **같은 rx,ry**로도 다른 호가 선택됩니다. 편집기에서 arc handle을 드래그할 때 이 네 조합 중 하나가 고정됩니다.

## endpoint vs center ([071](./lesson-071.md))

path `d`는 **끝점 파라미터**만 저장합니다. 디버그·호 편집에는 중심형이 편합니다.

```js
import { svgArcCenterParameters } from "svg-matrix-core";

const params = svgArcCenterParameters(arc);
// { cx, cy, rx, ry, phi, startAngle, deltaAngle, degenerate }
```

[071](./lesson-071.md) `geom-arc-center` 데모 — 빨간 점이 `(cx, cy)`.

## arc → cubic

```js
import { arcSegmentToCubics } from "svg-matrix-core";

const cubics = arcSegmentToCubics(arc);
// |Δθ| > 90° 이면 90° slice마다 C 하나 ([arc.js](../../svg-matrix-core/src/arc.js))
```

```js
import { convertArcsInPathD } from "svg-matrix-core";

const { d, segments, arcCount } = convertArcsInPathD(
  "M 0 50 A 50 50 0 0 1 100 50"
);
// d에 A 없음, C만 — arcCount === 1
```

| 목적 | API |
|------|-----|
| path `d`에서 A 제거 | `convertArcsInPathD` |
| segment graph 유지 | `convertArcsToCubics` (`engine.js`) |
| 단일 arc 분해 | `arcSegmentToCubics` |

[053](./lesson-053.md) · [082](./lesson-082.md) export 파이프라인.

## flatten · bbox

`A`는 `flattenPathSegments`에서 **먼저 cubic으로 쪼갠 뒤** 샘플합니다 — chord `P0→P1` 직선 보간이 아닙니다.

```js
import { flattenPathSegments } from "svg-matrix-core";

const poly = flattenPathSegments(segments, {
  stepsPerCurve: 20,
  stepsPerArc: 24   // arc당 cubic slice마다 step
});
```

[012](./lesson-012.md) `bboxOfPath`의 `A`도 `sampleArc` → min/max (근사 bbox).  
**chord lerp vs arc→cubic** 비교 overlay는 [065](./lesson-065.md) `arc-flatten-unified` 데모.

[016](./lesson-016.md) uniform · [052](./lesson-052.md) adaptive — `A`는 `arcSegmentToCubics` 후 cubic에 동일 적용.

## vs 원 primitive

| 표현 | 정확도 | path `d` |
|------|--------|----------|
| `<circle>` | 정확 | 요소 별도 |
| **`A`** | 정확 타원 호 | ✓ |
| 4× κ cubic | 근사 원 | [081](./lesson-081.md) |

아이콘 원을 path만 쓸 때: `A` 유지 vs κ×4 vs import 시 `convertArcsInPathD`.

## 편집기 전략

```txt
import:  A 유지 (호 편집)  |  convertArcsInPathD (cubic-only 코어)
edit:    endpoint / center handles ([071](./lesson-071.md))
export:  A 복원 (가능하면)  |  C만 (일부 뷰어 동일)
```

[024](./lesson-024.md) path editor — segment type `A`가 graph에 남는지는 제품 정책.

## Core API

| 함수 | 역할 |
|------|------|
| `parsePathD` | `A` segment 파싱 |
| `svgArcCenterParameters` | endpoint → (cx, cy, θ) |
| `arcSegmentToCubics` | 호 → `C[]` |
| `convertArcsInPathD` | `d` 문자열에서 A 제거 |
| `flattenPathSegments` | `sampleArc` + `stepsPerArc` |

## 관련

- [071](./lesson-071.md) center · [053](./lesson-053.md) 변환 · [065](./lesson-065.md) flatten 비교 · [081](./lesson-081.md) · [082](./lesson-082.md)

## 오늘의 핵심

`A`는 스펙상 **정확한 타원 호**입니다. cubic-only 코어라면 import 시 `arcSegmentToCubics`로 한 번 변환하고, flatten·length·hit은 그 `C` chain에 [016](./lesson-016.md)·[052](./lesson-052.md)를 적용하세요. chord 직선 보간은 [065](./lesson-065.md)에서 “안 되는 예”로만 비교합니다.
