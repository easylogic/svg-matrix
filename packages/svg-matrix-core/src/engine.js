import { arcSegmentToCubics } from "./arc.js";
import {
  add,
  cubicBezierPoint,
  cubicBezierTangent,
  distancePointToSegment,
  flattenPathSegments,
  length,
  normalize,
  parsePathD,
  pathDFromSegments,
  pathFromD,
  pathLength,
  pointAtPathLength,
  polylineLength,
  quadraticBezierPoint,
  scale,
  segmentsToSubpaths,
  subtract,
  syncPathEndpoints
} from "./index.js";

export { arcSegmentToCubics, svgArcCenterParameters } from "./arc.js";

export function parseDashArray(value) {
  if (value == null || value === "" || value === "none") return [];
  const parts = String(value)
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (!parts.length || parts.some((n) => Number.isNaN(n) || n < 0)) {
    throw new Error(`Invalid stroke-dasharray: ${value}`);
  }
  return parts;
}

export function formatDashArray(pattern) {
  if (!pattern?.length) return "none";
  return pattern.join(" ");
}

export function dashPatternPeriod(pattern) {
  if (!pattern.length) return 0;
  return pattern.reduce((sum, value) => sum + value, 0);
}

export function dashPatternPhaseAtLength(distance, pattern, offset = 0) {
  const period = dashPatternPeriod(pattern);
  if (!period) return { phase: 0, on: true, period: 0, index: 0 };
  let phase = (((distance + offset) % period) + period) % period;
  let index = 0;
  let on = true;
  while (index < pattern.length) {
    const span = pattern[index];
    if (phase < span) break;
    phase -= span;
    index += 1;
    on = !on;
  }
  return { phase, on, period, index };
}

export function strokeDashIntervals(pathDistance, pattern, offset = 0) {
  const period = dashPatternPeriod(pattern);
  if (!period || pathDistance <= 0) return [];
  const intervals = [];
  let cursor = 0;
  while (cursor < pathDistance) {
    const phaseInfo = dashPatternPhaseAtLength(cursor, pattern, offset);
    const span = pattern[phaseInfo.index] ?? period;
    const step = Math.min(span - phaseInfo.phase, pathDistance - cursor);
    if (phaseInfo.on) intervals.push({ start: cursor, end: cursor + step });
    cursor += step;
  }
  return intervals;
}

export function sampleStrokeDash(pathDistance, pattern, offset = 0, sampleCount = 64) {
  const samples = [];
  for (let i = 0; i <= sampleCount; i += 1) {
    const d = (pathDistance * i) / sampleCount;
    const phase = dashPatternPhaseAtLength(d, pattern, offset);
    samples.push({ distance: d, on: phase.on, phase: phase.phase, index: phase.index });
  }
  return samples;
}

function lineNormal(from, to) {
  const dir = normalize(subtract(to, from));
  return { x: -dir.y, y: dir.x };
}

export function offsetPolyline(points, distance, closed = false) {
  if (points.length < 2) return [];
  const n = points.length;
  const offsetPoints = [];

  for (let i = 0; i < n; i += 1) {
    const prev = points[closed ? (i - 1 + n) % n : Math.max(0, i - 1)];
    const curr = points[i];
    const next = points[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];

    let normal;
    if (!closed && i === 0) normal = lineNormal(curr, next);
    else if (!closed && i === n - 1) normal = lineNormal(prev, curr);
    else {
      const n1 = lineNormal(prev, curr);
      const n2 = lineNormal(curr, next);
      normal = normalize(add(n1, n2));
      const turn = subtract(curr, prev);
      const outgoing = subtract(next, curr);
      const cross = turn.x * outgoing.y - turn.y * outgoing.x;
      if (Math.abs(cross) < 1e-10) normal = n2;
    }

    offsetPoints.push(add(curr, scale(normal, distance)));
  }

  return offsetPoints;
}

export function offsetPathD(d, distance, options = {}) {
  const { closed = false, flattenOptions = {} } = options;
  const { segments } = pathFromD(d);
  const points = flattenPathSegments(segments, flattenOptions);
  if (points.length < 2) return { d, pointCount: points.length };
  const offsetPoints = offsetPolyline(points, distance, closed);
  let rebuilt = `M ${offsetPoints[0].x} ${offsetPoints[0].y}`;
  for (let i = 1; i < offsetPoints.length; i += 1) {
    rebuilt += ` L ${offsetPoints[i].x} ${offsetPoints[i].y}`;
  }
  if (closed) rebuilt += " Z";
  return { d: rebuilt, pointCount: offsetPoints.length };
}

function splitCubic(p0, p1, p2, p3) {
  const m01 = add(scale(p0, 0.5), scale(p1, 0.5));
  const m12 = add(scale(p1, 0.5), scale(p2, 0.5));
  const m23 = add(scale(p2, 0.5), scale(p3, 0.5));
  const m012 = add(scale(m01, 0.5), scale(m12, 0.5));
  const m123 = add(scale(m12, 0.5), scale(m23, 0.5));
  const mid = add(scale(m012, 0.5), scale(m123, 0.5));
  return {
    left: { p0, p1: m01, p2: m012, p3: mid },
    right: { p0: mid, p1: m123, p2: m23, p3 }
  };
}

export function flattenCubicAdaptive(p0, p1, p2, p3, tolerance, points) {
  const mid = cubicBezierPoint(p0, p1, p2, p3, 0.5);
  const deviation = distancePointToSegment(mid, p0, p3);
  if (deviation <= tolerance) {
    points.push({ ...p3 });
    return;
  }
  const { left, right } = splitCubic(p0, p1, p2, p3);
  flattenCubicAdaptive(left.p0, left.p1, left.p2, left.p3, tolerance, points);
  flattenCubicAdaptive(right.p0, right.p1, right.p2, right.p3, tolerance, points);
}

export function flattenQuadraticAdaptive(p0, p1, p2, tolerance, points) {
  const mid = quadraticBezierPoint(p0, p1, p2, 0.5);
  const deviation = distancePointToSegment(mid, p0, p2);
  if (deviation <= tolerance) {
    points.push({ ...p2 });
    return;
  }
  const q01 = add(scale(p0, 0.5), scale(p1, 0.5));
  const q12 = add(scale(p1, 0.5), scale(p2, 0.5));
  const midPoint = add(scale(q01, 0.5), scale(q12, 0.5));
  flattenQuadraticAdaptive(p0, q01, midPoint, tolerance, points);
  flattenQuadraticAdaptive(midPoint, q12, p2, tolerance, points);
}

export function flattenPathSegmentsAdaptive(segments, options = {}) {
  const tolerance = options.tolerance ?? 0.5;
  const points = [];
  for (const segment of segments) {
    if (segment.type === "M") {
      points.push({ ...segment.point });
      continue;
    }
    if (segment.type === "L") {
      points.push({ ...segment.to });
      continue;
    }
    if (segment.type === "C") {
      flattenCubicAdaptive(segment.from, segment.cp1, segment.cp2, segment.to, tolerance, points);
      continue;
    }
    if (segment.type === "Q") {
      flattenQuadraticAdaptive(segment.from, segment.cp, segment.to, tolerance, points);
      continue;
    }
    if (segment.type === "A") {
      const cubics = arcSegmentToCubics(segment);
      for (const cubic of cubics) {
        flattenCubicAdaptive(cubic.from, cubic.cp1, cubic.cp2, cubic.to, tolerance, points);
      }
    }
  }
  return points;
}

export function convertArcsToCubics(segments) {
  const out = [];
  for (const segment of segments) {
    if (segment.type === "A") out.push(...arcSegmentToCubics(segment));
    else out.push(segment);
  }
  return syncPathEndpoints(out);
}

export function convertArcsInPathD(d) {
  const segments = parsePathD(d);
  const converted = convertArcsToCubics(segments);
  return { d: pathDFromSegments(converted), segments: converted, arcCount: segments.filter((s) => s.type === "A").length };
}

export function subpathsToSegments(subpaths) {
  return syncPathEndpoints(subpaths.flat());
}

export function listSubpathHandles(segments) {
  return segmentsToSubpaths(segments).flatMap((subpath, subpathIndex) =>
    listPathHandlesForSubpath(subpath).map((handle) => ({
      ...handle,
      subpathIndex,
      id: `s${subpathIndex}:${handle.id}`
    }))
  );
}

function listPathHandlesForSubpath(segments) {
  const handles = [];
  segments.forEach((segment, segmentIndex) => {
    if (segment.type === "M") {
      handles.push({ id: `a:${segmentIndex}`, kind: "anchor", segmentIndex, point: { ...segment.point } });
      return;
    }
    if (segment.type === "L") {
      handles.push({ id: `a:${segmentIndex}`, kind: "anchor", segmentIndex, point: { ...segment.to } });
      return;
    }
    if (segment.type === "C") {
      handles.push(
        { id: `c1:${segmentIndex}`, kind: "control", role: "cp1", segmentIndex, point: { ...segment.cp1 } },
        { id: `c2:${segmentIndex}`, kind: "control", role: "cp2", segmentIndex, point: { ...segment.cp2 } },
        { id: `a:${segmentIndex}`, kind: "anchor", segmentIndex, point: { ...segment.to } }
      );
    }
  });
  return handles;
}

export function hitTestSubpathHandles(point, segments, radius = 8) {
  const handles = listSubpathHandles(segments);
  let best = null;
  let bestDistance = Infinity;
  for (const handle of handles) {
    const distance = length(subtract(point, handle.point));
    if (distance <= radius && distance < bestDistance) {
      best = handle;
      bestDistance = distance;
    }
  }
  return best;
}

export function updateSubpathHandle(segments, handleId, point) {
  const match = String(handleId).match(/^s(\d+):(.+)$/);
  if (!match) throw new Error(`Expected subpath handle id sN:role:index, got ${handleId}`);
  const subpathIndex = Number(match[1]);
  const innerId = match[2];
  const subpaths = segmentsToSubpaths(segments);
  if (!subpaths[subpathIndex]) throw new Error(`Unknown subpath: ${subpathIndex}`);
  subpaths[subpathIndex] = updateSubpathInnerHandle(subpaths[subpathIndex], innerId, point);
  return subpathsToSegments(subpaths);
}

function updateSubpathInnerHandle(segments, handleId, point) {
  const next = JSON.parse(JSON.stringify(segments));
  const [role, indexValue] = handleId.split(":");
  const segmentIndex = Number(indexValue);
  const segment = next[segmentIndex];
  if (!segment) throw new Error(`Unknown handle: ${handleId}`);

  if (role === "a") {
    if (segment.type === "M") segment.point = { ...point };
    else if (segment.type === "L" || segment.type === "C" || segment.type === "Q") segment.to = { ...point };
  } else if (role === "c1" && segment.type === "C") segment.cp1 = { ...point };
  else if (role === "c2" && segment.type === "C") segment.cp2 = { ...point };
  else if (role === "c" && segment.type === "Q") segment.cp = { ...point };
  else throw new Error(`Cannot update handle ${handleId}`);

  return syncPathEndpoints(next);
}

export function compareFlattenMethods(segments, options = {}) {
  const uniform = flattenPathSegments(segments, options);
  const adaptive = flattenPathSegmentsAdaptive(segments, options);
  return {
    uniformCount: uniform.length,
    adaptiveCount: adaptive.length,
    uniformLength: polylineLength(uniform),
    adaptiveLength: polylineLength(adaptive)
  };
}

function lerpScalar(a, b, t) {
  return a + (b - a) * t;
}

function lerpPt(a, b, t) {
  return { x: lerpScalar(a.x, b.x, t), y: lerpScalar(a.y, b.y, t) };
}

function lerpSegmentMorph(segA, segB, t) {
  if (segA.type !== segB.type) return segA;
  if (segA.type === "M") return { type: "M", point: lerpPt(segA.point, segB.point, t) };
  if (segA.type === "L") {
    return { type: "L", from: lerpPt(segA.from, segB.from, t), to: lerpPt(segA.to, segB.to, t) };
  }
  if (segA.type === "C") {
    return {
      type: "C",
      from: lerpPt(segA.from, segB.from, t),
      cp1: lerpPt(segA.cp1, segB.cp1, t),
      cp2: lerpPt(segA.cp2, segB.cp2, t),
      to: lerpPt(segA.to, segB.to, t)
    };
  }
  if (segA.type === "Q") {
    return {
      type: "Q",
      from: lerpPt(segA.from, segB.from, t),
      cp: lerpPt(segA.cp, segB.cp, t),
      to: lerpPt(segA.to, segB.to, t)
    };
  }
  return segA;
}

/** Morph between paths with identical segment command lists. */
export function morphPathDLinear(dFrom, dTo, t) {
  const clamped = Math.min(1, Math.max(0, t));
  const segsA = parsePathD(dFrom);
  const segsB = parsePathD(dTo);
  if (segsA.length !== segsB.length) {
    return { compatible: false, d: clamped < 0.5 ? dFrom : dTo, t: clamped };
  }
  for (let i = 0; i < segsA.length; i += 1) {
    if (segsA[i].type !== segsB[i].type) {
      return { compatible: false, d: clamped < 0.5 ? dFrom : dTo, t: clamped };
    }
  }
  const morphed = segsA.map((seg, index) => lerpSegmentMorph(seg, segsB[index], clamped));
  return { compatible: true, d: pathDFromSegments(morphed), t: clamped };
}

/** Precomputed cumulative distances along flattened path (for uniform-speed motion). */
export function buildArcLengthLookup(segments, options = {}) {
  const stepsPerCurve = options.stepsPerCurve ?? 32;
  const points = flattenPathSegments(segments, { stepsPerCurve });
  if (points.length === 0) return { cumulative: [0], total: 0, points: [] };
  const cumulative = [0];
  for (let i = 1; i < points.length; i += 1) {
    cumulative.push(cumulative[i - 1] + length(subtract(points[i], points[i - 1])));
  }
  return { cumulative, total: cumulative[cumulative.length - 1], points, stepsPerCurve };
}

function pointAtArcLengthLookup(lookup, distance) {
  const { cumulative, points, total } = lookup;
  if (!points.length) return { point: { x: 0, y: 0 }, tangent: { x: 1, y: 0 }, index: 0 };
  const target = Math.min(total, Math.max(0, distance));
  if (target <= 0) {
    const tangent = normalize(subtract(points[1] ?? points[0], points[0]));
    return { point: { ...points[0] }, tangent, index: 0 };
  }
  let lo = 0;
  let hi = cumulative.length - 1;
  while (lo < hi - 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (cumulative[mid] <= target) lo = mid;
    else hi = mid;
  }
  const span = cumulative[hi] - cumulative[lo] || 1;
  const t = (target - cumulative[lo]) / span;
  const point = add(points[lo], scale(subtract(points[hi], points[lo]), t));
  const tangent = normalize(subtract(points[hi], points[lo]));
  return { point, tangent, index: lo };
}

/** progress∈[0,1] maps linearly to arc length (uniform speed along polyline approximation). */
export function sampleMotionAlongPathUniform(segments, progress, options = {}) {
  const lookup = options.lookup ?? buildArcLengthLookup(segments, options);
  const p = Math.min(1, Math.max(0, progress));
  const sample = pointAtArcLengthLookup(lookup, p * lookup.total);
  return {
    point: sample.point,
    tangent: sample.tangent,
    distance: p * lookup.total,
    progress: p,
    totalLength: lookup.total,
    lookup
  };
}

function drawableSegments(segments) {
  return segments.filter((s) => s.type !== "M" && s.type !== "Z");
}

function sampleDrawableAtParameter(segment, t) {
  const clamped = Math.min(1, Math.max(0, t));
  if (segment.type === "L") {
    return {
      point: add(segment.from, scale(subtract(segment.to, segment.from), clamped)),
      tangent: normalize(subtract(segment.to, segment.from))
    };
  }
  if (segment.type === "C") {
    return {
      point: cubicBezierPoint(segment.from, segment.cp1, segment.cp2, segment.to, clamped),
      tangent: cubicBezierTangent(segment.from, segment.cp1, segment.cp2, segment.to, clamped)
    };
  }
  if (segment.type === "Q") {
    return {
      point: quadraticBezierPoint(segment.from, segment.cp, segment.to, clamped),
      tangent: normalize(
        add(
          scale(subtract(segment.cp, segment.from), 2 * (1 - clamped)),
          scale(subtract(segment.to, segment.cp), 2 * clamped)
        )
      )
    };
  }
  return { point: { ...segment.to }, tangent: { x: 1, y: 0 } };
}

/** progress∈[0,1] splits evenly across segment count (SMIL-style parameter speed, not arc length). */
export function sampleMotionAlongPathByParameter(segments, progress) {
  const drawable = drawableSegments(segments);
  if (!drawable.length) {
    return { point: { x: 0, y: 0 }, tangent: { x: 1, y: 0 }, progress: 0, segmentIndex: 0, localT: 0 };
  }
  const p = Math.min(1, Math.max(0, progress));
  const scaled = p * drawable.length;
  const segmentIndex = Math.min(drawable.length - 1, Math.floor(scaled));
  const localT = scaled - segmentIndex;
  const sample = sampleDrawableAtParameter(drawable[segmentIndex], localT);
  return { ...sample, progress: p, segmentIndex, localT };
}

/** progress ∈ [0,1] by arc length — JS motion engine helper */
export function sampleMotionAlongPath(segments, progress, options = {}) {
  const total = pathLength(segments, options);
  if (total <= 0) {
    return { point: { x: 0, y: 0 }, tangent: { x: 1, y: 0 }, distance: 0, progress: 0, totalLength: 0 };
  }
  const p = Math.min(1, Math.max(0, progress));
  const distance = p * total;
  const sample = pointAtPathLength(segments, distance, options);
  return {
    point: sample.point,
    tangent: sample.tangent,
    distance,
    progress: p,
    totalLength: total
  };
}
