---
id: "064"
title: "paint-order · opacity · filters"
part: "Part 14. SVG spec breadth"
demo: "svg-paint-order"
---

# paint-order · opacity · filters

`paint-order`로 fill/stroke 겹침 순서를 바꾸고, layer opacity·`feTurbulence` stub으로 스펙 폭을 넓힙니다.

<LessonDemo id="064" />

## 데모에서 볼 것

- 둥근 rect — 두꺼운 **stroke** + fill  
- **paint-order**: `fill stroke markers` | `stroke fill markers`  
- stroke-first일 때 filter off — 겹침 차이 확인  
- readout: `paint-order`, `opacity`, `fill-opacity`  

```js
import {
  paintOrderAttributes,
  layerOpacityAttributes,
  buildTurbulenceFilterMarkup
} from "svg-matrix-core";

paintOrderAttributes("stroke fill markers");
layerOpacityAttributes({ opacity: 0.9, fillOpacity: 0.85 });
buildTurbulenceFilterMarkup("warp", 0.04);
```

## paint-order

| 값 | 효과 |
|----|------|
| `fill stroke markers` (default) | fill 먼저 |
| `stroke fill markers` | stroke가 fill 위 |

## Core API

| 함수 | 역할 |
|------|------|
| `paintOrderAttributes` | paint-order attr |
| `layerOpacityAttributes` | opacity / fill-opacity |
| `buildTurbulenceFilterMarkup` | feTurbulence defs |

## 관련

- [031](./lesson-031.md) · [055](./lesson-055.md) pathPaintModel

## 오늘의 핵심

같은 도형도 **paint-order**에 따라 시각이 달라집니다 — 두꺼운 stroke 아이콘에서 중요합니다.
