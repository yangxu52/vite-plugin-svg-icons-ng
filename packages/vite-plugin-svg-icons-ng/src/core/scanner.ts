import type { Entry } from 'fast-glob'
import fg from 'fast-glob'

export type ScannedIconDir = {
  dir: string
  entries: Entry[]
}

export async function scanIconDirs(iconDirs: string[]): Promise<ScannedIconDir[]> {
  const dirPromises = iconDirs.map(async (dir) => {
    const entries = await fg.glob('**/*.svg', { cwd: dir, stats: true, absolute: true })
    return { dir, entries }
  })
  return await Promise.all(dirPromises)
}
