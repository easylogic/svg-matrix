---
id: "039"
title: "Figma effect 매핑표 전체"
part: "Part 9. SVG filter & Figma effects"
demo: "figma-effects-all"
---

# Figma effect 매핑표 전체

Part 9 마무리 — Figma `effects[]` 네 타입을 **`figmaEffectToSvgFilter` 한 곳**에서 SVG markup으로 dispatch합니다. [031](./lesson-031.md)–[038](./lesson-038.md)는 각 타입의 수업이고, 여기서는 **플러그인 export 입구**를 고정합니다.

<LessonDemo id="039" />

## `FIGMA_EFFECT_FILTER_MAP`

문서·데모 readout이 참조하는 표 (`index.js`):

| Figma `type` | SVG (요약) | 전용 함수 |
|--------------|------------|-----------|
| `DROP_SHADOW` | `feDropShadow` 또는 blur→merge chain | `figmaDropShadowToSvgFilter` |
| `INNER_SHADOW` | composite로 안쪽 clip | `figmaInnerShadowToSvgFilter` |
| `LAYER_BLUR` | `feGaussianBlur` on SourceGraphic | `figmaLayerBlurToSvgFilter` |
| `BACKGROUND_BLUR` | blur BackgroundImage + over | `figmaBackgroundBlurToSvgFilter` |

상세 필드: [figma-filter-mapping](./figma-filter-mapping.md)

## dispatch API

```js
import { figmaEffectToSvgFilter, FIGMA_EFFECT_FILTER_MAP } from "svg-matrix-core";

// 타입 목록
FIGMA_EFFECT_FILTER_MAP.map((row) => row.figma);
// ["DROP_SHADOW", "INNER_SHADOW", "LAYER_BLUR", "BACKGROUND_BLUR"]

const mapped = figmaEffectToSvgFilter({
  type: "INNER_SHADOW",
  offset: { x: 0, y: 6 },
  radius: 8,
  color: { r: 0, g: 0, b: 0, a: 0.35 }
}, "fx-custom-id");

// { type, filterId, filterAttr, markup, ... }
```

`filterId` 생략 시 type별 기본 id (`figma-drop-shadow`, …).

### 지원하지 않는 type

```js
figmaEffectToSvgFilter({ type: "UNKNOWN" });
// throw: Unsupported Figma effect type
```

플러그인은 `FIGMA_PAINT_GAP_MAP`([057](./lesson-057.md))처럼 **warning 목록**을 UI에 보여 주는 패턴이 좋습니다.

## end-to-end export

```js
function exportNodeEffects(figmaNode) {
  const filters = [];
  for (const effect of figmaNode.effects ?? []) {
    if (effect.visible === false) continue;
    const { filterId, filterAttr, markup } = figmaEffectToSvgFilter(effect);
    filters.push({ filterId, markup });
  }
  return {
    defsFilters: filters.map((f) => f.markup).join("\n"),
    filterAttr: filters.length ? `url(#${filters[0].filterId})` : null
    // 다중 effect: filter 체인 또는 merge는 제품 정책
  };
}
```

```xml
<svg>
  <defs>
    <!-- exportNodeEffects.defsFilters -->
  </defs>
  <g filter="url(#figma-drop-shadow)">
    <path d="..."/>
  </g>
</svg>
```

다중 shadow는 filter를 **합치거나** markup을 이어 붙입니다 — Figma는 effect 배열 순서가 중요합니다.

## 데모

toolbar **effect** 셀렉트 — 네 type 전환 시:

1. rect 미리보기 갱신  
2. readout: `FIGMA_EFFECT_FILTER_MAP`의 `svg`, `notes` + **전체 markup**  

type별로 markup 길이·primitive 개수 차이를 비교하세요.

## CSS 병행 export

| Figma | SVG (이 코스) | HTML/CSS |
|-------|---------------|----------|
| DROP_SHADOW | filter + feDropShadow | `filter: drop-shadow()` |
| LAYER_BLUR | SourceGraphic blur | `filter: blur()` |
| BACKGROUND_BLUR | BackgroundImage | `backdrop-filter` |

동일 JSON에서 **SVG 파일**과 **CSS 스니펫**을 같이 내면 handoff가 쉽습니다.

## Core API

- `figmaEffectToSvgFilter`
- `FIGMA_EFFECT_FILTER_MAP`
- per-type: `figmaDropShadowToSvgFilter`, `figmaInnerShadowToSvgFilter`, `figmaLayerBlurToSvgFilter`, `figmaBackgroundBlurToSvgFilter`

## Part 9 학습 순서 (권장)

```txt
035 chain 읽기 → 031 drop shortcut → 036 merge 펼치기 → 037 inner → 038 blur types → 039 dispatch
```

## 오늘의 핵심

export 입구는 **`figmaEffectToSvgFilter` 하나**. 개별 강의는 primitive 이해용, 플러그인은 여기서 markup만 `<defs>`에 넣으면 됩니다.
