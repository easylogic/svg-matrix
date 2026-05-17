---
id: "055"
title: "capability map"
part: "Part 12. Primer"
demo: "primer-capability-map"
---

# capability map

코스·`svg-matrix-core`·연계 repo(**css-matrix**, webgl) 범위를 표로 정리합니다.

<LessonDemo id="055" />

## 데모에서 볼 것

- **SVG capability map** — topic / repo / lesson ID  
- **Figma ↔ SVG layers** — Geometry, Paint, Effects, Compositing, Layout  
- readout: `pathPaintModel()` — fill·stroke·paint-order·Figma strokeAlign 요약  

## API

```js
import {
  SVG_CAPABILITY_MAP,
  FIGMA_SVG_LAYERS,
  pathPaintModel
} from "svg-matrix-core";

pathPaintModel();
// { fill, stroke, paintOrder, figmaStrokeAlign }
```

`SVG_CAPABILITY_MAP` 행 예:

```txt
path d grammar          svg-matrix    003–012
CSS overlay             css-matrix    —
```

`FIGMA_SVG_LAYERS` — layer별 figma vs svg 매핑.

## 범위 해석

| repo | 역할 |
|------|------|
| svg-matrix | path, fill, export, icon |
| css-matrix | mask-image, clip-path CSS |
| webgl-webgpu-matrix | flatten → GPU (표만) |

**partial** lesson = stub·export preset — 프로덕션 boolean/Clipper는 별도.

## Core API

| export | 역할 |
|--------|------|
| `SVG_CAPABILITY_MAP` | topic → lesson |
| `FIGMA_SVG_LAYERS` | layer 표 |
| `pathPaintModel` | fill/stroke 요약 객체 |

## 관련

- [056](./lesson-056.md) · [057](./lesson-057.md) · [001](./lesson-001.md)

## 오늘의 핵심

맵으로 **이 패키지가 담당하는 경계**를 고정하고, gap은 [057](./lesson-057.md)에서 paint 단위로 내립니다.
