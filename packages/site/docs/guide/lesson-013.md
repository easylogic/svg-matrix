---
id: "013"
title: "miter length 공식"
part: "Part 2. Stroke geometry"
demo: "miter-math"
---

# miter length 공식

`stroke-linejoin: miter`일 때, 두 stroke **외곽 edge**를 연장한 직선의 교점이 모서리를 만듭니다. 각이 좁을수록 교점이 중심선에서 멀어져 **spike**가 길어지고, `stroke-miterlimit`이 그 길이를 제한합니다. [005](./lesson-005.md)에서 join 종류를 봤다면, 여기서는 **miter 수치**를 계산합니다.

<LessonDemo id="013" />

## 데모에서 볼 것

path:

```txt
M 120 300 L 320 120 L 520 300
```

V자 꼭짓점 `(320, 120)`에서 join이 일어납니다.

| 슬라이더 | 역할 |
|----------|------|
| **join angle (deg)** | 꼭짓점 **내각** (20°–160°, 기본 60°) |
| **strokeWidth** | `stroke-width` |
| **miterLimit** | `stroke-miterlimit` |

readout:

- `miter length` — core `miterLength` 결과  
- `threshold = strokeWidth × miterLimit` — SVG bevel 전환 기준  
- `BEvel` / `miter OK` — `shouldBevelJoin`과 동일하게 path에 `stroke-linejoin` 적용  

슬라이더 각도는 **눈에 보이는 내각**이고, API에는 **진행 방향 turn angle**을 넘깁니다:

```js
const joinRad = (deg * Math.PI) / 180;
const turnAngle = Math.PI - joinRad;   // 데모와 동일
miterLength(turnAngle, strokeWidth);
```

내각 60° → turn 120° → spike가 상대적으로 짧음. 내각 20° → turn 160° → spike 급증 → bevel fallback.

## 기하

```txt
        spike tip (miter point)
              *
             /|\
            / | \   ← stroke half-width = sw/2
           /  |  \
    -----●----+----●-----  centerline corner
```

turn angle `θ`(라디안, path가 꺾이는 각):

```txt
miterLength = (strokeWidth / 2) / sin(|θ| / 2)
```

`θ → 0` (거의 직선)이면 `sin(θ/2) → 0` → `Infinity` — core는 `EPSILON` 이하에서 `Infinity` 반환.

## 코드

```js
import { miterLength, shouldBevelJoin, segmentTurnAngle } from "svg-matrix-core";

const incoming = { x: 1, y: 0 };
const outgoing = { x: -0.5, y: 0.866 };
const turn = segmentTurnAngle(incoming, outgoing);
// atan2(cross, dot) — signed turn (라디안)

const strokeWidth = 16;
const miterLimit = 4;

const spike = miterLength(turn, strokeWidth);
const bevel = shouldBevelJoin(turn, strokeWidth, miterLimit);
// bevel === spike > strokeWidth * miterLimit
```

`segmentTurnAngle`은 **정규화된 방향 벡터** 두 개가 필요합니다. polyline vertex `i`에서는

```js
const incoming = subtract(points[i - 1], points[i]);
const outgoing = subtract(points[i + 1], points[i]);
const turn = segmentTurnAngle(incoming, outgoing);
```

([004](./lesson-004.md) stroke hit도 flatten polyline에서 tangent를 씁니다.)

## miterlimit (SVG 규칙)

```txt
miterLength  >  strokeWidth × miterlimit  →  bevel
```

`miterlimit = 4` → spike가 stroke 두께의 **4배**를 넘으면 miter를 쓰지 않습니다. 비율로 보면 `miterLength / strokeWidth > miterlimit`.

| 내각 (대략) | turn | spike (sw=16, limit=4) |
|-------------|------|-------------------------|
| 90° | 90° | ~11.3 (< 64) → miter |
| 30° | 150° | 매우 큼 → bevel |

브라우저 `CanvasRenderingContext2D.lineJoin` · SVG `stroke-linejoin` · Figma export(`stroke-miterlimit`, [figma-bridge.js](../../svg-matrix-core/src/figma-bridge.js))이 같은 규칙입니다.

## [005](./lesson-005.md) join 비교

| join | 꼭짓점 |
|------|--------|
| **miter** | edge 연장 교점 — 위 공식 |
| **bevel** | spike 잘라 직선 연결 |
| **round** | 반지름 `sw/2` 원호 |

데모 `stroke-style`([005](./lesson-005.md))은 cap/join **시각** 비교, `miter-math`는 **수치·limit** 비교입니다.

## 자체 renderer

Canvas/SVG에 맡기지 않고 stroke mesh를 직접 만들 때:

1. vertex마다 `segmentTurnAngle`  
2. `shouldBevelJoin` → miter tip vs bevel cut  
3. bbox·clip — spike가 view 밖으로 나가면 [012](./lesson-012.md) pad 확대  

## offset과의 연결

급한 모서리에서 **parallel offset**은 cusp·self-intersection ([078](./lesson-078.md)). miter spike와 같이 “내각이 작다”는 기하 문제의 다른 면입니다.

## Core API

| 함수 | 역할 |
|------|------|
| `segmentTurnAngle` | incoming/outgoing → signed turn |
| `miterLength` | turn + `strokeWidth` → centerline→tip 거리 |
| `shouldBevelJoin` | limit 초과 여부 |

## 관련

- [005](./lesson-005.md) join/cap · [004](./lesson-004.md) stroke hit · [006](./lesson-006.md) align · [078](./lesson-078.md) offset cusp

## 오늘의 핵심

miter spike 길이는 `(sw/2)/sin(θ/2)` 하나로 정해집니다. 편집기 preview는 `shouldBevelJoin`으로 SVG와 같은 bevel fallback을 맞추고, 슬라이더 **내각**과 API **turn angle** 변환(`π − 내각`)을 혼동하지 마세요.
