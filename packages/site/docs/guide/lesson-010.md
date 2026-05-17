---
id: "010"
title: "S, T — smooth continuation"
part: "Part 1. Path grammar"
demo: "path-smooth"
---

# S, T — smooth continuation

`S` / `T`는 path `d`를 짧게 쓰기 위한 **문법 설탕**입니다. 수학적으로는 [008](./lesson-008.md) `C` / [009](./lesson-009.md) `Q`와 **같은 곡선 family**이고, 이전 control을 anchor 기준 **반사**해 G¹(접선 연속)을 맞춥니다.

<LessonDemo id="010" />

## 데모 path

```txt
M 60 300 C 120 60 200 360 260 120 S 420 40 580 300
```

`mountPathCommandDemo` — readout에 **segment 리스트**와 `pathDFromSegments` rebuild가 출력됩니다. `S` 줄은 파서가 이미 **explicit `C`**로 전개한 뒤 보여 줍니다.

## S — smooth cubic

```txt
… C cp2_prev, anchor
S cp2_new, end
→ cp1_auto = 2·anchor − cp2_prev
```

```js
import { reflectControlForSmoothContinuation } from "svg-matrix-core";

const cp1 = reflectControlForSmoothContinuation(anchor, previousCp2);
// { x: 2*anchor.x - previousCp2.x, y: ... }
```

`parsePathD` 내부 ([`index.js`](packages/svg-matrix-core/src/index.js)):

```js
// upper === "S"
const reflected = lastCubicControl
  ? { x: 2 * current.x - lastCubicControl.x, y: 2 * current.y - lastCubicControl.y }
  : { ...current };
segments.push({ type: "C", from: current, cp1: reflected, cp2, to });
```

이전 segment가 `C`가 아니면 `lastCubicControl` 없음 → `cp1 = current`(kink 가능).

## T — smooth quadratic

```txt
… Q cp_prev, anchor
T cp_new, end   (또는 relative t)
```

`T`도 동일 반사 — `lastQuadraticControl` 사용. [016](./lesson-016.md) flatten 데모 path `… Q … T …`에서 두 번째 곡선이 `T`로 이어짐.

## G¹ 직관

| | 보장 |
|---|------|
| G⁰ | 위치 연속 (같은 anchor) |
| G¹ | 접선 방향 연속 |
| G² | ✗ (곡률 연속 아님) |

필기·프리드로우·Illustrator pencil stroke가 S/T를 씁니다.

## 편집기

- 사용자는 **anchor**만 드래그 → 반사 cp1이 따라감 ([072](./lesson-072.md) 데모)  
- 저장: `S`/`T` 유지 vs `pathDFromSegments`로 전부 `C`/`Q` — 제품 선택  
- [024](./lesson-024.md) editor는 explicit segment graph  

## Core API

- `reflectControlForSmoothContinuation` — `geometry.js`
- `parsePathD` — S/T → C/Q 전개

## 관련

- [072](./lesson-072.md) G¹ 수학 · [069](./lesson-069.md) flatness (다른 주제)

## 오늘의 핵심

S/T는 **다른 곡선이 아니라 반사 규칙 + 축약 문법**입니다. 파서·편집기·[072](./lesson-072.md)가 같은 한 줄 수식을 공유해야 kink가 없습니다.
