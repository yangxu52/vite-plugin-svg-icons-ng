# vite-plugin-svg-icons-ng

[![npm version](https://badge.fury.io/js/vite-plugin-svg-icons-ng.svg)](https://www.npmjs.com/package/vite-plugin-svg-icons-ng)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
![GitHub Stars](https://img.shields.io/github/stars/yangxu52/vite-plugin-svg-icons-ng.svg?style=flat-square&label=Stars&logo=github)
![GitHub Forks](https://img.shields.io/github/forks/yangxu52/vite-plugin-svg-icons-ng.svg?style=flat-square&label=Forks&logo=github)

> A high-performance SVG icon plugin for Vite.
>
> Automatically generates SVG sprites from files and injects them at runtime, making icon usage simpler and more efficient.

[Documentation](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/) | [中文文档](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/zh/) | [npm](https://www.npmjs.com/package/vite-plugin-svg-icons-ng)

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

## Package

Install the package:

```sh
pnpm add -D vite-plugin-svg-icons-ng
```

Then continue with the package guide:

- [Package README](./packages/vite-plugin-svg-icons-ng/README.md)
- [Getting Started](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/guide/)
- [Usage Guide](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/guide/usage)
- [Component Usage](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/guide/component/)

## Thanks

Inspired by [vite-plugin-svg-icons](https://github.com/vbenjs/vite-plugin-svg-icons).

## License

[MIT](./LICENSE)
Copyright (c) 2025-present, yangxu52
