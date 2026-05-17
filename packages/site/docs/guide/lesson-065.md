---
id: "065"
title: "arc flatten 통합"
part: "Part 14. SVG spec breadth"
demo: "arc-flatten-unified"
---

# arc flatten 통합

`A` elliptical arc를 다룰 때 흔한 실수는 **끝점 chord를 직선 보간**하는 것입니다. svg-matrix의 **정식 flatten**은 [053](./lesson-053.md) `arcSegmentToCubics` 후 cubic을 샘플합니다. 이 강의는 두 방법을 **같은 arc**에 겹쳐 비교합니다.

<LessonDemo id="065" />

## 데모에서 볼 것

```txt
M 80 300 A 200 120 0 0 1 560 300
```

| 레이어 | 의미 |
|--------|------|
| 연한 회색 **path** | 원본 `A` (SVG가 그리는 호) |
| 회색 **점선 polyline** | chord lerp — `from`→`to` 직선만 25점 (**잘못된 근사**, 교육용) |
| 파란 **polyline** | `flattenPathSegments(..., { stepsPerArc: 12 })` — **arc→cubic→sample** |

readout 예:

```txt
chord lerp (gray dashed) 25 pts — 구 flatten
arc→cubic sample (blue) … pts — arc.js via flattenPathSegments
mid Y accurate≈…
```

호 **중앙**에서 파란 점은 위로 휘고, chord 점선은 거의 직선입니다 — chord로 length·fill·hit을 하면 **체감과 수치가 모두 틀어집니다**.

## 잘못된 방법: chord lerp

```js
// 안티패턴 — 데모 회색 점선
for (let i = 0; i <= n; i++) {
  const t = i / n;
  points.push({
    x: seg.from.x + (seg.to.x - seg.from.x) * t,
    y: seg.from.y + (seg.to.y - seg.from.y) * t
  });
}
```

`A`의 rx, ry, rotation, large-arc, sweep을 **무시**합니다.

## 정식 방법: arc → cubic → sample

core `flattenPathSegments` ([016](./lesson-016.md)):

```txt
segment.type === "A"
  → sampleArc(segment, stepsPerArc)
      → arcSegmentToCubics(segment)   // [053], [arc.js](../../svg-matrix-core/src/arc.js)
      → 각 cubic에 cubicBezierPoint(t)
```

```js
import { flattenPathSegments, parsePathD, arcSegmentToCubics } from "svg-matrix-core";

const arcD = "M 80 300 A 200 120 0 0 1 560 300";
const seg = parsePathD(arcD).find((s) => s.type === "A");

const poly = flattenPathSegments(parsePathD(arcD), { stepsPerArc: 12 });

const cubics = arcSegmentToCubics(seg);
// 편집기·intersection은 C segment graph로 유지
```

### 파이프라인 통일 ([053](./lesson-053.md))

```js
import { convertArcsInPathD, flattenPathSegmentsAdaptive } from "svg-matrix-core";

const { d, segments } = convertArcsInPathD(pathWithA);
// d에 A 없음 — 전부 C

const poly = flattenPathSegments(segments, { stepsPerCurve: 12 });
// 또는
const adaptive = flattenPathSegmentsAdaptive(segments, { tolerance: 0.5 });
```

import 시 **한 번** `convertArcsToCubics` → 이후 [012](./lesson-012.md) bbox·[004](./lesson-004.md) stroke·[024](./lesson-024.md) editor가 **C만** 보면 됩니다.

## 비교 표

| 방법 | arc 기하 | 점 분포 | 용도 |
|------|----------|---------|------|
| chord lerp | ✗ | 균등 t on 직선 | **사용 금지** (데모 대비용) |
| `flattenPathSegments` + `A` | ✓ (`sampleArc`) | `stepsPerArc` per cubic slice | length, fill hit, bbox sample |
| `convertArcsInPathD` + flatten `C` | ✓ | `stepsPerCurve` / [052](./lesson-052.md) adaptive | 편집기·export |
| `arcSegmentToCubics` only | ✓ | control만 (렌더는 브라우저 `A`) | handle 편집 |

## bbox · length · hit

| API | arc 처리 |
|-----|----------|
| `bboxOfPath` `A` | `sampleArc` → min/max ([012](./lesson-012.md)) |
| `pathLength` | `flattenPathSegments` ([017](./lesson-017.md)) |
| `pointInPath` | flatten polygon ([015](./lesson-015.md)) |

모두 chord가 아니라 **cubic sample** 경로입니다.

## Part 14 맥락

[011](./lesson-011.md) `A` 문법 · [053](./lesson-053.md) 변환 · [065](./lesson-065.md) flatten 통일 — “스펙 breadth”에서 **엔진이 SVG arc를 어떻게 소화하는지** 한 줄로 맞춥니다.

## Core API

| 함수 | 역할 |
|------|------|
| `arcSegmentToCubics` | `A` → `C[]` |
| `flattenPathSegments` | `A` → `sampleArc` |
| `convertArcsInPathD` | `d`에서 `A` 제거 |
| `flattenPathSegmentsAdaptive` | ε 기반 ([052](./lesson-052.md)) |

## 관련

- [011](./lesson-011.md) · [053](./lesson-053.md) · [016](./lesson-016.md) · [052](./lesson-052.md) · [081](./lesson-081.md) κ 원 근사

## 오늘의 핵심

Arc flatten = **chord가 아니라 `arcSegmentToCubics` + sample**. 데모 회색 점선은 “하지 말아야 할 것”이고, 파란 polyline이 core 기본입니다. export·편집기는 [053](./lesson-053.md)로 `A`→`C` 통일 후 나머지 파이프라인을 공유하세요.
