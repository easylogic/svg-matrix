---
id: "020"
title: "clipPath와 mask 개념"
part: "Part 5. Paint servers"
demo: "clip-mask"
---

# clipPath와 mask 개념

같은 path geometry라도 **clip**과 **mask**는 렌더 파이프라인에서 다른 단계입니다. clip은 [014](./lesson-014.md) fill과 같은 **안/밖** 판정, mask는 **알파**로 부드럽게 가립니다.

<LessonDemo id="020" />

## 데모에서 볼 것

toolbar **mode**:

| mode | 효과 |
|------|------|
| **none** | 파란 rect + 텍스트 전체 표시 |
| **clip** | `clip-path: url(#clip-circle)` — 원 밖 **하드 제거** |
| **opacity-mask** | `mask: url(#fade-mask)` — gradient mask로 **소프트 fade** |

readout:

- none — full rectangle visible  
- clip — binary inside/outside  
- opacity-mask — luminance → alpha  

## clipPath — 하드 마스크

```xml
<clipPath id="clip-circle">
  <circle cx="320" cy="210" r="120"/>
</clipPath>
<g clip-path="url(#clip-circle)"> … content … </g>
```

수학 (path clip):

```js
import { classifyPointInPath, parsePathD } from "svg-matrix-core";

const clipSegs = parsePathD(clipPathD);
const { inside } = classifyPointInPath(pixel, clipSegs, "nonzero");
// inside → 그리기, outside → discard (alpha = 0)
```

- `fill-rule` on clip path — [014](./lesson-014.md)  
- stroke는 clip에 보통 **fill 영역**만 사용 (SVG clip rule)  

[006](./lesson-006.md) inside stroke: **clipPath + doubled stroke** 패턴.

## mask — 알파 마스크

```xml
<mask id="fade-mask">
  <rect fill="url(#fade)" …/>  <!-- white → opaque, transparent → hole -->
</mask>
```

- **grayscale / alpha** — edge feather, gradient vignette  
- clip과 달리 **반투명** 가능  
- `mask-type: luminance | alpha` (SVG2)

데모 `fade-mask`: linear white → transparent.

## paint order (개념)

```txt
geometry
  → defs (clipPath, mask, filter, gradient)
  → clip-path on group
  → mask on group
  → fill / stroke
  → filter effect
```

편집기 레이어 트리 = 이 순서를 attribute로 표현 ([043](./lesson-043.md) Figma export).

## Figma bridge

```js
import { figmaClipToSvgMarkup, figmaMaskToSvgMarkup } from "svg-matrix-core";

figmaClipToSvgMarkup({ pathD: "M … Z" }, "figma-clip");
// { clipPathId, clipPathAttr, markup }

figmaMaskToSvgMarkup({ pathD: "M … Z" }, "figma-mask");
// { maskId, maskAttr, markup } — path fill white in mask
```

## clip vs mask vs hit

| | clip | mask | fill hit |
|---|------|------|----------|
| 판정 | winding ([015](./lesson-015.md)) | alpha sample | `pointInPath` |
| 결과 | 0 or 1 | 0..1 | pick target |
| 단계 | render | render | interaction |

stroke hit([004](./lesson-004.md))은 clip **이후** 픽셀이 보일 때만 의미 있습니다.

## Core API

| 함수 | 역할 |
|------|------|
| `classifyPointInPath`, `pointInPath` | clip geometry test |
| `figmaClipToSvgMarkup`, `figmaMaskToSvgMarkup` | export markup |
| `parsePathD` | clip path `d` |

## 관련

- [014](./lesson-014.md) · [006](./lesson-006.md) · [019](./lesson-019.md) · [043](./lesson-043.md) · [064](./lesson-064.md) paint-order

## 오늘의 핵심

**clip = binary winding**, **mask = alpha 곱**. 둘 다 path geometry를 쓰지만 편집기에서는 레이어 스택 단계가 다릅니다.
