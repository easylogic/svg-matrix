---
id: "006"
title: "stroke align과 outline 개념"
part: "Part 2. Stroke geometry"
demo: "006"
---

# stroke align과 outline 개념

Figma는 inside / center / outside stroke를 고릅니다. SVG 기본 stroke는 **path 중심선**을 따라 그립니다.

<LessonDemo id="006" />

## center (SVG native)

```txt
half stroke inside fill boundary
half stroke outside fill boundary
```

## inside / outside

SVG 한 줄 속성으로 끝나지 않습니다. 보통:

```txt
inside  → offset path inward + clip to fill
outside → offset path outward
```

이건 **parallel curve / offset path** 문제입니다. Part 2 후반과 Part 3에서 이어집니다.

## 오늘의 핵심

Figma stroke align을 SVG로 옮길 때 “border-width 조절”이 아니라 **geometry offset**이라고 생각하면 설계가 맞습니다.
