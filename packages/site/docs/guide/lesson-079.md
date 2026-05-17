---
id: "079"
title: "affine inverse & decompose"
part: "Part 18. Transform algebra"
demo: "geom-affine"
---

# affine inverse & decompose

[002](./lesson-002.md)에서 `matrix(a,b,c,d,e,f)`로 도형을 움직였다면, 편집기는 반대로 **클릭 좌표를 path 로컬로 되돌리는** 역행렬이 필요합니다. 또한 UI에 “회전 25°, X 스케일 1.0”을 보여 주려면 matrix를 **분해(decompose)** 해야 합니다.

<LessonDemo id="079" />

## SVG affine 한 장

2D affine은 3×3 행렬의 위 2행만 씁니다 (마지막 행 `[0,0,1]`).

```txt
| x' |   | a  c  e | | x |
| y' | = | b  d  f | | y |
| 1  |   | 0  0  1 | | 1 |
```

```js
import { applyAffineMatrix } from "svg-matrix-core";

const world = applyAffineMatrix(matrix, { x: 10, y: 20 });
```

[002](./lesson-002.md)의 `applySvgMatrix` / `parseSvgMatrix`와 **같은 6수**입니다. 누적은 `multiplySvgMatrix(left, right)` — 오른쪽 transform이 먼저 적용됩니다.

## 역행렬 — pointer unproject

부모 `<g>`까지 포함한 **world matrix** `M`이 있을 때, path 로컬 점은:

```txt
p_local = M⁻¹ · p_world
```

```js
import { invertAffineMatrix, applyAffineMatrix } from "svg-matrix-core";

const worldMatrix = parseSvgMatrix(g.getAttribute("transform"));
// 또는 svg.getScreenCTM() → { a,b,c,d,e,f } (브라우저)

const inv = invertAffineMatrix(worldMatrix);
const local = applyAffineMatrix(inv, pointerInUserSpace);
```

### 특이(singular) matrix

```txt
det = a·d − b·c
```

`det ≈ 0`이면 역행렬이 없습니다 — scale 0, 잘못된 collapse. core는 `Singular affine matrix`를 던집니다.

| 상황 | 대응 |
|------|------|
| scale → 0 | 편집 UI에서 최소 스케일 클램프 |
| degenerate skew | decompose 값만 표시, hit test 스킵 |

## 분해 — UI 슬라이더와 맞추기

```js
import { decomposeAffineMatrix } from "svg-matrix-core";

const parts = decomposeAffineMatrix(matrix);
// {
//   translate: { x: e, y: f },
//   rotation,    // atan2(b, a) 라디안
//   scaleX,      // hypot(a, b)
//   scaleY,      // det / scaleX (부호 포함)
//   shear,
//   matrix       // 원본 그대로
// }
```

데모 슬라이더 **rotate°**, **scaleX**를 움직이면 readout의 `rotate=…° scaleX=…`가 갱신됩니다. 내부적으로는

```js
const matrix = {
  a: Math.cos(rad) * sc,
  b: Math.sin(rad) * sc,
  c: -Math.sin(rad),
  d: Math.cos(rad),
  e: 80,
  f: 40
};
```

처럼 합성한 뒤 `decomposeAffineMatrix`로 다시 읽습니다.

### 분해의 한계

- **순서가 다른** translate·rotate·scale 조합은 같은 matrix라도 “의도한” Euler 각이 여러 개일 수 있음  
- **음수 scaleY** (뒤집기)는 rotation + reflection으로 겹쳐 보임  
- 편집기는 보통 **translate → rotate → scale** 고정 순서로 UI를 설계하고, 그 순서에 맞춰 matrix를 **재합성**합니다  

## 좌표 스택과 연결

[056](./lesson-056.md) 흐름:

```txt
client (px) → SVG user space (getScreenCTM⁻¹) → layer local (g⁻¹) → path local
```

handle hit([022](./lesson-022.md))은 **path local**에서 거리를 재고, frame 이동은 **g matrix**만 바꿉니다 ([080](./lesson-080.md)).

## 데모에서 볼 것

1. **rotate°** — `decomposeAffineMatrix`의 `rotation`이 슬라이더와 같이 변하는지  
2. **scaleX** — `scaleX`만 변하고 rect가 찌그러지지 않는지 (데모는 균일 scale에 가깝게 구성)  
3. readout의 `invertAffineMatrix · e=… f=…` — 역행렬의 **이동 성분** (unproject 시 origin이 어디로 가는지)

## Core API

| 함수 | 역할 |
|------|------|
| `applyAffineMatrix` | matrix × 점 |
| `invertAffineMatrix` | M⁻¹ (singular 시 throw) |
| `decomposeAffineMatrix` | UI용 translate / rotation / scale / shear |
| `parseSvgMatrix`, `multiplySvgMatrix` | [002](./lesson-002.md) — `index.js` |

`geometry.js`에 affine 전용 구현, `index.js`에 SVG attribute 파서.

## 관련 강의

- [002 transform](./lesson-002.md) · [056 좌표 스택](./lesson-056.md)  
- [080 transform path vs group](./lesson-080.md)  
- css-matrix — 동일 matrix algebra  

## 오늘의 핵심

브라우저 `getScreenCTM()`은 world matrix를 줍니다. 편집기는 **`invertAffineMatrix`로 로컬로 내린 뒤** stroke/fill/handle hit을 합니다. 분해는 표시용이고, 저장은 matrix 곱 하나가 안전합니다.
