---
id: "085"
title: "Gaussian blur kernel"
part: "Part 21. Compositing math"
demo: "geom-gaussian"
---

# Gaussian blur kernel

G(x)∝e^(−x²/2σ²). separable 2D blur = 두 번 1D convolution.

<LessonDemo id="085" />

## Core API

`gaussianKernel1D, convolve1D` — `packages/svg-matrix-core/src/geometry.js`

## 오늘의 핵심

수식을 `svg-matrix-core`에서 직접 실행해 보세요. 브라우저 SVG는 결과만 보여 주고, 편집기는 같은 코드가 필요합니다.
