---
id: "022"
title: "handle hit testing"
part: "Part 6. Path editor capstone"
demo: "022"
---

# handle hit testing

pointer 주변 반경 안에서 가장 가까운 handle을 고릅니다.

<LessonDemo id="022" />

## 핵심

- hitTestPathHandles
- screen-space radius
- stroke hit보다 단순

## Core API

- `packages/svg-matrix-core/src/index.js` — `listPathHandles`, `hitTestPathHandles`, `updatePathHandle`, `pathFromD`
- `packages/lesson_runtime/path-editor.js` — `createPathEditor` (데모 UI)

## 오늘의 핵심

편집기는 **d 문자열이 아니라 segment graph**를 수정하고, 저장/보내기 직전에만 `d`로 직렬화합니다.
