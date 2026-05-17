---
id: "050"
title: "SVG optimization pipeline"
part: "Part 11. Icon design"
demo: "svg-optimize"
---

# SVG optimization pipeline

export 전 **viewBox 정리**·precision·(선택) SVGO로 배포용 SVG를 줄입니다.

<LessonDemo id="050" />

## 데모에서 볼 것

데모 path:

```txt
M 2 10 C 8 0, 16 20, 22 10 L 22 18 L 2 18 Z
```

- **padding** 슬라이더 0–4  
- **simplify ε** — `simplifyPathD` tolerance  
- readout: `optimizeSvgViewBox → -1 -1 26 26` 형태 + 점 개수  

## API

```js
import { optimizeSvgViewBox, simplifyPathD } from "svg-matrix-core";

const vb = optimizeSvgViewBox({ width: 24, height: 24, padding: 1 });
// { viewBox: "-1 -1 26 26", width: 24, height: 24 }

const simplified = simplifyPathD(rawD, 1.2);
// { d, pointCount, originalCount }
```

`optimizeSvgViewBox`는 **캔버스 크기 + padding** — path bbox 자동 fit은 [012](./lesson-012.md) `bboxOfPath`.

## 권장 파이프라인

```txt
1. snapPathDToIconGrid     ([044](./lesson-044.md))
2. simplifyPathD (optional) ([047](./lesson-047.md))
3. optimizeSvgViewBox
4. buildSvgSymbol / sheet   ([046](./lesson-046.md))
5. SVGO (build step, 외부)
```

## Core API

| 함수 | 역할 |
|------|------|
| `optimizeSvgViewBox` | width/height/padding → viewBox |
| `simplifyPathD` | DP 단순화 ([047](./lesson-047.md)) |

## 관련

- [047](./lesson-047.md) · [049](./lesson-049.md) · [012](./lesson-012.md)

## 오늘의 핵심

optimize = **배포 형태** 정리. geometry simplify([047](./lesson-047.md))와 markup minify를 구분하세요.
