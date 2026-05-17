---
id: "097"
title: "SVGPathElement length API"
part: "Part 24. Motion precision"
demo: "anim-path-api"
---

# SVGPathElement length API

브라우저는 렌더된 `<path>`에 대해 `getTotalLength()` / `getPointAtLength(distance)`를 제공합니다. svg-matrix-core는 **segment 그래프**에서 같은 질문에 답합니다.

<LessonDemo id="097" />

## Core API

`svgPathElementApiGuide()` — native vs core 비교 표

## 관련 강의

- [017 path length](./lesson-017.md) · [018 point at length](./lesson-018.md)
- [094 JS motion](./lesson-094.md)

## 오늘의 핵심

단일 path 노드·런타임만 필요하면 native API가 편합니다. Figma import, 다중 subpath, 핸들 편집 중 미리보기는 core `pathLength` / `pointAtPathLength`가 맞습니다.
