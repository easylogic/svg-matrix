---
id: "095"
title: "uniform speed along path"
part: "Part 24. Motion precision"
demo: "anim-uniform-motion"
---

# uniform speed along path

같은 `progress=0.5`라도 **segment마다 t를 균등 분배**하면 곡선 위에서 속도가 들쭉날쭉합니다. **arc length**로 진행하면 체감 속도가 일정해집니다.

<LessonDemo id="095" />

## Core API

- `sampleMotionAlongPathByParameter` — segment 개수 기준 parameter speed (SMIL에 가까운 느낌)
- `buildArcLengthLookup` + `sampleMotionAlongPathUniform` — 폴리라인 누적 길이로 uniform speed
- `sampleMotionAlongPath` — [018](./lesson-018.md) `pointAtPathLength` 기반 (세그먼트 그래프)

## 관련 강의

- [017 path length](./lesson-017.md) · [018 point at length](./lesson-018.md)
- [090 SMIL animateMotion](./lesson-090.md) · [094 JS motion](./lesson-094.md)
- css-matrix [051](./lesson-051.md) motion path / easing

## 오늘의 핵심

편집기 preview·게임 캐릭터 이동은 **길이 기준**으로 샘플링하세요. SMIL/CSS는 브라우저 구현에 맡기되, 오프라인 엔진은 lookup을 캐시하면 rAF에서 저렴합니다.
