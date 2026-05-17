---
id: "024"
title: "mini path editor — SVG round-trip"
part: "Part 6. Path editor capstone"
demo: "path-editor"
---

# mini path editor — SVG round-trip

Part 6 **캡스톤**입니다. [003](./lesson-003.md) grammar → [021](./lesson-021.md) handles → [022](./lesson-022.md) hit → [023](./lesson-023.md) drag를 한 화면에서 돌립니다. 목표는 **메모리의 segment graph ↔ SVG `d` 문자열**이 끊기지 않는다는 것을 증명하는 것입니다.

<LessonDemo id="024" />

## 한 바퀴 — 데이터 흐름

```txt
  import / paste                    편집 (pointer)
        │                                │
        ▼                                ▼
   pathFromD(d)              hitTestPathHandles → updatePathHandle
        │                                │
        ▼                                ▼
   segment[]  ───── syncPathEndpoints ───► segment[]
        │                                │
        └──────── pathDFromSegments ◄──┘
                        │
                        ▼
              <path d="..." />  (브라우저 렌더)
```

브라우저 SVG는 **뷰어**입니다. hit·동기화·직렬화는 `svg-matrix-core` + `path-editor.js`가 합니다.

## core API 연결

```js
import {
  pathFromD,
  pathDFromSegments,
  listPathHandles,
  hitTestPathHandles,
  updatePathHandle,
  syncPathEndpoints
} from "svg-matrix-core";

// 1) load
let { segments } = pathFromD("M 80 280 C 120 80, 520 360, 560 120");

// 2) hit (handles 배열을 먼저 만듦)
const handles = listPathHandles(segments);
const hit = hitTestPathHandles(pointer, handles, 12);

// 3) drag
if (hit) {
  segments = updatePathHandle(segments, hit.id, newPoint);
  // 내부에서 syncPathEndpoints — 인접 segment from/to 일치
}

// 4) serialize
const d = pathDFromSegments(segments);
```

### handle `id` 규칙

| id | 의미 |
|----|------|
| `a:0` | segment 0 anchor (보통 `M` 또는 끝점) |
| `c1:2` | segment 2 cubic의 `cp1` |
| `c2:2` | segment 2 cubic의 `cp2` |
| `c:1` | segment 1 quadratic의 `cp` |

[023](./lesson-023.md) `updatePathHandle`이 role 문자열로 분기합니다.

## `createPathEditor` (데모 UI)

```js
import { createPathEditor } from "../lesson_runtime/path-editor.js";

const editor = createPathEditor(canvasElement, {
  initialD: "M 80 280 C 120 80, 520 360, 560 120",
  showControls: true,   // cp1/cp2 점선 가이드
  allowDrag: true,
  onChange({ segments, d, handles }) {
    readout.textContent = d;
  }
});

editor.setPathD(pastedD);  // Apply 버튼
editor.getState();         // { segments, d, handles }
editor.destroy();
```

### pointer → user space

`path-editor.js`의 `clientToSvg`는 viewBox 스케일을 반영합니다 ([001](./lesson-001.md), [056](./lesson-056.md)). layer `<g transform>`이 있으면 **그 inverse를 먼저** 적용해야 합니다 ([079](./lesson-079.md)–[080](./lesson-080.md)).

## 데모에서 할 일

1. **파란 anchor / 흰 control** — 드래그해 곡선이 움직이는지  
2. **점선 가이드** — `showControls: true`일 때 cp1/cp2 팔  
3. textarea에 `d` 붙여넣고 **Apply** — `parsePathD` 오류 시 readout에 `parse error`  
4. **Copy d** — 클립보드로 round-trip 확인  

## Figma / export 어댑터

| 세계 | 표현 |
|------|------|
| 편집기 메모리 | `segment[]` + handles |
| SVG wire | `d` |
| Figma | vector network ([040](./lesson-040.md)) |

편집 코어는 **항상 segment**에 두고, Figma·SVG·GPU는 adapter입니다. export 시에만 [080](./lesson-080.md) bake를 선택합니다.

## round-trip 함정

| 입력 | 증상 | 대응 |
|------|------|------|
| 잘못된 `d` 문법 | parse throw | Apply 시 catch |
| `A` arc segment | handle 모델이 C-centric | [053](./lesson-053.md) convert 후 편집 |
| anchor만 옮기고 sync 누락 | path 틈 | `pathFromD` / `syncPathEndpoints` |
| 소수점 폭주 | 파일 커짐 | serialize 시 round ([050](./lesson-050.md)) |

## 의도적으로 없는 것

- pen tool (segment 추가/삭제)  
- undo/redo  
- boolean ([028](./lesson-028.md))  
- 스냅·교차 ([075](./lesson-075.md))  
- compound subpath UI — `createCompoundPathEditor` ([054](./lesson-054.md))는 별도  

mini editor는 **루프 증명**이 목적입니다.

## Core API 요약

| 단계 | 함수 |
|------|------|
| parse | `parsePathD`, `pathFromD` |
| handles | `listPathHandles`, `hitTestPathHandles` |
| edit | `updatePathHandle`, `syncPathEndpoints` |
| serialize | `pathDFromSegments`, `pathFromSegments` |
| UI | `createPathEditor`, `createCompoundPathEditor` — `path-editor.js` |

## 관련 강의

- [021](./lesson-021.md)–[023](./lesson-023.md) · [004](./lesson-004.md) hit · [080](./lesson-080.md) transform  

## 오늘의 핵심

벡터 편집기 최소 루프 = **graph in memory, `d` on wire**. 이 데모가 돌아가면 나머지는 도구·레이어·boolean을 얹는 문제입니다.
