---
id: "061"
title: "blend mode · layer opacity"
part: "Part 13. Figma ↔ SVG (deep)"
demo: "figma-blend-opacity"
---

# blend mode · layer opacity

Figma `blendMode`·`opacity`를 SVG/CSS compositing attrs로 옮깁니다.

<LessonDemo id="061" />

## 데모에서 볼 것

- 두 원 **겹침** — 파란 + 주황  
- **blend** select — `FIGMA_BLEND_MAP` 상위 8종  
- **opacity** 슬라이더 0.2–1  
- readout: `figma MULTIPLY → mix-blend-mode: …`  

```js
import {
  figmaBlendModeToSvg,
  figmaLayerCompositingToSvg,
  FIGMA_BLEND_MAP
} from "svg-matrix-core";

figmaLayerCompositingToSvg({ blendMode: "MULTIPLY", opacity: 0.85 });
// { "mix-blend-mode": "multiply", opacity: 0.85 }
```

## FIGMA_BLEND_MAP

`PASS_THROUGH` → `normal`, `COLOR_DODGE` → `color-dodge` 등 — SVG·CSS 이름 매핑 표.

## Core API

| export | 역할 |
|--------|------|
| `figmaBlendModeToSvg` | blendMode → CSS/SVG 이름 |
| `figmaLayerCompositingToSvg` | opacity + mix-blend-mode |
| `FIGMA_BLEND_MAP` | 전체 표 |

## 관련

- [031](./lesson-031.md) filters · [055](./lesson-055.md) Compositing layer

## 오늘의 핵심

blend = **레이어 합성** — path geometry와 분리해 export attrs로 처리합니다.
