import { arcSegmentToCubics } from "./arc.js";

const EPSILON = 1e-10;

export function length(vector) {
  return Math.hypot(vector.x, vector.y);
}

export function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

export function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function scale(vector, factor) {
  return { x: vector.x * factor, y: vector.y * factor };
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalize(vector) {
  const size = length(vector);
  if (size < EPSILON) return { x: 0, y: 0 };
  return { x: vector.x / size, y: vector.y / size };
}

export function distancePointToSegment(point, start, end) {
  const ab = subtract(end, start);
  const len2 = dot(ab, ab);
  if (len2 < EPSILON) return length(subtract(point, start));
  const t = clamp(dot(subtract(point, start), ab) / len2, 0, 1);
  const closest = add(start, scale(ab, t));
  return length(subtract(point, closest));
}

export function parseViewBox(value) {
  const parts = String(value)
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    throw new Error(`Invalid viewBox: ${value}`);
  }
  return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
}

export function viewBoxToViewport(viewBox, viewportWidth, viewportHeight, align = "xMidYMid", meetOrSlice = "meet") {
  const scaleX = viewportWidth / viewBox.width;
  const scaleY = viewportHeight / viewBox.height;
  const uniform = meetOrSlice === "slice" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
  const contentWidth = viewBox.width * uniform;
  const contentHeight = viewBox.height * uniform;

  let translateX = -viewBox.x * uniform;
  let translateY = -viewBox.y * uniform;

  if (align.includes("xMid")) translateX += (viewportWidth - contentWidth) / 2;
  else if (align.includes("xMax")) translateX += viewportWidth - contentWidth;

  if (align.includes("YMid")) translateY += (viewportHeight - contentHeight) / 2;
  else if (align.includes("YMax")) translateY += viewportHeight - contentHeight;

  return { scale: uniform, translateX, translateY, contentWidth, contentHeight };
}

export function parseSvgMatrix(value) {
  const match = String(value).trim().match(/^matrix\(([^)]+)\)$/i);
  if (!match) throw new Error(`Unsupported SVG matrix: ${value}`);
  const values = match[1].split(/[\s,]+/).map((part) => Number(part.trim()));
  if (values.length !== 6 || values.some(Number.isNaN)) {
    throw new Error(`Invalid SVG matrix: ${value}`);
  }
  return { a: values[0], b: values[1], c: values[2], d: values[3], e: values[4], f: values[5] };
}

export function multiplySvgMatrix(left, right) {
  return {
    a: left.a * right.a + left.c * right.b,
    b: left.b * right.a + left.d * right.b,
    c: left.a * right.c + left.c * right.d,
    d: left.b * right.c + left.d * right.d,
    e: left.a * right.e + left.c * right.f + left.e,
    f: left.b * right.e + left.d * right.f + left.f
  };
}

export function applySvgMatrix(matrix, point) {
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f
  };
}

export function parseTransformAttribute(transform) {
  const value = String(transform ?? "").trim();
  if (!value) return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

  const operations = value.match(/[a-zA-Z]+\([^)]*\)/g) ?? [];
  return operations.reduce((matrix, operation) => {
    const name = operation.slice(0, operation.indexOf("(")).trim();
    const args = operation
      .slice(operation.indexOf("(") + 1, -1)
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (args.some(Number.isNaN)) throw new Error(`Invalid transform args: ${operation}`);

    if (name === "matrix" && args.length === 6) {
      return multiplySvgMatrix(matrix, {
        a: args[0],
        b: args[1],
        c: args[2],
        d: args[3],
        e: args[4],
        f: args[5]
      });
    }
    if (name === "translate") {
      return multiplySvgMatrix(matrix, { a: 1, b: 0, c: 0, d: 1, e: args[0], f: args[1] ?? 0 });
    }
    if (name === "scale") {
      return multiplySvgMatrix(matrix, { a: args[0], b: 0, c: 0, d: args[1] ?? args[0], e: 0, f: 0 });
    }
    if (name === "rotate") {
      const radians = (args[0] * Math.PI) / 180;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      const cx = args[1] ?? 0;
      const cy = args[2] ?? 0;
      const rotation = { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 };
      const toOrigin = { a: 1, b: 0, c: 0, d: 1, e: -cx, f: -cy };
      const back = { a: 1, b: 0, c: 0, d: 1, e: cx, f: cy };
      return multiplySvgMatrix(matrix, multiplySvgMatrix(back, multiplySvgMatrix(rotation, toOrigin)));
    }
    throw new Error(`Unsupported transform operation: ${name}`);
  }, { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
}

function tokenizePath(pathData) {
  return String(pathData).trim().match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? [];
}

export function parsePathD(pathData) {
  const tokens = tokenizePath(pathData);
  if (!tokens.length) return [];

  const segments = [];
  let index = 0;
  let command = null;
  let current = { x: 0, y: 0 };
  let start = { x: 0, y: 0 };
  let lastCubicControl = null;
  let lastQuadraticControl = null;

  function readNumber() {
    return Number(tokens[index++]);
  }

  function pushLine(to) {
    segments.push({ type: "L", from: { ...current }, to: { ...to } });
    current = { ...to };
    lastCubicControl = null;
    lastQuadraticControl = null;
  }

  while (index < tokens.length) {
    const token = tokens[index];
    if (/^[a-zA-Z]$/.test(token)) command = tokens[index++];
    if (!command) break;

    const relative = command === command.toLowerCase();
    const upper = command.toUpperCase();

    if (upper === "M") {
      const x = readNumber();
      const y = readNumber();
      current = relative ? add(current, { x, y }) : { x, y };
      start = { ...current };
      segments.push({ type: "M", point: { ...current } });
      command = relative ? "l" : "L";
      continue;
    }

    if (upper === "L") {
      const x = readNumber();
      const y = readNumber();
      pushLine(relative ? add(current, { x, y }) : { x, y });
      continue;
    }

    if (upper === "H") {
      const x = readNumber();
      pushLine({ x: relative ? current.x + x : x, y: current.y });
      continue;
    }

    if (upper === "V") {
      const y = readNumber();
      pushLine({ x: current.x, y: relative ? current.y + y : y });
      continue;
    }

    if (upper === "C") {
      const cp1 = relative
        ? add(current, { x: readNumber(), y: readNumber() })
        : { x: readNumber(), y: readNumber() };
      const cp2 = relative
        ? add(current, { x: readNumber(), y: readNumber() })
        : { x: readNumber(), y: readNumber() };
      const to = relative ? add(current, { x: readNumber(), y: readNumber() }) : { x: readNumber(), y: readNumber() };
      segments.push({ type: "C", from: { ...current }, cp1, cp2, to: { ...to } });
      current = { ...to };
      lastCubicControl = { ...cp2 };
      lastQuadraticControl = null;
      continue;
    }

    if (upper === "S") {
      const reflected = lastCubicControl
        ? { x: 2 * current.x - lastCubicControl.x, y: 2 * current.y - lastCubicControl.y }
        : { ...current };
      const cp2 = relative
        ? add(current, { x: readNumber(), y: readNumber() })
        : { x: readNumber(), y: readNumber() };
      const to = relative ? add(current, { x: readNumber(), y: readNumber() }) : { x: readNumber(), y: readNumber() };
      segments.push({ type: "C", from: { ...current }, cp1: reflected, cp2, to: { ...to } });
      current = { ...to };
      lastCubicControl = { ...cp2 };
      lastQuadraticControl = null;
      continue;
    }

    if (upper === "Q") {
      const cp = relative ? add(current, { x: readNumber(), y: readNumber() }) : { x: readNumber(), y: readNumber() };
      const to = relative ? add(current, { x: readNumber(), y: readNumber() }) : { x: readNumber(), y: readNumber() };
      segments.push({ type: "Q", from: { ...current }, cp, to: { ...to } });
      current = { ...to };
      lastQuadraticControl = { ...cp };
      lastCubicControl = null;
      continue;
    }

    if (upper === "T") {
      const cp = lastQuadraticControl
        ? { x: 2 * current.x - lastQuadraticControl.x, y: 2 * current.y - lastQuadraticControl.y }
        : { ...current };
      const to = relative ? add(current, { x: readNumber(), y: readNumber() }) : { x: readNumber(), y: readNumber() };
      segments.push({ type: "Q", from: { ...current }, cp, to: { ...to } });
      current = { ...to };
      lastQuadraticControl = { ...cp };
      lastCubicControl = null;
      continue;
    }

    if (upper === "A") {
      const rx = readNumber();
      const ry = readNumber();
      const rotation = readNumber();
      const largeArc = readNumber();
      const sweep = readNumber();
      const to = relative ? add(current, { x: readNumber(), y: readNumber() }) : { x: readNumber(), y: readNumber() };
      segments.push({
        type: "A",
        from: { ...current },
        rx,
        ry,
        rotation,
        largeArc: Boolean(largeArc),
        sweep: Boolean(sweep),
        to: { ...to }
      });
      current = { ...to };
      lastCubicControl = null;
      lastQuadraticControl = null;
      continue;
    }

    if (upper === "Z") {
      segments.push({ type: "L", from: { ...current }, to: { ...start } });
      current = { ...start };
      continue;
    }

    throw new Error(`Unsupported path command: ${command}`);
  }

  return segments;
}

export function pathDFromSegments(segments) {
  return segments
    .map((segment) => {
      if (segment.type === "M") return `M ${segment.point.x} ${segment.point.y}`;
      if (segment.type === "L") return `L ${segment.to.x} ${segment.to.y}`;
      if (segment.type === "C") {
        return `C ${segment.cp1.x} ${segment.cp1.y} ${segment.cp2.x} ${segment.cp2.y} ${segment.to.x} ${segment.to.y}`;
      }
      if (segment.type === "Q") return `Q ${segment.cp.x} ${segment.cp.y} ${segment.to.x} ${segment.to.y}`;
      if (segment.type === "A") {
        return `A ${segment.rx} ${segment.ry} ${segment.rotation} ${segment.largeArc ? 1 : 0} ${segment.sweep ? 1 : 0} ${segment.to.x} ${segment.to.y}`;
      }
      return "";
    })
    .join(" ");
}

export const parsePathMoveLine = parsePathD;
export const pathSegmentsToD = pathDFromSegments;

export function cubicBezierPoint(p0, p1, p2, p3, t) {
  const q0 = add(scale(p0, 1 - t), scale(p1, t));
  const q1 = add(scale(p1, 1 - t), scale(p2, t));
  const q2 = add(scale(p2, 1 - t), scale(p3, t));
  const r0 = add(scale(q0, 1 - t), scale(q1, t));
  const r1 = add(scale(q1, 1 - t), scale(q2, t));
  return add(scale(r0, 1 - t), scale(r1, t));
}

export function quadraticBezierPoint(p0, p1, p2, t) {
  const q0 = add(scale(p0, 1 - t), scale(p1, t));
  const q1 = add(scale(p1, 1 - t), scale(p2, t));
  return add(scale(q0, 1 - t), scale(q1, t));
}

export function cubicBezierTangent(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return normalize({
    x: 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y)
  });
}

/** 1D cubic on t∈[0,1]: B(t) = a·t³ + b·t² + c·t + d */
export function cubicBezierPolynomialCoeffs(p0, p1, p2, p3) {
  return {
    a: -p0 + 3 * p1 - 3 * p2 + p3,
    b: 3 * p0 - 6 * p1 + 3 * p2,
    c: -3 * p0 + 3 * p1,
    d: p0
  };
}

/** 1D quadratic: B(t) = a·t² + b·t + c */
export function quadraticBezierPolynomialCoeffs(p0, p1, p2) {
  return {
    a: p0 - 2 * p1 + p2,
    b: 2 * p1 - 2 * p0,
    c: p0
  };
}

export function evalCubicPolynomial(coeffs, t) {
  const { a, b, c, d } = coeffs;
  return ((a * t + b) * t + c) * t + d;
}

export function evalQuadraticPolynomial(coeffs, t) {
  const { a, b, c } = coeffs;
  return (a * t + b) * t + c;
}

function quadraticRootsInUnitInterval(quadA, quadB, quadC) {
  const roots = [];
  if (Math.abs(quadA) < EPSILON) {
    if (Math.abs(quadB) < EPSILON) return roots;
    const t = -quadC / quadB;
    if (t > EPSILON && t < 1 - EPSILON) roots.push(t);
    return roots;
  }
  const discriminant = quadB * quadB - 4 * quadA * quadC;
  if (discriminant < 0) return roots;
  const sqrt = Math.sqrt(discriminant);
  const denom = 2 * quadA;
  for (const root of [(-quadB - sqrt) / denom, (-quadB + sqrt) / denom]) {
    if (root > EPSILON && root < 1 - EPSILON) roots.push(root);
  }
  return roots;
}

/** t where B′(t)=0 on one axis, always including endpoints 0 and 1. */
export function cubicBezierExtremaTimes1D(p0, p1, p2, p3) {
  const { a, b, c } = cubicBezierPolynomialCoeffs(p0, p1, p2, p3);
  return [0, 1, ...quadraticRootsInUnitInterval(3 * a, 2 * b, c)];
}

export function quadraticBezierExtremaTimes1D(p0, p1, p2) {
  const { a, b } = quadraticBezierPolynomialCoeffs(p0, p1, p2);
  const times = [0, 1];
  if (Math.abs(a) < EPSILON) return times;
  const t = -b / (2 * a);
  if (t > EPSILON && t < 1 - EPSILON) times.push(t);
  return times;
}

export function bezierControlHullBBox(points) {
  if (!points.length) return { x: 0, y: 0, width: 0, height: 0 };
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function bboxOfCubicBezier(p0, p1, p2, p3) {
  const xCoeffs = cubicBezierPolynomialCoeffs(p0.x, p1.x, p2.x, p3.x);
  const yCoeffs = cubicBezierPolynomialCoeffs(p0.y, p1.y, p2.y, p3.y);
  const times = [
    ...new Set([
      ...cubicBezierExtremaTimes1D(p0.x, p1.x, p2.x, p3.x),
      ...cubicBezierExtremaTimes1D(p0.y, p1.y, p2.y, p3.y)
    ])
  ];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const t of times) {
    const x = evalCubicPolynomial(xCoeffs, t);
    const y = evalCubicPolynomial(yCoeffs, t);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function bboxOfQuadraticBezier(p0, p1, p2) {
  const xCoeffs = quadraticBezierPolynomialCoeffs(p0.x, p1.x, p2.x);
  const yCoeffs = quadraticBezierPolynomialCoeffs(p0.y, p1.y, p2.y);
  const times = [
    ...new Set([
      ...quadraticBezierExtremaTimes1D(p0.x, p1.x, p2.x),
      ...quadraticBezierExtremaTimes1D(p0.y, p1.y, p2.y)
    ])
  ];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const t of times) {
    const x = evalQuadraticPolynomial(xCoeffs, t);
    const y = evalQuadraticPolynomial(yCoeffs, t);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function unionBBox(a, b) {
  if (!b) return a;
  if (!a) return b;
  const minX = Math.min(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxX = Math.max(a.x + a.width, b.x + b.width);
  const maxY = Math.max(a.y + a.height, b.y + b.height);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function segmentBBox(segment, options) {
  if (segment.type === "M") {
    return { x: segment.point.x, y: segment.point.y, width: 0, height: 0 };
  }
  if (segment.type === "L") {
    const minX = Math.min(segment.from.x, segment.to.x);
    const minY = Math.min(segment.from.y, segment.to.y);
    const maxX = Math.max(segment.from.x, segment.to.x);
    const maxY = Math.max(segment.from.y, segment.to.y);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }
  if (segment.type === "C") {
    return bboxOfCubicBezier(segment.from, segment.cp1, segment.cp2, segment.to);
  }
  if (segment.type === "Q") {
    return bboxOfQuadraticBezier(segment.from, segment.cp, segment.to);
  }
  if (segment.type === "A") {
    const points = sampleArc(segment, options.stepsPerArc ?? 24);
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }
  return null;
}

function sampleArc(segment, stepsPerCurve = 24) {
  const points = [{ ...segment.from }];
  for (const cubic of arcSegmentToCubics(segment)) {
    for (let i = 1; i <= stepsPerCurve; i += 1) {
      points.push(cubicBezierPoint(cubic.from, cubic.cp1, cubic.cp2, cubic.to, i / stepsPerCurve));
    }
  }
  return points;
}

export function flattenPathSegments(segments, options = {}) {
  const stepsPerCurve = options.stepsPerCurve ?? 20;
  const stepsPerArc = options.stepsPerArc ?? 24;
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
      for (let i = 1; i <= stepsPerCurve; i += 1) {
        points.push(cubicBezierPoint(segment.from, segment.cp1, segment.cp2, segment.to, i / stepsPerCurve));
      }
      continue;
    }
    if (segment.type === "Q") {
      for (let i = 1; i <= stepsPerCurve; i += 1) {
        points.push(quadraticBezierPoint(segment.from, segment.cp, segment.to, i / stepsPerCurve));
      }
      continue;
    }
    if (segment.type === "A") {
      const arcPoints = sampleArc(segment, stepsPerArc);
      points.push(...arcPoints.slice(1));
    }
  }

  return points;
}

export function polylineLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += length(subtract(points[i], points[i - 1]));
  }
  return total;
}

export function pointAtPolylineLength(points, distance) {
  if (!points.length) return { point: { x: 0, y: 0 }, tangent: { x: 1, y: 0 } };
  if (distance <= 0) {
    const tangent = normalize(subtract(points[1] ?? points[0], points[0]));
    return { point: { ...points[0] }, tangent };
  }

  let traveled = 0;
  for (let i = 1; i < points.length; i += 1) {
    const start = points[i - 1];
    const end = points[i];
    const segmentLength = length(subtract(end, start));
    if (traveled + segmentLength >= distance) {
      const t = segmentLength < EPSILON ? 0 : (distance - traveled) / segmentLength;
      return {
        point: add(start, scale(subtract(end, start), t)),
        tangent: normalize(subtract(end, start))
      };
    }
    traveled += segmentLength;
  }

  const last = points[points.length - 1];
  const prev = points[points.length - 2] ?? last;
  return { point: { ...last }, tangent: normalize(subtract(last, prev)) };
}

export function pathLength(segments, options) {
  return polylineLength(flattenPathSegments(segments, options));
}

export function pointAtPathLength(segments, distance, options) {
  return pointAtPolylineLength(flattenPathSegments(segments, options), distance);
}

export function segmentTurnAngle(incoming, outgoing) {
  const a = normalize(incoming);
  const b = normalize(outgoing);
  const cross = a.x * b.y - a.y * b.x;
  const dotValue = clamp(dot(a, b), -1, 1);
  return Math.atan2(cross, dotValue);
}

export function miterLength(joinAngle, strokeWidth) {
  const half = strokeWidth / 2;
  const sinHalf = Math.sin(Math.abs(joinAngle) / 2);
  if (Math.abs(sinHalf) < EPSILON) return Infinity;
  return half / sinHalf;
}

export function shouldBevelJoin(joinAngle, strokeWidth, miterLimit) {
  const miter = miterLength(joinAngle, strokeWidth);
  return miter > strokeWidth * miterLimit;
}

export function windingNumber(point, polygon) {
  let winding = 0;
  for (let i = 0; i < polygon.length; i += 1) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    if (a.y <= point.y) {
      if (b.y > point.y && (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x) > 0) winding += 1;
    } else if (b.y <= point.y && (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x) < 0) {
      winding -= 1;
    }
  }
  return winding;
}

export function pointInPolygon(point, polygon) {
  return windingNumber(point, polygon) !== 0;
}

export function segmentsToSubpaths(segments) {
  const subpaths = [];
  let batch = [];
  for (const segment of segments) {
    if (segment.type === "M") {
      if (batch.length) subpaths.push(batch);
      batch = [segment];
    } else {
      batch.push(segment);
    }
  }
  if (batch.length) subpaths.push(batch);
  return subpaths;
}

export function rayCrossingCount(point, polygon) {
  let crossings = 0;
  for (let i = 0; i < polygon.length; i += 1) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const straddles = (a.y <= point.y && b.y > point.y) || (b.y <= point.y && a.y > point.y);
    if (!straddles) continue;
    const xIntersect = a.x + ((point.y - a.y) * (b.x - a.x)) / (b.y - a.y);
    if (xIntersect > point.x) crossings += 1;
  }
  return crossings;
}

export function signedPolygonArea(polygon) {
  let area = 0;
  for (let i = 0; i < polygon.length; i += 1) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    area += a.x * b.y - b.x * a.y;
  }
  return area / 2;
}

export function classifyPointInPath(point, segments, fillRule = "nonzero", options = {}) {
  const polygons = segmentsToSubpaths(segments)
    .map((subpath) => flattenPathSegments(subpath, options))
    .filter((polygon) => polygon.length >= 3);

  let winding = 0;
  let crossings = 0;
  for (const polygon of polygons) {
    winding += windingNumber(point, polygon);
    crossings += rayCrossingCount(point, polygon);
  }

  const insideNonZero = winding !== 0;
  const insideEvenOdd = crossings % 2 === 1;
  const inside = fillRule === "evenodd" ? insideEvenOdd : insideNonZero;

  return { inside, winding, crossings, insideNonZero, insideEvenOdd, fillRule, subpathCount: polygons.length };
}

export function pointInPath(point, segments, fillRule = "nonzero", options = {}) {
  return classifyPointInPath(point, segments, fillRule, options).inside;
}

export function pointInPathBoolean(point, segmentsA, segmentsB, operation, options = {}) {
  const inA = pointInPath(point, segmentsA, "nonzero", options);
  const inB = pointInPath(point, segmentsB, "nonzero", options);
  switch (operation) {
    case "union":
      return inA || inB;
    case "subtract":
      return inA && !inB;
    case "intersect":
      return inA && inB;
    case "exclude":
      return inA !== inB;
    default:
      throw new Error(`Unknown boolean operation: ${operation}`);
  }
}

export const FIGMA_EFFECT_FILTER_MAP = [
  {
    figma: "DROP_SHADOW",
    svg: "<feDropShadow> or feGaussianBlur + feOffset + feFlood + feMerge",
    notes: "Figma radius ≈ SVG stdDeviation×2 (implementation-dependent)"
  },
  {
    figma: "INNER_SHADOW",
    svg: "SourceAlpha invert + clip + blur chain",
    notes: "Requires inner clip of shape bounds"
  },
  {
    figma: "LAYER_BLUR",
    svg: "feGaussianBlur on backdrop / Group filter",
    notes: "Applied to merged layer, not single fill"
  },
  {
    figma: "BACKGROUND_BLUR",
    svg: "feGaussianBlur on BackgroundImage + composite",
    notes: "Maps to backdrop-filter in CSS, filter in SVG"
  }
];

function figmaColorToRgb(color) {
  return `rgb(${Math.round(color.r * 255)} ${Math.round(color.g * 255)} ${Math.round(color.b * 255)})`;
}

export function figmaBlurRadiusToStdDeviation(blurRadius) {
  return blurRadius / 2;
}

export function buildFilterRegion(expandPercent = 50) {
  const p = expandPercent;
  return { x: `-${p}%`, y: `-${p}%`, width: `${100 + p * 2}%`, height: `${100 + p * 2}%` };
}

export function buildFilterPrimitive(tag, attributes = {}, result = null) {
  const attrs = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
  const resultAttr = result ? ` result="${result}"` : "";
  return `  <${tag} ${attrs}${resultAttr}/>`;
}

export function buildSvgFilter({ filterId, region = buildFilterRegion(), primitives, attributes = {} }) {
  const extra = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
  const body = primitives
    .map((primitive) => {
      if (typeof primitive === "string") return `  ${primitive}`;
      return buildFilterPrimitive(primitive.tag, primitive.attributes, primitive.result);
    })
    .join("\n");
  const markup = [
    `<filter id="${filterId}" x="${region.x}" y="${region.y}" width="${region.width}" height="${region.height}"${extra ? ` ${extra}` : ""}>`,
    body,
    `</filter>`
  ].join("\n");
  return { filterId, filterAttr: `url(#${filterId})`, markup };
}

export function buildDropShadowFilterChain(effect, filterId = "drop-shadow-chain") {
  const offsetX = effect.offset?.x ?? 0;
  const offsetY = effect.offset?.y ?? 4;
  const blurRadius = effect.radius ?? 8;
  const color = effect.color ?? { r: 0, g: 0, b: 0, a: 0.25 };
  const stdDeviation = figmaBlurRadiusToStdDeviation(blurRadius);
  const rgb = figmaColorToRgb(color);

  return buildSvgFilter({
    filterId,
    attributes: { "color-interpolation-filters": "sRGB" },
    primitives: [
      { tag: "feGaussianBlur", attributes: { in: "SourceAlpha", stdDeviation }, result: "blur" },
      { tag: "feOffset", attributes: { in: "blur", dx: offsetX, dy: offsetY }, result: "offsetBlur" },
      { tag: "feFlood", attributes: { "flood-color": rgb, "flood-opacity": color.a }, result: "color" },
      { tag: "feComposite", attributes: { in: "color", in2: "offsetBlur", operator: "in" }, result: "shadow" },
      "<feMerge>",
      "  <feMergeNode in=\"shadow\"/>",
      "  <feMergeNode in=\"SourceGraphic\"/>",
      "</feMerge>"
    ]
  });
}

export function figmaDropShadowToSvgFilter(effect, filterId = "figma-drop-shadow") {
  const offsetX = effect.offset?.x ?? 0;
  const offsetY = effect.offset?.y ?? 0;
  const blurRadius = effect.radius ?? 4;
  const color = effect.color ?? { r: 0, g: 0, b: 0, a: 0.25 };
  const stdDeviation = figmaBlurRadiusToStdDeviation(blurRadius);
  const rgb = figmaColorToRgb(color);

  const markup = [
    `<filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">`,
    `  <feDropShadow dx="${offsetX}" dy="${offsetY}" stdDeviation="${stdDeviation}" flood-color="${rgb}" flood-opacity="${color.a}"/>`,
    `</filter>`
  ].join("\n");

  return {
    filterId,
    filterAttr: `url(#${filterId})`,
    markup,
    figma: { offsetX, offsetY, blurRadius, color },
    svg: { dx: offsetX, dy: offsetY, stdDeviation }
  };
}

export function figmaInnerShadowToSvgFilter(effect, filterId = "figma-inner-shadow") {
  const offsetX = effect.offset?.x ?? 0;
  const offsetY = effect.offset?.y ?? 4;
  const blurRadius = effect.radius ?? 6;
  const color = effect.color ?? { r: 0, g: 0, b: 0, a: 0.35 };
  const stdDeviation = figmaBlurRadiusToStdDeviation(blurRadius);
  const rgb = figmaColorToRgb(color);

  return buildSvgFilter({
    filterId,
    attributes: { "color-interpolation-filters": "sRGB" },
    primitives: [
      { tag: "feGaussianBlur", attributes: { in: "SourceAlpha", stdDeviation }, result: "blur" },
      { tag: "feOffset", attributes: { in: "blur", dx: offsetX, dy: offsetY }, result: "offsetBlur" },
      { tag: "feFlood", attributes: { "flood-color": rgb, "flood-opacity": color.a }, result: "color" },
      { tag: "feComposite", attributes: { in: "color", in2: "offsetBlur", operator: "in" }, result: "shadow" },
      { tag: "feComposite", attributes: { in: "shadow", in2: "SourceAlpha", operator: "in" }, result: "innerShadow" },
      { tag: "feComposite", attributes: { in: "SourceGraphic", in2: "innerShadow", operator: "over" } }
    ]
  });
}

export function figmaLayerBlurToSvgFilter(effect, filterId = "figma-layer-blur") {
  const blurRadius = effect.radius ?? 12;
  const stdDeviation = figmaBlurRadiusToStdDeviation(blurRadius);
  return buildSvgFilter({
    filterId,
    primitives: [{ tag: "feGaussianBlur", attributes: { in: "SourceGraphic", stdDeviation } }]
  });
}

export function figmaBackgroundBlurToSvgFilter(effect, filterId = "figma-background-blur") {
  const blurRadius = effect.radius ?? 16;
  const stdDeviation = figmaBlurRadiusToStdDeviation(blurRadius);
  return buildSvgFilter({
    filterId,
    primitives: [
      { tag: "feGaussianBlur", attributes: { in: "BackgroundImage", stdDeviation }, result: "blur" },
      { tag: "feComposite", attributes: { in: "SourceGraphic", in2: "blur", operator: "over" } }
    ]
  });
}

export function figmaEffectToSvgFilter(effect, filterId = null) {
  const type = effect.type ?? "DROP_SHADOW";
  const id =
    filterId ??
    {
      DROP_SHADOW: "figma-drop-shadow",
      INNER_SHADOW: "figma-inner-shadow",
      LAYER_BLUR: "figma-layer-blur",
      BACKGROUND_BLUR: "figma-background-blur"
    }[type] ??
    "figma-filter";

  switch (type) {
    case "DROP_SHADOW":
      return { type, ...figmaDropShadowToSvgFilter(effect, id) };
    case "INNER_SHADOW":
      return { type, ...figmaInnerShadowToSvgFilter(effect, id) };
    case "LAYER_BLUR":
      return { type, ...figmaLayerBlurToSvgFilter(effect, id) };
    case "BACKGROUND_BLUR":
      return { type, ...figmaBackgroundBlurToSvgFilter(effect, id) };
    default:
      throw new Error(`Unsupported Figma effect type: ${type}`);
  }
}

export function bboxOfPathSampled(segments, options = {}) {
  const points = flattenPathSegments(segments, options);
  if (!points.length) return { x: 0, y: 0, width: 0, height: 0 };
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Exact bbox for M/L/C/Q; arcs sampled. Use `{ mode: "sample" }` for legacy flatten-only path. */
export function bboxOfPath(segments, options = {}) {
  if (options.mode === "sample") return bboxOfPathSampled(segments, options);
  let box = null;
  for (const segment of segments) {
    box = unionBBox(box, segmentBBox(segment, options));
  }
  return box ?? { x: 0, y: 0, width: 0, height: 0 };
}

export function linearGradientStopParameter(point, start, end) {
  const axis = subtract(end, start);
  const denom = dot(axis, axis);
  if (denom < EPSILON) return 0;
  return dot(subtract(point, start), axis) / denom;
}

export function objectBoundingBoxToUserSpace(point, bbox) {
  return {
    x: bbox.x + point.x * bbox.width,
    y: bbox.y + point.y * bbox.height
  };
}

export function userSpaceToObjectBoundingBox(point, bbox) {
  return {
    x: bbox.width ? (point.x - bbox.x) / bbox.width : 0,
    y: bbox.height ? (point.y - bbox.y) / bbox.height : 0
  };
}

export function resolveGradientPoint(point, gradientUnits, bbox) {
  if (gradientUnits === "objectBoundingBox") {
    return objectBoundingBoxToUserSpace(point, bbox);
  }
  return { x: point.x, y: point.y };
}

export function radialGradientStopParameter(point, center, radius, focal = null) {
  const focus = focal ?? center;
  const distance = length(subtract(point, focus));
  return distance / Math.max(radius, EPSILON);
}

export function radialGradientStopParameterEllipse(point, center, radiusX, radiusY, focal = null) {
  const focus = focal ?? center;
  const dx = (point.x - focus.x) / Math.max(radiusX, EPSILON);
  const dy = (point.y - focus.y) / Math.max(radiusY, EPSILON);
  return Math.hypot(dx, dy);
}

export function conicGradientStopParameter(point, center, startAngleDeg = 0) {
  const vector = subtract(point, center);
  const angle = (Math.atan2(vector.y, vector.x) * 180) / Math.PI;
  const normalized = (angle - startAngleDeg + 360) % 360;
  return normalized / 360;
}

export function applySpreadMethod(t, spreadMethod = "pad") {
  if (spreadMethod === "repeat") {
    const wrapped = t % 1;
    return wrapped < 0 ? wrapped + 1 : wrapped;
  }
  if (spreadMethod === "reflect") {
    const period = t % 2;
    const positive = period < 0 ? period + 2 : period;
    return positive <= 1 ? positive : 2 - positive;
  }
  return clamp(t, 0, 1);
}

function parseColorChannel(value) {
  if (typeof value === "string" && value.startsWith("#")) {
    const hex = value.slice(1);
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    return {
      r: parseInt(full.slice(0, 2), 16) / 255,
      g: parseInt(full.slice(2, 4), 16) / 255,
      b: parseInt(full.slice(4, 6), 16) / 255,
      a: full.length >= 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1
    };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}

export function interpolateColorStops(t, stops) {
  const sorted = [...stops]
    .map((stop) => ({
      offset: stop.offset,
      color:
        typeof stop.color === "string"
          ? parseColorChannel(stop.color)
          : { r: stop.r ?? 0, g: stop.g ?? 0, b: stop.b ?? 0, a: stop.a ?? 1 }
    }))
    .sort((a, b) => a.offset - b.offset);
  if (!sorted.length) return { r: 0, g: 0, b: 0, a: 0 };
  const param = clamp(t, 0, 1);
  if (param <= sorted[0].offset) return { ...sorted[0].color };
  if (param >= sorted[sorted.length - 1].offset) return { ...sorted[sorted.length - 1].color };

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const left = sorted[i];
    const right = sorted[i + 1];
    if (param >= left.offset && param <= right.offset) {
      const span = right.offset - left.offset || 1;
      const mix = (param - left.offset) / span;
      return {
        r: left.color.r + (right.color.r - left.color.r) * mix,
        g: left.color.g + (right.color.g - left.color.g) * mix,
        b: left.color.b + (right.color.b - left.color.b) * mix,
        a: left.color.a + (right.color.a - left.color.a) * mix
      };
    }
  }
  return { ...sorted[sorted.length - 1].color };
}

export function sampleLinearGradient(point, definition, bbox) {
  const units = definition.gradientUnits ?? "objectBoundingBox";
  const start = resolveGradientPoint(
    { x: definition.x1 ?? 0, y: definition.y1 ?? 0 },
    units,
    bbox
  );
  const end = resolveGradientPoint({ x: definition.x2 ?? 1, y: definition.y2 ?? 0 }, units, bbox);
  const rawT = linearGradientStopParameter(point, start, end);
  const t = applySpreadMethod(rawT, definition.spreadMethod ?? "pad");
  const color = interpolateColorStops(t, definition.stops ?? []);
  return { t: rawT, mappedT: t, color, start, end };
}

export function sampleRadialGradient(point, definition, bbox) {
  const units = definition.gradientUnits ?? "objectBoundingBox";
  const center = resolveGradientPoint(
    { x: definition.cx ?? 0.5, y: definition.cy ?? 0.5 },
    units,
    bbox
  );
  const focal = resolveGradientPoint(
    { x: definition.fx ?? definition.cx ?? 0.5, y: definition.fy ?? definition.cy ?? 0.5 },
    units,
    bbox
  );
  const radiusX =
    units === "objectBoundingBox"
      ? (definition.r ?? 0.5) * bbox.width
      : (definition.r ?? definition.radius ?? 50);
  const radiusY =
    units === "objectBoundingBox"
      ? (definition.ry ?? definition.r ?? 0.5) * bbox.height
      : (definition.ry ?? definition.r ?? definition.radius ?? 50);
  const rawT = radialGradientStopParameterEllipse(point, center, radiusX, radiusY, focal);
  const t = applySpreadMethod(rawT, definition.spreadMethod ?? "pad");
  const color = interpolateColorStops(t, definition.stops ?? []);
  return { t: rawT, mappedT: t, color, center, focal, radiusX, radiusY };
}

export function patternTileCoordinates(point, origin, tileWidth, tileHeight) {
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  const tileX = Math.floor(dx / tileWidth);
  const tileY = Math.floor(dy / tileHeight);
  const u = ((dx % tileWidth) + tileWidth) % tileWidth / tileWidth;
  const v = ((dy % tileHeight) + tileHeight) % tileHeight / tileHeight;
  return { u, v, tileX, tileY, localX: u * tileWidth, localY: v * tileHeight };
}

export function buildPatternMarkup(options) {
  const {
    id = "pattern",
    width,
    height,
    patternUnits = "userSpaceOnUse",
    patternContentUnits = "userSpaceOnUse",
    content = ""
  } = options;
  return [
    `<pattern id="${id}" width="${width}" height="${height}" patternUnits="${patternUnits}" patternContentUnits="${patternContentUnits}">`,
    content,
    `</pattern>`
  ].join("\n");
}

export function colorToCss(color) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `rgba(${r}, ${g}, ${b}, ${color.a})`;
}

export function cloneSegments(segments) {
  return JSON.parse(JSON.stringify(segments));
}

export function syncPathEndpoints(segments) {
  let current = null;
  for (const segment of segments) {
    if (segment.type === "M") {
      current = { ...segment.point };
      continue;
    }
    if (segment.type === "L" || segment.type === "C" || segment.type === "Q" || segment.type === "A") {
      if (current) segment.from = { ...current };
      if (segment.type === "L" || segment.type === "C" || segment.type === "Q" || segment.type === "A") {
        current = { ...segment.to };
      }
    }
  }
  return segments;
}

export function listPathHandles(segments) {
  const handles = [];
  segments.forEach((segment, segmentIndex) => {
    if (segment.type === "M") {
      handles.push({
        id: `a:${segmentIndex}`,
        kind: "anchor",
        segmentIndex,
        point: { ...segment.point }
      });
      return;
    }
    if (segment.type === "L") {
      handles.push({
        id: `a:${segmentIndex}`,
        kind: "anchor",
        segmentIndex,
        point: { ...segment.to }
      });
      return;
    }
    if (segment.type === "C") {
      handles.push(
        { id: `c1:${segmentIndex}`, kind: "control", role: "cp1", segmentIndex, point: { ...segment.cp1 } },
        { id: `c2:${segmentIndex}`, kind: "control", role: "cp2", segmentIndex, point: { ...segment.cp2 } },
        { id: `a:${segmentIndex}`, kind: "anchor", segmentIndex, point: { ...segment.to } }
      );
      return;
    }
    if (segment.type === "Q") {
      handles.push(
        { id: `c:${segmentIndex}`, kind: "control", role: "cp", segmentIndex, point: { ...segment.cp } },
        { id: `a:${segmentIndex}`, kind: "anchor", segmentIndex, point: { ...segment.to } }
      );
    }
  });
  return handles;
}

export function hitTestPathHandles(point, handles, radius = 8) {
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

export function updatePathHandle(segments, handleId, point) {
  const next = cloneSegments(segments);
  const [role, indexValue] = handleId.split(":");
  const segmentIndex = Number(indexValue);
  const segment = next[segmentIndex];
  if (!segment) throw new Error(`Unknown handle: ${handleId}`);

  if (role === "a") {
    if (segment.type === "M") segment.point = { ...point };
    else if (segment.type === "L" || segment.type === "C" || segment.type === "Q" || segment.type === "A") {
      segment.to = { ...point };
    } else throw new Error(`Anchor not supported on ${segment.type}`);
  } else if (role === "c1" && segment.type === "C") segment.cp1 = { ...point };
  else if (role === "c2" && segment.type === "C") segment.cp2 = { ...point };
  else if (role === "c" && segment.type === "Q") segment.cp = { ...point };
  else throw new Error(`Cannot update handle ${handleId}`);

  return syncPathEndpoints(next);
}

export function pathFromSegments(segments) {
  const normalized = syncPathEndpoints(cloneSegments(segments));
  return { segments: normalized, d: pathDFromSegments(normalized) };
}

export function pathFromD(d) {
  const segments = parsePathD(d);
  return pathFromSegments(segments);
}

export {
  FIGMA_BLEND_MAP,
  FIGMA_BOOLEAN_MAP,
  FIGMA_PAINT_GAP_MAP,
  FIGMA_VECTOR_MODEL,
  figmaAngularGradientToCss,
  figmaBlendModeToSvg,
  figmaBooleanPathsToSvg,
  figmaBooleanToFillRule,
  figmaClipToSvgMarkup,
  figmaImagePaintToSvg,
  figmaLayerCompositingToSvg,
  figmaLinearGradientPaintToSvg,
  figmaMaskToSvgMarkup,
  figmaNetworkToPathD,
  figmaNodeToSvgAttributes,
  figmaPaintToSvg,
  figmaRadialGradientPaintToSvg,
  figmaSolidPaintToSvg,
  figmaStrokeAlignToSvgMarkup,
  figmaStrokeToSvgAttributes,
  pathDToFigmaNetwork,
  sampleFigmaLinearAtPoint
} from "./figma-bridge.js";

export {
  FIGMA_SVG_LAYERS,
  SVG_CAPABILITY_MAP,
  explainCoordinateStack,
  pathPaintModel
} from "./primer.js";

export {
  SVG_FILTER_PRIMITIVES,
  buildMarkerMarkup,
  buildTextPathMarkup,
  buildTurbulenceFilterMarkup,
  layerOpacityAttributes,
  paintOrderAttributes
} from "./svg-spec.js";

export {
  CIRCLE_CUBIC_KAPPA,
  SVG_MATH_TOPIC_MAP,
  applyAffineMatrix,
  closestPointOnCubic,
  closestPointOnQuadratic,
  convolve1D,
  cubicCubicIntersections,
  cubicCurvatureAt,
  earClipTriangulate,
  cubicFlatnessError,
  cubicNormalAt,
  decomposeAffineMatrix,
  evenoddParityFromRayCast,
  fanTriangulateConvex,
  gaussianKernel1D,
  invertAffineMatrix,
  lineCubicIntersections,
  lineQuadraticIntersections,
  lineSegmentIntersection,
  offsetPointOnCubic,
  porterDuffSourceOver,
  premultiplyColor,
  quadraticCurvatureAt,
  quadraticFlatnessError,
  reflectControlForSmoothContinuation,
  shoelaceArea,
  subdivideCubicBezier,
  subdivideQuadraticBezier,
  transformPathSegments,
  unitCircleQuarterCubics,
  unpremultiplyColor
} from "./geometry.js";

export {
  arcSegmentToCubics,
  compareFlattenMethods,
  convertArcsInPathD,
  convertArcsToCubics,
  dashPatternPeriod,
  dashPatternPhaseAtLength,
  flattenCubicAdaptive,
  flattenPathSegmentsAdaptive,
  flattenQuadraticAdaptive,
  formatDashArray,
  hitTestSubpathHandles,
  listSubpathHandles,
  offsetPathD,
  offsetPolyline,
  parseDashArray,
  sampleStrokeDash,
  strokeDashIntervals,
  subpathsToSegments,
  svgArcCenterParameters,
  updateSubpathHandle
} from "./engine.js";

export {
  CRISP_ICON_STROKES,
  ICON_GRID_PRESETS,
  buildSvgSpriteSheet,
  buildSvgSymbol,
  buildSvgUse,
  currentColorAttributes,
  douglasPeucker,
  iconViewBox,
  nearestCrispStrokeWidth,
  optimizeSvgViewBox,
  simplifyPathD,
  snapPathDToIconGrid,
  snapPointToIconGrid,
  snapToHalfPixel,
  svgMarkupToDataUri
} from "./icon.js";
