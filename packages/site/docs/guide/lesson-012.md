---
id: "012"
title: "path bounding box"
part: "Part 1. Path grammar"
demo: "012"
---

# path bounding box

곡선 bbox는 control point만으로는 부족할 수 있어 sampling 후 min/max를 잡습니다.

<LessonDemo id="012" />

## 핵심

- `bboxOfPath`
- selection UI의 기본
- export crop에도 사용

## Core API (`svg-matrix-core`)

이 레슨 데모는 `packages/lesson_runtime/lesson-app.js`의 `path-bbox` 데모와 `svg-matrix-core` 함수를 연결합니다.

## 오늘의 핵심

개념을 코드로 고정하세요. 브라우저 SVG는 결과를 보여 주고, 편집기는 같은 수식을 직접 실행해야 합니다.
