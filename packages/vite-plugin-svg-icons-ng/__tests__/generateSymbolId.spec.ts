import { __TEST__ } from '../src'
import { describe, expect, test } from 'vitest'

describe('Test GenerateSymbolId', () => {
  describe('icon-[dir]-[name]', () => {
    const options = { symbolId: 'icon-[dir]-[name]' } as any
    test('single level', () => {
      const id = __TEST__.generateSymbolId('file.svg', options)
      const specialId = __TEST__.generateSymbolId('folder_dir-file.svg', options)

      expect(id).toBe('icon-file')
      expect(specialId).toBe('icon-folder_dir-file')
    })
    test('second level', () => {
      const id = __TEST__.generateSymbolId('dir/file.svg', options)
      const specialId = __TEST__.generateSymbolId('dir/folder_dir-file.svg', options)

      expect(id).toBe('icon-dir-file')
      expect(specialId).toBe('icon-dir-folder_dir-file')
    })

    test('multi level', () => {
      const id = __TEST__.generateSymbolId('folder/dir/file.svg', options)
      const specialId = __TEST__.generateSymbolId('folder/dir/folder_dir-file.svg', options)

      expect(id).toBe('icon-folder-dir-file')
      expect(specialId).toBe('icon-folder-dir-folder_dir-file')
    })
  })

  describe('icon-[name]', () => {
    const options = { symbolId: 'icon-[name]' } as any
    test('single level', () => {
      const id = __TEST__.generateSymbolId('file.svg', options)
      const specialId = __TEST__.generateSymbolId('folder/dir/folder_dir-file.svg', options)

      expect(id).toBe('icon-file')
      expect(specialId).toBe('icon-folder_dir-file')
    })
    test('second level', () => {
      const id = __TEST__.generateSymbolId('dir/file.svg', options)
      const specialId = __TEST__.generateSymbolId('folder/dir/folder_dir-file.svg', options)

      expect(id).toBe('icon-file')
      expect(specialId).toBe('icon-folder_dir-file')
    })

    test('multi level', () => {
      const id = __TEST__.generateSymbolId('folder/dir/file.svg', options)
      const specialId = __TEST__.generateSymbolId('folder/dir/folder_dir-file.svg', options)

      expect(id).toBe('icon-file')
      expect(specialId).toBe('icon-folder_dir-file')
    })
  })
})
