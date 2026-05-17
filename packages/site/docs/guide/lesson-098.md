---
id: "098"
title: "SMIL keyTimes & keySplines"
part: "Part 24. Motion precision"
demo: "anim-smil-timing"
---

# SMIL keyTimes & keySplines

`animateMotion`에 `calcMode="spline"` + `keySplines` → path 위 **공간 easing** (CSS cubic-bezier와 유사).

<LessonDemo id="098" />

## 데모에서 볼 것

```txt
pathD = M 60 150 C 160 30, 480 270, 580 70
```

- 회색 **motion path** (dash)  
- **회색 dot** — `linear` preset  
- **파랑 dot** — `easeInOut` (`keySplines`)  
- readout: `buildAnimateMotionMarkup(applySmilTimingPreset(…))` XML  

```js
import {
  SMIL_TIMING_PRESETS,
  applySmilTimingPreset,
  buildAnimateMotionMarkup
} from "svg-matrix-core";

buildAnimateMotionMarkup(
  applySmilTimingPreset(
    { pathD, dur: "4s", repeatCount: "indefinite" },
    "easeInOut"
  )
);
```

## SMIL_TIMING_PRESETS

| preset | calcMode | keySplines |
|--------|----------|------------|
| `linear` | linear | — |
| `easeInOut` | spline | `0.42 0 0.58 1` |
| `easeOut` | spline | `0 0 0.58 1` |

## 공간 vs 시간

| | 조절 |
|---|------|
| keySplines on motion | path 위 **위치** 분배 |
| CSS `animation-timing-function` | **시계** easing |

[095](./lesson-095.md) arc-length uniform + spline = 구간별 빠름/느림.

## Core API

| export | 역할 |
|--------|------|
| `SMIL_TIMING_PRESETS` | preset 표 |
| `applySmilTimingPreset` | options 병합 |
| `buildAnimateMotionMarkup` | motion XML |

## 관련

- [090](./lesson-090.md) · [095](./lesson-095.md) · css-matrix easing

## 오늘의 핵심

SMIL spline = **공간 reparameterization** — css-matrix는 **시간** easing, 역할을 나눠 이해하세요.
