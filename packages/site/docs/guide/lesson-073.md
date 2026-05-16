---
id: "073"
title: "shoelace signed area"
part: "Part 15. Curve calculus"
demo: "geom-shoelace"
---

# shoelace signed area

Σ(xᵢyᵢ₊₁−xᵢ₊₁yᵢ)/2. 부호는 winding 방향. fill·boolean 면적의 기초입니다.

<LessonDemo id="073" />

## Core API

`shoelaceArea` — `packages/svg-matrix-core/src/geometry.js`

## 오늘의 핵심

수식을 `svg-matrix-core`에서 직접 실행해 보세요. 브라우저 SVG는 결과만 보여 주고, 편집기는 같은 코드가 필요합니다.
