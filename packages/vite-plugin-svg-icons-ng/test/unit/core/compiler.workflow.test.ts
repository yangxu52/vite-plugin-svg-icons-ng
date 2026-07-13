import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, expect, test } from 'vitest'
import { createMemoryCache } from '../../../src/cache/memoryCache'
import { createCompiler } from '../../../src/core/compiler'
import type { CompilerContext } from '../../../src/types'

const tempRoots = new Set<string>()

afterEach(async () => {
  await Promise.all(Array.from(tempRoots, async (root) => await rm(root, { recursive: true, force: true })))
  tempRoots.clear()
})

test('compiles scanned icons from disk and rebuilds after invalidation', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'vite-plugin-svg-icons-ng-compiler-'))
  tempRoots.add(root)
  const iconDir = path.join(root, 'icons')
  const iconFile = path.join(iconDir, 'home.svg')
  await mkdir(iconDir, { recursive: true })
  await writeFile(iconFile, '<svg viewBox="0 0 24 24"><path fill="#f00" d="M0 0h24v24H0z" /></svg>', 'utf8')

  const compiler = createCompiler(createCompilerContext(iconDir))
  const first = await compiler.getResult()

  expect(first.ids).toEqual(['icon-home'])
  expect(first.symbols[0]).toContain('id="icon-home"')
  expect(await compiler.getResult()).toBe(first)

  await writeFile(iconFile, '<svg viewBox="0 0 24 24"><path fill="#0f0" d="M0 0h24v24H0z" /></svg>', 'utf8')
  compiler.invalidate(iconFile)
  const second = await compiler.getResult()

  expect(second).not.toBe(first)
  expect(second.ids).toEqual(['icon-home'])
  expect(second.sprite).not.toBe(first.sprite)
})

function createCompilerContext(iconDir: string): CompilerContext {
  return {
    cache: createMemoryCache(),
    options: {
      iconDirs: [iconDir],
      symbolId: 'icon-[name]',
      inject: 'body-last',
      htmlMode: 'inline',
      customDomId: '__svg__icons__dom__',
      strokeOverride: false,
      failOnError: true,
      bakerOptions: {},
    },
  }
}
