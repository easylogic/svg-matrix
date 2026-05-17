---
id: "016"
title: "flatten tolerance"
part: "Part 4. Path sampling"
demo: "path-flatten"
---

# flatten tolerance

브라우저·편집기는 곡선 `d`를 그릴 때 내부적으로 **polyline**으로 근사합니다. `stepsPerCurve`는 “곡선 하나당 몇 개의 t 샘플을 찍을지”를 정하는 **고정 step** flatten입니다.

<LessonDemo id="016" />

## 데모 path

```txt
M 80 320 Q 200 40 360 320 T 560 120
```

- 회색 stroke — 원본 path (`Q` + smooth `T`)  
- 파란 **점** — `flattenPathSegments` 결과  
- toolbar **stepsPerCurve** 2–48 (기본 12)  

step을 **줄이면** 점 개수↓·빠름·stroke/fill/hit **오차↑**. step을 **늘리면** 반대.

## uniform flatten API

```js
import { flattenPathSegments, parsePathD } from "svg-matrix-core";

const segments = parsePathD(pathD);
const polyline = flattenPathSegments(segments, {
  stepsPerCurve: 12,
  stepsPerArc: 24      // A segment → arcSegmentToCubics 후 샘플
});
```

### segment별 동작

| type | flatten |
|------|---------|
| `M` | 시작점 push |
| `L` | `to` push |
| `C` | `t = 1/n…1`에 `cubicBezierPoint` |
| `Q` | `quadraticBezierPoint` |
| `A` | `arcSegmentToCubics` → C 샘플 ([053](./lesson-053.md)) |

```txt
t = 0, 1/n, 2/n, …, 1  (끝점 중복 — polyline edge)
```

## 무엇이 flatten에 의존하나

| 기능 | flatten 사용 |
|------|----------------|
| fill hit (근사) | polygon ([015](./lesson-015.md)) |
| stroke hit (데모 일부) | polyline — 정확은 [004](./lesson-004.md) cubic |
| `pathLength` / `pointAtPathLength` | [017](./lesson-017.md), [018](./lesson-018.md) |
| bbox `mode: sample` | [012](./lesson-012.md) |
| GPU mesh 전처리 | polygon → ear clip |

## adaptive — 다른 멈춤 조건

같은 목표(폴리라인)에 **점 개수를 줄이는** 방법:

| 강의 | 멈춤 |
|------|------|
| **016 (여기)** | 고정 `stepsPerCurve` |
| [069](./lesson-069.md) | chord error ≤ tolerance |
| [052](./lesson-052.md) | `flattenPathSegmentsAdaptive` |

```js
import { flattenPathSegmentsAdaptive } from "svg-matrix-core";

flattenPathSegmentsAdaptive(segments, { tolerance: 0.5 });
```

급격히 휘는 구간만 촘촘히 — [068](./lesson-068.md) subdivide와 짝.

## 언제 무엇을 쓰나

| 상황 | 권장 |
|------|------|
| 편집 중 live preview | coarse step (빠름) |
| export / hit / length | adaptive ([052](./lesson-052.md)) 또는 해석 bbox ([008](./lesson-008.md), [009](./lesson-009.md)) |
| motion 균일 속도 | flatten 후 length + [095](./lesson-095.md) LUT |

## Core API

- `flattenPathSegments` — `index.js`
- `flattenPathSegmentsAdaptive`, `flattenCubicAdaptive` — `engine.js`
- `cubicFlatnessError`, `subdivideCubicBezier` — `geometry.js`

## 관련

- [017](./lesson-017.md) length · [018](./lesson-018.md) point at length

## 오늘의 핵심

고정 step vs adaptive의 차이는 “몇 점”이 아니라 **언제 멈추느냐**입니다. 016 데모 슬라이더로 오차–성능 trade-off를 눈으로 확인하세요.
