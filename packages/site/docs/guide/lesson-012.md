---
id: "012"
title: "path bounding box"
part: "Part 1. Path grammar"
demo: "path-bbox"
---

# path bounding box

편집기 selection marquee, `viewBox` 자동 맞춤, gradient `objectBoundingBox`, export crop은 **path 전체를 덮는 axis-aligned bbox**가 필요합니다. [008](./lesson-008.md)·[009](./lesson-009.md)에서 segment 하나의 tight bbox를 봤다면, 여기서는 **여러 segment를 union**합니다.

<LessonDemo id="012" />

## 데모에서 볼 것

데모 path:

```txt
M 120 300 C 200 40, 440 360, 520 80
```

- 파란 **stroke** + 연한 fill — cubic 한 segment  
- 회색 **점** — `from`, `cp1`, `cp2`, `to`  
- 주황 **점선 rect** — 선택된 bbox 모드 결과  

toolbar:

| mode | 동작 |
|------|------|
| **exact (C/Q 해석)** | `bboxOfPath` — [008](./lesson-008.md) `bboxOfCubicBezier` |
| **control hull only** | 네 control의 AABB — 느슨한 상한 |
| **flatten sample** | `bboxOfPathSampled` — `sample steps` 슬라이더 |

readout에 `exact cubic` vs `sample(N)` 크기가 함께 나옵니다. **hull** 모드는 주황 rect가 더 큰 경우가 많고, **sample**은 step을 줄이면 **과소** bbox가 될 수 있습니다.

## 반환 형식

```js
{ x, y, width, height }  // min corner + size (SVG <rect>와 동일)
```

빈 path → `{ x: 0, y: 0, width: 0, height: 0 }`.

## 세 가지 방법 (복습)

| 방법 | API | 특징 |
|------|-----|------|
| Control hull | `bezierControlHullBBox([p0, cp…, p3])` | **항상 덮음** · handle이 멀면 selection 과대 |
| Anchor만 | `bezierControlHullBBox([p0, p3])` | **과소** — 곡선이 rect 밖으로 나감 |
| 해석 tight | `bboxOfCubicBezier` / `bboxOfQuadraticBezier` | `B′(t)=0` + 끝점 ([008](./lesson-008.md)) |
| Flatten sample | `bboxOfPathSampled` | step·ε에 의존 · 검증·레거시 |

## `bboxOfPath` — segment union

```js
import { bboxOfPath, bboxOfPathSampled, parsePathD } from "svg-matrix-core";

const segments = parsePathD("M 120 300 C 200 40, 440 360, 520 80");

const exact = bboxOfPath(segments);
// C/Q: 해석 · A: sampleArc · L: 끝점

const sampled = bboxOfPath(segments, { mode: "sample", stepsPerCurve: 24 });
// bboxOfPathSampled와 동일 — 전 segment flatten 후 min/max
```

```txt
box = null
for (segment of segments)
  box = unionBBox(box, segmentBBox(segment))
```

| type | `segmentBBox` |
|------|----------------|
| `M` | 점 하나 (width/height 0) |
| `L` | `from`·`to` min/max |
| `C` | `bboxOfCubicBezier` |
| `Q` | `bboxOfQuadraticBezier` |
| `A` | `arcSegmentToCubics` → sample (`stepsPerArc`, 기본 24) |

[011](./lesson-011.md) arc는 타원 호 해석 bbox가 무겁기 때문에 **cubic sample**로 근사합니다. [065](./lesson-065.md) flatten 품질과 같은 `sampleArc` 경로.

## `bboxOfPathSampled`

```js
const points = flattenPathSegments(segments, options);
// xs/ys min/max → bbox
```

[016](./lesson-016.md) flatten과 **동일한 polyline**에서 bbox를 구합니다. `stepsPerCurve`·`stepsPerArc`가 작으면 tight bbox보다 **작아질** 수 있습니다.

## 실무 연결

| 용도 | bbox + α |
|------|----------|
| Selection UI | `bboxOfPath` + strokeWidth/2 + handle pad |
| Fit view / camera | compound path 전체 union |
| `gradientUnits="objectBoundingBox"` | [019](./lesson-019.md) `objectBoundingBoxToUserSpace` |
| Hit broad-phase | rect 겹침 후 segment test ([004](./lesson-004.md)) |
| Transform bake | [080](./lesson-080.md) 후 `bboxOfPath` — 좌표계 통일 |

### subpath

`Z`로 닫힌 여러 subpath가 있어도 `bboxOfPath`는 **flat segment 리스트 전체**를 union합니다. subpath별 bbox가 필요하면 `segmentsToSubpaths` 후 각각 `bboxOfPath`.

### padding

```js
function padBBox(b, px) {
  return { x: b.x - px, y: b.y - px, width: b.width + 2 * px, height: b.height + 2 * px };
}
```

## 검증 루틴

```js
const a = bboxOfPath(segments);
const b = bboxOfPathSampled(segments, { stepsPerCurve: 64, stepsPerArc: 48 });
// max(|a.x-b.x|, …) < 1px 이면 sampling 파이프라인 OK
```

C/Q만 있는 path에서는 `exact`와 고 step `sample`이 거의 일치해야 합니다.

## Core API

| 함수 | 역할 |
|------|------|
| `bboxOfPath` | C/Q 해석 + A sample union |
| `bboxOfPathSampled` | flatten-only bbox |
| `bboxOfCubicBezier`, `bboxOfQuadraticBezier` | segment tight |
| `bezierControlHullBBox` | control 점 AABB |
| `unionBBox` | 내부 (export 없음) |

## 관련

- [008](./lesson-008.md) C bbox · [009](./lesson-009.md) Q · [011](./lesson-011.md) A sample · [016](./lesson-016.md) flatten · [019](./lesson-019.md) gradient units

## 오늘의 핵심

- tight bbox = **극값** ([008](./lesson-008.md)); control hull은 안전하지만 느슨합니다.  
- **끝점만** min/max하면 selection이 잘립니다.  
- `bboxOfPath`는 C/Q 해석 + arc sample union; flatten bbox는 step이 부족하면 과소입니다.  
- 편집기는 `bboxOfPath` + pad를 매 프레임 쓰고, arc-heavy path는 `stepsPerArc`를 키우거나 [011](./lesson-011.md) `convertArcsInPathD` 후 해석 cubic bbox를 고려하세요.
