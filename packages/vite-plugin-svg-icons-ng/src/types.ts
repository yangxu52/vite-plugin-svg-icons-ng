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
  /**
   * throw on invalid svg transform error.
   * when false, print warning and skip the broken icon.
   * @default: false
   */
  failOnError?: boolean
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

export type IconCache = {
  get(path: string, mtimeMs?: number): SymbolData | null
  set(path: string, entry: SymbolCache): void
  invalidate(path: string): void
}

export type IconCompiler = {
  getResult(): Promise<BuildResult>
  invalidate(file?: string): void
  isIconFile(file: string): boolean
}

export type PluginContext = {
  cache: IconCache
  options: ResolvedOptions
  compiler: IconCompiler
}

export type BuildContext = Pick<PluginContext, 'options' | 'cache'>

export type BuildResult = {
  symbols: string[]
  ids: string[]
}

export type VirtualModuleType = 'register' | 'ids' | 'sprite'

export type VirtualModuleRenderContext = {
  isBuild: boolean
  ssr: boolean
}
