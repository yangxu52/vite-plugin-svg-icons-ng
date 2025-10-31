import type { Config } from 'svgo'

export type SvgoConfig = Omit<Config, 'path'> | false
export type InjectMode = 'body-first' | 'body-last'
export type StrokeOverrideConfig = boolean | { color: string }

export interface Options {
  /**
   * icons store directories
   * all svg files in these  will be converted to svg sprite.
   */
  iconDirs: string[]
  /**
   * icon name format
   * @default: icon-[dir]-[name]
   */
  symbolId?: string
  /**
   * SVGO configuration, used to optimize svg
   * @default：{}
   */
  svgoOptions?: SvgoConfig
  /**
   * icon format
   * @default: 'body-last'
   */
  inject?: InjectMode

  /**
   * custom dom id
   * @default: '__svg__icons__dom__'
   */
  customDomId?: string
  /**
   * override `stroke` attribute
   * `false` to disable, `true` to override as `currentColor`, or an object `{ color: '#fff' }`
   * @default: false
   */
  strokeOverride?: StrokeOverrideConfig
}

export type SymbolEntry = {
  symbolId: string
  symbol: string
}

export interface CacheEntry {
  mtimeMs?: number
  entry: SymbolEntry
}
