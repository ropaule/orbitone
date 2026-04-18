# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Orbitone is a web-based **polyshifting** explorer built with React and Tone.js. The core concept is *not* traditional polyrhythm — instead, each tone in a chord is played at a slightly different repeating interval. For example: Tone A fires every X seconds, Tone B every X+1 seconds, Tone C every X+2 seconds, and so on. This offset-interval approach creates evolving, shifting patterns as the tones drift in and out of phase with each other.

## Commands

```bash
npm run dev      # Start dev server (Vite)
npm run build    # Production build
npm run preview  # Preview production build locally
npm run lint     # ESLint (flat config, JS/JSX files)
```

There is no test suite.

## Architecture

**Stack:** React 19 + Vite 8, Tone.js 15 for Web Audio, plain CSS (no CSS-in-JS or utility framework).

**App layout** (`App.jsx`): Two-panel layout — `.stage` (main content, flex: 1) and `.sidebar` (fixed 260px right panel). State for BPM and volume lives at the App level and is passed down to controls.

**Tone.js** is installed but not yet wired up — audio engine integration is pending.

### Design system

All CSS custom properties are defined in `src/index.css` under `:root`. The palette is neumorphic (soft shadows using `--shadow-dark` / `--shadow-light` on a `--color-bg` base). Accent color is `--color-accent` (blue). Font is Space Grotesk.

### Knob component (`src/components/Knob.jsx`)

The reusable rotary control. Key design decisions:
- SVG arc uses a fixed internal `viewBox="0 0 100 100"` coordinate system; stroke widths are in those 100-unit coordinates and scale automatically.
- Physical size is controlled by the `size` prop (`xs | s | m | l`) which maps to a `--knob-scale` CSS variable applied to the container. Text labels and value display are fixed size regardless of knob scale.
- Drag interaction uses `window` mousemove/mouseup listeners (attached on mousedown, removed on mouseup). Movement along both axes contributes to value change over a 200px range.
- Props: `label`, `min` (default 0), `max` (default 100), `value`, `onChange`, `size` (default `"m"`).

## ESLint rules

- `no-unused-vars` errors, but ignores variables matching `/^[A-Z_]/` (constants/components pattern).
