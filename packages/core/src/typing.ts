import type { Config } from 'svgo'

export type SvgoConfig = Omit<Config, 'path'>
export type InjectMode = 'body-first' | 'body-last'

export interface Options {
  /**
   * # icons store directories
   * all svg files in these  will be converted to svg sprite.
   *
   */
  iconDirs: string[]
  /**
   * icon name format
   * default: icon-[dir]-[name]
   */
  symbolId?: string
  /**
   * SVGO configuration, used to optimize svg
   * default：{}
   */
  svgoOptions?: SvgoConfig
  /**
   * icon format
   * default: 'body-last'
   */
  inject?: InjectMode

  /**
   * custom dom id
   * default: '__svg__icons__dom__'
   */
  customDomId?: string
}

export interface FileStats {
  /**
   * file relative name
   */
  relativeName: string
  /**
   * modified time(ms)
   */
  mtimeMs?: number
  /**
   * file content
   */
  code: string
  /**
   * symbol id
   */
  symbolId?: string
}
