import {
  colorToCss,
  parsePathD,
  pathDFromSegments,
  pathFromD,
  sampleLinearGradient
} from "./index.js";

export const FIGMA_VECTOR_MODEL = {
  figma: "vectorNetwork { vertices[], segments[] }",
  svg: "<path d=\"...\">",
  notes: "Figma edits vertices/segments; SVG export flattens to d"
};

export const FIGMA_BOOLEAN_MAP = [
  { figma: "UNION", svg: "single path, fill-rule nonzero", fillRule: "nonzero" },
  { figma: "SUBTRACT", svg: "compound path / evenodd", fillRule: "evenodd" },
  { figma: "INTERSECT", svg: "intersection path", fillRule: "nonzero" },
  { figma: "EXCLUDE", svg: "xor regions", fillRule: "evenodd" }
];

function pointKey(point) {
  return `${point.x.toFixed(4)},${point.y.toFixed(4)}`;
}

export function figmaNetworkToPathD(network) {
  const vertices = network.vertices ?? [];
  if (!vertices.length) return "";
  const segments = network.segments ?? [];
  let d = `M ${vertices[0].x} ${vertices[0].y}`;
  for (const segment of segments) {
    const end = vertices[segment.end];
    if (!end) continue;
    if (segment.tangentStart && segment.tangentEnd) {
      d += ` C ${segment.tangentStart.x} ${segment.tangentStart.y} ${segment.tangentEnd.x} ${segment.tangentEnd.y} ${end.x} ${end.y}`;
    } else {
      d += ` L ${end.x} ${end.y}`;
    }
  }
  if (network.closed) d += " Z";
  return d;
}

export function pathDToFigmaNetwork(d) {
  const { segments } = pathFromD(d);
  const vertices = [];
  const indexByKey = new Map();

  function indexFor(point) {
    const key = pointKey(point);
    if (indexByKey.has(key)) return indexByKey.get(key);
    const index = vertices.length;
    vertices.push({ x: point.x, y: point.y });
    indexByKey.set(key, index);
    return index;
  }

  const networkSegments = [];
  let closed = false;
  let firstPoint = null;

  for (const segment of segments) {
    if (segment.type === "M") {
      firstPoint = { ...segment.point };
      indexFor(segment.point);
      continue;
    }
    if (segment.type === "L") {
      if (firstPoint && pointKey(segment.to) === pointKey(firstPoint)) {
        closed = true;
        continue;
      }
      networkSegments.push({
        start: indexFor(segment.from),
        end: indexFor(segment.to)
      });
      continue;
    }
    if (segment.type === "C") {
      networkSegments.push({
        start: indexFor(segment.from),
        end: indexFor(segment.to),
        tangentStart: { ...segment.cp1 },
        tangentEnd: { ...segment.cp2 }
      });
    }
  }

  return { vertices, segments: networkSegments, closed };
}

export function figmaSolidPaintToSvg(paint) {
  const color = paint.color ?? { r: 0, g: 0, b: 0, a: 1 };
  const opacity = (paint.opacity ?? 1) * (color.a ?? 1);
  return {
    fill: colorToCss({ ...color, a: 1 }),
    "fill-opacity": opacity
  };
}

export function figmaLinearGradientPaintToSvg(paint, bbox, options = {}) {
  const handles = paint.gradientHandlePositions ?? [
    { x: 0, y: 0.5 },
    { x: 1, y: 0.5 }
  ];
  const stops = (paint.gradientStops ?? []).map((stop) => ({
    offset: stop.position,
    color: {
      r: stop.color.r,
      g: stop.color.g,
      b: stop.color.b,
      a: (stop.color.a ?? 1) * (paint.opacity ?? 1)
    }
  }));
  const gradientId = options.gradientId ?? "figma-linear";
  const x1 = handles[0].x;
  const y1 = handles[0].y;
  const x2 = handles[1].x;
  const y2 = handles[1].y;
  const stopMarkup = stops
    .map((stop) => `<stop offset="${stop.offset}" stop-color="${colorToCss({ ...stop.color, a: 1 })}" stop-opacity="${stop.color.a}"/>`)
    .join("\n    ");
  const markup = [
    `<linearGradient id="${gradientId}" gradientUnits="objectBoundingBox" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">`,
    `    ${stopMarkup}`,
    `</linearGradient>`
  ].join("\n");
  return {
    gradientId,
    fill: `url(#${gradientId})`,
    markup,
    definition: { x1, y1, x2, y2, stops }
  };
}

export function figmaStrokeToSvgAttributes(stroke) {
  const color = stroke.color ?? { r: 0, g: 0, b: 0, a: 1 };
  const capMap = { NONE: "butt", ROUND: "round", SQUARE: "square", LINE_ARROW: "square" };
  const joinMap = { MITER: "miter", BEVEL: "bevel", ROUND: "round" };
  const attrs = {
    stroke: colorToCss(color),
    "stroke-width": stroke.weight ?? 1,
    "stroke-linecap": capMap[stroke.cap] ?? "butt",
    "stroke-linejoin": joinMap[stroke.join] ?? "miter",
    "stroke-miterlimit": stroke.miterLimit ?? 4
  };
  if (stroke.dashPattern?.length) {
    attrs["stroke-dasharray"] = stroke.dashPattern.join(" ");
  }
  if (stroke.align === "INSIDE" || stroke.align === "OUTSIDE") {
    attrs["data-figma-stroke-align"] = stroke.align;
  }
  return attrs;
}

export function figmaBooleanToFillRule(operation) {
  const row = FIGMA_BOOLEAN_MAP.find((item) => item.figma === operation);
  return row?.fillRule ?? "nonzero";
}

export function figmaBooleanPathsToSvg(paths, operation) {
  const fillRule = figmaBooleanToFillRule(operation);
  const d = paths.map((path) => path.d ?? path).join(" ");
  return {
    d,
    fillRule,
    svg: `<path d="${d}" fill-rule="${fillRule}" fill="currentColor"/>`
  };
}

export function figmaClipToSvgMarkup(vectorNode, clipId = "figma-clip") {
  const d = vectorNode.pathD ?? vectorNode.d ?? "";
  return {
    clipPathId: clipId,
    clipPathAttr: `url(#${clipId})`,
    markup: `<clipPath id="${clipId}"><path d="${d}"/></clipPath>`
  };
}

export function figmaMaskToSvgMarkup(vectorNode, maskId = "figma-mask") {
  const d = vectorNode.pathD ?? vectorNode.d ?? "";
  return {
    maskId,
    maskAttr: `url(#${maskId})`,
    markup: [
      `<mask id="${maskId}" maskUnits="userSpaceOnUse">`,
      `  <path d="${d}" fill="white"/>`,
      `</mask>`
    ].join("\n")
  };
}

export function figmaNodeToSvgAttributes(node, bbox) {
  const attrs = {};
  if (node.fills?.length) {
    const fill = node.fills[0];
    if (fill.type === "SOLID") Object.assign(attrs, figmaSolidPaintToSvg(fill));
    if (fill.type === "GRADIENT_LINEAR") {
      const gradient = figmaLinearGradientPaintToSvg(fill, bbox, { gradientId: `${node.id ?? "node"}-fill` });
      attrs.fill = gradient.fill;
      attrs.gradientMarkup = gradient.markup;
    }
  }
  if (node.strokes?.length && node.strokeWeight > 0) {
    Object.assign(attrs, figmaStrokeToSvgAttributes({ ...node.strokes[0], weight: node.strokeWeight, align: node.strokeAlign }));
  }
  if (node.effects?.length) {
    attrs.effects = node.effects;
  }
  return attrs;
}

export const FIGMA_PAINT_GAP_MAP = [
  { figma: "SOLID", svg: "fill + fill-opacity", supported: true, notes: "figmaSolidPaintToSvg" },
  { figma: "GRADIENT_LINEAR", svg: "<linearGradient>", supported: true, notes: "figmaLinearGradientPaintToSvg" },
  { figma: "GRADIENT_RADIAL", svg: "<radialGradient>", supported: true, notes: "figmaRadialGradientPaintToSvg" },
  {
    figma: "GRADIENT_ANGULAR",
    svg: "CSS conic-gradient (no native SVG paint server)",
    supported: "partial",
    notes: "figmaAngularGradientToCss / mask workaround"
  },
  { figma: "IMAGE", svg: "<pattern> or <image>", supported: true, notes: "figmaImagePaintToSvg" },
  { figma: "EMOJI", svg: "—", supported: false, notes: "raster embed" },
  { figma: "VIDEO", svg: "—", supported: false, notes: "foreignObject / HTML" }
];

export const FIGMA_BLEND_MAP = [
  { figma: "PASS_THROUGH", svg: "normal", css: "normal" },
  { figma: "NORMAL", svg: "normal", css: "normal" },
  { figma: "MULTIPLY", svg: "multiply", css: "multiply" },
  { figma: "SCREEN", svg: "screen", css: "screen" },
  { figma: "OVERLAY", svg: "overlay", css: "overlay" },
  { figma: "DARKEN", svg: "darken", css: "darken" },
  { figma: "LIGHTEN", svg: "lighten", css: "lighten" },
  { figma: "COLOR_DODGE", svg: "color-dodge", css: "color-dodge" },
  { figma: "COLOR_BURN", svg: "color-burn", css: "color-burn" },
  { figma: "HARD_LIGHT", svg: "hard-light", css: "hard-light" },
  { figma: "SOFT_LIGHT", svg: "soft-light", css: "soft-light" },
  { figma: "DIFFERENCE", svg: "difference", css: "difference" },
  { figma: "EXCLUSION", svg: "exclusion", css: "exclusion" },
  { figma: "HUE", svg: "hue", css: "hue" },
  { figma: "SATURATION", svg: "saturation", css: "saturation" },
  { figma: "COLOR", svg: "color", css: "color" },
  { figma: "LUMINOSITY", svg: "luminosity", css: "luminosity" }
];

export function figmaBlendModeToSvg(blendMode = "PASS_THROUGH") {
  const row = FIGMA_BLEND_MAP.find((item) => item.figma === blendMode);
  return row?.svg ?? "normal";
}

export function figmaLayerCompositingToSvg(node) {
  return {
    opacity: node.opacity ?? 1,
    "mix-blend-mode": figmaBlendModeToSvg(node.blendMode),
    style: node.isolation ? "isolation: isolate" : undefined
  };
}

export function figmaRadialGradientPaintToSvg(paint, options = {}) {
  const stops = (paint.gradientStops ?? []).map((stop) => ({
    offset: stop.position,
    color: {
      r: stop.color.r,
      g: stop.color.g,
      b: stop.color.b,
      a: (stop.color.a ?? 1) * (paint.opacity ?? 1)
    }
  }));
  const handles = paint.gradientHandlePositions ?? [
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0 }
  ];
  const gradientId = options.gradientId ?? "figma-radial";
  const cx = handles[0].x;
  const cy = handles[0].y;
  const r = Math.hypot(handles[2].x - cx, handles[2].y - cy) || 0.5;
  const stopMarkup = stops
    .map(
      (stop) =>
        `<stop offset="${stop.offset}" stop-color="${colorToCss({ ...stop.color, a: 1 })}" stop-opacity="${stop.color.a}"/>`
    )
    .join("\n    ");
  const markup = [
    `<radialGradient id="${gradientId}" gradientUnits="objectBoundingBox" cx="${cx}" cy="${cy}" r="${r}">`,
    `    ${stopMarkup}`,
    `</radialGradient>`
  ].join("\n");
  return { gradientId, fill: `url(#${gradientId})`, markup, definition: { cx, cy, r, stops } };
}

export function figmaAngularGradientToCss(paint) {
  const stops = (paint.gradientStops ?? [])
    .map((stop) => `${colorToCss(stop.color)} ${Math.round(stop.position * 100)}%`)
    .join(", ");
  const handles = paint.gradientHandlePositions ?? [{ x: 0.5, y: 0.5 }, { x: 1, y: 0.5 }];
  const angle = (Math.atan2(handles[1].y - handles[0].y, handles[1].x - handles[0].x) * 180) / Math.PI;
  return {
    background: `conic-gradient(from ${angle}deg at ${handles[0].x * 100}% ${handles[0].y * 100}%, ${stops})`,
    note: "SVG has no conic paint server; use CSS on HTML wrapper or rasterize"
  };
}

export function figmaImagePaintToSvg(paint, options = {}) {
  const href = paint.imageRef ?? paint.href ?? "";
  const scaleMode = paint.scaleMode ?? "FILL";
  const patternId = options.patternId ?? "figma-image";
  if (scaleMode === "TILE") {
    const tileW = paint.scalingFactor ? 1 / paint.scalingFactor : 0.25;
    const markup = [
      `<pattern id="${patternId}" patternUnits="objectBoundingBox" width="${tileW}" height="${tileW}">`,
      `  <image href="${href}" width="1" height="1" preserveAspectRatio="xMidYMid slice"/>`,
      `</pattern>`
    ].join("\n");
    return { patternId, fill: `url(#${patternId})`, markup };
  }
  const markup = `<image href="${href}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>`;
  return { fill: undefined, markup, image: true };
}

export function figmaStrokeAlignToSvgMarkup({ pathD, stroke, clipId = "stroke-align-clip" }) {
  const align = stroke.align ?? "CENTER";
  const strokeAttrs = figmaStrokeToSvgAttributes(stroke);
  const width = stroke.weight ?? 1;

  if (align === "CENTER") {
    return {
      align,
      markup: `<path d="${pathD}" fill="none" ${serializeAttrs(strokeAttrs)}/>`,
      layers: [{ role: "stroke", d: pathD, attrs: strokeAttrs }]
    };
  }

  if (align === "INSIDE") {
    const doubled = { ...strokeAttrs, "stroke-width": width * 2 };
    return {
      align,
      defs: `<clipPath id="${clipId}"><path d="${pathD}"/></clipPath>`,
      clipPathAttr: `url(#${clipId})`,
      markup: [
        `<clipPath id="${clipId}"><path d="${pathD}"/></clipPath>`,
        `<path d="${pathD}" fill="none" ${serializeAttrs(doubled)} clip-path="url(#${clipId})"/>`
      ].join("\n"),
      layers: [
        { role: "fill-clip", clipId },
        { role: "stroke", d: pathD, attrs: doubled, clipPathAttr: `url(#${clipId})` }
      ]
    };
  }

  return {
    align: "OUTSIDE",
    note: "SVG has no outside stroke; duplicate path with larger stroke under fill, or offset outline",
    markup: `<path d="${pathD}" fill="none" ${serializeAttrs(strokeAttrs)}/>`,
    layers: [{ role: "stroke-outside-approx", d: pathD, attrs: strokeAttrs }]
  };
}

function serializeAttrs(attrs) {
  return Object.entries(attrs)
    .filter(([key]) => !key.startsWith("data-"))
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
}

export function figmaPaintToSvg(paint, bbox, options = {}) {
  const type = paint.type ?? "SOLID";
  if (type === "SOLID") return { type, ...figmaSolidPaintToSvg(paint) };
  if (type === "GRADIENT_LINEAR") {
    return { type, ...figmaLinearGradientPaintToSvg(paint, bbox, options) };
  }
  if (type === "GRADIENT_RADIAL") {
    return { type, ...figmaRadialGradientPaintToSvg(paint, options) };
  }
  if (type === "GRADIENT_ANGULAR") {
    return { type, ...figmaAngularGradientToCss(paint) };
  }
  if (type === "IMAGE") return { type, ...figmaImagePaintToSvg(paint, options) };
  return { type, supported: false };
}

export function sampleFigmaLinearAtPoint(point, paint, bbox) {
  const gradient = figmaLinearGradientPaintToSvg(paint, bbox);
  const handles = paint.gradientHandlePositions ?? [
    { x: 0, y: 0.5 },
    { x: 1, y: 0.5 }
  ];
  return sampleLinearGradient(
    point,
    {
      gradientUnits: "objectBoundingBox",
      x1: handles[0].x,
      y1: handles[0].y,
      x2: handles[1].x,
      y2: handles[1].y,
      stops: gradient.definition.stops
    },
    bbox
  );
}
