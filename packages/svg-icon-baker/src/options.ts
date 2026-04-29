import type { Config, PluginConfig } from 'svgo'
import type { IdPolicyOptions, Options, ResolvedIdPolicyOptions, ResolvedOptions, SvgoPlugins } from './types.ts'

const PRESET_OVERRIDE_BLOCKED_PLUGINS = [
  'cleanupIds',
  'removeUselessDefs',
  'removeHiddenElems',
  'removeUnknownsAndDefaults',
  'collapseGroups',
  'mergePaths',
  'convertShapeToPath',
  'removeEmptyContainers',
] as const

const FILTER_ONLY_BLOCKED_PLUGINS = ['prefixIds', 'reusePaths', 'convertOneStopGradients'] as const

const USER_FILTER_BLOCKED_PLUGINS = ['preset-default', ...PRESET_OVERRIDE_BLOCKED_PLUGINS, ...FILTER_ONLY_BLOCKED_PLUGINS] as const

const DEFAULT_SAFE_PRESET: PluginConfig = {
  name: 'preset-default',
  params: {
    overrides: Object.fromEntries(PRESET_OVERRIDE_BLOCKED_PLUGINS.map((name) => [name, false])),
  },
}

const DEFAULT_SAFE_PLUGINS: SvgoPlugins = [{ name: 'removeTitle' }, { name: 'removeXMLNS' }, { name: 'removeXlink' }]

export function resolveOptions(userOption?: Options): ResolvedOptions {
  const userObject = userOption ?? {}
  return {
    optimize: userObject.optimize ?? true,
    svgoOptions: userObject.svgoOptions ?? {},
    idPolicy: resolveIdPolicyOptions(userObject.idPolicy),
  }
}

export function createSvgoConfig(options: ResolvedOptions): Config {
  const plugins: SvgoPlugins = []
  if (options.optimize) {
    plugins.push(DEFAULT_SAFE_PRESET)
    plugins.push(...DEFAULT_SAFE_PLUGINS)
  }
  if (options.svgoOptions.plugins != null) {
    plugins.push(...filterPlugins(options.svgoOptions.plugins))
  }

  return {
    multipass: options.svgoOptions.multipass,
    floatPrecision: options.svgoOptions.floatPrecision,
    js2svg: options.svgoOptions.js2svg,
    plugins,
  }
}

function filterPlugins(plugins: SvgoPlugins): SvgoPlugins {
  return plugins.filter((plugin) => {
    const name = resolvePluginName(plugin)
    if (name == null) {
      return true
    }
    return !USER_FILTER_BLOCKED_PLUGINS.includes(name as (typeof USER_FILTER_BLOCKED_PLUGINS)[number])
  })
}

function resolvePluginName(plugin: PluginConfig): string | null {
  if (typeof plugin === 'string') {
    return plugin
  }
  if (plugin && typeof plugin === 'object' && 'name' in plugin && typeof plugin.name === 'string') {
    return plugin.name
  }
  return null
}

function resolveIdPolicyOptions(idPolicy: IdPolicyOptions | undefined): ResolvedIdPolicyOptions {
  return {
    rewrite: idPolicy?.rewrite ?? true,
    unresolved: idPolicy?.unresolved ?? 'prefix',
    idStyle: idPolicy?.idStyle ?? 'named',
    delim: idPolicy?.delim ?? '_',
  }
}
