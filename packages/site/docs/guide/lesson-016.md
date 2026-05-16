---
id: "016"
title: "flatten tolerance"
part: "Part 4. Path sampling"
demo: "016"
---

# flatten tolerance

stepsPerCurve로 곡선→polyline 정밀도를 조절합니다.

<LessonDemo id="016" />

## 핵심

- 편집 중 coarse / export fine
- adaptive flatten은 v0.3+
- 성능 vs 정확도

## Core API (`svg-matrix-core`)

이 레슨 데모는 `packages/lesson_runtime/lesson-app.js`의 `path-flatten` 데모와 `svg-matrix-core` 함수를 연결합니다.

## 오늘의 핵심

개념을 코드로 고정하세요. 브라우저 SVG는 결과를 보여 주고, 편집기는 같은 수식을 직접 실행해야 합니다.
