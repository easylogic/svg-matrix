---
id: "029"
title: "fill vs stroke hit 우선순위"
part: "Part 7. Fill & winding deep dive"
demo: "hit-priority"
---

# fill vs stroke hit 우선순위

같은 포인터에서 **fill inside**이면서 **stroke band**(중심선 ± width/2) 안에 들어갈 수 있습니다. SVG DOM은 “무엇이 위에 그려졌는지”만 알려 줄 뿐, **편집기가 무엇을 선택할지**는 앱 정책입니다.

<LessonDemo id="029" />

## 두 판정을 분리해서 계산

### Fill — winding

```js
import { classifyPointInPath, parsePathD } from "svg-matrix-core";

const segments = parsePathD(d);
const { inside: fillHit } = classifyPointInPath(pointer, segments, "nonzero", {
  stepsPerCurve: 24
});
```

[014](./lesson-014.md) — `nonzero` / `evenodd`는 제품 설정.

### Stroke — 최단 거리

정확한 방법 ([004](./lesson-004.md), [076](./lesson-076.md)):

```js
import { closestPointOnCubic, distancePointToSegment } from "svg-matrix-core";

let minD = Infinity;
for (const seg of segments) {
  if (seg.type === "L") {
    minD = Math.min(minD, distancePointToSegment(pointer, seg.from, seg.to).distance);
  }
  if (seg.type === "C") {
    const r = closestPointOnCubic(pointer, seg.from, seg.cp1, seg.cp2, seg.to, { samples: 48 });
    minD = Math.min(minD, r.distance);
  }
}
const strokeHit = minD <= strokeWidth / 2;
```

이 레슨 **데모**는 설명 단순화를 위해 `flattenPathSegments` polyline에 `distancePointToSegment`를 씁니다 — **얇은 S곡선**에서 fill/stroke 판정이 [004](./lesson-004.md)와 약간 어긋날 수 있습니다. 편집기 코드는 cubic 전용 closest를 쓰세요.

## 우선순위 테이블 (일반적)

```txt
1. handle     (가장 작은 타겟, 편집 의도가 명확)
2. stroke     (선 잡기 — 많은 도구가 fill보다 우선)
3. fill       (면 선택·이동)
4. none
```

```js
import { listPathHandles, hitTestPathHandles, classifyPointInPath } from "svg-matrix-core";

function pickTarget(pointer, segments, strokeWidth, hitRadius = 12) {
  const handles = listPathHandles(segments);
  const handleHit = hitTestPathHandles(pointer, handles, hitRadius);
  if (handleHit) return { kind: "handle", handle: handleHit };

  const strokeHit = /* closest loop, § 위 */;
  if (strokeHit) return { kind: "stroke", distance: minD };

  const fillHit = classifyPointInPath(pointer, segments, "nonzero").inside;
  if (fillHit) return { kind: "fill" };

  return { kind: "none" };
}
```

주의: `hitTestPathHandles(point, handles, radius)` — **segments가 아니라 handles 배열** ([022](./lesson-022.md)).

## helper stroke width ([004](./lesson-004.md))

| 반경 | 용도 |
|------|------|
| visible `strokeWidth` | 렌더 |
| `hitWidth` (더 두껍게) | 잡기 쉬운 tolerance |

우선순위 판정에 **어느 값을 쓸지** 제품 스펙으로 고정하세요. “보이는 선은 얇은데 잡히는 영역은 넓다”는 의도적 UX입니다.

## z-order · 여러 path

겹친 path가 여러 개면:

1. 위에서부터 hit test  
2. 각 path에 `pickTarget`  
3. 첫 hit 또는 **가장 작은 area** path  

이 강의 데모는 **path 하나**만 다룹니다.

## 데모에서 볼 것

1. **strokeWidth** 슬라이더 — band 두께 변경  
2. readout — `fill hit=…` `stroke hit=…` `min distance=…`  
3. `editor picks: stroke` — **둘 다 true일 때 stroke 우선** (데모 정책)  
4. fill만 있는 중앙 vs stroke band만 걸리는 가장자리  

## vs SVG `pointer-events`

`pointer-events: stroke` / `fill` / `visibleStroke`는 브라우저 hit를 제한합니다. **편집기**는 보통 canvas/SVG 위에 직접 `svg-matrix-core` hit를 돌려 layer·handle·snap을 한꺼번에 제어합니다 ([056](./lesson-056.md), [079](./lesson-079.md)).

## Core API

| 판정 | 함수 |
|------|------|
| fill | `classifyPointInPath`, `pointInPath` |
| stroke | `closestPointOnCubic`, `distancePointToSegment` |
| handle | `listPathHandles`, `hitTestPathHandles` |
| flatten (데모만) | `flattenPathSegments` |

데모: `mountHitPriorityDemo` — `lesson-app.js`

## 관련

- [004 stroke hit](./lesson-004.md) · [015 fill hit](./lesson-015.md) · [022 handle hit](./lesson-022.md) · [024 editor](./lesson-024.md)

## 오늘의 핵심

hit testing = 기하 함수 + **우선순위 테이블**. fill과 stroke를 한 함수에 섞지 말고, 정책을 명시적으로 적용하세요.
