import type { Options as BakerOptions } from 'svg-icon-baker'

export type InjectMode = 'body-first' | 'body-last'
export type StrokeOverride = boolean | string
export type ResolvedStrokeOverride = false | string

export type Options = {
  /**
   * icons store directories
   * all svg files in these  will be converted to svg sprite.
   * @requires true
   */
  iconDirs: string[]
  /**
   * icon name format
   * @default icon-[dir]-[name]
   */
  symbolId?: string
  /**
   * icon format
   * @default 'body-last'
   */
  inject?: InjectMode

  /**
   * custom dom id
   * @default '__svg__icons__dom__'
   */
  customDomId?: string
  /**
   * override `stroke` attribute
   * `false` to disable, `true` to override as `currentColor`, or an object `{ color: '#fff' }`
   * @default false
   */
  strokeOverride?: StrokeOverride
  /**
   * throw on invalid svg transform error.
   * when false, print warning and skip the broken icon.
   * @default: false
   */
  failOnError?: boolean
  /**
   * **Advanced options**
   *
   * Directly customize the underlying svg-icon-baker bundle.
   * see [svg-icon-baker](https://www.npmjs.com/package/svg-icon-baker) for more details
   * @default {}
   */
  bakerOptions?: BakerOptions
}

export type ResolvedOptions = Required<Omit<Options, 'strokeOverride'>> & { strokeOverride: ResolvedStrokeOverride }

export type IconFile = {
  file: string
  iconDir: string
  relativePath: string
}

export type IconSource = IconFile & {
  code: string
  hash: string
}

export type CompiledIcon = {
  file: string
  id: string
  symbol: string
  hash: string
}

export type IconCacheEntry = {
  hash: string
  icon: CompiledIcon
}

export type IconCache = {
  get(path: string, hash: string): CompiledIcon | null
  set(path: string, entry: IconCacheEntry): void
  invalidate(path: string): void
}

export type IconCompiler = {
  getResult(): Promise<CompileResult>
  invalidate(file?: string): void
  isIconFile(file: string): boolean
}

export type PluginContext = {
  options: ResolvedOptions
  cache: IconCache
  compiler: IconCompiler
}

export type CompilerContext = Pick<PluginContext, 'options' | 'cache'>

export type CompileResult = {
  symbols: string[]
  ids: string[]
  sprite: string
  iconsByFile: Map<string, CompiledIcon>
}

export type CompilerState = {
  dirty: boolean
  result: CompileResult | null
}

export type VirtualModuleType = 'register' | 'ids' | 'sprite'

export type VirtualModuleRenderContext = {
  isBuild: boolean
  ssr: boolean
}
