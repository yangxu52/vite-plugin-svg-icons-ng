import { __TEST__ } from '../src'
import { describe, expect, test } from 'vitest'

describe('discreteDir test', () => {
  test('discreteDir Not included /', () => {
    const { fileName, dirName } = __TEST__.discreteDir('file.svg')

    expect(fileName).toBe('file.svg')
    expect(dirName).toBe('')
  })

  test('discreteDir Not included / and include .', () => {
    const { fileName, dirName } = __TEST__.discreteDir('file.name.svg')

    expect(fileName).toBe('file.name.svg')
    expect(dirName).toBe('')
  })

  test('discreteDir Included /', () => {
    const { fileName, dirName } = __TEST__.discreteDir('dir/file.svg')

    expect(fileName).toBe('file.svg')
    expect(dirName).toBe('dir')
  })

  test('discreteDir Included multiple /', () => {
    const { fileName, dirName } = __TEST__.discreteDir('folder/dir/file.svg')

    expect(fileName).toBe('file.svg')
    expect(dirName).toBe('folder-dir')
  })
})
