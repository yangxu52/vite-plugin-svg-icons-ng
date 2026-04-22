import fs from 'node:fs'
import path from 'node:path'

import { PRERELEASE_CHANNELS, releaseConfig, TAG_TYPES } from './release.config.mjs'

const SEMVER_RE = /^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?$/
const VERSION_ONLY_TAG_RE = new RegExp(`^v(${SEMVER_RE.source.slice(1, -1)})$`)

export function getMainPackageDir() {
  return releaseConfig.mainPackageDir
}

export function getPackageReleaseConfig(packageDir) {
  const override = releaseConfig.packages[packageDir] ?? {}

  return {
    packageDir,
    tagType: override.tagType ?? releaseConfig.defaultTagType,
  }
}

export function isValidReleaseVersion(version) {
  return SEMVER_RE.test(version)
}

export function isPrereleaseVersion(version) {
  return version.includes('-')
}

export function assertPrereleaseChannel(channel) {
  if (!PRERELEASE_CHANNELS.includes(channel)) {
    throw new Error(`Unsupported prerelease channel '${channel}'. Expected one of: ${PRERELEASE_CHANNELS.join(', ')}`)
  }
}

export function formatReleaseTag(packageDir, version) {
  if (!isValidReleaseVersion(version)) {
    throw new Error(`Invalid version '${version}'. Expected a semver version.`)
  }

  const { tagType } = getPackageReleaseConfig(packageDir)

  if (tagType === TAG_TYPES.VERSION_ONLY) {
    return `v${version}`
  }

  if (tagType === TAG_TYPES.DIR_AT_VERSION) {
    return `${packageDir}@${version}`
  }

  throw new Error(`Unsupported tag type '${tagType}' for package '${packageDir}'.`)
}

export function getPrereleaseTagPrefix(packageDir, baseVersion, channel) {
  assertPrereleaseChannel(channel)

  const { tagType } = getPackageReleaseConfig(packageDir)

  if (tagType === TAG_TYPES.VERSION_ONLY) {
    return `v${baseVersion}-${channel}.`
  }

  if (tagType === TAG_TYPES.DIR_AT_VERSION) {
    return `${packageDir}@${baseVersion}-${channel}.`
  }

  throw new Error(`Unsupported tag type '${tagType}' for package '${packageDir}'.`)
}

export function parseReleaseTag(tag) {
  if (!tag) {
    throw new Error('Release tag is required.')
  }

  const versionOnlyMatch = tag.match(VERSION_ONLY_TAG_RE)
  if (versionOnlyMatch) {
    const version = versionOnlyMatch[1]

    const packageDir = getMainPackageDir()
    const { tagType } = getPackageReleaseConfig(packageDir)

    if (tagType !== TAG_TYPES.VERSION_ONLY) {
      throw new Error(`Package '${packageDir}' is not configured for version-only tags.`)
    }

    return {
      tag,
      packageDir,
      version,
      tagType,
    }
  }

  const separatorIndex = tag.lastIndexOf('@')
  if (separatorIndex <= 0) {
    throw new Error(`Invalid release tag '${tag}'. Expected v<version> or <package-dir>@<version>.`)
  }

  const packageDir = tag.slice(0, separatorIndex)
  const version = tag.slice(separatorIndex + 1)

  if (!isValidReleaseVersion(version)) {
    throw new Error(`Invalid package tag '${tag}'. Expected format <package-dir>@<version>.`)
  }

  const { tagType } = getPackageReleaseConfig(packageDir)
  if (tagType !== TAG_TYPES.DIR_AT_VERSION) {
    throw new Error(`Package '${packageDir}' is not configured for <package-dir>@<version> tags.`)
  }

  return {
    tag,
    packageDir,
    version,
    tagType,
  }
}

export function getPackageManifestPath(rootDir, packageDir) {
  return path.join(rootDir, 'packages', packageDir, 'package.json')
}

export function readPackageManifest(rootDir, packageDir) {
  const manifestPath = getPackageManifestPath(rootDir, packageDir)

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Package manifest '${path.relative(rootDir, manifestPath)}' does not exist.`)
  }

  return {
    manifestPath,
    packageJson: JSON.parse(fs.readFileSync(manifestPath, 'utf-8')),
  }
}

export function resolveRelease(rootDir, tag) {
  const parsed = parseReleaseTag(tag)
  const { manifestPath, packageJson } = readPackageManifest(rootDir, parsed.packageDir)

  if (packageJson.version !== parsed.version) {
    throw new Error(`Tag version '${parsed.version}' does not match ${path.relative(rootDir, manifestPath)} version '${packageJson.version}'.`)
  }

  return {
    ...parsed,
    name: packageJson.name,
    prerelease: isPrereleaseVersion(parsed.version),
    manifestPath,
  }
}
