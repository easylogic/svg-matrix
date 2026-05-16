---
id: "021"
title: "path handle 모델"
part: "Part 6. Path editor capstone"
demo: "021"
---

# path handle 모델

segment graph에서 anchor(꼭짓점)와 control(Bézier 손잡이)를 분리해 목록으로 만듭니다.

<LessonDemo id="021" />

## 핵심

- listPathHandles
- anchor vs control
- Figma vector node의 vertex/handle

## Core API

- `packages/svg-matrix-core/src/index.js` — `listPathHandles`, `hitTestPathHandles`, `updatePathHandle`, `pathFromD`
- `packages/lesson_runtime/path-editor.js` — `createPathEditor` (데모 UI)

## 오늘의 핵심

편집기는 **d 문자열이 아니라 segment graph**를 수정하고, 저장/보내기 직전에만 `d`로 직렬화합니다.
