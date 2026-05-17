---
id: "034"
title: "gradientUnits와 spreadMethod"
part: "Part 8. Pattern & gradient"
demo: "gradient-spread"
---

# gradientUnits와 spreadMethod

[019](./lesson-019.md) linear · [032](./lesson-032.md) radial은 **stop 사이**를 보간합니다. `gradientUnits`는 축 좌표계를, `spreadMethod`는 **stop 밖**(`t<0`, `t>1`)을 어떻게 볼지 정합니다.

<LessonDemo id="034" />

## gradientUnits

| 값 | `x1,y1,x2,y2` / `cx,cy,r` |
|----|---------------------------|
| `objectBoundingBox` | 0–1, **요소 bbox** 기준 ([019](./lesson-019.md)) |
| `userSpaceOnUse` | SVG user space px |

데모 toolbar **units** 전환:

- `objectBoundingBox` — `x2="1.2"` (bbox 너비의 120%)  
- `userSpaceOnUse` — rect 오른쪽 밖까지 축 연장  

**같은 rect**라도 축이 달라져 색 분포가 바뀝니다.

```js
import { resolveGradientPoint, objectBoundingBoxToUserSpace } from "svg-matrix-core";

const start = resolveGradientPoint({ x: 0, y: 0 }, "objectBoundingBox", bbox);
// → bbox 좌상단 쪽 user space
```

## spreadMethod

stop 정의는 `offset ∈ [0,1]` 안이지만, **raw t**는 축 밖까지 이어집니다.

```js
import { applySpreadMethod, sampleLinearGradient } from "svg-matrix-core";

applySpreadMethod(1.4, "pad");     // 1
applySpreadMethod(1.4, "repeat");  // 0.4
applySpreadMethod(1.4, "reflect"); // 0.6
```

| spread | 동작 | 시각 |
|--------|------|------|
| `pad` | `clamp(t, 0, 1)` | 밖은 끝 stop 색 |
| `repeat` | `t % 1` | 줄무늬 반복 |
| `reflect` | 삼각파 0–1 | 거울 반복 |

### reflect 수식 (core)

```txt
period = t mod 2  (양수로 정규화)
mapped = period ≤ 1 ? period : 2 - period
```

## 전체 샘플링

```js
const sample = sampleLinearGradient(point, {
  gradientUnits: "objectBoundingBox",
  x1: 0,
  y1: 0,
  x2: 1.2,
  y2: 0,
  spreadMethod: "reflect",
  stops: [
    { offset: 0, color: "#2563eb" },
    { offset: 1, color: "#f59e0b" }
  ]
}, bbox);

// sample.t      — raw (투영)
// sample.mappedT — spread 적용 후
// sample.color  — interpolateColorStops
// sample.start, sample.end — user space 축 끝점
```

`sampleRadialGradient`도 동일하게 `spreadMethod`를 받습니다 ([032](./lesson-032.md)).

## 데모에서 볼 것

1. **spread** `pad` / `repeat` / `reflect` — rect **밖** pointer에서 색 차이  
2. **units** 전환 — 축 방향·길이 변화  
3. readout — `raw t` → `mapped t`, `applySpreadMethod(...)` 검증  

데모는 `x2=1.2`로 일부러 **t>1** 영역을 만들어 spread를 드러냅니다.

## CSS 대응

| SVG | CSS |
|-----|-----|
| `spreadMethod="repeat"` | `repeating-linear-gradient` |
| `pad` | 일반 `linear-gradient` (끝색 유지) |
| `objectBoundingBox` | `%` stop (css-matrix) |

## Core API

- `applySpreadMethod`, `sampleLinearGradient`, `sampleRadialGradient`
- `linearGradientStopParameter`, `resolveGradientPoint`
- `interpolateColorStops`, `colorToCss`

## Part 8 순서

```txt
019 linear t → 032 radial t → 033 pattern (u,v) → 034 units + spread
```

## 오늘의 핵심

gradient 엔진 = **축 투영(raw t) → spread → stop 보간**. units와 spread를 분리해 생각하면 Figma·SVG·CSS export가 같은 수식으로 맞습니다.
