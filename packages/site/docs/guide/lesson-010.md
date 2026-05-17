---
id: "010"
title: "S, T — smooth continuation"
part: "Part 1. Path grammar"
demo: "path-smooth"
---

# S, T — smooth continuation

`S`/`T`는 **이전 segment의 control point를 반사(reflect)** 해 매끄러운 연속 곡선을 만드는 축약입니다. 필기·프리드로우 stroke에서 C1 연속을 유지할 때 자주 씁니다.

<LessonDemo id="010" />

## S — smooth cubic

이전 segment가 `C`일 때, 이전 `cp2`를 anchor 기준으로 반사한 점이 새 `cp1`이 됩니다.

```txt
이전: … C cp2x cp2y, anchor
다음: S cpx cpy, end
→ 내부 cp1 = reflect(anchor, cp2)
```

```js
import { reflectControlForSmoothContinuation } from "svg-matrix-core";

const cp1 = reflectControlForSmoothContinuation(anchor, previousCp2);
```

## T — smooth quadratic

이전 `Q`의 control을 반사해 다음 quadratic의 control을 자동 생성합니다.

## 편집기에서

- 사용자는 **anchor**만 드래그해도, 반사 규칙으로 cp1이 따라옵니다.
- `S`/`T`를 펼치면 항상 명시적 `C`/`Q` segment 리스트가 됩니다.

## Core API

- `reflectControlForSmoothContinuation`
- `parsePathD` — S/T 파싱 후 C/Q로 전개

## 관련 강의

- [008 C cubic](./lesson-008.md)
- [009 Q quadratic](./lesson-009.md)
- [069 smooth reflect](./lesson-069.md)

## 오늘의 핵심

smooth 명령은 **저장 형식**이지 다른 곡선 family가 아닙니다. 파서·편집기는 반사 규칙 한 곳에 모아 두세요.
