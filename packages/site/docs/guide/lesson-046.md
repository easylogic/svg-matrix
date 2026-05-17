---
id: "046"
title: "symbol · sprite · currentColor"
part: "Part 11. Icon design"
demo: "icon-sprite"
---

# symbol · sprite · currentColor

한 번 정의한 path를 `<symbol>` + `<use>`로 재사용하고, CSS `color`로 tint합니다.

<LessonDemo id="046" />

## 데모에서 볼 것

- `buildSvgSpriteSheet` — hidden defs + star/heart symbols  
- 두 개 `<use>` 96×96  
- toolbar **CSS color** — `uses.setAttribute("color", …)`  

readout: sprite markup + `data URI length=…` (`svgMarkupToDataUri(sheet)`).

```js
buildSvgSymbol({
  id: "icon-star",
  content: '<path d="M 12 2 … Z"/>',
  attributes: currentColorAttributes("fill")
});
buildSvgSymbol({
  id: "icon-heart",
  content: '<path d="M 12 21 … Z"/>',
  attributes: currentColorAttributes("stroke")
});
```

## API

```js
import {
  buildSvgSymbol,
  buildSvgUse,
  buildSvgSpriteSheet,
  currentColorAttributes,
  svgMarkupToDataUri
} from "svg-matrix-core";

const symbols = [
  buildSvgSymbol({ id: "icon-home", viewBox: "0 0 24 24", content: pathMarkup }),
  …
];
const sheet = buildSvgSpriteSheet(symbols);           // hidden sprite
const sheetVisible = buildSvgSpriteSheet(symbols, { hidden: false });

const useMarkup = buildSvgUse({
  href: "#icon-home",
  x: 0, y: 0, width: 24, height: 24
});
```

## currentColor

```js
currentColorAttributes("fill");   // { fill: "currentColor" }
currentColorAttributes("stroke"); // { fill: "none", stroke: "currentColor" }
currentColorAttributes("both");
```

```css
.icon { color: #2563eb; }  /* 자식 SVG가 상속 */
```

## data URI

```js
const uri = svgMarkupToDataUri(sheet);
// data:image/svg+xml,…  → [049](./lesson-049.md)
```

## Core API

| 함수 | 역할 |
|------|------|
| `buildSvgSymbol` | `<symbol>` 문자열 |
| `buildSvgUse` | `<use href="#id">` |
| `buildSvgSpriteSheet` | `<svg><symbol>…` |
| `currentColorAttributes` | tint attrs |
| `svgMarkupToDataUri` | CSS background |

## 관련

- [048](./lesson-048.md) · [049](./lesson-049.md) · [045](./lesson-045.md)

## 오늘의 핵심

스프라이트 = **한 번 정의 · N번 `<use>`** + 테마는 `currentColor` 한 줄.
