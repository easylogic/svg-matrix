---
id: "021"
title: "path handle 모델"
part: "Part 6. Path editor capstone"
demo: "path-handles"
---

# path handle 모델

편집기는 `d` 문자열 대신 **segment graph** 위의 **handle** 배열을 그립니다. [003](./lesson-003.md) parse → 편집 → [023](./lesson-023.md) update → serialize.

<LessonDemo id="021" />

## 데모에서 볼 것

초기 path ([024](./lesson-024.md) editor와 동일):

```txt
M 80 280 C 120 80, 520 360, 560 120
```

`createPathEditor` — **allowDrag: false** (읽기 전용 handle 표시).

readout:

```txt
d="…"
handles (N):
a:0 [anchor] (80.0, 280.0)
c1:1 [control] (…)
c2:1 [control] (…)
a:1 [anchor] (…)
…
anchor = vertex on path
control = Bézier handle
```

- 파란 curve + 회색 **control hull** 점선  
- **주황** anchor, **초록** control 점  

## segment → handles

```js
import { pathFromD, listPathHandles } from "svg-matrix-core";

const { segments, d } = pathFromD(
  "M 80 280 C 120 80, 520 360, 560 120"
);
const handles = listPathHandles(segments);
```

| segment | handles (`listPathHandles`) |
|---------|----------------------------|
| `M` | `a:i` anchor @ `point` |
| `L` | `a:i` anchor @ `to` |
| `C` | `c1:i`, `c2:i`, `a:i` @ cp1, cp2, to |
| `Q` | `c:i`, `a:i` |

handle `id` 형식: `role:segmentIndex` (예 `c1:1`, `a:2`).

```js
// 예
{ id: "c1:1", kind: "control", role: "cp1", segmentIndex: 1, point: { x, y } }
{ id: "a:1", kind: "anchor", segmentIndex: 1, point: { x, y } }
```

[008](./lesson-008.md) cubic 네 점과 1:1 — UI는 kind로 스타일 분기.

## round-trip

```js
import { pathDFromSegments, syncPathEndpoints } from "svg-matrix-core";

const dOut = pathDFromSegments(segments);
// 편집 후에도 d 복원

pathFromD(d);  // parse + syncPathEndpoints 내장
```

편집 루프 ([023](./lesson-023.md)):

```txt
pointerdown → hitTestPathHandles(point, handles, radius)
           → updatePathHandle(segments, handleId, newPoint)
           → syncPathEndpoints
           → pathDFromSegments → <path d="…">
```

`hitTestPathHandles`는 **handles 배열**을 받습니다 — segments가 아님 ([022](./lesson-022.md)).

## compound

여러 subpath: `listSubpathHandles` — id `s0:a:1` ([054](./lesson-054.md) `engine-adaptive` 데모).

## vs storage

| 계층 | 표현 |
|------|------|
| SVG file | `d` 문자열 |
| Figma | vector network (vertices + handles) |
| svg-matrix editor | `segments[]` + `listPathHandles` |

import: `parsePathD` / Figma → segments. export: `pathDFromSegments` 또는 `convertArcsInPathD` ([053](./lesson-053.md)).

## Core API

| 함수 | 역할 |
|------|------|
| `pathFromD`, `pathFromSegments` | parse + sync + `d` |
| `listPathHandles` | UI handle 목록 |
| `hitTestPathHandles` | pick (handles 배열) |
| `updatePathHandle` | drag → segments 갱신 |
| `pathDFromSegments` | serialize |

## 관련

- [003](./lesson-003.md) · [008](./lesson-008.md) · [022](./lesson-022.md) · [023](./lesson-023.md) · [024](./lesson-024.md) editor capstone

## 오늘의 핵심

Figma vector = **handles + segment types**. UI는 `listPathHandles`로 그리고, 저장은 `pathDFromSegments`입니다. 편집 수학은 [008](./lesson-008.md) segment와 동일합니다.
