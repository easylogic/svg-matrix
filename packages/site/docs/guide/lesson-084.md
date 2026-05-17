---
id: "084"
title: "evenodd parity → pixels"
part: "Part 20. Tessellation & pixels"
demo: "geom-evenodd-pixel"
---

# evenodd parity → pixels

[014](./lesson-014.md) fill hit과 **scanline**은 같은 evenodd 규칙 — edge를 지날 때마다 parity flip.

<LessonDemo id="084" />

## 데모에서 볼 것

- 사각 polygon (200,120)–(440,300)  
- 테스트 점 **(320, 210)** — 중심  
- **초록** = inside, **빨강** = outside (`evenoddParityFromRayCast`)  
- readout: `inside center lobe` + scanline 설명  

```js
import { evenoddParityFromRayCast } from "svg-matrix-core";

evenoddParityFromRayCast({ x: 320, y: 210 }, polygon);
// true | false
```

## scanline (개념)

```js
import { classifyPointInPath } from "svg-matrix-core";

for (let x = 0; x <= width; x += step) {
  const c = classifyPointInPath({ x, y }, segments, "evenodd");
  if (c.inside) spans.push(x);
}
```

[030](./lesson-030.md) scanline 데모 · bow-tie는 [025](./lesson-025.md), [027](./lesson-027.md).

## GPU vs CPU

| | CPU | GPU |
|---|-----|-----|
| preview | parity / scanline | — |
| realtime | — | triangulation ([083](./lesson-083.md), [100](./lesson-100.md)) |

## Core API

| 함수 | 역할 |
|------|------|
| `evenoddParityFromRayCast` | 점 ∈ polygon (evenodd) |
| `classifyPointInPath` | segment graph + rule |

## 관련

- [014](./lesson-014.md) · [030](./lesson-030.md) · [028](./lesson-028.md)

## 오늘의 핵심

fill-rule = **기하 API와 픽셀 래스터가 공유하는 규칙** — self-intersect는 evenodd가 직관적입니다.
