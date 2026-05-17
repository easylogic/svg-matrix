---
id: "098"
title: "SMIL keyTimes & keySplines"
part: "Part 24. Motion precision"
demo: "anim-smil-timing"
---

# SMIL keyTimes & keySplines

`animateMotion`에 `calcMode="spline"`과 `keySplines`를 주면 경로 위 이동에 **easing**을 줄 수 있습니다. CSS `cubic-bezier`와 같은 제어점 개념입니다.

<LessonDemo id="098" />

## Core API

- `SMIL_TIMING_PRESETS` — `linear`, `easeInOut`, `easeOut`
- `applySmilTimingPreset` + `buildAnimateMotionMarkup`

## 관련 강의

- [090 animateMotion](./lesson-090.md) · [095 uniform speed](./lesson-095.md)
- css-matrix keyframes / easing 부록

## 오늘의 핵심

공간 easing(SMIL spline)과 시간 easing(CSS)을 혼동하지 마세요. 둘 다 쓰면 경로 위에서 더 복잡한 속도 프로필이 됩니다.
