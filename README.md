# Progen Flares 2

A procedural lens flare generator built with Svelte. Create photorealistic, fully customizable lens flare effects with real-time preview and export.

## Features

- Real-time procedural flare rendering on HTML5 Canvas
- 6 customizable artifact layers: Hotspot, Streak, Ring, Multi-Iris, Glow, Lens Orbs
- Zoom/pan canvas preview with fit-to-window scaling
- Preset system with 17 built-in presets and user import/export (.pgf2 format)
- Undo/redo history (Ctrl+Z / Ctrl+Y)
- Export as PNG, JPG, or WebP
- Responsive layout with draggable panel divider
- Multiple deployment targets: web, Electron desktop app, Photoshop plugin, Photopea plugin

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:8181 in your browser.

## Build Commands

| Command | Output | Description |
|---------|--------|-------------|
| `npm run build` | `public/build/` | Production web build |
| `npm run build:electron` | `electron-app/app/build/` | Electron app bundle |
| `npm run build:photoshop` | `photoshop-plugin/webview-contents/build/` | Photoshop UXP plugin |
| `npm run build:photopea` | `photopea-plugin/frame-contents/build/` | Photopea popup plugin |
| `npm run dev` | `public/build/` | Dev server with live reload |

## Project Structure

```
src/
├── App.svelte              Main app shell (layout, export, platform integration)
├── main.js                 Entry point
├── components/             UI components (Slider, Collapsible, Divider, etc.)
│   └── controls/           Control panel sections (per-artifact settings)
├── flareArtifacts/         Canvas rendering classes (Spot, Ring, Iris, Half)
├── state/                  Settings defaults, render engine, undo history
├── utils/                  Shared utilities (noise, color, drawing, canvas actions)
├── builtinPresets/         .pgf2 preset JSON files
└── images/                 Logo and cover image assets

electron-app/              Electron desktop wrapper
photoshop-plugin/          Adobe Photoshop UXP plugin
photopea-plugin/           Photopea web plugin
```

## Architecture

The flare is composed of independent artifact layers, each rendered to an offscreen canvas, then composited onto the main preview canvas with screen blending. The render pipeline:

1. **Artifact render** — Each artifact class (Spot, Ring, Iris) generates its texture
2. **Composition** — `renderEngine.js` draws all visible artifacts to the output canvas
3. **Preview** — The `PreviewCanvas` component provides zoom/pan interaction
4. **Export** — Temporarily sets downscaling to 1, renders at full resolution, encodes to data URL

Settings are stored as a plain JSON object (`flareSettings`) which doubles as the preset format.

## Tech Stack

- **Svelte 3** — UI framework
- **Rollup** — Module bundler with environment-specific builds
- **Canvas 2D API** — All rendering
- **SVG feTurbulence** — Fractal noise generation (via persistent hidden SVG)
- **seedrandom** — Deterministic RNG for reproducible randomized effects

## License

See [LICENSE.md](./LICENSE.md).

---

© 2026 Lunal Graphics — Developed by Yikuan Sun
