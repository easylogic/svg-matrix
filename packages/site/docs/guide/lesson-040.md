---
id: "040"
title: "vector network vs path d"
part: "Part 10. Figma ↔ SVG bridge"
demo: "figma-vector-network"
---

# vector network vs path d

Figma **vectorNetwork** (vertices + segments)와 SVG **`d`** 는 같은 곡선의 두 표현입니다. 편집기는 network, 브라우저·export는 `d`가 일반적입니다.

<LessonDemo id="040" />

## 데모에서 볼 것

```txt
M 80 120 C 140 40, 500 360, 560 120
```

- 파란 **path** — SVG `d`  
- readout:
  - `FIGMA_VECTOR_MODEL.figma` → `FIGMA_VECTOR_MODEL.svg`  
  - `pathDToFigmaNetwork(d)` → JSON `vertices` / `segments`  
  - `figmaNetworkToPathD(network)` → **rebuilt d** (round-trip 확인)  

## network 구조

```js
{
  vertices: [{ x, y }, …],
  segments: [
    { start: 0, end: 1 },                                    // line
    { start: 1, end: 2, tangentStart, tangentEnd }         // cubic
  ],
  closed: false
}
```

| Figma | SVG `d` |
|-------|---------|
| vertex | `M` / `L` / `C` 끝점 |
| segment + tangents | `C cp1 cp2 x y` |
| closed flag | `Z` |

## 변환 API

```js
import {
  figmaNetworkToPathD,
  pathDToFigmaNetwork,
  FIGMA_VECTOR_MODEL
} from "svg-matrix-core";

const network = pathDToFigmaNetwork(pathD);
const rebuilt = figmaNetworkToPathD(network);
```

`pathFromD` / `pathDFromSegments`([003](./lesson-003.md))와 함께 쓰면 segments graph를 중간에 둘 수 있습니다.

## path editor 연결

```txt
Figma plugin     → vectorNetwork
import           → parsePathD → segments
UI               → listPathHandles ([021](./lesson-021.md))
export SVG       → pathDFromSegments / figmaNetworkToPathD
```

[024](./lesson-024.md) capstone editor는 `d` 중심; Figma sync는 network ↔ `d` 브리지.

## Core API

| 함수 / 상수 | 역할 |
|-------------|------|
| `figmaNetworkToPathD` | network → `d` |
| `pathDToFigmaNetwork` | `d` → network |
| `FIGMA_VECTOR_MODEL` | 문서용 요약 문자열 |

## 관련

- [003](./lesson-003.md) · [021](./lesson-021.md) · [024](./lesson-024.md) · [042](./lesson-042.md)

## 오늘의 핵심

저장(network)과 전송(`d`)을 분리하면 Figma·SVG·내부 segments가 **한 geometry 엔진**을 공유합니다.
