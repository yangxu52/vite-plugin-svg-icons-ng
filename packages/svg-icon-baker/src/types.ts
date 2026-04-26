import type { Config, Output, PluginConfig } from 'svgo'

export type SvgoPlugins = PluginConfig[]
export type SvgoOutput = Output

export type BakeSource = {
  name: string
  content: string
}

export type BakeIssueCode = 'ResolveReferenceFailed' | 'DetectDefinitionDuplicate' | 'DetectReferenceCarrierUnsupported' | 'ParseStyleFailed'

export type BakeIssue = {
  code: BakeIssueCode
  message: string
  targetId?: string
}

export type BakeErrorCode =
  | 'ValidateSourceInvalid'
  | 'ValidateNameInvalid'
  | 'ValidateSvgRootInvalid'
  | 'ParseSvgFailed'
  | 'OptimizeSvgFailed'
  | 'ResolveViewBoxFailed'

export class BakeError extends Error {
  readonly code: BakeErrorCode
  override readonly cause?: unknown

  constructor(code: BakeErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'BakeError'
    this.code = code
    this.cause = options?.cause
  }
}

export type IdPolicyOptions = {
  rewrite?: boolean
  unresolved?: 'prefix' | 'preserve'
  idStyle?: 'named' | 'minified' | 'hashed'
  delim?: '-' | '_'
}

export type BakeResult = {
  name: string
  content: string
  issues: BakeIssue[]
}

export type SvgoOptions = Pick<Config, 'multipass' | 'floatPrecision' | 'js2svg' | 'plugins'>

export type Options = {
  /**
   * enable/disable default safe optimization preset
   * @default true
   */
  optimize?: boolean
  /**
   * custom svgo options merged into optimizer
   */
  svgoOptions?: SvgoOptions
  /**
   * sprite-safe local id rewriting
   * @default { rewrite: true, unresolved: 'prefix', idStyle: 'named', delim: '_' }
   */
  idPolicy?: IdPolicyOptions
}

export type ResolvedIdPolicyOptions = {
  rewrite: boolean
  unresolved: 'prefix' | 'preserve'
  idStyle: 'named' | 'minified' | 'hashed'
  delim: '-' | '_'
}

export type ResolvedOptions = {
  optimize: boolean
  svgoOptions: SvgoOptions
  idPolicy: ResolvedIdPolicyOptions
}
