import { glob } from 'tinyglobby'
import { normalizePath } from 'vite'
import type { IconFile } from '../types'

export async function scanIconDirs(iconDirs: string[]): Promise<IconFile[]> {
  const groups = await Promise.all(
    iconDirs.map(async (iconDir) => {
      const files = await glob('**/*.svg', {
        cwd: iconDir,
        absolute: true,
        onlyFiles: true,
      })
      return files
        .map((file) => {
          const normalizedFile = normalizePath(file)
          const normalizedDir = normalizePath(iconDir)
          const relativePath = normalizedFile.replace(normalizedDir.endsWith('/') ? normalizedDir : `${normalizedDir}/`, '')
          return {
            file,
            iconDir,
            relativePath,
          } satisfies IconFile
        })
        .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
    })
  )
  return groups.flat()
}
