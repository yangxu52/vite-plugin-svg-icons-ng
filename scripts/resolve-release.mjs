#!/usr/bin/env node

import fs from 'node:fs'

import { resolveRelease } from './release-contract.mjs'

function getArgValue(flag) {
  const args = process.argv.slice(2)
  const index = args.indexOf(flag)
  return index === -1 ? null : (args[index + 1] ?? null)
}

function appendGithubOutput(key, value) {
  const outputPath = process.env.GITHUB_OUTPUT
  if (!outputPath) return
  fs.appendFileSync(outputPath, `${key}=${value}\n`)
}

const tag = getArgValue('--tag') ?? process.env.GITHUB_REF_NAME

if (!tag) {
  console.error('Release tag is required. Usage: node scripts/resolve-release.mjs --tag <tag>')
  process.exit(1)
}

try {
  const release = resolveRelease(process.cwd(), tag)

  appendGithubOutput('dir', release.packageDir)
  appendGithubOutput('name', release.name)
  appendGithubOutput('version', release.version)
  appendGithubOutput('prerelease', String(release.prerelease))

  console.log(
    JSON.stringify(
      {
        dir: release.packageDir,
        name: release.name,
        version: release.version,
        prerelease: release.prerelease,
      },
      null,
      2
    )
  )
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exit(1)
}
