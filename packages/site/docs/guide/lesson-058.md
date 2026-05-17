---
id: "058"
title: "radial · angular gradient export"
part: "Part 13. Figma ↔ SVG (deep)"
demo: "figma-radial-paint"
---

# radial · angular gradient export

Figma **GRADIENT_RADIAL** → `<radialGradient>`. **GRADIENT_ANGULAR** (conic) → SVG 1.1에 없음 → **CSS `conic-gradient`**.

<LessonDemo id="058" />

## 데모에서 볼 것

- **mode** select: `GRADIENT_RADIAL` | `GRADIENT_ANGULAR`  
- 400×240 rect  
- radial: defs + `fill=url(#rg)` + readout **markup**  
- angular: `shape.style.background` = conic CSS + `css.note`  

## API

```js
import {
  figmaRadialGradientPaintToSvg,
  figmaAngularGradientToCss
} from "svg-matrix-core";

const radial = figmaRadialGradientPaintToSvg(paint, { gradientId: "rg" });
// { fill: "url(#rg)", markup: "<radialGradient>…" }

const css = figmaAngularGradientToCss(paint);
// { background: "conic-gradient(…)", note: "…" }
```

## gradientHandlePositions

Figma 3점 = 축·반경 — [019](./lesson-019.md) linear, [032](./lesson-032.md) radial과 동일 모델.

## Core API

| 함수 | 역할 |
|------|------|
| `figmaRadialGradientPaintToSvg` | radial defs |
| `figmaAngularGradientToCss` | conic → CSS |

## 관련

- [019](./lesson-019.md) · [032](./lesson-032.md) · [057](./lesson-057.md)

## 오늘의 핵심

angular = **하이브리드 export** (SVG fill + CSS background). gap map [057](./lesson-057.md)의 `partial` 케이스입니다.
