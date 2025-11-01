import { describe, expect, test } from 'vitest'
import { parseDirName } from '../core'

describe('Test ParseDirName', () => {
  describe('singe level', () => {
    test('normal name', () => {
      const { baseName, dirName } = parseDirName('file.svg')

      expect(baseName).toBe('file')
      expect(dirName).toBe('')
    })

    test('special name', () => {
      const { baseName, dirName } = parseDirName('folder_dir-file.svg')

      expect(baseName).toBe('folder_dir-file')
      expect(dirName).toBe('')
    })
  })
  describe('second level', () => {
    test('normal name', () => {
      const { baseName, dirName } = parseDirName('dir/file.svg')

      expect(baseName).toBe('file')
      expect(dirName).toBe('dir')
    })

    test('special name', () => {
      const { baseName, dirName } = parseDirName('dir/folder_dir-file.svg')

      expect(baseName).toBe('folder_dir-file')
      expect(dirName).toBe('dir')
    })
  })
  describe('multi level', () => {
    test('normal name', () => {
      const { baseName, dirName } = parseDirName('folder/dir/file.svg')

      expect(baseName).toBe('file')
      expect(dirName).toBe('folder-dir')
    })

    test('special name', () => {
      const { baseName, dirName } = parseDirName('folder/dir/folder_dir-file.svg')

      expect(baseName).toBe('folder_dir-file')
      expect(dirName).toBe('folder-dir')
    })
  })
})
