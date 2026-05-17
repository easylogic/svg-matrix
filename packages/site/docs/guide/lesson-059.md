---
id: "059"
title: "image · pattern fill"
part: "Part 13. Figma ↔ SVG (deep)"
demo: "figma-image-paint"
---

# image · pattern fill

Figma **IMAGE** fill을 `<pattern>` 또는 `<image>` defs로 export합니다.

<LessonDemo id="059" />

## 데모에서 볼 것

- **scaleMode**: `FILL` | `TILE`  
- checker SVG를 `imageRef` data URI로 embed  
- readout: 생성된 **pattern markup** 전체  

```js
figmaImagePaintToSvg(
  { type: "IMAGE", scaleMode: "TILE", imageRef: "data:image/svg+xml,…" },
  { patternId: "img" }
);
```

## scaleMode

| Figma | SVG |
|-------|-----|
| FILL | pattern stretch / object cover |
| TILE | `patternUnits` + repeat |

## Core API

| 함수 | 역할 |
|------|------|
| `figmaImagePaintToSvg` | `{ fill, markup }` |

## 관련

- [057](./lesson-057.md) IMAGE row · [041](./lesson-041.md) paint

## 오늘의 핵심

image fill = **defs + url(#pattern)**. `href` / `imageRef`는 export 시 embed vs 외부 URL 정책이 필요합니다.
