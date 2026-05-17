---
id: "006"
title: "stroke align과 outline 개념"
part: "Part 2. Stroke geometry"
demo: "stroke-align"
---

# stroke align과 outline 개념

Figma는 **inside / center / outside** stroke를 고릅니다. SVG 1.1 기본 stroke는 항상 **path 중심선**을 따라 그립니다. “테두리만 안쪽”은 속성 한 줄이 아니라 **geometry** 문제입니다.

<LessonDemo id="006" />

## center (SVG native)

```txt
half stroke inside fill boundary
half stroke outside fill boundary
```

fill 영역과 stroke가 겹치는 비율은 두께에 따라 달라집니다. 얇은 UI stroke는 보통 이 모델로 충분합니다.

## inside / outside

| align | 구현 패턴 |
|-------|-----------|
| inside | fill boundary 안쪽으로 **offset path** + fill로 clip |
| outside | 바깥쪽으로 offset path만 stroke |

이때 필요한 것은 **parallel curve / offset path** 입니다. [076 offset](./lesson-076.md) · [077 cusp](./lesson-077.md)에서 이어집니다.

```js
import { offsetPathD } from "svg-matrix-core";

// 개념: 원본 path를 normal 방향으로 밀어 outline 생성
const { d: outlineD } = offsetPathD(originalD, distance);
```

Figma `strokeAlign: INSIDE` export는 종종 **이중 path** 또는 clipPath로 표현됩니다 ([figma-bridge](../packages/svg-matrix-core/src/figma-bridge.js)).

## Core API

- `offsetPathD`, `offsetPolyline` — outline / outside stroke
- Figma: `figmaStrokeToSvg` (inside → clip)

## 관련 강의

- [005 join/cap](./lesson-005.md)
- [014 fill rule](./lesson-014.md)
- [025–031 Figma paint](./lesson-025.md)

## 오늘의 핵심

stroke align을 “border-width 조절”이 아니라 **offset + clip**으로 설계하면 SVG·Canvas·GPU 파이프가 일관됩니다.
