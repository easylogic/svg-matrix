# SVG Graphics Geometry

Path, stroke, fill, and coordinate math for people building vector editors, SVG exporters, and Figma-like tools.

## Series position

This repository is a **standalone** course. It does not extend `css-matrix` in place.

```txt
../css-matrix           DOM/CSS/SVG overlay + Figma to CSS
../svg-matrix           SVG path & rendering math (this repo)
../webgl-webgpu-matrix  GPU renderer for the same editor model
```

Recommended order: finish or skim `css-matrix` coordinates and matrices, then start here.

## Commands

```bash
pnpm install
pnpm dev
pnpm test
pnpm run build
pnpm run serve:lessons
```

Dev server: http://127.0.0.1:4175/

## Structure

- `packages/site/docs` — VuePress lesson source
- `packages/svg-matrix-core` — dependency-free path and geometry utilities
- `packages/lesson_runtime` — browser demos
- `packages/lesson_XXX` — per-lesson entry HTML

## Curriculum (v0.9)

| Part | Lessons | Topics |
|------|---------|--------|
| 0 | 000–002, 067 | SVG 소개, viewBox, transform, 기본 도형 |
| 1 | 003, 007–012 | M/L/Z, H/V, C/Q, S/T, arc, bbox |
| 2 | 004–006, 013 | stroke distance, join/cap, align, miter math |
| 3 | 014–015 | nonzero/evenodd, fill hit (intro) |
| 4 | 016–018 | flatten, length, point-at-length |
| 5 | 019–020 | linearGradient coords, clip/mask |
| 6 | 021–024 | path handles, hit, drag, mini editor |
| 7 | 025–030 | winding deep dive, boolean, scanline |
| 8 | 032–034 | radialGradient, pattern, spreadMethod |
| 9 | 031, 035–039 | SVG filter chain, Figma effects |
| 10 | 040–043 | Figma vector network, fill/stroke, boolean, clip |
| 11 | 044–047 | icon grid, fill/stroke icons, sprite, simplify |
| A | 048–050 | currentColor, data URI, viewBox optimize |
| B | 051–054 | dash/offset, adaptive flatten, arc→cubic, multi-subpath |
| 12 | 055–056 | capability map, coordinate stack |
| 13 | 057–061 | Figma paint gap, gradients, image, stroke align, blend |
| 14 | 062–065 | markers, textPath, paint-order, arc flatten |

**87 lessons** with live demos (000·067 = Part 0 입문, 068–087 = SVG 수학 Parts 15–22).

- 목차: `packages/site/docs/guide/README.md`
- 로드맵: `packages/site/docs/guide/ROADMAP.md`
- Figma filter 매핑: `packages/site/docs/guide/figma-filter-mapping.md`
- Figma paint gap: `packages/site/docs/guide/figma-paint-gap.md`
