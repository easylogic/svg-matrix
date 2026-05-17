---
id: "033"
title: "pattern tile"
part: "Part 8. Pattern & gradient"
demo: "pattern-tile"
---

# pattern tile

`<pattern>`은 작은 **타일**을 바둑판처럼 반복해 영역을 채웁니다. gradient가 1D t라면, pattern은 **2D (u, v)** 타일 좌표 + 주기 함수입니다.

<LessonDemo id="033" />

## SVG markup

```js
import { buildPatternMarkup } from "svg-matrix-core";

const markup = buildPatternMarkup({
  id: "grid",
  width: 32,
  height: 32,
  patternUnits: "userSpaceOnUse",
  patternContentUnits: "userSpaceOnUse",
  content: `
    <rect width="32" height="32" fill="#f8fafc"/>
    <path d="M 0 32 L 32 0" stroke="#94a3b8" stroke-width="2"/>
  `
});
```

```xml
<rect x="40" y="40" width="560" height="340" fill="url(#grid)"/>
```

CSS `background-repeat: repeat` / `background-size: 32px`와 같은 역할.

## tile 좌표 — `patternTileCoordinates`

```js
import { patternTileCoordinates } from "svg-matrix-core";

const origin = { x: 40, y: 40 };
const tileW = 32;
const tileH = 32;

const coords = patternTileCoordinates(pointer, origin, tileW, tileH);
// {
//   tileX, tileY,     // 몇 번째 타일 (정수 격자)
//   u, v,             // 타일 내부 0–1
//   localX, localY   // 타일 내부 px
// }
```

### 수식

```txt
dx = point.x - origin.x
tileX = floor(dx / tileW)
u = (dx mod tileW) / tileW   // 음수도 0–1로 wrap
```

편집기에서 pattern **내부 hit test**·texture preview·export UV에 씁니다.

## patternUnits

| attribute | 의미 |
|-----------|------|
| `patternUnits` | `x,y,width,height` 해석 — `userSpaceOnUse` \| `objectBoundingBox` |
| `patternContentUnits` | 타일 **안** 도형 좌표계 |

데모는 `userSpaceOnUse` — origin `(40,40)`, **tile size** 슬라이더로 `width/height` 동시 변경.

## Figma image fill

[059](./lesson-059.md) `figmaImagePaintToSvg` — `scaleMode: TILE`이 pattern 반복에 대응. 비트맵은 vector `d`와 별도 레이어.

## 데모에서 볼 것

1. **tile size** — 격자 촘촘함 변경  
2. pointer — readout `tile=(tileX,tileY)`, `u,v`, `local px`  
3. 빨간 점 — 샘플 위치  

## Core API

- `patternTileCoordinates`, `buildPatternMarkup`

## 관련

- [019](./lesson-019.md) paint servers · [059](./lesson-059.md) image tile

## 오늘의 핵심

pattern = **2D 주기 좌표 (u,v)**. 색을 직접 보간하지 않고, 타일 SVG를 반복해 채웁니다.
