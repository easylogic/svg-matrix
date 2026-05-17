---
id: "038"
title: "layer blur vs background blur"
part: "Part 9. SVG filter & Figma effects"
demo: "filter-blur-types"
---

# layer blur vs background blur

Figma **Layer blur**와 **Background blur**는 UI 이름은 비슷하지만, 샘플하는 픽셀이 다릅니다. SVG filter의 `in` 소스가 갈립니다.

<LessonDemo id="038" />

## LAYER_BLUR — 레이어 자체

```json
{ "type": "LAYER_BLUR", "radius": 12, "visible": true }
```

```js
import { figmaLayerBlurToSvgFilter } from "svg-matrix-core";

const { filterAttr, markup } = figmaLayerBlurToSvgFilter({ radius: 12 }, "layer-blur");
```

```xml
<filter id="layer-blur" x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="6"/>
</filter>
```

`SourceGraphic` = **이 요소의 RGBA 전체**가 뿌옇게 — 글자·아이콘도 번짐.

CSS: `filter: blur(12px)` on element.

## BACKGROUND_BLUR — 뒤만

```json
{ "type": "BACKGROUND_BLUR", "radius": 16 }
```

```js
import { figmaBackgroundBlurToSvgFilter } from "svg-matrix-core";

const { markup } = figmaBackgroundBlurToSvgFilter({ radius: 16 }, "bg-blur");
```

```xml
<filter id="bg-blur" ...>
  <feGaussianBlur in="BackgroundImage" stdDeviation="8" result="blur"/>
  <feComposite in="SourceGraphic" in2="blur" operator="over"/>
</filter>
```

`BackgroundImage` — filter 적용 요소 **뒤**에 이미 그려진 픽셀. 위에 반투명 카드를 올리면 **유리판** 효과.

CSS: `backdrop-filter: blur(16px)`.

## 데모

- **checker** 배경 + 반투명 흰 **card**  
- toolbar **blur type**: `layer` | `background`  
- **radius** 슬라이더  

| mode | 관찰 |
|------|------|
| layer | 카드 내용(흰 면) 자체가 흐림 |
| background | 카드 뒤 격자만 흐리고 카드 edge는 선명 (브라우저·SVG 엔진에 따라 차이) |

readout에 생성된 `<filter>…` 전체가 출력됩니다.

## radius ↔ stdDeviation

둘 다 `figmaBlurRadiusToStdDeviation(radius)` — [031](./lesson-031.md)과 동일.

## 한계

- SVG `BackgroundImage`는 HTML `backdrop-filter`만큼 everywhere 동일하지 않음 — export 시 **CSS fallback** 병행하는 제품이 많음 ([057](./lesson-057.md) paint gap)  
- 여러 레이어 blur는 filter **합성 순서** = 레이어 트리 순서 ([061](./lesson-061.md))  

## Core API

- `figmaLayerBlurToSvgFilter`, `figmaBackgroundBlurToSvgFilter`
- `figmaBlurRadiusToStdDeviation`

## 관련

- [035](./lesson-035.md) `in` 키워드 · [039](./lesson-039.md) dispatch

## 오늘의 핵심

같은 Gaussian, 다른 **입력 버퍼**. glass UI = background blur + 반투명 fill.
