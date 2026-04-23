import type { Config, Output, PluginConfig } from 'svgo'

export type SvgoPlugins = PluginConfig[]
export type SvgoOutput = Output

export type BakeSource = {
  name: string
  content: string
}

export type BakeResult = {
  name: string
  content: string
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
}

export type ResolvedOptions = {
  optimize: boolean
  svgoOptions: SvgoOptions
}
