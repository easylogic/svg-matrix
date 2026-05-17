---
id: "081"
title: "circle as cubic — κ constant"
part: "Part 19. Rational curves"
demo: "geom-circle-cubic"
---

# circle as cubic — κ constant

원을 **polynomial cubic만**으로는 정확히 표현할 수 없습니다. 대신 **4개의 quarter cubic**으로 매우 가깝게 근사하고, 제어점 오프셋은 상수 **κ (kappa)** 하나로 고정됩니다.

<LessonDemo id="081" />

## 데모에서 볼 것

- 파란 **cubic** — 1/4 원 (단위 원의 한 사분면)  
- 회색 점선 **`<circle r="100">`** — 참조 원  
- readout: `CIRCLE_CUBIC_KAPPA = 4(√2−1)/3 ≈ 0.5522847498`  

데모 path (반지름 100, 중심 (100,100)):

```txt
M 100 0
C 100 55.23  44.77 100  0 100
     ↑ cp1.y = 100·κ    ↑ cp2.x = 100·κ
```

## κ 정의

```js
import { CIRCLE_CUBIC_KAPPA } from "svg-matrix-core";

// κ = 4(√2 − 1) / 3 ≈ 0.5522847498
// 제어점이 축 방향으로 κ·radius 만큼 떨어짐
```

| 위치 | 제어점 (단위 원, 1사분면) |
|------|---------------------------|
| `P0` | (1, 0) |
| `P1` | (1, κ) |
| `P2` | (κ, 1) |
| `P3` | (0, 1) |

```js
import { unitCircleQuarterCubics } from "svg-matrix-core";

const [quarter] = unitCircleQuarterCubics();
// { p0, p1, p2, p3 } — 반지름 1, 원점 중심의 한 사분면
// 실제 UI: translate·scale·rotate 후 4번 반복
```

전체 원 = 같은 패턴을 90°씩 회전한 **4× `C`** 또는 `<circle>` / `A`.

## 오차

κ는 **최대 radial error를 최소화**하는 고전 상수입니다. 아이콘·UI loader에서는 눈에 안 띕니다. **공학 도면**·궤도 시뮬레이션은 `<circle>` / `A` / NURBS([082](./lesson-082.md)).

## vs arc `A`

| | 정확도 | path `d` | 엔진 |
|---|--------|----------|------|
| `<circle>` | 정확 | 요소 별도 | DOM |
| `A` elliptical arc | 정확 호 | native [011](./lesson-011.md) | `arcSegmentToCubics` → C ([053](./lesson-053.md)) |
| 4× κ cubic | ~0.03% r (typ.) | cubic-only | `CIRCLE_CUBIC_KAPPA` |

```js
import { convertArcsInPathD } from "svg-matrix-core";

convertArcsInPathD("M 0 50 A 50 50 0 0 1 100 50");
// A 제거, κ 근사 cubic 연속
```

cubic-only 편집기·boolean·[052](./lesson-052.md) adaptive는 import 시 `A`→cubic 변환이 일반적.

## 생성 패턴 (앱 코드)

```js
function circleAsPathD(cx, cy, r) {
  const k = CIRCLE_CUBIC_KAPPA * r;
  return [
    `M ${cx + r} ${cy}`,
    `C ${cx + r} ${cy - k} ${cx + k} ${cy - r} ${cx} ${cy - r}`,
    `C ${cx - k} ${cy - r} ${cx - r} ${cy - k} ${cx - r} ${cy}`,
    `C ${cx - r} ${cy + k} ${cx - k} ${cy + r} ${cx} ${cy + r}`,
    `C ${cx + k} ${cy + r} ${cx + r} ${cy + k} ${cx + r} ${cy}`,
    "Z"
  ].join(" ");
}
```

부호·시계 방향은 좌표계에 맞게 조정.

## Core API

- `CIRCLE_CUBIC_KAPPA`, `unitCircleQuarterCubics` — `geometry.js`
- `arcSegmentToCubics`, `convertArcsInPathD` — `arc.js` / `engine.js`

## 관련

- [011](./lesson-011.md) A · [053](./lesson-053.md) arc→cubic · [082](./lesson-082.md) rational 정확 원

## 오늘의 핵심

UI 원 = **κ·radius**로 control 생성. 정확 원이 필요하면 `circle`/`A`를 유지하고, cubic-only 파이프라인에 넣을 때만 κ 또는 `convertArcsInPathD`를 쓰세요.
