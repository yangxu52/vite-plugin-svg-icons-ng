export const TAG_TYPES = {
  VERSION_ONLY: 'version-only',
  DIR_AT_VERSION: 'dir-at-version',
}

export const PRERELEASE_CHANNELS = ['alpha', 'beta', 'rc']

export const releaseConfig = {
  mainPackageDir: 'vite-plugin-svg-icons-ng',
  defaultTagType: TAG_TYPES.DIR_AT_VERSION,
  packages: {
    'vite-plugin-svg-icons-ng': {
      tagType: TAG_TYPES.VERSION_ONLY,
    },
  },
}
