---
id: "008"
title: "C — cubic Bézier"
part: "Part 1. Path grammar"
demo: "008"
---

# C — cubic Bézier

네 점으로 정의되는 cubic Bézier. 렌더·hit test는 flatten polyline으로 근사합니다.

<LessonDemo id="008" />

## 핵심

- `cubicBezierPoint`로 t∈[0,1] 샘플
- `flattenPathSegments`의 stepsPerCurve
- control handle은 곡선을 당기는 레버

## Core API (`svg-matrix-core`)

이 레슨 데모는 `packages/lesson_runtime/lesson-app.js`의 `path-cubic` 데모와 `svg-matrix-core` 함수를 연결합니다.

## 오늘의 핵심

개념을 코드로 고정하세요. 브라우저 SVG는 결과를 보여 주고, 편집기는 같은 수식을 직접 실행해야 합니다.
