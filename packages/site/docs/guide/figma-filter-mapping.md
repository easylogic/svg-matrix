---
title: "Figma effect → SVG filter 매핑"
---

# Figma effect → SVG filter 매핑

`svg-matrix-core`의 `FIGMA_EFFECT_FILTER_MAP` · `figmaEffectToSvgFilter` · 039강 데모가 참조하는 표입니다.

| Figma `effect.type` | SVG | Core 함수 |
|---------------------|-----|-----------|
| `DROP_SHADOW` | `<feDropShadow>` 또는 blur→offset→merge 체인 | `figmaDropShadowToSvgFilter`, `buildDropShadowFilterChain` |
| `INNER_SHADOW` | blur + composite로 shape 안쪽 clip | `figmaInnerShadowToSvgFilter` |
| `LAYER_BLUR` | `feGaussianBlur` on `SourceGraphic` | `figmaLayerBlurToSvgFilter` |
| `BACKGROUND_BLUR` | `feGaussianBlur` on `BackgroundImage` | `figmaBackgroundBlurToSvgFilter` |

## 공통 필드

| Figma | SVG |
|-------|-----|
| `radius` (blur) | `stdDeviation` ≈ `radius / 2` (`figmaBlurRadiusToStdDeviation`) |
| `offset.x/y` | `feOffset` `dx` / `dy` |
| `color` (0–1 RGBA) | `flood-color`, `flood-opacity` |
| `visible` | filter 노드 포함 여부 |

## filter region

blur는 주변 픽셀을 샘플하므로 `<filter x="-50%" y="-50%" width="200%" height="200%">`처럼 region을 넓혀 잘림을 줄입니다. `buildFilterRegion()` 참고.

## dispatch API

```js
import { figmaEffectToSvgFilter } from "svg-matrix-core";

const { filterAttr, markup } = figmaEffectToSvgFilter({
  type: "INNER_SHADOW",
  offset: { x: 0, y: 4 },
  radius: 8,
  color: { r: 0, g: 0, b: 0, a: 0.35 }
});
```

## CSS 대응

| Figma | CSS |
|-------|-----|
| DROP_SHADOW | `box-shadow` / `filter: drop-shadow()` |
| LAYER_BLUR | `filter: blur()` |
| BACKGROUND_BLUR | `backdrop-filter: blur()` |

SVG filter는 DOM/CSS export와 Figma plugin JSON 양쪽에서 같은 markup을 재사용할 수 있습니다.
