---
id: "020"
title: "clipPath와 mask 개념"
part: "Part 5. Paint servers"
demo: "020"
---

# clipPath와 mask 개념

clip은 이진, mask는 알파. 레이어 compositing 순서의 일부입니다.

<LessonDemo id="020" />

## 핵심

- clipPath hard edge
- mask luminance/alpha
- 편집기는 clip stack 모델

## Core API (`svg-matrix-core`)

이 레슨 데모는 `packages/lesson_runtime/lesson-app.js`의 `clip-mask` 데모와 `svg-matrix-core` 함수를 연결합니다.

## 오늘의 핵심

개념을 코드로 고정하세요. 브라우저 SVG는 결과를 보여 주고, 편집기는 같은 수식을 직접 실행해야 합니다.
