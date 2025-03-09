import { __TEST__ } from '../src'
import { expect, test } from 'vitest'

const TEST_SYMBOL_ID = 'icon-[dir]-[name]'
// const TEST_SYMBOL_ID = 'icon-[name]';
test('createSymbolId test', () => {
  const options = { symbolId: TEST_SYMBOL_ID } as any

  const normalId = __TEST__.createSymbolId('file.svg', options)
  const dirId = __TEST__.createSymbolId('dir/file.svg', options)
  const folderId = __TEST__.createSymbolId('folder/dir/file.svg', options)
  const specialId = __TEST__.createSymbolId('folder/dir/.file.svg', options)

  expect(normalId).toBe('icon-file')
  expect(dirId).toBe('icon-dir-file')
  expect(folderId).toBe('icon-folder-dir-file')
  expect(specialId).toBe('icon-folder-dir-.file')
})

test('createSymbolId Not dir', () => {
  const id = __TEST__.createSymbolId('dir/file.svg', { symbolId: 'icon-[name]' } as any)

  expect(id).toBe('icon-dir/file')
})
