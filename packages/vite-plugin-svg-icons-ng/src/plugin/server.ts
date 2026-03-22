import { normalizePath } from 'vite'
import type { PluginContext } from '../types'
import { getWeakETag } from '../utils/hash'
import { renderVirtualModule, resolveVirtualTypeFromUrl } from './virtual'
import type { HmrContext, ViteDevServer } from 'vite'

type RequestLike = { url?: string }
type ResponseLike = {
  setHeader: (name: string, value: string) => void
  statusCode: number
  end: (content: string) => void
}
type MiddlewareUse = (handler: (req: RequestLike, res: ResponseLike, next: () => void) => Promise<void>) => void

export function setupServerMiddleware(ctx: PluginContext, use: MiddlewareUse): void {
  // TODO: use route-based handler when available.
  use(async (req, res, next) => {
    const url = normalizePath(req.url!)
    const moduleType = resolveVirtualTypeFromUrl(url)
    if (moduleType) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Content-Type', 'application/javascript')
      res.setHeader('Cache-Control', 'no-cache')
      const content = await renderVirtualModule(ctx, moduleType, { isBuild: false, ssr: false })
      res.setHeader('Etag', getWeakETag(content))
      res.statusCode = 200
      res.end(content)
    } else {
      next()
    }
  })
}

export function pluginConfigureServer(ctx: PluginContext, server: ViteDevServer): void {
  for (const dir of ctx.options.iconDirs) {
    server.watcher.add(dir)
  }
}

export function pluginHandleHotUpdate(ctx: PluginContext, hotUpdateCtx: HmrContext): [] | void {
  if (!ctx.compiler.isIconFile(hotUpdateCtx.file)) {
    return
  }
  ctx.compiler.invalidate(hotUpdateCtx.file)
  hotUpdateCtx.server.ws.send({ type: 'full-reload' })
  return []
}
