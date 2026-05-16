---
id: "004"
title: "점에서 stroke까지의 거리"
part: "Part 2. Stroke geometry"
demo: "004"
---

# 점에서 stroke까지의 거리

얇은 path를 클릭하기 어렵기 때문에, 편집기는 **보이는 stroke**와 **잡히는 stroke**를 분리합니다.

<LessonDemo id="004" />

## 판정식

segment `AB`와 점 `P`에 대해:

```txt
t = clamp( dot(P-A, B-A) / |B-A|^2 , 0, 1 )
closest = A + t(B-A)
distance = |P - closest|
hit  <=>  distance <= strokeWidth / 2
```

`svg-matrix-core`의 `distancePointToSegment`가 이 공식입니다.

## helper stroke

```xml
<path stroke="black" stroke-width="2" />
<path stroke="transparent" stroke-width="16" pointer-events="stroke" />
```

## 오늘의 핵심

stroke hit은 fill hit과 다른 코드 경로입니다. fill은 winding, stroke는 거리장입니다.
