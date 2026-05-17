---
id: "053"
title: "arc → cubic 변환"
part: "Appendix B. Engine extras"
demo: "engine-arc-cubic"
---

# arc → cubic 변환

SVG `A`(elliptical arc)는 스펙상 **정확한 타원 호**입니다. cubic-only 엔진·편집기·boolean은 `A`를 **`C` segment chain**으로 바꿔 같은 파이프라인을 탑니다. [011](./lesson-011.md) 문법 · [071](./lesson-071.md) center 파라미터 · 이 강의는 **변환 구현**입니다.

<LessonDemo id="053" />

## 데모에서 볼 것

```txt
before: M 120 300 A 120 80 0 0 1 520 300
after:  M 120 300 C … C …  (A 없음)
```

- **회색 점선** — 원본 `A` path  
- **파란 실선** — `convertArcsInPathD` 결과 `d`  
- **주황 점** — `arcSegmentToCubics`의 `cp1`/`cp2`  

readout: `arcCount`, cubic 개수, before/after `d` 문자열.

## 한 segment → 여러 cubic

```js
import { parsePathD, arcSegmentToCubics, svgArcCenterParameters } from "svg-matrix-core";

const arcD = "M 120 300 A 120 80 0 0 1 520 300";
const segment = parsePathD(arcD).find((s) => s.type === "A");

const params = svgArcCenterParameters(segment);
// { cx, cy, rx, ry, phi, startAngle, deltaAngle, degenerate }

const cubics = arcSegmentToCubics(segment);
// { type: "C", from, cp1, cp2, to }[]
```

### 90° slice

`|Δθ| > 90°`이면 **90°마다** cubic 하나 (`sliceCount = ceil(|Δθ| / (π/2))`). 각 slice는 타원 위 호를 `cubicFromArcSlice`로 fitting — tangent 방향으로 control offset (`k = (4/3) tan(Δθ/4)`).

- 첫 cubic `from` = arc `segment.from`  
- 마지막 cubic `to` = arc `segment.to`  
- degenerate(rx≈0, Δθ≈0) → straight-line cubic placeholder  

## path 전체에서 A 제거

```js
import { convertArcsInPathD, convertArcsToCubics } from "svg-matrix-core";

const { d, segments, arcCount } = convertArcsInPathD(
  "M 0 50 A 50 50 0 0 1 100 50"
);
// d에 " A " 없음 · arcCount === 1

// segment graph만:
import { pathFromD, pathDFromSegments } from "svg-matrix-core";
const { segments: s0 } = pathFromD(pathD);
const cubicsOnly = convertArcsToCubics(s0);
const d2 = pathDFromSegments(cubicsOnly);
```

`convertArcsInPathD` = `parsePathD` → `convertArcsToCubics` → `pathDFromSegments` + `syncPathEndpoints`.

## 왜 변환하나

| 목표 | `A` 유지 | → cubic |
|------|----------|---------|
| Figma/SVG export 호 편집 | ✓ | |
| cubic handle 편집 ([024](./lesson-024.md)) | | ✓ |
| `closestPointOnCubic` stroke hit | | ✓ ([004](./lesson-004.md)) |
| `bboxOfCubicBezier` (C만 해석) | | ✓ ([012](./lesson-012.md)) |
| [052](./lesson-052.md) adaptive flatten | `sampleArc` | cubic adaptive |
| intersection | | ✓ ([075](./lesson-075.md)) |

## vs 다른 “원/호” 표현

| 방법 | 정확도 | 비고 |
|------|--------|------|
| **`arcSegmentToCubics`** | 타원 호 **정확** (SVG `A`와 동치) | 임의 rx, ry, rotation |
| [081](./lesson-081.md) κ×4 | 원 **근사** | 고정 상수 |
| [065](./lesson-065.md) chord lerp | **근사** | 잘못된 flatten 예 |
| `<circle>` / `A` in DOM | 정확 | 편집기 밖 |

변환 후 flatten·length는 [016](./lesson-016.md)·[017](./lesson-017.md)·[052](./lesson-052.md)를 **C**에 그대로 적용.

## 파이프라인 (권장)

```txt
import path with A
  → convertArcsToCubics (또는 편집 중 A segment 유지 + 필요 시 변환)
  → flattenPathSegmentsAdaptive / pointInPath / editor handles
export
  → A 복원 (가능하면) 또는 C만
```

## Core API (`arc.js` / `engine.js`)

| 함수 | 역할 |
|------|------|
| `svgArcCenterParameters(segment)` | endpoint `A` → center 형 |
| `arcSegmentToCubics(segment)` | `C[]` |
| `convertArcsToCubics(segments)` | graph 내 모든 `A` |
| `convertArcsInPathD(d)` | 문자열 in/out + `arcCount` |

## 관련

- [011](./lesson-011.md) · [071](./lesson-071.md) · [065](./lesson-065.md) · [081](./lesson-081.md) · [082](./lesson-082.md)

## 오늘의 핵심

`A`는 저장·브라우저용 정확 format, engine 내부는 **`arcSegmentToCubics`로 C 통일**하는 전략이 흔합니다. chord 보간([065](./lesson-065.md))과 혼동하지 말고, 원 근사([081](./lesson-081.md))와도 구분하세요.
