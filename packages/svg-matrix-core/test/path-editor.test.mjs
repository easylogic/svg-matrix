import assert from "node:assert/strict";
import test from "node:test";
import {
  hitTestPathHandles,
  listPathHandles,
  pathFromD,
  pathFromSegments,
  parsePathD,
  pathDFromSegments,
  syncPathEndpoints,
  updatePathHandle
} from "../src/index.js";

const SAMPLE = "M 0 0 C 0 80 80 80 80 0";

test("lists anchors and controls for cubic path", () => {
  const { segments } = pathFromD(SAMPLE);
  const handles = listPathHandles(segments);
  assert.equal(handles.filter((handle) => handle.kind === "anchor").length, 2);
  assert.equal(handles.filter((handle) => handle.kind === "control").length, 2);
});

test("hit tests nearest handle within radius", () => {
  const { segments } = pathFromD(SAMPLE);
  const handles = listPathHandles(segments);
  const anchor = handles.find((handle) => handle.id === "a:1");
  const hit = hitTestPathHandles(anchor.point, handles, 4);
  assert.equal(hit.id, anchor.id);
});

test("updates anchor and keeps endpoints synced", () => {
  const { segments } = pathFromD(SAMPLE);
  const moved = updatePathHandle(segments, "a:1", { x: 120, y: 0 });
  const cubic = moved[1];
  assert.equal(cubic.type, "C");
  assert.equal(cubic.to.x, 120);
  assert.equal(cubic.to.y, 0);
  assert.deepEqual(cubic.from, { x: 0, y: 0 });
});

test("round-trips d through pathFromD", () => {
  const first = pathFromD(SAMPLE);
  const second = pathFromD(first.d);
  assert.equal(second.d, pathDFromSegments(parsePathD(SAMPLE)));
});

test("syncPathEndpoints wires consecutive segments", () => {
  const segments = syncPathEndpoints(parsePathD("M 0 0 L 10 0 L 10 10"));
  assert.deepEqual(segments[1].from, { x: 0, y: 0 });
  assert.deepEqual(segments[2].from, { x: 10, y: 0 });
});

test("pathFromSegments returns normalized graph", () => {
  const { d, segments } = pathFromSegments(parsePathD(SAMPLE));
  assert.ok(d.startsWith("M"));
  assert.equal(segments.length, 2);
});
