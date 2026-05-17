---
id: "032"
title: "radialGradient"
part: "Part 8. Pattern & gradient"
demo: "radial-gradient"
---

# radialGradient

`linearGradient`([019](./lesson-019.md))가 **축 위 1D t**라면, `radialGradient`는 **중심에서 밖으로** 퍼지는 1D t입니다. 원·타원·focal point까지 SVG paint server로 표현합니다.

<LessonDemo id="032" />

## SVG markup (개념)

```xml
<defs>
  <radialGradient id="rg" gradientUnits="userSpaceOnUse"
    cx="320" cy="180" r="90" fx="320" fy="180">
    <stop offset="0" stop-color="#2563eb"/>
    <stop offset="0.6" stop-color="#22c55e"/>
    <stop offset="1" stop-color="#f59e0b"/>
  </radialGradient>
</defs>
<rect fill="url(#rg)" ... />
```

| attribute | 의미 |
|-----------|------|
| `cx`, `cy` | gradient 원 중심 |
| `r` | 반경 (타원이면 `rx`/`ry` 대신 core는 ellipse 파라미터로 처리) |
| `fx`, `fy` | **focal** — 빛이 나오는 점 (기본 = center) |
| `gradientUnits` | `userSpaceOnUse` \| `objectBoundingBox` |

## stop 파라미터 t — 원형

```js
import { radialGradientStopParameter } from "svg-matrix-core";

const t = radialGradientStopParameter(point, center, radius, focal);
// t ≈ distance(point, focal) / radius
```

`focal` 생략 시 `center`와 동일.

## 타원 + focal — 엔진 기본

```js
import { sampleRadialGradient, radialGradientStopParameterEllipse } from "svg-matrix-core";

const sample = sampleRadialGradient(
  point,
  {
    gradientUnits: "userSpaceOnUse",
    cx: 320,
    cy: 180,
    fx: 400,
    fy: 180,
    r: 90,
    ry: 90,           // 생략 시 r과 동일 계열
    spreadMethod: "pad",
    stops: [
      { offset: 0, color: "#2563eb" },
      { offset: 0.6, color: "#22c55e" },
      { offset: 1, color: "#f59e0b" }
    ]
  },
  bbox
);
// { t: rawT, mappedT, color, center, focal, radiusX, radiusY }
```

`radialGradientStopParameterEllipse`:

```txt
t = hypot((px-fx)/rx, (py-fy)/ry)
```

objectBoundingBox일 때 `r`·`ry`는 **bbox.width/height**를 곱해 user space 반경으로 바꿉니다.

## 파이프라인 (linear와 동일)

```txt
point + bbox
  → resolveGradientPoint (units)
  → rawT (거리 기반)
  → applySpreadMethod ([034](./lesson-034.md))
  → interpolateColorStops
```

## 데모에서 볼 것

- toolbar **radius**, **focal X** — `cx,cy,r,fx` 갱신  
- pointer 이동 — 빨간 점, readout `raw t` / `mapped t` / `color=rgba(...)`  
- focal을 center에서 옮기면 **그라데이션 중심이 비대칭**으로 휨 (Figma radial handle과 같음)  

## Figma export

```js
import { figmaRadialGradientPaintToSvg } from "svg-matrix-core";

// gradientHandlePositions[0]=center, [2]=radius handle on circle
const { markup, fill } = figmaRadialGradientPaintToSvg(figmaPaint, { gradientId: "rg" });
```

[058](./lesson-058.md) — angular(conic)는 CSS fallback.

## Core API

- `radialGradientStopParameter`, `radialGradientStopParameterEllipse`
- `sampleRadialGradient`, `interpolateColorStops`, `resolveGradientPoint`
- `figmaRadialGradientPaintToSvg` — `figma-bridge.js`

## 관련

- [019](./lesson-019.md) linear · [034](./lesson-034.md) spread · [058](./lesson-058.md) Figma radial

## 오늘의 핵심

radial = **focal에서의 정규화 거리**로 t를 잡고 stop 색을 보간합니다. 편집기 preview는 `sampleRadialGradient`, export는 `<radialGradient>` markup.
