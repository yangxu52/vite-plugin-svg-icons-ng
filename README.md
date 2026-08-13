# vite-plugin-svg-icons-ng

[![npm version](https://badge.fury.io/js/vite-plugin-svg-icons-ng.svg)](https://www.npmjs.com/package/vite-plugin-svg-icons-ng)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
![GitHub Stars](https://img.shields.io/github/stars/yangxu52/vite-plugin-svg-icons-ng.svg?style=flat-square&label=Stars&logo=github)
![GitHub Forks](https://img.shields.io/github/forks/yangxu52/vite-plugin-svg-icons-ng.svg?style=flat-square&label=Forks&logo=github)

> A high-performance SVG icon plugin for Vite.
>
> Automatically generates SVG sprites from files and injects them at runtime, making icon usage simpler and more efficient.

[Documentation](https://vite-plugin-svg-icons-ng.yangxu.cc) | [中文文档](https://vite-plugin-svg-icons-ng.yangxu.cc/zh/) | [npm](https://www.npmjs.com/package/vite-plugin-svg-icons-ng)

> For coding agents, install the companion skill:

```sh
npx skills add yangxu52/vite-plugin-svg-icons-ng # For global installation, add -g
```

## Highlights

- File-based SVG icons with automatic sprite generation
- Runtime sprite injection with no extra network request
- Cached compilation with HMR for a smoother development loop
- Consistent output across dev, build, and SSR flows
- Safer icon sets with duplicate `symbolId` detection and optional build failure
- Ready-to-use virtual modules for register, ids, and sprite access

## Repository

- Core package: [`packages/vite-plugin-svg-icons-ng`](./packages/vite-plugin-svg-icons-ng)
- Documentation site: [`docs`](./docs)
- Playground: [`playground`](./playground)

## Development

```sh
pnpm test              # unit tests for both packages
pnpm run test:browser  # Chromium and Vite integration tests
pnpm run test:all      # unit and browser tests
pnpm run coverage      # unit-test coverage for production source
pnpm run typecheck
```

## Package

Install the package:

```sh
pnpm add -D vite-plugin-svg-icons-ng
```

Then continue with the package guide:

- [Package README](./packages/vite-plugin-svg-icons-ng/README.md)
- [Getting Started](https://vite-plugin-svg-icons-ng.yangxu.cc/guide/)
- [Usage Guide](https://vite-plugin-svg-icons-ng.yangxu.cc/guide/usage)
- [Component Usage](https://vite-plugin-svg-icons-ng.yangxu.cc/guide/component/)

## Thanks

Inspired by [vite-plugin-svg-icons](https://github.com/vbenjs/vite-plugin-svg-icons).

## License

[MIT](./LICENSE)
Copyright (c) 2025-present, yangxu52
