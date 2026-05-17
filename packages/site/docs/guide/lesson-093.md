---
id: "093"
title: "path morph"
part: "Part 23. SVG animation"
demo: "anim-path-morph"
---

# path morph

**같은 topology**의 두 `d`를 선형 보간해 shape tween합니다.

<LessonDemo id="093" />

## 데모에서 볼 것

```txt
dFrom = M 120 40 L 520 40 L 520 160 L 120 160 Z   (rect)
dTo   = M 200 20 L 440 20 L 500 180 L 140 180 Z   (trapezoid)
```

- **morph t** 슬라이더 0–100%  
- readout: `compatible=true/false`, segment 수·타입 일치 여부  

```js
import { morphPathDLinear } from "svg-matrix-core";

const result = morphPathDLinear(dFrom, dTo, 0.5);
// { d, compatible }
```

`compatible=false` — segment 수·명령 타입 불일치 → morph 불가.

## 한계

- topology 다르면 **vertex correspondence** 없음  
- 실무: 동일 segment graph에서만 tween  

## Core API

| 함수 | 역할 |
|------|------|
| `morphPathDLinear` | t ∈ [0,1] → interpolated `d` |

## 관련

- [003](./lesson-003.md) grammar · [024](./lesson-024.md) editor

## 오늘의 핵심

morph = **숫자 보간**이지 magic이 아님 — export 전 segment list를 맞춰 두세요.
