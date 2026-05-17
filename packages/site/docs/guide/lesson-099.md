---
id: "099"
title: "degree elevation Q→C"
part: "Part 24. Motion precision"
demo: "geom-degree-elevate"
---

# degree elevation Q→C

quadratic Bézier 하나는 **동일 곡선**을 그리는 cubic 한 segment로 올릴 수 있습니다(degree elevation). Figma·많은 export 파이프는 cubic만 쓰므로 Q 명령을 C로 통일할 때 필요합니다.

<LessonDemo id="099" />

## Core API

`elevateQuadraticToCubic(p0, p1, p2)` → `{ p0, p1, p2, p3 }`

## 관련 강의

- [009 quadratic vs cubic](./lesson-009.md)
- [068 subdivide](./lesson-068.md) (반대 방향: C를 Q로 내리기는 일반적이지 않음)

## 오늘의 핵심

올린 cubic의 제어점은 직관적이지 않지만 곡선 형태는 Q와 일치합니다. 편집 UI는 여전히 3점 핸들을 보여 주고 내부만 cubic으로 저장하는 패턴이 흔합니다.
