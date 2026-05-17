---
id: "028"
title: "path boolean"
part: "Part 7. Fill & winding deep dive"
demo: "path-boolean"
---

# path boolean

Figma **Union / Subtract / Intersect / Exclude**는 두 채움 영역 \(A, B\)에 대한 **집합 연산**입니다. “결과 path의 `d`”를 바로 주는 API가 아니라, 먼저 **점이 결과 안인지**를 정의하는 것이 수학적으로 정확합니다.

<LessonDemo id="028" />

## 네 가지 연산 (진리표)

`inA`, `inB` = [014](./lesson-014.md) `pointInPath` (기본 `nonzero`).

| op | inside when | 직관 |
|----|-------------|------|
| `union` | inA ∨ inB | 합치기 |
| `subtract` | inA ∧ ¬inB | A에서 B 빼기 |
| `intersect` | inA ∧ inB | 겹치는 부분만 |
| `exclude` | inA ⊕ inB | XOR — 겹침 제외 |

```js
import { parsePathD, pointInPathBoolean } from "svg-matrix-core";

const segA = parsePathD("M 20 30 L 80 30 L 80 80 L 20 80 Z");
const segB = parsePathD("M 55 35 L 105 35 L 105 85 L 55 85 Z");

const inside = pointInPathBoolean(pointer, segA, segB, "union", {
  stepsPerCurve: 16
});
```

core 구현 (`packages/svg-matrix-core/src/index.js`):

```js
const inA = pointInPath(point, segmentsA, "nonzero", options);
const inB = pointInPath(point, segmentsB, "nonzero", options);
// op에 따라 inA, inB 조합
```

## 이 레슨 데모 = **점 샘플링 시각화**

`mountPathBooleanDemo`는 **결과 path를 그리지 않습니다**.

- **파란·주황** 사각형 = A, B  
- 포인터를 움직이면 **초록 틴트** = 현재 `op`에서 `inside === true`인 위치  
- toolbar **boolean** 셀렉트: `union` / `subtract` / `intersect` / `exclude`  

겹치는 영역에서 op를 바꿔 보며 진리표를 몸으로 확인하세요.

### readout 예

```txt
pointer=(72, 58)
union → inside=true
```

## 실무: 결과 `d`는 어떻게 만드나

| 접근 | 설명 |
|------|------|
| **Polygon clip** | flatten → Clipper / boolean-op — Figma·Illustrator 계열 |
| **GPU raster** | coverage mask → contour (느리거나 해상도 의존) |
| **점 샘플링** | 이 데모 — **정의 검증·교육용**, 프로덕션 boolean 아님 |

편집기는 보통 clip 라이브러리로 **새 segment[]**를 만들고, 그다음 [024](./lesson-024.md) round-trip으로 `d`를 씁니다.

## fill-rule · compound

- `pointInPathBoolean`은 A,B 각각 `nonzero` ([025](./lesson-025.md)–[026](./lesson-026.md))  
- hole·여러 subpath는 **winding 방향**이 결과를 바꿉니다 — boolean 전에 [026](./lesson-026.md) 정리  
- self-intersect ([027](./lesson-027.md)) — evenodd vs nonzero 선택이 선행  

## Figma export

```js
import { figmaBooleanPathsToSvg, FIGMA_BOOLEAN_MAP } from "svg-matrix-core";

// UNION | SUBTRACT | INTERSECT | EXCLUDE → compound path + fill-rule
```

[042](./lesson-042.md) — 플러그인은 **결과 geometry**를 export, 이 강의는 **의미**를 맞춥니다.

## 성능 메모

포인터마다 `classifyPointInPath` × 2 — 괜찮습니다. 전 화면 픽셀 boolean preview는 해상도×면적만큼 비용이 듭니다. 실무 preview는 저해상도 raster 또는 bbox clip 후 polygon.

## Core API

- `pointInPathBoolean`, `pointInPath`, `classifyPointInPath`
- `figmaBooleanPathsToSvg`, `FIGMA_BOOLEAN_MAP` — bridge

## 관련

- [026 compound](./lesson-026.md) · [027 self-intersect](./lesson-027.md) · [042 Figma boolean](./lesson-042.md)

## 오늘의 핵심

boolean = **집합론**. `pointInPathBoolean`은 정의를 코드로 고정한 것이고, “도형 합치기” UI는 polygon clip이 담당합니다. 데모는 op별 **inside 영역**을 색으로 보여 줍니다.
