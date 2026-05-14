# Changelog

## [1.9.1](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.9.0...v1.9.1) (2026-05-14)

### Bug Fixes

- support flexible symbolId templates ([a33f117](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/a33f117c181454ed015e36cde61c57c2ba126038)), closes [#26](https://github.com/yangxu52/vite-plugin-svg-icons-ng/issues/26)

### Documentation

- add migration guides from old-plugin ([3900665](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/390066570e98019350f5ad1d65af87a468a3fcce))

### Miscellaneous Chores

- normalize workspace deps with pnpm catalog ([535902e](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/535902ed18053d09661387a5bdc1eee3997d1aea))

### Tests

- add browser runtime coverage ([4abe45d](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/4abe45d615bba8a12ff341ed69c98c819d9f9765))

## [1.9.0](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.8.1...v1.9.0) (2026-05-03)

### Features

- add htmlMode for script inline none html generation ([12500bb](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/12500bb5852547ccd1b8287422ecd94442aa1a81)), closes [#25](https://github.com/yangxu52/vite-plugin-svg-icons-ng/issues/25)
- report baker issues during compile ([da6e417](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/da6e4171c4b5f0ac2efeb8e18b456b98b6c6be4e))

### Documentation

- document htmlMode and updated html generation behavior ([cc3e2d8](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/cc3e2d82bb66350a9f16b64b833eea5a62952957))

### Code Refactoring

- adapt compiler to instantiated baker ([3b44697](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/3b44697166efd7f09d893e31b9be1fa9c6c0fbc3))
- extract shared sprite mount runtime ([98ef211](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/98ef211a49ce4547ca4f2f729d8ab2d66ab77f03))
- rename compiled entry and close compiler scope ([2b5bbc0](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/2b5bbc081ccd856fcc7755b3fae12b2bc2f851a7))

### Tests

- cover htmlMode and foreignObject regression ([961f76b](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/961f76b974a5e081ea6f9e1afec06fd47b125958))

## <small>1.8.1 (2026-04-26)</small>

### Bug Fixes

- fix(svg-icon-baker): allow svg preamble before root ([07b2996](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/07b2996))

## 1.8.0 (2026-04-23)

- ci: unify package release workflow ([cceca37](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/cceca37))
- chore: unify and standardize package file ([539a905](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/539a905))
- test: add coverage workflow scripts ([01ba09e](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/01ba09e))
- test: cover svg icon hmr and ssr regressions ([798a00e](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/798a00e))
- docs: align svg icon runtime behavior ([22c2cb3](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/22c2cb3))
- feat: report duplicate svg symbol ids ([822a5da](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/822a5da))
- refactor: resolve icon dirs from vite root ([9028fa2](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/9028fa2))

## <small>1.7.1 (2026-04-20)</small>

- docs: align runtime and hmr descriptions ([767559a](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/767559a))
- docs: fix line number issue and refresh version ([5064a71](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/5064a71))
- refactor(core): unify compile pipeline and hash cache ([6b5f4a5](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/6b5f4a5))
- refactor(playground): normalize playground packages structure and tsconfig ([a3cb687](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/a3cb687))
- refactor(plugin): switch hmr to sprite update event ([6cbaaba](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/6cbaaba))
- feat(playground): add simple vue playground and unify detail ([c82850a](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/c82850a))
- chore: improve engineering foundation ([38cb487](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/38cb487))
- chore: unify the vite version and normalize tsconfig in workspace ([ba239a9](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/ba239a9))
- fix: types issue in unit test ([cac7ffd](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/cac7ffd))

## 1.7.0 (2026-03-30)

- docs: adjust the structure and polish content ([4909499](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/4909499))
- docs: polish HMR copy and clarify bakerOptions docs ([87e982a](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/87e982a))
- docs: refresh guides for SSR usage and auto-injection ([d5a9402](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/d5a9402))
- feat: add failOnError option and observable icon build errors ([bd534d8](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/bd534d8))
- feat: use the transformIndexHtml hook to inject ([d6b7504](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/d6b7504))
- feat(playground): add minimal SSR playground for verification ([e761825](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/e761825))
- fix: invalidate virtual modules on icon add/remove for dev-ssr ([07d8af3](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/07d8af3))
- refactor: cleanup dead code and import consistency ([707dcdb](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/707dcdb))
- refactor: extract hook, move template and simplify ([9bc42ba](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/9bc42ba))
- refactor: unify naming and structure ([8ba26fe](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/8ba26fe))

## <small>1.6.3 (2026-03-24)</small>

- feat: bump svg-icon-baker to v1.2.0 and adapt ([4f5014a](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/4f5014a)), closes [#23](https://github.com/yangxu52/vite-plugin-svg-icons-ng/issues/23)
- fix: make isIconFile extension check case-insensitive ([51d6a37](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/51d6a37))
- chore: update issue template ([290a407](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/290a407))

## <small>1.6.2 (2026-03-23)</small>

- test(playground): add icons to reproduce issue #22 ([d7e4b21](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/d7e4b21)), closes [#22](https://github.com/yangxu52/vite-plugin-svg-icons-ng/issues/22)
- fix: bump svg-icon-baker to v1.1.3 ([81eb879](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/81eb879)), closes [#22](https://github.com/yangxu52/vite-plugin-svg-icons-ng/issues/22)
- chore: normalize license ([79f9cba](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/79f9cba))

## <small>1.6.1 (2026-03-21)</small>

- chore: update non-major dependencies ([28053f3](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/28053f3))
- chore(skill): add agent skill ([bdaec46](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/bdaec46))
- test: split unit tests file by module ([cd0f41d](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/cd0f41d))
- refactor: abstract IconCache and implement memory cache ([84b5c29](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/84b5c29))
- refactor: extract compile pipeline and unify module renderers ([eda5868](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/eda5868))
- refactor: remove redundant core entry and decouple plugin/compiler utils ([b3e772b](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/b3e772b))
- refactor: unify load pipeline ([dd76551](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/dd76551))
- refactor: unify virtual module pipeline and add behavior test ([25b726f](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/25b726f))

## 1.6.0 (2026-03-20)

- docs: update options by using svg-icon-baker ([883ba6a](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/883ba6a))
- refactor: optimize naming and structure ([a2ef916](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/a2ef916))

## 1.6.0-rc.1 (2026-03-20)

- refactor: improve strokeOverride option ([d614b01](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/d614b01))
- chore: simplify README.md ([9043717](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/9043717))
- chore(playground): collect new svg files and group Display ([4631823](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/4631823))
- fix: issues by using svg-icon-baker ([579d710](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/579d710))
- ci: add release script & node bump to 24 ([a2e89a3](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/a2e89a3))
- docs: add missing import statement ([d9d4442](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/d9d4442))
- docs: normalize text ([5d061c8](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/5d061c8))

## 1.6.0-beta.1 (2025-11-13)

- feat: using svg-icon-baker for convert ([6f465a1](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/6f465a1))
- chore: extract stroke override ([706c006](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/706c006))

## <small>1.5.2 (2025-11-01)</small>

- refactor: move some function and re-implement path splash logic ([202c40c](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/202c40c))
- fix: re-implement ETag, move function and fix issue ([3ea5656](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/3ea5656))
- fix: typo in README ([57ebaf6](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/57ebaf6))
- chore: extract implementation from index.ts to dedicated file ([e13add7](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/e13add7))
- chore: move vitest and unbuild from workspace to package ([51486e9](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/51486e9))
- chore: remove some erroneous code check ([b3fdd93](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/b3fdd93))
- chore: rename package and filename ([7e59626](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/7e59626))
- chore: standardize unit test and update vitest to v4 ([12dcc38](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/12dcc38))

## 1.5.1 (2025-10-13)

- fix: prefix id issues ([30a14ce](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/30a14ce))

## [1.5.0](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.5.0...v1.4.1) (2025-10-10)

### Features

- feat: add non-duplicate symbol insertion when custom DOM elements exist ([1ace017](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/1ace017))

---

- chore: clean project ([4f1a578](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/4f1a578))
- chore: update & adjust commit lint and log ci ([54bc53f](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/54bc53f))
- chore: update non-major dependencies ([2a11c6d](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/2a11c6d))
- docs: fix example component props issue ([0bc9a5c](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/0bc9a5c))

## [1.4.1](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.4.1...v1.4.0) (2025-06-01)

- refactor: optimize the injected code
  snippets ([b143e59](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/b143e5958eacc386e35f521e28449518190d8467))
- chore: update engines requirements ([9da2000](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/9da20007828a3223c1bd3280d94d7fe8e84aeccd))

## [1.4.0](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.3.2...v1.3.1) (2025-04-08)

### Features

- feat: custom stroke overwrite ([68b5102](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/68b5102d3284950e9c690032ff0dfcadaeebf7b4))

### Bug Fixes

- fix: overwrite stroke issue ([28a25d2](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/28a25d2e45923d2f148b286fe67f08e087e9711e))

## [1.3.1](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.3.1...v1.3.0) (2025-03-24)

- docs: fix component reference ([55a62f4](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/55a62f4))
- chore: add LICENSE.md and README.md to packages/core ([0422b50](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/0422b50))

## [1.3.0](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.3.0...v1.2.2) (2025-03-16)

### Features

- feat: async process file and dir ([940cb72](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/940cb72f5114f43f23387e91f0431df9bbaf1139))

---

- docs: online office [homepage](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/)
  ([be09862](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/be098626db100bc0afec034fe3447fb1f5b7ca2e))

## [1.2.2](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.2.1...v1.0.0) (2025-03-12)

### Bug Fixes

- fix: incorrect removal of `width` and `height` issues,
  close [#2](https://github.com/yangxu52/vite-plugin-svg-icons-ng/issues/2) ([c82da26](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/c82da26a95685ad9c98f3497f99a88077cf44db7))

---

- chore: adjust playground style ([da0b0f9](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/da0b0f96e05def158cc89222788ea58501f6d5bd))

## [1.2.1](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.2.1...v1.2.0) (2025-03-12)

- chore: adjust regexp for DOM id ([ee72931](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/ee729315cffa73e9aa938aa6040105c09a13fe43))

## [1.2.0](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.2.0...v1.1.1) (2025-03-11)

**Little Breaking Change:** the logic of generate symbol id logic is changed, and then add user option validation, but it should not affect normal users.

### Features

- feat: validate user option ([6487937](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/6487937075a769f822074bb6be24b35f8698c076))

---

- refactor: file split dirname and basename
  logic ([e243bba](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/e243bba5afd8b0e7680de406f571c641cdf70c22))
- refactor: generate symbol id logic ([9d7ecd1](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/9d7ecd1eeec9c9a268cae1c6c23d7643b8f6a52f))
- chore: optimize type declaration ([c5ef104](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/c5ef104d08eddc2f3b05f0ca27b26be0155a33e6))

## [1.1.1](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.1.0...v1.0.0) (2025-03-10)

- refactor: reserve svg attribute in convert
  process ([bd3ecbc](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/bd3ecbc82fc0ca8e16f2df284fa101e793300fab))

## [1.1.0](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.0.5...v1.0.4) (2025-03-09)

- refactor: implement ETag generation logic ([cd901fd](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/cd901fd8d1c4745ce0fc49556303c6e2f33f0ab0))
- refactor: add cors header independently ([0d549d2](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/0d549d23f587612257c3a54ee415be94c5cb8a87))
- chore: remove the export of internal
  function ([4e6f336](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/4e6f336bc0456a9e741462f17b3738b3ad27e5a1))
- docs: update README ([dc062b8](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/dc062b801188a29df368b6825101ef377549e6bd))

## [1.0.4](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.0.4...v1.0.3) (2025-03-09)

- chore: add prefix '\0' while resolving id ([63b81a1](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/63b81a14f39498e6e5dd3bac026bcb20ff0c50bd))

## [1.0.3](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.0.3...v1.0.2) (2025-03-07)

- chore: optimize inject content ([54c24de](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/54c24dee7187278696fd7ee42aed560a35cd6705))
- chore: package export client.d.ts ([5835743](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/583574344ecff32b3ee451104cddb58bddf18aa6))

## [1.0.2](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.0.0...v1.0.2) (2025-03-05)

- fix: SVGO may throw error, when svg file has DOCTYPE
  declaration ([45cbe93](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/45cbe93fb700c65b848f199104a1ba05f9cbb344))

## [1.0.1](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.0.0...v1.0.1) (2025-03-05)

- refactor: the `svg` to `symbol` convert
  logic ([a89a61f](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/a89a61f4a340d5cd771a99f477a6953469595600))
- chore：update README ([47ce45a](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/47ce45a376a5386ebcf4a6baaa8678ac8f442d1b))
- chore：rewrite ci ([e3a610c](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/e3a610c4338dabf0e91cd18660c29a2b61bf6473))
- chore: organize & optimize project ([3e7dcc1](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/3e7dcc191c16fb6f711b51799a8d94d23036db9f))

# [1.0.0](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/bb334a992739afa418a455c01cb762386a50840a...1ffe748b93053b26cf5210d528df68761116e2e7) (2025-03-03)

### BREAKING CHANGES

- refactor: implement the `svg` to `symbol` convert logic to **remove
  `svg-baker`** ([84a0047](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/84a00475ff705de97ee4cbf1203c3d79fbf89b03))  
  This may cause unknown problems, but it's working good now. Welcome to [issue](https://github.com/yangxu52/vite-plugin-svg-icons-ng/issues).

---

- refactor: migrate to `svgo` v3 ([82b6cfc](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/82b6cfc88e3a7196061ad82e6f75a378dc930e06))

- refactor: migrate to `ESLint` v9 and `Prettier` v3 and
  reconfigure ([87bc4d2](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/87bc4d249a3732246cc4932b4b8f8582b5483b08))

- chore: dev/test/build related dependencies version alignment of
  the [create-vite@6.3.1](https://github.com/vitejs/vite/releases/tag/create-vite%406.3.1) ([ee84950](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/ee8495005929edc4e487a32a57d7c4714f91de7b))

- chore: almost no-major dependencies update to the latest and fix some
  problems ([commit 5f253f1](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/5f253f1e498aa7567702bcd316b0b2abb94a6816))

- chore: remove useless dependencies ([commit 390561b](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/390561baf1cbbd81630ab219bb284b1b0c8ab6ef))

- chore: other organization work
