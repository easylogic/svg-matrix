---
id: "086"
title: "Porter–Duff & premultiplied α"
part: "Part 21. Compositing math"
demo: "geom-porter-duff"
---

# Porter–Duff & premultiplied α

source-over: out = src + dst·(1−α_src). premultiplied는 GPU 합성 표준.

<LessonDemo id="086" />

## Core API

`porterDuffSourceOver, premultiplyColor` — `packages/svg-matrix-core/src/geometry.js`

## 오늘의 핵심

수식을 `svg-matrix-core`에서 직접 실행해 보세요. 브라우저 SVG는 결과만 보여 주고, 편집기는 같은 코드가 필요합니다.
