# [1.3.0](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.3.0...v1.2.2) (2025-03-16)

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
