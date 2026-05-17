---
id: "007"
title: "H, V — 축 정렬 직선"
part: "Part 1. Path grammar"
demo: "path-hv"
---

# H, V — 축 정렬 직선

`H` / `V`는 **한 축만** 바꾸는 직선의 **문법 설탕**입니다. [003](./lesson-003.md) `L`과 같은 `L` segment로 그려지며, `parsePathD`가 파싱 시점에 **정규화**합니다. 편집기·hit test·bbox는 H/V를 몰라도 됩니다.

<LessonDemo id="007" />

## 데모 path

```txt
M 80 80 H 520 V 320 h -120 v -80 Z
```

`mountPathCommandDemo` — readout에 **segment 리스트**와 `pathDFromSegments` rebuild.

- `H 520` — y=80 유지, x만 520  
- `V 320` — x=520 유지, y=320  
- `h -120` — 상대, x -= 120  
- `v -80` — 상대, y -= 80  
- `Z` — (80,80)으로 닫기  

파서 출력에는 `H`/`V` 문자열이 없고 `{ type: "L", from, to }`만 보입니다.

## 명령 정리

| 명령 | 절대 | 상대 |
|------|------|------|
| 가로 | `H x` | `h dx` |
| 세로 | `V y` | `v dy` |

| | `L x y` | `H` / `V` |
|---|---------|-----------|
| 표현 | 두 축 동시 | 한 축만 |
| segment | `L` | `L` (동일) |
| 용도 | 일반 | 와이어프레임·그리드·손코딩 |

## 파서 동작

```js
// index.js — 개념
if (upper === "H") {
  pushLine({ x: relative ? current.x + x : x, y: current.y });
}
if (upper === "V") {
  pushLine({ x: current.x, y: relative ? current.y + y : y });
}
```

`pushLine`이 `from: current`, `to: 목표`인 `L` segment를 push하고 `current`를 갱신합니다.

```js
import { parsePathD, pathDFromSegments } from "svg-matrix-core";

const segments = parsePathD("M 10 20 H 100 V 80");
// [
//   { type: "M", point: { x: 10, y: 20 } },
//   { type: "L", from: { x: 10, y: 20 }, to: { x: 100, y: 20 } },
//   { type: "L", from: { x: 100, y: 20 }, to: { x: 100, y: 80 } }
// ]

pathDFromSegments(segments);
// 보통 "M 10 20 L 100 20 L 100 80" — H/V로 다시보내지 않음
```

### implicit `L` after `M`

`M` 다음 토큰이 좌표만 오면 SVG는 **암시적 `L`**로 이어집니다. `H`/`V`도 같은 규칙 안에서 동작합니다 ([003](./lesson-003.md)).

## 왜 정규화하나

| 레이어 | H/V |
|--------|-----|
| import / `d` 문자열 | 있을 수 있음 |
| segment graph | **`L`만** |
| stroke hit | `distancePointToSegment` on `L` ([004](./lesson-004.md)) |
| bbox | `L` 끝점 min/max ([012](./lesson-012.md)) |
| path editor | anchor 이동 → `L` ([024](./lesson-024.md)) |

H/V 전용 편집 분기를 없애면 C/Q/A와 같은 파이프라인을 재사용합니다.

## export · 손코딩

다시 `H`/`V`로 줄이는 **역변환**은 선택 사항입니다 (파일 크기·가독성). core `pathDFromSegments`는 기본 **L** 출력.

```txt
M 0 0 H 100 V 50   ← 사람이 읽기 쉬움
M 0 0 L 100 0 L 100 50   ← 엔진 내부
```

Figma·Illustrator export가 H/V를 쓰면 import → `parsePathD` → 편집 → `pathDFromSegments`.

## 테스트 예

```js
parsePathD("M 0 0 H 100 V 50 h -20 v -10");
// M + 4개의 L — 상대 h/v 포함
```

## Core API

- `parsePathD` — H/V → `L` 정규화  
- `pathDFromSegments`, `pathFromD`  
- `parsePathMoveLine` — `parsePathD` 별칭 (이름만 M/L/Z 용도)

## 관련

- [003](./lesson-003.md) M/L/Z · [008](./lesson-008.md) C · [010](./lesson-010.md) S/T (다른 sugar)

## 오늘의 핵심

H/V는 **저장·가독성용 sugar**, segment graph는 **L로 충분**합니다. 파서 한곳에서 정규화하면 hit·bbox·편집기가 곡선 명령과 같은 코드 경로를 탑니다.
