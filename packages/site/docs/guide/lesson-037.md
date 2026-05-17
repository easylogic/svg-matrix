---
id: "037"
title: "inner shadow"
part: "Part 9. SVG filter & Figma effects"
demo: "filter-inner"
---

# inner shadow

Figma `INNER_SHADOW`는 shape **안쪽**에만 어두운 영역이 보입니다. drop shadow([031](./lesson-031.md))에 **추가 `feComposite`**로 SourceAlpha와 교집합합니다.

<LessonDemo id="037" />

## Figma JSON

```json
{
  "type": "INNER_SHADOW",
  "offset": { "x": 0, "y": 4 },
  "radius": 8,
  "color": { "r": 0, "g": 0, "b": 0, "a": 0.45 }
}
```

```js
import { figmaInnerShadowToSvgFilter } from "svg-matrix-core";

const { filterAttr, markup } = figmaInnerShadowToSvgFilter(
  {
    offset: { x: 0, y: 4 },
    radius: 8,
    color: { r: 0, g: 0, b: 0, a: 0.45 }
  },
  "inner-demo"
);
```

## 생성되는 chain (요약)

```xml
<filter id="inner-demo" ...>
  <!-- 1–4: drop과 동일 — SourceAlpha blur → offset → flood → composite → shadow -->
  <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
  <feOffset in="blur" dx="0" dy="4" result="offsetBlur"/>
  <feFlood flood-color="rgb(0 0 0)" flood-opacity="0.45" result="color"/>
  <feComposite in="color" in2="offsetBlur" operator="in" result="shadow"/>
  <!-- 5: shape 안쪽만 -->
  <feComposite in="shadow" in2="SourceAlpha" operator="in" result="innerShadow"/>
  <!-- 6: 원본 위에 -->
  <feComposite in="SourceGraphic" in2="innerShadow" operator="over"/>
</filter>
```

### drop vs inner

| 단계 | DROP ([036](./lesson-036.md)) | INNER |
|------|------------------------------|--------|
| shadow 위치 | 바깥 (merge 아래) | `shadow ∩ SourceAlpha` |
| 최종 | feMerge | SourceGraphic **over** innerShadow |

## 데모에서 볼 것

- 초록 rounded rect — **안쪽** 가장자리가 어두워지는지  
- **blur** 슬라이더 — `stdDeviation` 변경, readout에 전체 markup  
- offset `y: 4` — 위쪽 안쪽이 더 진한지 (빛 방향 느낌)  

## Figma “inside”

UI의 inside shadow = 이 filter chain. CSS에는 `box-shadow: inset …` 대응 ([figma-filter-mapping](./figma-filter-mapping.md)).

## Core API

- `figmaInnerShadowToSvgFilter` — `buildSvgFilter` + composite 2단 추가
- [039](./lesson-039.md) `figmaEffectToSvgFilter({ type: "INNER_SHADOW", … })`

## 관련

- [020](./lesson-020.md) clip 개념 · [031](./lesson-031.md) drop shadow

## 오늘의 핵심

inner = **바깥 shadow를 만든 뒤** SourceAlpha로 안을 잘라 넣기. composite 순서가 틀리면 전체가 어두워지거나 사라집니다.
