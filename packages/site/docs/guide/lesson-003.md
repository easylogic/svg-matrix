---
id: "003"
title: "path d 명령어 — M, L, Z"
part: "Part 1. Path grammar"
demo: "003"
---

# path d 명령어 — M, L, Z

Part 0에서 SVG가 무엇인지([000](./lesson-000.md)), viewBox·transform·기본 도형([001](./lesson-001.md), [067](./lesson-067.md), [002](./lesson-002.md))을 봤다면, 이제 **가장 유연한 도형 표현**인 `path`로 들어갑니다.

Figma vector, Illustrator path, SVG `<path d="...">`는 결국 **segment 연결**입니다. 문자열 `d`는 그 목록의 압축 표기입니다.

<LessonDemo id="003" />

## M, L, Z

| 명령 | 의미 |
|------|------|
| M | subpath 시작 (move) |
| L | 직선 segment |
| Z | 현재 subpath를 시작점으로 닫기 |

대문자는 절대 좌표, 소문자는 상대 좌표입니다.

## 내부 모델

편집기는 `d` 문자열만 들고 있으면 수정이 어렵습니다. 보통은 segment graph를 씁니다.

```ts
type Segment =
  | { type: "M"; point: Point }
  | { type: "L"; from: Point; to: Point };
```

`svg-matrix-core`의 `parsePathD` / `pathDFromSegments`가 이 최소 파이프라인을 보여줍니다. (`parsePathMoveLine`은 동일 함수의 별칭입니다.)

## 오늘의 핵심

**d는 저장 형식이고, segment가 진짜 모델**입니다. H/V/C/Q/A는 [007](./lesson-007.md)부터 parser가 확장합니다.
