---
id: "007"
title: "H, V — 축 정렬 직선"
part: "Part 1. Path grammar"
demo: "007"
---

# H, V — 축 정렬 직선

H/V는 한 축만 이동하는 L의 축약입니다. `parsePathD`는 항상 `L` segment로 정규화합니다.

<LessonDemo id="007" />

## 핵심

- `H x` / `V y`는 절대 좌표
- `h` / `v`는 상대
- 내부 모델은 L만 있어도 충분

## Core API (`svg-matrix-core`)

이 레슨 데모는 `packages/lesson_runtime/lesson-app.js`의 `path-hv` 데모와 `svg-matrix-core` 함수를 연결합니다.

## 오늘의 핵심

개념을 코드로 고정하세요. 브라우저 SVG는 결과를 보여 주고, 편집기는 같은 수식을 직접 실행해야 합니다.
