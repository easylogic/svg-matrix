---
id: "048"
title: "currentColor · CSS theming"
part: "Part 11. Icon design"
demo: "svg-current-color"
---

# currentColor · CSS theming

SVG `fill`/`stroke`에 **`currentColor`**를 쓰면 부모의 CSS `color`로 아이콘 테마가 바뀝니다.

<LessonDemo id="048" />

## 데모에서 볼 것

- toolbar **color** — 부모 `color` 변경  
- A/B/C 세 개 SVG — `currentColorAttributes("both")` (fill+stroke)  
- readout: `parent { color: … }` + attrs JSON

## API

```js
import { currentColorAttributes } from "svg-matrix-core";

currentColorAttributes("fill");
// { fill: "currentColor" }

currentColorAttributes("stroke");
// { fill: "none", stroke: "currentColor", "stroke-width": "2" }

currentColorAttributes("both");
// fill + stroke currentColor
```

## CSS

```css
.btn-icon { color: var(--text-primary); }
.btn-icon:hover { color: var(--accent); }
```

```html
<span class="btn-icon" style="color:#2563eb">
  <svg>… fill="currentColor" …</svg>
</span>
```

`color`는 **상속** — 루트 한 곳만 바꿔도 `<use>` 자식에 전파 ([046](./lesson-046.md)).

## vs 하드코딩 hex

| | `#2563eb` | `currentColor` |
|---|-----------|----------------|
| 다크 모드 | 파일 N개 | CSS 변수 1곳 |
| 스프라이트 | symbol마다 색 | symbol 1개 |

## Core API

| 함수 | 역할 |
|------|------|
| `currentColorAttributes(mode)` | `"fill"` \| `"stroke"` \| `"both"` |

## 관련

- [046](./lesson-046.md) · [049](./lesson-049.md) · [045](./lesson-045.md)

## 오늘의 핵심

디자인 시스템 tint = SVG 안 hex 대신 **`currentColor` + CSS `color`**.
