import type { PluginContext } from '../types'
import { renderVirtualModule, resolveVirtualTypeFromId } from './virtual'

type LoadOptionsLike = { ssr?: boolean | undefined } | boolean | undefined

export function resolveVirtualId(id: string): string | null {
  if (!resolveVirtualTypeFromId(id)) {
    return null
  }
  return id.startsWith('\0') ? id : '\0' + id
}

function parseSsr(loadOptions: LoadOptionsLike): boolean {
  if (typeof loadOptions === 'boolean') {
    return loadOptions
  }
  if (!loadOptions || typeof loadOptions !== 'object') {
    return false
  }
  return !!loadOptions.ssr
}

export async function loadVirtualModuleById(ctx: PluginContext, id: string, isBuild: boolean, loadOptions?: LoadOptionsLike): Promise<string | null> {
  const moduleType = resolveVirtualTypeFromId(id)
  if (!moduleType) {
    return null
  }
  const ssr = parseSsr(loadOptions)
  return await renderVirtualModule(ctx, moduleType, {
    isBuild,
    ssr,
  })
}
