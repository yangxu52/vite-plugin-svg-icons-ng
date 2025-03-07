# [1.0.3](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.0.3...v1.0.2) (2025-03-07)

- chore: optimize inject content ([54c24de](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/54c24dee7187278696fd7ee42aed560a35cd6705))
- chore: package export client.d.ts ([5835743](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/583574344ecff32b3ee451104cddb58bddf18aa6))

## [1.0.2](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.0.0...v1.0.2) (2025-03-05)

- fix: SVGO may throw error, when svg file has DOCTYPE declaration ([45cbe93](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/45cbe93fb700c65b848f199104a1ba05f9cbb344))

## [1.0.1](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/v1.0.0...v1.0.1) (2025-03-05)

- refactor: the `svg` to `symbol` convert logic ([a89a61f](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/a89a61f4a340d5cd771a99f477a6953469595600))
- chore：update README ([47ce45a](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/47ce45a376a5386ebcf4a6baaa8678ac8f442d1b))
- chore：rewrite ci ([e3a610c](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/e3a610c4338dabf0e91cd18660c29a2b61bf6473))
- chore: organize & optimize project ([3e7dcc1](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/3e7dcc191c16fb6f711b51799a8d94d23036db9f))

# [1.0.0](https://github.com/yangxu52/vite-plugin-svg-icons-ng/compare/bb334a992739afa418a455c01cb762386a50840a...1ffe748b93053b26cf5210d528df68761116e2e7) (2025-03-03)

### BREAKING CHANGES

- #### refactor: implement the `svg` to `symbol` convert logic to **remove `svg-baker`** ([84a0047](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/84a00475ff705de97ee4cbf1203c3d79fbf89b03))
  This may cause unknown problems, but it's working good now. Welcome to [issue](https://github.com/yangxu52/vite-plugin-svg-icons-ng/issues).

---

- refactor: migrate to `svgo` v3 ([82b6cfc](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/82b6cfc88e3a7196061ad82e6f75a378dc930e06))

- refactor: migrate to `ESLint` v9 and `Prettier` v3 and reconfigure ([87bc4d2](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/87bc4d249a3732246cc4932b4b8f8582b5483b08))

- chore: dev/test/build related dependencies version alignment of the [create-vite@6.3.1](https://github.com/vitejs/vite/releases/tag/create-vite%406.3.1) ([ee84950](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/ee8495005929edc4e487a32a57d7c4714f91de7b))

- chore: almost no-major dependencies update to the latest and fix some problems ([commit 5f253f1](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/5f253f1e498aa7567702bcd316b0b2abb94a6816))

- chore: remove useless dependencies ([commit 390561b](https://github.com/yangxu52/vite-plugin-svg-icons-ng/commit/390561baf1cbbd81630ab219bb284b1b0c8ab6ef))

- chore: other organization work
