# Why this plugin?

## The Real-World Problem

In a real project, icon usage often becomes noisy and repetitive:

- Icon files are scattered, naming is inconsistent, and imports are manual.
- Teams fall back to `<img src>` or ad-hoc inline SVG, which is hard to reuse.
- Color/size control varies by page, and updates are easy to miss.
- Behavior can drift between development, build output, and SSR.

The issue is not SVG itself.  
The issue is that icon workflow is rarely treated as a first-class part of the build system.

## Why create `vite-plugin-svg-icons-ng`

`vite-plugin-svg-icons-ng` was created to make icon usage predictable:

- Take local SVG files as the source of truth.
- Generate sprite output automatically.
- Inject and consume icons in a consistent way.
- Keep the developer loop smooth with cache + HMR.

The goal is simple: turn icon handling from manual chores into a standard workflow.

## Relationship with `vite-plugin-svg-icons`

- This project is inspired by [`vite-plugin-svg-icons`](https://github.com/vbenjs/vite-plugin-svg-icons), and respects its core sprite-based idea.
- `vite-plugin-svg-icons-ng` focuses on a renewed implementation and documentation experience for this repository.
- It keeps a migration-friendly path for legacy virtual module ids, while recommending the newer module ids:
  - `virtual:svg-icons/register`
  - `virtual:svg-icons/ids`
