---
id: "080"
title: "transform path vs group"
part: "Part 18. Transform algebra"
demo: "geom-transform-path"
---

# transform path vs group

같은 화면 결과도 **저장 방식**이 두 가지입니다: `<g transform="…">`에 matrix를 두거나, matrix를 **path 좌표에 bake**합니다. 편집기는 거의 항상 전자, export·일부 파이프라인은 후자를 씁니다.

<LessonDemo id="080" />

## 방식 비교

| | `<g transform>` | path에 bake |
|---|----------------|-------------|
| `d` 문자열 | 로컬 그대로 | 모든 점·제어점 변환됨 |
| frame 이동 | `g` matrix만 수정 | `d` 전체 재계산 |
| pointer hit | `M⁻¹` unproject ([079](./lesson-079.md)) | 좌표가 이미 world면 그대로 |
| 중첩 그룹 | 트리 유지 | flatten 시 계층 소실 |
| Figma 느낌 | layer transform | “flatten transforms” export |

데모: **회색** = 원본 `d`, **파란색** = `transformPathSegments` 후 bake된 path.

## group transform (편집 권장)

```xml
<g transform="matrix(1.2 0.1 -0.1 1.1 40 20)">
  <path d="M 120 280 C 200 80 440 320 520 120"/>
</g>
```

- path grammar·handle index가 안정적 ([021](./lesson-021.md)–[024](./lesson-024.md))  
- 여러 path가 같은 `g` 아래면 **한 번에** 이동  
- `multiplySvgMatrix(parent, child)`로 누적 ([002](./lesson-002.md))  

## bake — `transformPathSegments`

```js
import {
  parsePathD,
  pathDFromSegments,
  transformPathSegments,
  parseSvgMatrix
} from "svg-matrix-core";

const segments = parsePathD(pathD);
const matrix = parseSvgMatrix("matrix(1.2 0.1 -0.1 1.1 40 20)");
const baked = transformPathSegments(segments, matrix);
const bakedD = pathDFromSegments(baked);
```

segment 타입별로 **모든 점**에 `applyAffineMatrix`가 들어갑니다:

| type | 변환되는 점 |
|------|-------------|
| `M` | `point` |
| `L` | `from`, `to` |
| `C` | `from`, `cp1`, `cp2`, `to` |
| `Q` | `from`, `cp`, `to` |

곡선 **형태**는 affine 하에서 동일 Bézier입니다 (제어점만 이동). 비균일 scale + strong skew에서는 시각적으로 “다른” handle 배치처럼 보일 수 있어 UI는 group 쪽이 낫습니다.

## 언제 bake하나

- SVG export “flatten transforms” 옵션  
- boolean·offset 전에 **한 좌표계**로 맞출 때 ([028](./lesson-028.md))  
- Canvas 2D에 path를 그릴 때 CTM 없이 `d`만 넘기는 경우  
- GPU mesh: world space vertex buffer ([100](./lesson-100.md))  

편집 **세션 중**에는 bake하지 않고, export 버튼에서만 bake하는 제품이 많습니다.

## pointer unproject (group 편집 시)

```js
import { invertAffineMatrix, applyAffineMatrix } from "svg-matrix-core";

const world = multiplySvgMatrix(parentMatrix, nodeMatrix);
const local = applyAffineMatrix(invertAffineMatrix(world), pointerUser);
// local에서 closestPointOnCubic / classifyPointInPath
```

[079](./lesson-079.md) `decomposeAffineMatrix`는 Inspector “회전/스케일” 표시용입니다.

## bake 후 편집하면?

bake된 `d`만 남으면 “원래 로컬 path + transform” 정보가 사라집니다. 되돌리려면 역행렬을 **다시 곱해** unbake하거나, 편집기 history에 pre-bake snapshot을 둡니다.

## 데모에서 볼 것

1. 회색·파란 path가 **같은 실루엣**인지 (같은 matrix 결과)  
2. readout — “bake matrix into coordinates vs g leaves d in local space”  
3. 파란 path만 있으면 `transform` 없이도 그려지는 이유  

## Core API

- `transformPathSegments`, `applyAffineMatrix` — `geometry.js`  
- `parseSvgMatrix`, `multiplySvgMatrix`, `pathDFromSegments` — `index.js` / `engine.js`  

## 관련 강의

- [002 matrix](./lesson-002.md) · [079 inverse](./lesson-079.md) · [056 좌표 스택](./lesson-056.md)  
- [024 path editor](./lesson-024.md) — round-trip은 local `d` + layer transform  

## 오늘의 핵심

**편집 = local geometry + group matrix.** **export = 필요 시 bake.** 두 path를 혼동하면 hit test와 handle index가 어긋납니다.
