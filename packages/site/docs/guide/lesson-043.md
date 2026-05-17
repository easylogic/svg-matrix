---
id: "043"
title: "mask · clip export"
part: "Part 10. Figma ↔ SVG bridge"
demo: "figma-clip-mask"
---

# mask · clip export

Figma mask group을 `<clipPath>` / `<mask>` **defs markup**으로 변환합니다. [020](./lesson-020.md) 개념의 **export 버전**입니다.

<LessonDemo id="043" />

## 데모에서 볼 것

```txt
shapeD = M 220 120 L 420 120 L 320 300 Z
```

| mode | 효과 |
|------|------|
| **clip** | `figmaClipToSvgMarkup` → hard edge |
| **mask** | `figmaMaskToSvgMarkup` → alpha mask |

readout에 생성된 **XML markup** 전체가 출력됩니다.

## clipPath

```js
import { figmaClipToSvgMarkup } from "svg-matrix-core";

const clip = figmaClipToSvgMarkup({ pathD: shapeD }, "figma-clip");
// {
//   clipPathId: "figma-clip",
//   clipPathAttr: "url(#figma-clip)",
//   markup: "<clipPath id=\"figma-clip\"><path d=\"…\"/></clipPath>"
// }
```

```xml
<defs>…clipPath…</defs>
<g clip-path="url(#figma-clip)">…content…</g>
```

판정 = [014](./lesson-014.md) `classifyPointInPath` (binary).

## mask

```js
import { figmaMaskToSvgMarkup } from "svg-matrix-core";

const mask = figmaMaskToSvgMarkup({ pathD: shapeD }, "figma-mask");
// maskAttr: url(#figma-mask)
// markup: <mask>…<path fill="white"/>…
```

grayscale·gradient mask — [020](./lesson-020.md) opacity-mask 데모와 동일 아이디어.

## [020](./lesson-020.md) vs [043](./lesson-043.md)

| | 020 | 043 |
|---|-----|-----|
| 초점 | 브라우저 렌더 | Figma → SVG 문자열 |
| API | `classifyPointInPath` | `figmaClipToSvgMarkup` |

## Core API

| 함수 | 역할 |
|------|------|
| `figmaClipToSvgMarkup` | clip defs |
| `figmaMaskToSvgMarkup` | mask defs |

## 관련

- [020](./lesson-020.md) · [006](./lesson-006.md) inside stroke clip · [031](./lesson-031.md) filters

## 오늘의 핵심

레이어 mask 플래그 → **defs + url()** reference. geometry 판정은 fill과 동일, 적용 단계만 다릅니다.
