# Introduction

## What's this?

`vite-plugin-svg-icons-ng` is a high-performance SVG icon plugin built for Vite.

It automatically generates SVG sprites from local files and injects them at runtime, allowing you to use SVG icons as easily as regular icons.

No manual sprite management, no extra requests, and no complex setup—just a clean and reusable icon system.

> This project is inspired by vite-plugin-svg-icons. Thanks.

## Why this plugin?

Using SVG icons in real-world projects often comes with friction:

- Manually managing icon files, imports, and paths
- Using `<img src>` or inline SVG is verbose and hard to reuse
- Styling (color, size, responsiveness) is awkward
- Updating icons interrupts development flow
- Inconsistent behavior across dev, build, and SSR

vite-plugin-svg-icons-ng solves these problems:

- Generates SVG sprites automatically from files
- Use icons via `<use>` with full styling control
- Built-in HMR for instant updates
- Consistent output across dev, build, and SSR
- No extra requests, better performance

Turning icons from something you manage into something you just use.

---

## Features

- 🚀 Pre-generation & Injection  
  Automatically generates SVG sprites from files and injects them at runtime for global reuse.

- ⚡ High Performance  
  Combines async build processing with caching, updating icons only when needed for a faster, smoother experience.

- 🔥 HMR Support  
  Icons update quickly in dev and stay consistent across client/SSR paths (currently via automatic full-page reload).

- 🧩 SSR Ready  
  Works seamlessly in SSR environments, ensuring consistent rendering without extra setup.

- 🧱 Cross-environment Consistency  
  Ensures identical SVG sprite output across dev, build, and SSR to avoid environment inconsistencies.

- 📦 Out-of-the-box  
  Sensible defaults and comprehensive docs for quick setup and a unified icon system.

## Next Steps

- Start with [Quick Start](/guide/quick-start)
- Check [Options](/guide/options) for configuration details
