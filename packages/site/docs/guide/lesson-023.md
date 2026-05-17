---
id: "023"
title: "handle drag로 segment 갱신"
part: "Part 6. Path editor capstone"
demo: "handle-drag"
---

# handle drag로 segment 갱신

handle을 드래그하면 **segment graph**가 바뀌고, 연결된 segment의 `from`/`to`가 동기화됩니다. 화면의 `d` 속성은 매 프레임 또는 mouseup 시 **직렬화**합니다.

<LessonDemo id="023" />

## 데모에서 볼 것

- `createPathEditor` — **allowDrag: true**  
- 파란 **anchor**, 흰 **control** — control polygon 점선  
- 드래그 시 readout에 **live `d` 문자열** + handle 개수  
- `path-editor.js`가 `updatePathHandle` → `pathDFromSegments` 호출  

## updatePathHandle

```js
import { updatePathHandle, pathDFromSegments, pathFromD } from "svg-matrix-core";

let { segments } = pathFromD(initialD);

function onHandleDrag(handleId, newPoint) {
  segments = updatePathHandle(segments, handleId, newPoint);
  const d = pathDFromSegments(segments);
  pathElement.setAttribute("d", d);
}
```

`handleId` 예: `"c1:2"` (segment 2의 cp1), `"a:3"` (segment 3의 anchor).

## endpoint 동기화

한 anchor를 움직이면 **이전 segment의 `to`**와 **다음 segment의 `from`**이 같아야 합니다. core는 `syncPathEndpoints`로 이를 유지합니다.

```js
import { pathFromD } from "svg-matrix-core";

// pathFromD = parse + syncPathEndpoints
```

드래그 중 끊긴 path가 보이면 sync가 빠진 것입니다.

## path-editor 구조

```53:77:/Users/user/github/math/svg-matrix/packages/lesson_runtime/path-editor.js
  let segments = pathFromD(initialD).segments;
  // renderGuides: control polygon 점선
  // renderHandles: anchor/control 원
  // pointerdown → hitTestPathHandles → activeHandle
  // pointermove → updatePathHandle → pathDFromSegments
```

## cubic control 가이드

`C` segment는 `from–cp1`, `to–cp2` 점선이 **control polygon**입니다. [008](./lesson-008.md)에서 본 네 점과 동일합니다.

## Core API

- `updatePathHandle`, `updateSubpathHandle`
- `pathDFromSegments`, `pathFromD`, `syncPathEndpoints`
- `createPathEditor` — `path-editor.js`

## 다음

- [024](./lesson-024.md) — 전체 mini editor

## 오늘의 핵심

편집 = segment graph mutation. `d`는 export/렌더용 **캐시 문자열**로 생각하면 아키텍처가 단순해집니다.
