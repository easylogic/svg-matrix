---
id: "031"
title: "Figma DROP_SHADOW → SVG filter"
part: "Part 9. SVG filter & Figma effects"
demo: "figma-filter"
---

# Figma DROP_SHADOW → SVG filter

Figma 레이어의 `effects[]` 항목 중 `DROP_SHADOW`를 SVG `<filter>` + `filter="url(#…)"`로 바꿉니다. geometry(`d`)는 그대로이고, **픽셀 파이프라인**만 추가됩니다.

<LessonDemo id="031" />

## Figma JSON (플러그인에서 읽는 형태)

```json
{
  "type": "DROP_SHADOW",
  "visible": true,
  "offset": { "x": 0, "y": 4 },
  "radius": 8,
  "color": { "r": 0, "g": 0, "b": 0, "a": 0.25 }
}
```

| 필드 | 의미 |
|------|------|
| `offset.x/y` | 그림자 이동 (px) |
| `radius` | blur 반경 (Figma UI 값) |
| `color` | 0–1 RGBA |

## 한 줄 변환 — `feDropShadow`

```js
import { figmaDropShadowToSvgFilter } from "svg-matrix-core";

const effect = {
  offset: { x: 0, y: 4 },
  radius: 8,
  color: { r: 0, g: 0, b: 0, a: 0.25 }
};

const { filterId, filterAttr, markup, svg } = figmaDropShadowToSvgFilter(effect, "shadow-1");
```

생성되는 markup (예):

```xml
<filter id="shadow-1" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
  <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgb(0 0 0)" flood-opacity="0.25"/>
</filter>
```

적용:

```xml
<defs><!-- 위 filter --></defs>
<rect filter="url(#shadow-1)" ... />
```

`filterAttr` = `url(#shadow-1)` — DOM에 그대로 넣습니다.

## radius → stdDeviation

Figma `radius`와 SVG Gaussian `stdDeviation` 정의가 다릅니다.

```js
import { figmaBlurRadiusToStdDeviation } from "svg-matrix-core";

figmaBlurRadiusToStdDeviation(8); // 4
```

| Figma | SVG |
|-------|-----|
| `radius: 8` | `stdDeviation="4"` |

데모 readout: `radius=8` → `stdDeviation=4`. 슬라이더 **blur radius**, **offset Y**를 움직이며 markup이 바뀌는지 확인하세요.

## filter region

`x="-50%" width="200%"` — blur가 bbox 밖으로 퍼지므로 **잘림 방지** ([035](./lesson-035.md) `buildFilterRegion`).

## shortcut vs full chain

| API | markup |
|-----|--------|
| `figmaDropShadowToSvgFilter` | `feDropShadow` 한 줄 |
| `buildDropShadowFilterChain` | blur→offset→flood→merge ([036](./lesson-036.md)) |

브라우저가 `feDropShadow`를 지원하면 shortcut이 짧습니다. 커스텀 composite가 필요하면 chain.

## export 파이프라인

```txt
Figma node.effects[]
  → figmaDropShadowToSvgFilter (또는 figmaEffectToSvgFilter)
  → <defs>에 markup 삽입
  → shape에 filter="url(#id)"
```

[039](./lesson-039.md)에서 네 effect type을 한 dispatch로 처리합니다.

## CSS 대응

`filter: drop-shadow(0 4px 8px rgba(0,0,0,.25))` — HTML export 시 병행 가능 ([figma-filter-mapping](./figma-filter-mapping.md)).

## Core API

- `figmaDropShadowToSvgFilter`, `figmaBlurRadiusToStdDeviation`
- `buildDropShadowFilterChain` — [036](./lesson-036.md)

## 오늘의 핵심

플러그인 첫 단계 = **effect 객체 → filter markup**. 수학은 Gaussian blur + offset이고, geometry 엔진과 분리해 두세요.
