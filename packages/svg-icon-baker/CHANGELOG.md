# Changelog

## [2.0.0](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/svg-icon-baker@1.2.1...svg-icon-baker@2.0.0) (2026-05-01)

### ⚠ BREAKING CHANGES

- **custom SVGO plugins now run before sprite id rewriting and therefore observe original ids instead of rewritten ids. Error timing and edge-case behavior may differ from the previous rewrite-then-optimize flow.**
- **sprite id rewriting no longer follows the previous SVGO-based flow. Generated ids and custom SVGO setups that relied on the old behavior may produce different results.**

### Features

- add reusable baker instance API ([8eab428](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/8eab428a56606caa2f1dcc229cb3c5f60791449b))
- decouple sprite id rewrite pipeline from svgo ([62ad050](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/62ad0508ea72578cac0668b867f12fce20191c65))

### Documentation

- align skill docs with rewrite core ([5241148](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/5241148e5c602880517df90a3d80f5d92cb1e330))

### Code Refactoring

- harden safe svgo plugin blacklist ([30bf3a6](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/30bf3a6320d711f8d9cc4056197811e4a5eb8075))
- move symbol build into oven ([e1d1d9d](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/e1d1d9d067e1be9a7d2c0a7a58b5cf9e765c9ce0))
- run svgo before sprite id rewrite ([d45a39e](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/d45a39eddfa95cb6059164bf8fe8b26877b88143))
- simplify oven ast rewrite flow ([363ccc5](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/363ccc5f24faeda788332b6b2fb428ec3b2276cf))
- simplify source conversion flow ([dcd8013](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/dcd801354057bf4872bc08f7a4a551a41a573889))
- unify bake issue and error model ([c46dfe5](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/c46dfe5c3de2f2c310346bfe4bd99894b42c0172))

### Tests

- cover issue and reference edges ([7387067](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/7387067f45067ef0cbaf66ebad9b0118c435886c))

## 1.2.1 (2026-04-26)

### Bug Fixes

- **svg-icon-baker:** allow svg preamble before root ([07b2996](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/07b29968156fa05cded5daf7adcb80b2eaa35965))

## 1.2.0 (2026-03-24)

- docs: update the content related to options ([343293c](https://github.com/yangxu52/svg-icon-baker/commit/343293c))
- test: add unit test for refactor options flow ([0aad830](https://github.com/yangxu52/svg-icon-baker/commit/0aad830))
- feat: refactor options flow to support svgo options ([4337789](https://github.com/yangxu52/svg-icon-baker/commit/4337789))

## <small>1.1.3 (2026-03-23)</small>

- chore: create svg-icon-baker project skill ([7122541](https://github.com/yangxu52/svg-icon-baker/commit/7122541))
- fix: preserve root attributes when converting svg to symbol ([1e0c0ec](https://github.com/yangxu52/svg-icon-baker/commit/1e0c0ec))
- docs: update README.md content ([30607a9](https://github.com/yangxu52/svg-icon-baker/commit/30607a9))

## <small>1.1.2 (2026-03-20)</small>

- refactor: override the preset-default, improve safe ([02d6fbf](https://github.com/yangxu52/svg-icon-baker/commit/02d6fbf))

## <small>1.1.1 (2026-03-20)</small>

- fix: svgo prefix-id issue with patch ([f0a78df](https://github.com/yangxu52/svg-icon-baker/commit/f0a78df))
- docs: update README.md ([458fe3d](https://github.com/yangxu52/svg-icon-baker/commit/458fe3d))

## 1.1.0 (2026-03-17)

- feat: add batch processing ([a72a4a4](https://github.com/yangxu52/svg-icon-baker/commit/a72a4a4))
- feat: add boolean to options ([60204a9](https://github.com/yangxu52/svg-icon-baker/commit/60204a9))
- refactor: unify named ([9544f20](https://github.com/yangxu52/svg-icon-baker/commit/9544f20))

## <small>1.0.1 (2026-03-16)</small>

- ci: update ([8fd750f](https://github.com/yangxu52/svg-icon-baker/commit/8fd750f))
- refactor: remove redundant type assertion ([3efebcd](https://github.com/yangxu52/svg-icon-baker/commit/3efebcd))
- chore: add CLAUDE.md ([2363e3a](https://github.com/yangxu52/svg-icon-baker/commit/2363e3a))
- chore: update dependencies ([56661c7](https://github.com/yangxu52/svg-icon-baker/commit/56661c7))

## 1.0.0 (2025-11-21)

- docs: add options help ([eee766f](https://github.com/yangxu52/svg-icon-baker/commit/eee766f))
- feat: validate name and improve unit test ([e348f6e](https://github.com/yangxu52/svg-icon-baker/commit/e348f6e))
- chore: normalize license ([7707597](https://github.com/yangxu52/svg-icon-baker/commit/7707597))

## 1.0.0-rc.1 (2025-11-14)

- chore: automated bump version ([1655590](https://github.com/yangxu52/svg-icon-baker/commit/1655590))
- chore: required node>=20 ([cb51288](https://github.com/yangxu52/svg-icon-baker/commit/cb51288))

## 1.0.0-beta.3 (2025-11-13)

- refactor: throwing the error instead of boxing the error ([3dee355](https://github.com/yangxu52/svg-icon-baker/commit/3dee355))

## 1.0.0-beta.2 (2025-11-13)

- refactor: remove asynchronous and modify document ([8165132](https://github.com/yangxu52/svg-icon-baker/commit/8165132))

## 1.0.0-beta.1 (2025-11-13)

- chore: optimize code struct ([c16b65e](https://github.com/yangxu52/svg-icon-baker/commit/c16b65e))
- chore: standardize unit test ([30ad720](https://github.com/yangxu52/svg-icon-baker/commit/30ad720))
- chore: test add coverage ([45bc15d](https://github.com/yangxu52/svg-icon-baker/commit/45bc15d))
- test: rewrite unit test ([23fec8e](https://github.com/yangxu52/svg-icon-baker/commit/23fec8e))
- feat: batch process ([ce19a01](https://github.com/yangxu52/svg-icon-baker/commit/ce19a01))

## 0.3.0-beta.1 (2025-10-30)

- feat: implement options ([8a5e566](https://github.com/yangxu52/svg-icon-baker/commit/8a5e566))

## 0.2.0-beta.2 (2025-10-29)

- fix: run build before publish ([cea470a](https://github.com/yangxu52/svg-icon-baker/commit/cea470a))

## 0.2.0-beta.1 (2025-10-29)

- feat: implement core logic ([45103bd](https://github.com/yangxu52/svg-icon-baker/commit/45103bd))
- chore: standardization ([f41a1f2](https://github.com/yangxu52/svg-icon-baker/commit/f41a1f2))
- ci: update for OIDC ([a3ecf5d](https://github.com/yangxu52/svg-icon-baker/commit/a3ecf5d))

## 0.1.0-beta.1 (2025-10-12)

- init: project ([2496fd4](https://github.com/yangxu52/svg-icon-baker/commit/2496fd4))
