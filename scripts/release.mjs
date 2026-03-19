#!/usr/bin/env node

/* eslint-disable */
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const DEFAULT_PKG = 'vite-plugin-svg-icons-ng'

// ------------------------------
// 1. Parse CLI Args
// ------------------------------
const args = process.argv.slice(2)
const bumpType = args[0] // patch | minor | major | keep

if (!['patch', 'minor', 'major', 'keep'].includes(bumpType)) {
  console.error('❌ Usage: pnpm release [patch|minor|major|keep] [--tag rc|beta|alpha] [--pkg pkgName]')
  process.exit(1)
}

// Get --tag rc|beta|alpha
let tag = null
const tagIndex = args.indexOf('--tag')
if (tagIndex !== -1) {
  tag = args[tagIndex + 1]
}

// --- tag is required in keep mode ---
if (bumpType === 'keep' && !tag) {
  console.error("❌ 'pre' requires --tag rc|beta|alpha")
  process.exit(1)
}

if (tag && !['rc', 'beta', 'alpha'].includes(tag)) {
  console.error('❌ tag must be rc | beta | alpha')
  process.exit(1)
}

// --pkg or fallback to default package
let pkgName = DEFAULT_PKG
const pkgIndex = args.indexOf('--pkg')
if (pkgIndex !== -1) {
  pkgName = args[pkgIndex + 1]
}

// ------------------------------
// 2. Load package.json
// ------------------------------
const root = process.cwd()
const pkgDir = path.join(root, 'packages', pkgName)
const pkgPath = path.join(pkgDir, 'package.json')

if (!fs.existsSync(pkgPath)) {
  console.error(`❌ package.json not found: ${pkgPath}`)
  process.exit(1)
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
const oldVersion = pkg.version

// ------------------------------
// 3. Bump version  logic
// ------------------------------
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

let newVersion

// Handle pre-release tag
if (bumpType === 'keep') {
  // keep main version
  const base = oldVersion.split('-')[0]
  // find history tag
  let preNumber = 1
  try {
    const existing = execSync('git tag', { encoding: 'utf-8' })
      .split('\n')
      .filter((t) => t.startsWith(`v${base}-${tag}.`))

    if (existing.length > 0) {
      const nums = existing.map((t) => Number(t.split('.').pop()))
      preNumber = Math.max(...nums) + 1
    }
  } catch {}

  newVersion = `${base}-${tag}.${preNumber}`
} else {
  // 原逻辑：patch/minor/major
  let bumped = bumpVersion(parseVersion(oldVersion))

  if (!tag) {
    newVersion = bumped
  } else {
    let preNumber = 0
    try {
      const tags = execSync('git tag', { encoding: 'utf-8' })
        .split('\n')
        .filter((t) => t.startsWith(`v${bumped}-${tag}.`))

      if (tags.length > 0) {
        const nums = tags.map((t) => Number(t.split('.').pop()))
        preNumber = Math.max(...nums) + 1
      }
    } catch {}

    newVersion = `${bumped}-${tag}.${preNumber}`
  }
}

// ------------------------------
// 4. Write package.json
// ------------------------------
pkg.version = newVersion
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

console.log(`📦 Bumped version: ${oldVersion} → ${newVersion}`)

// ------------------------------
// 5. Generate CHANGELOG
// ------------------------------
const changelogPath = path.join(root, 'CHANGELOG.md')

process.chdir(pkgDir)
console.log(`📝 Generating changelog from commits under: packages/${pkgName}`)
execSync(`conventional-changelog -i "${changelogPath}" -s`, { stdio: 'inherit' })
process.chdir(root)

// Format changelog with Prettier
try {
  execSync(`prettier --write "${changelogPath}"`, { stdio: 'inherit' })
  console.log('✨ CHANGELOG formatted by Prettier')
} catch {
  console.warn('⚠️ Prettier not installed, skipping format.')
}

// ------------------------------
// 6. Git commit & tag
// ------------------------------
try {
  execSync(`git add ${pkgPath} ${changelogPath}`, { stdio: 'inherit' })
  execSync(`git commit -m "chore: release v${newVersion}"`, { stdio: 'inherit' })
  execSync(`git tag v${newVersion}`, { stdio: 'inherit' })
  console.log(`🏷️ Created tag: v${newVersion}`)
} catch {
  console.warn('⚠️ Git commit/tag failed.')
}

console.log('\n🎉 Release finished!')
