---
id: "054"
title: "multi-subpath editing"
part: "Part 12. Engine utilities"
demo: "engine-multi-subpath"
---

# multi-subpath editing

한 `d` 안 **triangle + rect** 두 subpath — 핸들을 드래그해 부분 편집합니다.

<LessonDemo id="054" />

## 데모에서 볼 것

```txt
M 80 200 L 200 80 L 320 200 Z
M 400 120 L 560 120 L 560 280 L 400 280 Z
```

- compound path editor — subpath별 핸들 드래그  
- readout: `subpaths=2`, `handles=N`, 갱신된 `d`  

## API

```js
import {
  listSubpathHandles,
  updateSubpathHandle,
  parsePathD,
  pathDFromSegments
} from "svg-matrix-core";

const segments = parsePathD(pathD);
const handles = listSubpathHandles(segments);
// id: "s0:a:1"  (s{subpathIndex}:{anchor|control}:{segmentIndex})

const next = updateSubpathHandle(segments, "s1:a:2", { x: 420, y: 200 });
const newD = pathDFromSegments(next);
```

`updateSubpathHandle(segments, handleId, point)` — id는 `sN:…` 형식만 허용.

## vs [021](./lesson-021.md)

| | 021 | 054 |
|---|-----|-----|
| subpath | 단일 | **복수 + 드래그 UI** |
| API | `listPathHandles` | `listSubpathHandles` |

## compound fill

[026](./lesson-026.md) evenodd / hole — 편집 후 fill-rule 재검증.

## Core API

| 함수 | 역할 |
|------|------|
| `listSubpathHandles` | 전 subpath handles |
| `updateSubpathHandle` | id + point → segments |

## 관련

- [021](./lesson-021.md) · [026](./lesson-026.md) · [024](./lesson-024.md)

## 오늘의 핵심

복합 `d` = subpath index가 있는 handle id로 **부분 갱신** → `pathDFromSegments`.
