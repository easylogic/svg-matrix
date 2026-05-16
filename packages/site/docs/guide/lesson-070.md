---
id: "070"
title: "곡률 κ와 법선"
part: "Part 15. Curve calculus"
demo: "geom-curvature"
---

# 곡률 κ와 법선

κ = (x′y″−y′x″)/|B′|³. 법선은 접선을 90° 돌린 단위벡터로 offset·textPath 방향에 씁니다.

<LessonDemo id="070" />

## Core API

`cubicCurvatureAt, cubicNormalAt` — `packages/svg-matrix-core/src/geometry.js`

## 오늘의 핵심

수식을 `svg-matrix-core`에서 직접 실행해 보세요. 브라우저 SVG는 결과만 보여 주고, 편집기는 같은 코드가 필요합니다.
