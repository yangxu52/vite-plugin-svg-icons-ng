import { describe, expect, test } from 'vitest'
import { splitPath } from '../utils'

describe('Test ParseDirName', () => {
  describe('singe level', () => {
    test('normal name', () => {
      const { dir, name } = splitPath('file.svg')

      expect(dir).toBe('')
      expect(name).toBe('file')
    })

    test('special name', () => {
      const { dir, name } = splitPath('folder_dir-file.svg')

      expect(dir).toBe('')
      expect(name).toBe('folder_dir-file')
    })
  })
  describe('second level', () => {
    test('normal name', () => {
      const { dir, name } = splitPath('dir/file.svg')

      expect(dir).toBe('dir')
      expect(name).toBe('file')
    })

    test('special name', () => {
      const { dir, name } = splitPath('dir/folder_dir-file.svg')

      expect(dir).toBe('dir')
      expect(name).toBe('folder_dir-file')
    })
  })
  describe('multi level', () => {
    test('normal name', () => {
      const { dir, name } = splitPath('folder/dir/file.svg')

      expect(dir).toBe('folder-dir')
      expect(name).toBe('file')
    })

    test('special name', () => {
      const { dir, name } = splitPath('folder/dir/folder_dir-file.svg')

      expect(dir).toBe('folder-dir')
      expect(name).toBe('folder_dir-file')
    })
  })
})
