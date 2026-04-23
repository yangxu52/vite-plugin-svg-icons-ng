import type { Config, PluginConfig } from 'svgo'
import type { Options, ResolvedOptions, SvgoPlugins } from './types.ts'

const DEFAULT_SAFE_PRESET: PluginConfig = {
  name: 'preset-default',
  params: {
    overrides: {
      removeUselessDefs: false,
      removeHiddenElems: false,
      removeUnknownsAndDefaults: false,
      collapseGroups: false,
      mergePaths: false,
      convertShapeToPath: false,
    },
  },
}

const DEFAULT_SAFE_PLUGINS: SvgoPlugins = [{ name: 'removeTitle' }, { name: 'removeXMLNS' }, { name: 'removeXlink' }]

const CORE_PLUGIN_BLOCKLIST = new Set(['prefixIds'])

export function resolveOptions(userOption?: Options): ResolvedOptions {
  const userObject = userOption ?? {}
  return {
    optimize: userObject.optimize ?? true,
    svgoOptions: userObject.svgoOptions ?? {},
  }
}

export function createSvgoConfig(sourceName: string, options: ResolvedOptions): Config {
  const plugins: SvgoPlugins = []
  if (options.optimize) {
    plugins.push(DEFAULT_SAFE_PRESET)
    plugins.push(...DEFAULT_SAFE_PLUGINS)
  }
  if (options.svgoOptions.plugins != null) {
    plugins.push(...filterPlugins(options.svgoOptions.plugins))
  }
  plugins.push(...createCorePlugins(sourceName))

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
    return !CORE_PLUGIN_BLOCKLIST.has(name)
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

function createCorePlugins(sourceName: string): SvgoPlugins {
  return [{ name: 'removeDimensions' }, { name: 'prefixIds', params: { prefix: `${sourceName}-`, delim: '' } }]
}
