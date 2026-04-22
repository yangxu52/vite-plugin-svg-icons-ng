#!/usr/bin/env node

/* eslint-disable */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync, execSync } from 'node:child_process'

import { formatReleaseTag, getMainPackageDir, getPrereleaseTagPrefix, readPackageManifest } from './release-contract.mjs'

const DEFAULT_PKG = getMainPackageDir()
const VALID_BUMP_TYPES = ['patch', 'minor', 'major', 'keep']
const VALID_PRERELEASE_TAGS = ['rc', 'beta', 'alpha']

const args = process.argv.slice(2)
const bumpType = args[0]

if (!VALID_BUMP_TYPES.includes(bumpType)) {
  console.error('❌ Usage: pnpm release [patch|minor|major|keep] [--tag rc|beta|alpha] [--pkg packageDir]')
  process.exit(1)
}

let prereleaseTag = null
const prereleaseTagIndex = args.indexOf('--tag')
if (prereleaseTagIndex !== -1) {
  prereleaseTag = args[prereleaseTagIndex + 1]
}

if (bumpType === 'keep' && !prereleaseTag) {
  console.error("❌ 'keep' requires --tag rc|beta|alpha")
  process.exit(1)
}

if (prereleaseTag && !VALID_PRERELEASE_TAGS.includes(prereleaseTag)) {
  console.error('❌ tag must be rc | beta | alpha')
  process.exit(1)
}

let pkgName = DEFAULT_PKG
const pkgIndex = args.indexOf('--pkg')
if (pkgIndex !== -1) {
  pkgName = args[pkgIndex + 1]
}

const root = process.cwd()
const { manifestPath: pkgPath, packageJson: pkg } = readPackageManifest(root, pkgName)
const pkgDir = path.dirname(pkgPath)
const oldVersion = pkg.version

function parseVersion(version) {
  const [main] = version.split('-')
  const [major, minor, patch] = main.split('.').map(Number)
  return { major, minor, patch }
}

function bumpVersion({ major, minor, patch }) {
  if (bumpType === 'patch') patch++
  if (bumpType === 'minor') {
    minor++
    patch = 0
  }
  if (bumpType === 'major') {
    major++
    minor = 0
    patch = 0
  }
  return `${major}.${minor}.${patch}`
}

function getNextPrereleaseNumber(prefix, initialValue) {
  try {
    const existing = execSync('git tag', { encoding: 'utf-8' })
      .split('\n')
      .filter((tag) => tag.startsWith(prefix))

    if (existing.length === 0) {
      return initialValue
    }

    const nums = existing.map((tag) => Number(tag.split('.').pop())).filter((value) => Number.isInteger(value))

    if (nums.length === 0) {
      return initialValue
    }

    return Math.max(...nums) + 1
  } catch {
    return initialValue
  }
}

let newVersion

if (bumpType === 'keep') {
  const baseVersion = oldVersion.split('-')[0]
  const prefix = getPrereleaseTagPrefix(pkgName, baseVersion, prereleaseTag)
  const preNumber = getNextPrereleaseNumber(prefix, 1)
  newVersion = `${baseVersion}-${prereleaseTag}.${preNumber}`
} else {
  const bumpedVersion = bumpVersion(parseVersion(oldVersion))

  if (!prereleaseTag) {
    newVersion = bumpedVersion
  } else {
    const prefix = getPrereleaseTagPrefix(pkgName, bumpedVersion, prereleaseTag)
    const preNumber = getNextPrereleaseNumber(prefix, 0)
    newVersion = `${bumpedVersion}-${prereleaseTag}.${preNumber}`
  }
}

pkg.version = newVersion
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

console.log(`📦 Bumped version: ${oldVersion} → ${newVersion}`)

const changelogPath = path.join(pkgDir, 'CHANGELOG.md')

process.chdir(pkgDir)
console.log(`📝 Generating changelog from commits under: packages/${pkgName}`)
execSync(`conventional-changelog -i "${changelogPath}" -s`, { stdio: 'inherit' })
process.chdir(root)

try {
  execSync(`prettier --write "${changelogPath}"`, { stdio: 'inherit' })
  console.log('✨ CHANGELOG formatted by Prettier')
} catch {
  console.warn('⚠️ Prettier not installed, skipping format.')
}

const releaseTag = formatReleaseTag(pkgName, newVersion)
const commitMessage = `chore(release): ${releaseTag}`

try {
  execFileSync('git', ['add', pkgPath, changelogPath], { stdio: 'inherit' })
  execFileSync('git', ['commit', '-m', commitMessage], { stdio: 'inherit' })
  execFileSync('git', ['tag', releaseTag], { stdio: 'inherit' })
  console.log(`🏷️ Created tag: ${releaseTag}`)
} catch {
  console.warn('⚠️ Git commit/tag failed.')
}

console.log('\n🎉 Release preparation finished!')
