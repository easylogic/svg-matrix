---
id: "026"
title: "compound path — 여러 subpath"
part: "Part 7. Fill & winding deep dive"
demo: "compound-path"
---

# compound path — 여러 subpath

M이 여러 번인 path에서 hole과 ring을 다룹니다.

<LessonDemo id="026" />

## 핵심

- segmentsToSubpaths
- hole winding 반대
- evenodd vs nonzero

## Core API (`svg-matrix-core`)

`packages/svg-matrix-core/src/index.js` — 이 레슨 데모와 연결된 함수를 사용합니다.
