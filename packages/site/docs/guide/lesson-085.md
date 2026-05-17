---
id: "085"
title: "Gaussian blur kernel"
part: "Part 21. Compositing math"
demo: "geom-gaussian"
---

# Gaussian blur kernel

`feGaussianBlur` = 2D 가우시안 컨볼루션. 구현은 **separable 1D** (가로·세로)로 비용을 줄입니다.

<LessonDemo id="085" />

## 데모에서 볼 것

- **σ** 슬라이더 1–8  
- Canvas **막대 그래프** — 64칸 impulse → `convolve1D` 결과  
- readout: `gaussianKernel1D(σ) → separable blur`  

```js
import { gaussianKernel1D, convolve1D } from "svg-matrix-core";

const signal = Array.from({ length: 64 }, (_, i) => (i > 28 && i < 36 ? 1 : 0));
const kernel = gaussianKernel1D(sigma);
const blurred = convolve1D(signal, kernel);
```

## SVG filter

```xml
<feGaussianBlur stdDeviation="3"/>
```

`stdDeviation` ≈ σ — [031](./lesson-031.md), [032](./lesson-032.md) Figma blur mapping.

## 2D separable

```txt
image * (G_σ ⊗ G_σ) = (rows * G_σ) then (cols * G_σ)
```

## Core API

| 함수 | 역할 |
|------|------|
| `gaussianKernel1D` | 정규화 1D kernel |
| `convolve1D` | 1D convolution |

## 관련

- [031](./lesson-031.md) filters · [086](./lesson-086.md) compositing

## 오늘의 핵심

blur = **kernel + convolution** — Canvas / SVG filter / GPU는 같은 수학, 다른 실행기입니다.
