export function buildMarkerMarkup(options) {
  const {
    id = "arrow",
    viewBox = "0 0 10 10",
    refX = 10,
    refY = 5,
    orient = "auto",
    markerWidth = 6,
    markerHeight = 6,
    pathD = "M 0 0 L 10 5 L 0 10 Z",
    fill = "context-stroke"
  } = options;
  return [
    `<marker id="${id}" viewBox="${viewBox}" refX="${refX}" refY="${refY}"`,
    ` markerWidth="${markerWidth}" markerHeight="${markerHeight}" orient="${orient}">`,
    `  <path d="${pathD}" fill="${fill}"/>`,
    `</marker>`
  ].join("\n");
}

export function buildTextPathMarkup(options) {
  const { pathId = "label-path", pathD, text, fill = "currentColor", fontSize = 16 } = options;
  return [
    `<defs><path id="${pathId}" d="${pathD}"/></defs>`,
    `<text fill="${fill}" font-size="${fontSize}">`,
    `  <textPath href="#${pathId}" startOffset="50%" text-anchor="middle">${text}</textPath>`,
    `</text>`
  ].join("\n");
}

export function paintOrderAttributes(order = "fill stroke markers") {
  return { "paint-order": order };
}

export function layerOpacityAttributes({ opacity = 1, fillOpacity, strokeOpacity } = {}) {
  const attrs = {};
  if (opacity !== undefined) attrs.opacity = opacity;
  if (fillOpacity !== undefined) attrs["fill-opacity"] = fillOpacity;
  if (strokeOpacity !== undefined) attrs["stroke-opacity"] = strokeOpacity;
  return attrs;
}

export const SVG_FILTER_PRIMITIVES = [
  { tag: "feGaussianBlur", role: "blur" },
  { tag: "feOffset", role: "translate shadow" },
  { tag: "feFlood", role: "solid color" },
  { tag: "feComposite", role: "mask / clip layers" },
  { tag: "feMerge", role: "stack shadows" },
  { tag: "feTurbulence", role: "noise texture" },
  { tag: "feDisplacementMap", role: "warp using noise" }
];

export function buildTurbulenceFilterMarkup(filterId = "noise", baseFrequency = 0.05) {
  return [
    `<filter id="${filterId}" x="0%" y="0%" width="100%" height="100%">`,
    `  <feTurbulence type="fractalNoise" baseFrequency="${baseFrequency}" numOctaves="2" result="noise"/>`,
    `  <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G"/>`,
    `</filter>`
  ].join("\n");
}
