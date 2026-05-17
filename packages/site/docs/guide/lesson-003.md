---
id: "003"
title: "path d 명령어 — M, L, Z"
part: "Part 1. Path grammar"
demo: "path-grammar"
---

# path d 명령어 — M, L, Z

Part 0에서 SVG·viewBox·기본 도형([000](./lesson-000.md)–[002](./lesson-002.md), [067](./lesson-067.md))을 봤다면, 이제 **가장 유연한 도형**인 `path`로 들어갑니다. Figma vector, Illustrator path, SVG `d="..."`는 모두 **segment 연결**이고, `d`는 그 목록의 압축 문자열입니다.

<LessonDemo id="003" />

## 데모에서 볼 것

**Next path** 버튼으로 세 샘플을 순환합니다.

| # | `d` (요약) | 모양 |
|---|------------|------|
| 1 | `M 40 80 L 180 40 L 260 140 Z` | 삼각형 |
| 2 | `M 80 220 L 220 220 L 220 320 L 80 320 Z` | 사각형 |
| 3 | `M 320 80 L 520 80 L 420 200 Z` | 삼각형 (다른 위치) |

readout: `parsed segments` 리스트 + `rebuilt d="..."` — `parsePathMoveLine` / `pathSegmentsToD`로 **파싱·재조립이 일치**하는지 확인.

## M, L, Z (문법)

| 명령 | 의미 | core segment |
|------|------|----------------|
| `M x y` | subpath 시작 (pen up → move) | `{ type: "M", point }` |
| `L x y` | 직선 (pen down) | `{ type: "L", from, to }` |
| `Z` / `z` | 시작점으로 닫기 | **`L`로 정규화** (`to` = subpath 시작) |

대문자 **절대**, 소문자 `m`/`l` **상대**. `M` 뒤에 좌표만 오면 SVG는 **암시적 `L`** ([007](./lesson-007.md) `H`/`V`도 결국 `L`).

```txt
M 10 20 L 100 20 L 100 80 Z
→ M + L + L + L(시작점으로 닫힘)
```

```js
import { parsePathD } from "svg-matrix-core";

const segments = parsePathD("M 10 20 L 100 20 L 100 80 Z");
// 마지막 segment: { type: "L", from: {100,80}, to: {10,20} }
// type: "Z" 객체는 없음
```

## segment graph = 편집 모델

```txt
저장/전송:  d 문자열
편집/수학:  segments[]
렌더:      Canvas path / SVG <path>
```

`d`만 있으면 handle drag·snap·hit test가 어렵습니다. [024](./lesson-024.md) path editor는 segments + handles가 source of truth입니다.

## parse → sync → serialize

```js
import {
  parsePathD,
  pathDFromSegments,
  pathFromD,
  pathFromSegments,
  syncPathEndpoints
} from "svg-matrix-core";

const d = "M 10 20 L 100 20 L 100 80 Z";
const segments = parsePathD(d);

const rebuilt = pathDFromSegments(segments);

const { segments: synced, d: d2 } = pathFromD(d);
// parsePathD + syncPathEndpoints + pathDFromSegments

syncPathEndpoints(segments);
// 각 L/C/Q/A의 from을 이전 끝점에 맞춤 — handle 편집 후 필수
```

별칭 (동일 구현):

```js
import { parsePathMoveLine, pathSegmentsToD } from "svg-matrix-core";
// parsePathMoveLine === parsePathD  (이름만 M/L/Z 강조)
// pathSegmentsToD === pathDFromSegments
```

## compound path — `M` … `Z` · `M` … `Z`

```txt
M 0 0 L 100 0 L 100 100 Z     ← outer
M 20 20 L 80 20 L 80 80 Z    ← hole (새 subpath)
```

```js
import { segmentsToSubpaths } from "svg-matrix-core";

segmentsToSubpaths(parsePathD(d)).length === 2;
```

[014](./lesson-014.md) `fill-rule`이 구멍을 어떻게 파이는지 결정합니다. [027](./lesson-027.md) compound 편집.

## Canvas 파이프라인

```js
ctx.beginPath();
let subpathStart = null;
for (const seg of segments) {
  if (seg.type === "M") {
    subpathStart = seg.point;
    ctx.moveTo(seg.point.x, seg.point.y);
  }
  if (seg.type === "L") ctx.lineTo(seg.to.x, seg.to.y);
  // Z는 이미 L → 마지막 L이 시작점으로 닫힘
}
ctx.closePath(); // 열린 subpath만 — Z 파싱 후엔 보통 불필요
ctx.fill(); ctx.stroke();
```

## 이후 Part 1 확장

| 강의 | 추가 segment |
|------|----------------|
| [007](./lesson-007.md) | H/V → `L` |
| [008](./lesson-008.md) | `C` |
| [009](./lesson-009.md) | `Q` |
| [011](./lesson-011.md) | `A` |
| [010](./lesson-010.md) | S/T → `C`/`Q` |

파서만 늘고 **편집 루프는 동일**: `pathFromD` → edit → `pathDFromSegments`.

## Core API

| 함수 | 역할 |
|------|------|
| `parsePathD` / `parsePathMoveLine` | `d` → segments |
| `pathDFromSegments` / `pathSegmentsToD` | segments → `d` |
| `pathFromD`, `pathFromSegments` | parse + sync + serialize |
| `syncPathEndpoints` | `from`/`to` 연결 복구 |
| `segmentsToSubpaths` | `M` 기준 분리 |

## 관련

- [007](./lesson-007.md) · [014](./lesson-014.md) · [024](./lesson-024.md)

## 오늘의 핵심

**`d`는 저장 형식, segment graph가 편집 모델**입니다. `Z`는 파서에서 **닫는 `L`**이 됩니다. compound는 `M`으로 subpath를 나누고, fill은 [014](./lesson-014.md)로 이어집니다.
