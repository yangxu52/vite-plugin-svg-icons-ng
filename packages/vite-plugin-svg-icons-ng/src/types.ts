import type { Options as BakerOptions } from 'svg-icon-baker'

export type InjectMode = 'body-first' | 'body-last'
export type StrokeOverride = boolean | string
export type ResolvedStrokeOverride = false | string

export type Options = {
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
  strokeOverride?: StrokeOverride
  /**
   * optimize Options, base on SVGO
   * @default：true
   */
  optimize?: BakerOptions
}

export type ResolvedOptions = Required<Omit<Options, 'strokeOverride'>> & { strokeOverride: ResolvedStrokeOverride }

export type SymbolData = {
  id: string
  content: string
}

export type SymbolCache = {
  mtimeMs?: number
  symbol: SymbolData
}

export type PluginContext = {
  cache: Map<string, SymbolCache>
  options: ResolvedOptions
}

export type CompileContext = Pick<PluginContext, 'options' | 'cache'>

export type CompileResult = {
  symbols: string[]
  ids: string[]
}
