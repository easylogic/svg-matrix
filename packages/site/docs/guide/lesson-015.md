---
id: "015"
title: "fill hit testing"
part: "Part 3. Fill rules"
demo: "fill-hit"
---

# fill hit testing

포인터가 path **내부(fill 영역)** 인지 판정하는 것이 fill hit입니다. [014](./lesson-014.md)의 `fill-rule`을 그대로 쓰고, 곡선·arc segment는 **flatten polygon**으로 바꾼 뒤 winding/parity를 계산합니다.

<LessonDemo id="015" />

## 데모에서 볼 것

[014](./lesson-014.md) `fill-rule` 데모와 **동일 UI** (`mountFillHitDemo` = compound rect + 구멍).

- `fill-rule` 선택: `nonzero` / `evenodd`  
- 포인터 이동 — inside **초록** / outside **빨강**  
- readout에 `fill hit = pointInPath(flattened polygon)` 추가  

구멍 안·밖을 `evenodd`와 `nonzero`로 번갈아 가며 클릭해 보면 [014](./lesson-014.md) 표와 일치합니다.

## 한 줄 API

```js
import { pointInPath, parsePathD } from "svg-matrix-core";

const segments = parsePathD(pathD);
const inside = pointInPath(pointer, segments, "evenodd", {
  stepsPerCurve: 16,
  stepsPerArc: 24
});
```

`pointInPath` = `classifyPointInPath(...).inside` 만 반환.

## 상세: `classifyPointInPath`

```js
import { classifyPointInPath } from "svg-matrix-core";

const c = classifyPointInPath(pointer, segments, "nonzero", {
  stepsPerCurve: 24,
  stepsPerArc: 24
});

c.inside;           // 최종 판정
c.winding;          // nonzero — subpath 합
c.crossings;        // evenodd — subpath 합
c.insideNonZero;    // rule 무관 참고값
c.insideEvenOdd;
c.subpathCount;     // M으로 나뉜 개수
```

compound path(구멍)는 subpath마다 polygon을 만든 뒤 **winding/crossing을 합산**합니다 ([014](./lesson-014.md)).

## 편집기 pick 파이프라인

```txt
screen (clientX,Y)
  → inverse view / element transform  ([001](./lesson-001.md))
  → world point
  → (optional) bboxOfPath broad-phase ([012](./lesson-012.md))
  → pointInPath(point, segments, fillRule, flatten opts)
```

```js
function pickFill(world, segments, style) {
  if (!bboxContains(padBBox(bboxOfPath(segments), style.strokeWidth), world)) {
    return false;
  }
  return pointInPath(world, segments, style.fillRule ?? "nonzero", {
    stepsPerCurve: style.hitSteps ?? 16
  });
}
```

handle·anchor hit은 **별도** 경로입니다 ([022](./lesson-022.md) `hitTestPathHandles` — segments가 아니라 handle 배열).

## 정확도 · 성능

| 옵션 | 영향 |
|------|------|
| `stepsPerCurve` ↑ | cubic/quadratic 근처 fill hit 정확 |
| `stepsPerArc` ↑ | [011](./lesson-011.md) `A` 호 근처 정확 |
| [052](./lesson-052.md) adaptive | flatten-only 파이프라인에 적용 가능 — `pointInPath` 기본은 uniform |

흔한 패턴:

- **pointermove** — coarse step (8–12)  
- **click / commit** — fine step (24–32) 또는 adaptive  

bbox·selection은 해석 `bboxOfPath`([012](./lesson-012.md)) — fill hit만 flatten에 의존합니다.

## stroke hit과 분리

| | fill hit | stroke hit |
|---|----------|------------|
| 질문 | 영역 안/밖? | 중심선까지 거리 ≤ sw/2? |
| core | `pointInPath` | `distancePointToSegment` / `closestPointOnCubic` ([004](./lesson-004.md)) |
| 규칙 | `nonzero` / `evenodd` | stroke width · align ([006](./lesson-006.md)) |
| 근사 | flatten polygon | 곡선 최근접 ([076](./lesson-076.md)) |

[029](./lesson-029.md) — 둘 다 true일 때 **stroke 우선**이 일반적 UX. fill·stroke 코드를 한 함수에 섞지 마세요.

```js
const fillHit = pointInPath(p, segments, fillRule, opts);
const strokeHit = minDistanceToPath(p, segments) <= strokeWidth / 2;
const target = strokeHit ? "stroke" : fillHit ? "fill" : null;
```

## Canvas · DOM

```js
// Canvas 2D
ctx.isPointInPath(path2d, x, y, "evenodd");

// SVG (Chromium 등)
pathEl.isPointInFill(new DOMPoint(x, y));  // fill-rule 반영
```

편집 중 segment graph는 DOM과 매 프레임 동기화되지 않으므로 **core `pointInPath`**가 기본입니다 ([097](./lesson-097.md) length API와 같은 이유).

## boolean · compound

- **한 path, 구멍** — `fill-rule` + compound subpath ([014](./lesson-014.md))  
- **두 path set op** — `pointInPathBoolean` (A/B 각각 nonzero 후 union/subtract/…)  
- **편집기 레이어** — z-order + 위 pick 파이프라인 반복  

[028](./lesson-028.md) path boolean geometry는 별도; hit은 often “결과 path 하나”에 `pointInPath`.

## Core API

| 함수 | 역할 |
|------|------|
| `pointInPath` | fill hit boolean |
| `classifyPointInPath` | inside + winding/crossings 디버그 |
| `flattenPathSegments`, `segmentsToSubpaths` | 전처리 |
| `pointInPathBoolean` | 두 region set op |
| `windingNumber`, `rayCrossingCount` | polygon 단위 ([014](./lesson-014.md)) |

## 관련

- [014](./lesson-014.md) rules · [004](./lesson-004.md) stroke · [029](./lesson-029.md) priority · [024](./lesson-024.md) editor

## 오늘의 핵심

fill hit = **world 좌표 + flatten + fill-rule**. stroke·handle pick과 분리하고, `stepsPerCurve`/`stepsPerArc`를 move/click에 맞게 나누면 편집기가 브라우저 fill과 같은 체감에 가깝습니다.
