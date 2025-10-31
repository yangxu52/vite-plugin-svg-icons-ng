import { describe, expect, test } from 'vitest'
import { generateSymbolId } from '../src/core'

describe('Test GenerateSymbolId', () => {
  describe('icon-[dir]-[name]', () => {
    const options = { symbolId: 'icon-[dir]-[name]' } as never
    test('single level', () => {
      const id = generateSymbolId('file.svg', options)
      const specialId = generateSymbolId('folder_dir-file.svg', options)

      expect(id).toBe('icon-file')
      expect(specialId).toBe('icon-folder_dir-file')
    })
    test('second level', () => {
      const id = generateSymbolId('dir/file.svg', options)
      const specialId = generateSymbolId('dir/folder_dir-file.svg', options)

      expect(id).toBe('icon-dir-file')
      expect(specialId).toBe('icon-dir-folder_dir-file')
    })

    test('multi level', () => {
      const id = generateSymbolId('folder/dir/file.svg', options)
      const specialId = generateSymbolId('folder/dir/folder_dir-file.svg', options)

      expect(id).toBe('icon-folder-dir-file')
      expect(specialId).toBe('icon-folder-dir-folder_dir-file')
    })
  })

  describe('icon-[name]', () => {
    const options = { symbolId: 'icon-[name]' } as never
    test('single level', () => {
      const id = generateSymbolId('file.svg', options)
      const specialId = generateSymbolId('folder/dir/folder_dir-file.svg', options)

      expect(id).toBe('icon-file')
      expect(specialId).toBe('icon-folder_dir-file')
    })
    test('second level', () => {
      const id = generateSymbolId('dir/file.svg', options)
      const specialId = generateSymbolId('folder/dir/folder_dir-file.svg', options)

      expect(id).toBe('icon-file')
      expect(specialId).toBe('icon-folder_dir-file')
    })

    test('multi level', () => {
      const id = generateSymbolId('folder/dir/file.svg', options)
      const specialId = generateSymbolId('folder/dir/folder_dir-file.svg', options)

      expect(id).toBe('icon-file')
      expect(specialId).toBe('icon-folder_dir-file')
    })
  })
})
