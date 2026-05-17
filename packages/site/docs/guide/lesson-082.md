---
id: "082"
title: "rational curves & exact arcs"
part: "Part 19. Rational curves"
demo: "geom-rational-arc"
---

# rational curves & exact arcs

유리 Bézier는 원을 정확히 표현하지만 SVG path에는 없습니다. 정확 원은 `circle` 요소·`A` arc 명령으로 둡니다.

<LessonDemo id="082" />

## Core API

`arc A vs cubic C` — `packages/svg-matrix-core/src/geometry.js`

## 오늘의 핵심

수식을 `svg-matrix-core`에서 직접 실행해 보세요. 브라우저 SVG는 결과만 보여 주고, 편집기는 같은 코드가 필요합니다.
