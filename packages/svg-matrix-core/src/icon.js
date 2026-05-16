import {
  distancePointToSegment,
  flattenPathSegments,
  parsePathD,
  pathDFromSegments,
  pathFromD
} from "./index.js";

export const ICON_GRID_PRESETS = {
  "16": 16,
  "20": 20,
  "24": 24
};

export const CRISP_ICON_STROKES = [1, 1.5, 2];

export function snapToHalfPixel(value) {
  return Math.round(value * 2) / 2;
}

export function snapPointToIconGrid(point, halfPixel = true) {
  if (!halfPixel) {
    return { x: Math.round(point.x), y: Math.round(point.y) };
  }
  return { x: snapToHalfPixel(point.x), y: snapToHalfPixel(point.y) };
}

export function nearestCrispStrokeWidth(width) {
  return CRISP_ICON_STROKES.reduce((best, candidate) =>
    Math.abs(candidate - width) < Math.abs(best - width) ? candidate : best
  );
}

export function snapPathDToIconGrid(d, halfPixel = true) {
  const { segments } = pathFromD(d);
  const snapped = segments.map((segment) => {
    if (segment.type === "M") {
      return { ...segment, point: snapPointToIconGrid(segment.point, halfPixel) };
    }
    if (segment.type === "L") {
      return {
        ...segment,
        from: snapPointToIconGrid(segment.from, halfPixel),
        to: snapPointToIconGrid(segment.to, halfPixel)
      };
    }
    if (segment.type === "C") {
      return {
        ...segment,
        from: snapPointToIconGrid(segment.from, halfPixel),
        cp1: snapPointToIconGrid(segment.cp1, halfPixel),
        cp2: snapPointToIconGrid(segment.cp2, halfPixel),
        to: snapPointToIconGrid(segment.to, halfPixel)
      };
    }
    if (segment.type === "Q") {
      return {
        ...segment,
        from: snapPointToIconGrid(segment.from, halfPixel),
        cp: snapPointToIconGrid(segment.cp, halfPixel),
        to: snapPointToIconGrid(segment.to, halfPixel)
      };
    }
    return segment;
  });
  const normalized = pathDFromSegments(snapped);
  return pathFromD(normalized);
}

export function douglasPeucker(points, tolerance) {
  if (points.length <= 2) return points.slice();

  const first = points[0];
  const last = points[points.length - 1];
  let maxDistance = 0;
  let index = 0;

  for (let i = 1; i < points.length - 1; i += 1) {
    const distance = distancePointToSegment(points[i], first, last);
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }

  if (maxDistance > tolerance) {
    const left = douglasPeucker(points.slice(0, index + 1), tolerance);
    const right = douglasPeucker(points.slice(index), tolerance);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}

export function simplifyPathD(d, tolerance = 0.8, options = {}) {
  const flat = flattenPathSegments(parsePathD(d), options);
  if (flat.length < 2) return { d, pointCount: flat.length, originalCount: flat.length };
  const simplified = douglasPeucker(flat, tolerance);
  let rebuilt = `M ${simplified[0].x} ${simplified[0].y}`;
  for (let i = 1; i < simplified.length; i += 1) {
    rebuilt += ` L ${simplified[i].x} ${simplified[i].y}`;
  }
  return {
    d: rebuilt,
    pointCount: simplified.length,
    originalCount: flat.length
  };
}

export function buildSvgSymbol({ id, viewBox = "0 0 24 24", content, attributes = {} }) {
  const attrs = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
  return `<symbol id="${id}" viewBox="${viewBox}"${attrs ? ` ${attrs}` : ""}>${content}</symbol>`;
}

export function buildSvgUse({ href, x = 0, y = 0, width, height, attributes = {} }) {
  const attrs = {
    href,
    x,
    y,
    ...attributes
  };
  if (width !== undefined) attrs.width = width;
  if (height !== undefined) attrs.height = height;
  const serialized = Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
  return `<use ${serialized}/>`;
}

export function buildSvgSpriteSheet(symbols, options = {}) {
  const xmlns = options.xmlns ?? "http://www.w3.org/2000/svg";
  const hidden = options.hidden === false ? "" : ' style="display:none"';
  return `<svg xmlns="${xmlns}"${hidden}>${symbols.join("")}</svg>`;
}

export function currentColorAttributes(mode = "fill") {
  if (mode === "stroke") {
    return { fill: "none", stroke: "currentColor" };
  }
  if (mode === "both") {
    return { fill: "currentColor", stroke: "currentColor" };
  }
  return { fill: "currentColor" };
}

export function svgMarkupToDataUri(svgMarkup) {
  return `data:image/svg+xml,${encodeURIComponent(svgMarkup)}`;
}

export function iconViewBox(size = 24) {
  return `0 0 ${size} ${size}`;
}

export function optimizeSvgViewBox({ width, height, padding = 0 }) {
  return {
    viewBox: `${-padding} ${-padding} ${width + padding * 2} ${height + padding * 2}`,
    width,
    height
  };
}
