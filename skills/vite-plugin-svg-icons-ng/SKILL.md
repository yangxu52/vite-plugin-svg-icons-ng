---
name: vite-plugin-svg-icons-ng
description: 'Consumer setup and integration for vite-plugin-svg-icons-ng: installation, createSvgIconsPlugin configuration, direct SVG usage, Vue 3 and React components, htmlMode, virtual modules, TypeScript, SSR, and migration from vite-plugin-svg-icons. Excludes plugin source development, compiler/cache/HMR internals, svg-icon-baker, workspace maintenance, tests, and releases.'
---

# vite-plugin-svg-icons-ng (library-user support)

Consumer-facing reference for `vite-plugin-svg-icons-ng`, intended for AI Agent use rather than direct end-user reading.

## Scope

Cover only the public consumer workflow:

- installation and first Vite configuration;
- direct SVG usage and reusable Vue 3 or React icon components;
- public plugin options and runtime choices;
- virtual modules, SSR, and TypeScript declarations;
- migration from `vite-plugin-svg-icons`.

Do not infer consumer instructions from implementation files. Do not handle package internals, compiler behavior, cache/HMR fixes, `svg-icon-baker` development, workspace/release work, or test maintenance. Route those requests to the repository's developer skills instead.

## Documentation sources and routing

Documentation site: https://vite-plugin-svg-icons-ng.yangxu.cc

All factual guidance must be grounded in the documentation site. Read only the reference needed for the current question. When the user asks in Chinese, use the Chinese guide pages on the documentation site; do not assume undocumented behavior from source code, package metadata, or history.

| User task                                    | Skill reference                      |
| -------------------------------------------- | ------------------------------------ |
| Install and configure the plugin             | `references/getting-started.md`      |
| Direct usage or component integration        | `references/usage-and-components.md` |
| Options, virtual modules, SSR, or TypeScript | `references/options-and-runtime.md`  |
| Migrate from the old plugin                  | `references/migration.md`            |

If the docs do not establish an answer, say what is undocumented and ask for the missing project context instead of guessing from source code or history.

## Agent workflow

1. Classify the request as setup, direct/component usage, runtime/SSR/TypeScript, or migration.
2. Identify the project's framework and package manager before choosing an example.
3. Check prerequisites and the existing plugin configuration before proposing edits.
4. Give the smallest change supported by the documentation, including the documented imports, paths, and relevant follow-up page when needed.
5. Call out mutually exclusive or easy-to-misconfigure runtime choices.
6. For migration, follow the migration reference and finish with its checklist.

## Gotchas

- Do not load every reference for a single-topic request.
- Do not fill documentation gaps with package internals or general ecosystem assumptions.
- Do not answer implementation, testing, workspace, or release questions with this consumer skill.

## Should trigger

- “How do I install and configure `vite-plugin-svg-icons-ng`?”
- “Write a Vue 3/React `SvgIcon` component for this plugin.”
- “Which `htmlMode` should my SSR app use?”
- “Why is my `symbolId` invalid or duplicated?”
- “How do I configure the TypeScript declarations?”
- “How do I use `virtual:svg-icons/ids`?”
- “Migrate this project from `vite-plugin-svg-icons`.”

## Should not trigger

- “Fix icon cache invalidation or HMR in the plugin source.”
- “Change SVG ID rewriting in `svg-icon-baker`.”
- “Which package owns this workspace dependency or release tag?”
