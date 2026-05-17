---
id: "049"
title: "sprite data URI"
part: "Part 11. Icon design"
demo: "svg-sprite-uri"
---

# sprite data URI

스프라이트 SVG를 **data URI**로 인코딩해 CSS `background-image`나 `<img src>`에 넣습니다.

<LessonDemo id="049" />

## 데모에서 볼 것

- `buildSvgSpriteSheet` — star + heart symbols  
- **preview** — `background-image: url(data:…)`  
- readout: `data URI length=…` (문자 수)

```js
const sheet = buildSvgSpriteSheet(symbols);
const uri = svgMarkupToDataUri(sheet);
// data:image/svg+xml,%3Csvg…
```

## API

```js
import {
  buildSvgSymbol,
  buildSvgSpriteSheet,
  svgMarkupToDataUri
} from "svg-matrix-core";

const uri = svgMarkupToDataUri(markup);
// encodeURIComponent, # → %23
```

## 사용 패턴

```css
.icon-star {
  width: 24px;
  height: 24px;
  background-image: url("data:image/svg+xml,…");
  color: #2563eb; /* currentColor symbol과 함께 */
}
```

```html
<img src="data:image/svg+xml,…" alt="" width="24" height="24" />
```

## trade-offs

| 장점 | 단점 |
|------|------|
| HTTP 요청 0 (inline) | HTML/CSS 크기 증가 |
| 빌드 시 한 번 생성 | 캐시·CDN 분리 어려움 |

대규모 세트 → 외부 `icons.svg` + `<use>` ([046](./lesson-046.md))가 흔합니다.

## Core API

| 함수 | 역할 |
|------|------|
| `svgMarkupToDataUri` | markup → data URL |
| `buildSvgSpriteSheet` | symbol defs |

## 관련

- [046](./lesson-046.md) · [048](./lesson-048.md) · [050](./lesson-050.md)

## 오늘의 핵심

data URI = **번들된 SVG**. `currentColor`와 같이 쓰면 CSS만으로 테마 유지.
