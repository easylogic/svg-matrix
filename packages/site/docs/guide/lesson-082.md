---
id: "082"
title: "rational curves & exact arcs"
part: "Part 19. Rational curves"
demo: "geom-rational-arc"
---

# rational curves & exact arcs

**유리 Bézier**(rational, weights)는 원·타원을 **정확히** 표현할 수 있습니다. SVG path `d`에는 weights가 없고, NURBS는 CAD·WebGL 쪽입니다. 이 강의는 **포맷별 표현 선택**을 정리합니다.

<LessonDemo id="082" />

## 데모에서 볼 것

- **파란** path — `A 80 80` 정확 원호  
- **주황** path — 동일 1/4을 [081](./lesson-081.md) κ cubic으로 근사  
- readout: exact = `<circle>` / `A`; rational = path grammar 밖 (webgl-matrix NURBS)  

## SVG path 한계

| 표현 | path `d` | 정확 원/타원 |
|------|----------|--------------|
| `M L C Q` | ✓ | ✗ (polynomial만) |
| `A` | ✓ | ✓ (elliptical arc) |
| `<circle>` / `<ellipse>` | 요소 | ✓ |
| rational / NURBS | ✗ | ✓ (엔진 내부) |

cubic-only 워크플로([024](./lesson-024.md) path editor):

1. import 시 `A` 유지, 또는  
2. `convertArcsInPathD` / `arcSegmentToCubics` → `C` ([053](./lesson-053.md)), 또는  
3. [081](./lesson-081.md) κ로 원 primitive 생성  

## polynomial vs rational

```txt
polynomial:  B(t) = Σ (1-t)^(n-i) t^i · Pi

rational:    B(t) = Σ w_i (1-t)^(n-i) t^i · Pi  /  Σ w_i (1-t)^(n-j) t^j · ...
```

모든 `w_i`가 같으면 polynomial과 동일. **단위 원**에 대한 classical trick: quadratic rational에 적절한 weight를 주면 정확 90° 호.

```txt
exact circle  →  rational quadratic (weights)
           ↘  polynomial cubic (κ 근사, [081])
           ↘  SVG arc A (endpoint parameterization)
```

## arc → cubic (실무)

```js
import { arcSegmentToCubics, parsePathD } from "svg-matrix-core";

const seg = parsePathD("M 80 100 A 80 80 0 0 1 240 100").find((s) => s.type === "A");
const cubics = arcSegmentToCubics(seg);
// 여러 C segment — κ 원과 달리 임의 rx,ry,rotation 지원
```

[071](./lesson-071.md) `svgArcCenterParameters` — `A`의 endpoint 문법을 (cx, cy, θ)로 읽을 때.

## export 전략

| 목표 | 권장 |
|------|------|
| 브라우저 SVG | `A` 또는 `<circle>` 유지 |
| Figma-like vector network | arc edge type + cubic fallback |
| cubic-only boolean | `convertArcsInPathD` |
| GPU / CAD tessellation | NURBS → polyline (webgl-matrix) |
| flatten / hit | [052](./lesson-052.md) adaptive on cubics |

## [081]과의 선택

| 필요 | 선택 |
|------|------|
| 아이콘 원 스트로크 | κ × 4 |
| 임의 타원 호 | `A` 또는 `arcSegmentToCubics` |
| 수학적으로 exact | rational / `circle` |
| 편집기에서 호 편집 | `A` segment graph ([071](./lesson-071.md)) |

## Core API

- `arcSegmentToCubics`, `svgArcCenterParameters` — `arc.js`
- `convertArcsInPathD` — `engine.js`
- `CIRCLE_CUBIC_KAPPA`, `unitCircleQuarterCubics` — [081](./lesson-081.md)

## 관련

- [081](./lesson-081.md) κ · [011](./lesson-011.md) · [053](./lesson-053.md) · Part 19 rational 이론

## 오늘의 핵심

“원을 cubic으로”는 **근사**, “원을 rational으로”는 **정확** — SVG는 중간에 **`A`/`circle`**을 제공합니다. 저장 포맷과 런타임 엔진(cubic-only vs mixed)에 맞는 표현을 고르세요.
