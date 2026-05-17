---
id: "036"
title: "blur · offset · merge"
part: "Part 9. SVG filter & Figma effects"
demo: "filter-blur-merge"
---

# blur · offset · merge

`feDropShadow`([031](./lesson-031.md))는 아래 파이프라인을 **한 태그**로 축약한 것입니다. primitive를 직접 쓰면 색·blend·다중 그림자를 커스터할 수 있습니다.

<LessonDemo id="036" />

## Figma JSON → full chain

```json
{
  "type": "DROP_SHADOW",
  "offset": { "x": 0, "y": 6 },
  "radius": 8,
  "color": { "r": 0, "g": 0, "b": 0, "a": 0.3 }
}
```

```js
import { buildDropShadowFilterChain } from "svg-matrix-core";

const { filterAttr, markup } = buildDropShadowFilterChain(
  {
    offset: { x: 0, y: 6 },
    radius: 8,
    color: { r: 0, g: 0, b: 0, a: 0.3 }
  },
  "blur-demo"
);
```

## 단계별 해설

```txt
1. feGaussianBlur  in=SourceAlpha     → 실루엣을 흐림 (blur)
2. feOffset        in=blur            → dx,dy 만큼 이동 (offsetBlur)
3. feFlood         flood-color/opacity → 단색 레이어 (color)
4. feComposite     in=color in2=offsetBlur operator=in → 색×알파 (shadow)
5. feMerge         shadow 아래, SourceGraphic 위 → 최종
```

### 왜 `operator="in"`?

`feComposite` `in` — `in2`의 알파 마스크 안에 `in` 색을 남깁니다. 흐린 실루엣 모양으로 **검은 그림자**를 만듭니다.

### `feMerge` 순서

```xml
<feMerge>
  <feMergeNode in="shadow"/>
  <feMergeNode in="SourceGraphic"/>
</feMerge>
```

**아래**에 shadow, **위**에 원본 — drop shadow 시각 순서.

## 데모 — shortcut 토글

toolbar **feDropShadow shortcut** 체크:

| 체크 | API | markup |
|------|-----|--------|
| on | `figmaDropShadowToSvgFilter` | 한 줄 `feDropShadow` |
| off | `buildDropShadowFilterChain` | 위 5단계 |

**blur** 슬라이더로 `radius` / `stdDeviation` 연동을 비교하세요.

## SourceAlpha vs SourceGraphic

| blur 입력 | 결과 |
|-----------|------|
| SourceAlpha | 그림자·외곽선 실루엣 |
| SourceGraphic | 레이어 전체가 뿌옇게 ([038](./lesson-038.md) LAYER_BLUR) |

혼동하면 “색이 번진 그림자”가 됩니다.

## Core API

- `buildDropShadowFilterChain`, `figmaDropShadowToSvgFilter`
- `buildSvgFilter`, `figmaBlurRadiusToStdDeviation`

## 관련

- [035](./lesson-035.md) chain 개요 · [031](./lesson-031.md) shortcut

## 오늘의 핵심

[031](./lesson-031.md)을 펼치면 이 DAG입니다. 커스텀 그림자·이중 shadow는 primitive를 복제·수정하면 됩니다.
