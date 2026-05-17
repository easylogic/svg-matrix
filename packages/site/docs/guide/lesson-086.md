---
id: "086"
title: "Porter–Duff & premultiplied α"
part: "Part 21. Compositing math"
demo: "geom-porter-duff"
---

# Porter–Duff & premultiplied α

레이어 합성 = **Porter–Duff**. SVG filter·Canvas·GPU blend가 같은 algebra를 씁니다.

<LessonDemo id="086" />

## 데모에서 볼 것

- **source α** 슬라이더 0–100% — 빨간 레이어 on 초록 backdrop  
- readout: `porterDuffSourceOver` → `out.a=…`  
- `premultiply before GPU` 힌트  

```js
import { porterDuffSourceOver, premultiplyColor } from "svg-matrix-core";

porterDuffSourceOver(
  { r: 0.94, g: 0.27, b: 0.27, a: 0.7 },
  { r: 0.13, g: 0.77, b: 0.37, a: 1.0 }
);
// unpremultiplied { r, g, b, a }

premultiplyColor({ r: 1, g: 0, b: 0, a: 0.5 });
// { r: 0.5, g: 0, b: 0, a: 0.5 }
```

## premultiplied alpha

```txt
premul: (r·a, g·a, b·a, a)
합성 후 unpremultiply (r/a) — edge halation 방지
```

## 연결

- [061](./lesson-061.md) blend mode · [031](./lesson-031.md) filter chain

## Core API

| 함수 | 역할 |
|------|------|
| `porterDuffSourceOver` | source over |
| `premultiplyColor` | straight → premul |
| `unpremultiplyColor` | premul → straight |

## 관련

- [032](./lesson-032.md) · css-matrix blend

## 오늘의 핵심

합성 버그 절반은 **premul 여부 불일치** — core 수식을 렌더러마다 동일 호출하세요.
