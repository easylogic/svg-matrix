---
id: "044"
title: "pixel grid · optical alignment"
part: "Part 11. Icon design"
demo: "icon-grid"
---

# pixel grid · optical alignment

24×24 아이콘은 **정수·half-pixel** 좌표에 맞춰야 1× 디스플레이에서 선이 흐릿하지 않습니다.

<LessonDemo id="044" />

## 데모에서 볼 것

```txt
DEMO_ICON_D = M 4.3 8.7 L 12.1 3.9 L 19.8 8.2 L 17.5 20.3 L 6.9 20.1 Z
```

- 24×24 **격자** (×8 preview)  
- **회색 점선** — raw `d`  
- **파란** — `snapPathDToIconGrid` 후  
- **half-pixel snap** 체크박스  
- **stroke** 슬라이더 → `nearestCrispStrokeWidth`  

readout: `stroke request → crisp=1 | 1.5 | 2`, snapped `d`.

## 스냅 API

```js
import {
  snapPointToIconGrid,
  snapPathDToIconGrid,
  snapToHalfPixel,
  nearestCrispStrokeWidth,
  CRISP_ICON_STROKES,
  ICON_GRID_PRESETS
} from "svg-matrix-core";

const p = snapPointToIconGrid({ x: 12.3, y: 7.8 }, true);
// halfPixel=true → snapToHalfPixel (×2 round / 2)

const { d, segments } = snapPathDToIconGrid(pathD, true);
```

| `halfPixel` | 동작 |
|-------------|------|
| `true` | 0.5 step (1px stroke crisp) |
| `false` | `Math.round` 정수 |

## stroke width

```js
nearestCrispStrokeWidth(1.25);  // → 1 | 1.5 | 2
```

`CRISP_ICON_STROKES = [1, 1.5, 2]` — `ICON_GRID_PRESETS` 16/20/24.

```txt
viewBox="0 0 24 24"   // 관례
```

## optical alignment

수학적 중심 ≠ 시각적 중심 — 원·△은 **0.5px shift**가 흔합니다. 격자 위 raw vs snapped를 나란히 비교하세요.

## 파이프라인

```txt
design → snapPathDToIconGrid → export SVG
       → (optional) [047](./lesson-047.md) simplify
```

## Core API

| 함수 | 역할 |
|------|------|
| `snapPointToIconGrid` | 점 스냅 |
| `snapPathDToIconGrid` | 전체 `d` |
| `nearestCrispStrokeWidth` | crisp width |
| `snapToHalfPixel` | 스칼라 |

## 관련

- [045](./lesson-045.md) · [047](./lesson-047.md) · [050](./lesson-050.md)

## 오늘의 핵심

아이콘 = geometry + **격자 스냅**. simplify 전에 snap하는 경우가 많습니다.
