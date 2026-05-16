---
id: "005"
title: "join, cap, miter limit"
part: "Part 2. Stroke geometry"
demo: "005"
---

# join, cap, miter limit

모서리와 끝점은 선분 하나로 끝나지 않습니다. 브라우저/SVG는 규칙으로 모양을 정합니다.

<LessonDemo id="005" />

## linejoin

- `miter`: 두 방향 연장선의 교점
- `bevel`: 직선으로 잘라 연결
- `round`: 원호

## miterlimit

```txt
miter length / strokeWidth  >  miterlimit  →  bevel로 fallback
```

## linecap

- `butt`: 끝에서 자름
- `round`: 반원
- `square`: strokeWidth만큼 연장 후 자름

## 오늘의 핵심

UI에서 join/cap을 바꾸는 것은 **같은 centerline path에 다른 stroke renderer**를 쓰는 것입니다.
