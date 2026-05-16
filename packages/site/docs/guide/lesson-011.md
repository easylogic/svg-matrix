---
id: "011"
title: "A — elliptical arc"
part: "Part 1. Path grammar"
demo: "011"
---

# A — elliptical arc

타원 호 파라미터(rx, ry, rotation, flags). 엔진은 보통 line/cubic으로 변환합니다.

<LessonDemo id="011" />

## 핵심

- large-arc / sweep flag
- v0.1은 flatten 근사
- 정확 arc→cubic은 별도 알고리즘

## Core API (`svg-matrix-core`)

이 레슨 데모는 `packages/lesson_runtime/lesson-app.js`의 `path-arc` 데모와 `svg-matrix-core` 함수를 연결합니다.

## 오늘의 핵심

개념을 코드로 고정하세요. 브라우저 SVG는 결과를 보여 주고, 편집기는 같은 수식을 직접 실행해야 합니다.
