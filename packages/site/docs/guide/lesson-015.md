---
id: "015"
title: "fill hit testing"
part: "Part 3. Fill rules"
demo: "015"
---

# fill hit testing

pointer가 path 안인지 flatten + winding으로 판정합니다.

<LessonDemo id="015" />

## 핵심

- `pointInPath`
- fill-rule 동일 적용
- stroke hit과 분리

## Core API (`svg-matrix-core`)

이 레슨 데모는 `packages/lesson_runtime/lesson-app.js`의 `fill-hit` 데모와 `svg-matrix-core` 함수를 연결합니다.

## 오늘의 핵심

개념을 코드로 고정하세요. 브라우저 SVG는 결과를 보여 주고, 편집기는 같은 수식을 직접 실행해야 합니다.
