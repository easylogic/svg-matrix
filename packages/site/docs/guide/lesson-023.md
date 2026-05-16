---
id: "023"
title: "handle drag로 segment 갱신"
part: "Part 6. Path editor capstone"
demo: "023"
---

# handle drag로 segment 갱신

handle 이동 → updatePathHandle → syncPathEndpoints → pathDFromSegments 순서로 d를 갱신합니다.

<LessonDemo id="023" />

## 핵심

- updatePathHandle
- syncPathEndpoints
- 실시간 SVG preview

## Core API

- `packages/svg-matrix-core/src/index.js` — `listPathHandles`, `hitTestPathHandles`, `updatePathHandle`, `pathFromD`
- `packages/lesson_runtime/path-editor.js` — `createPathEditor` (데모 UI)

## 오늘의 핵심

편집기는 **d 문자열이 아니라 segment graph**를 수정하고, 저장/보내기 직전에만 `d`로 직렬화합니다.
