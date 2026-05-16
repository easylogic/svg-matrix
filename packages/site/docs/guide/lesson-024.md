---
id: "024"
title: "mini path editor — SVG round-trip"
part: "Part 6. Path editor capstone"
demo: "024"
---

# mini path editor — SVG round-trip

d 문자열을 파싱해 편집하고 다시 d로보냅니다. 벡터 편집기의 최소 루프입니다.

<LessonDemo id="024" />

## 핵심

- pathFromD
- pathDFromSegments
- 다음: webgl-webgpu-matrix

## Core API

- `packages/svg-matrix-core/src/index.js` — `listPathHandles`, `hitTestPathHandles`, `updatePathHandle`, `pathFromD`
- `packages/lesson_runtime/path-editor.js` — `createPathEditor` (데모 UI)

## 오늘의 핵심

편집기는 **d 문자열이 아니라 segment graph**를 수정하고, 저장/보내기 직전에만 `d`로 직렬화합니다.
