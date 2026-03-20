import { normalizePath } from 'vite'
import type { PluginContext } from '../types'
import { getWeakETag } from '../utils/hash'
import { renderVirtualModule, resolveVirtualTypeFromUrl } from './virtual'

type RequestLike = { url?: string }
type ResponseLike = {
  setHeader: (name: string, value: string) => void
  statusCode: number
  end: (content: string) => void
}
type MiddlewareUse = (handler: (req: RequestLike, res: ResponseLike, next: () => void) => Promise<void>) => void

export function setupDevMiddleware(ctx: PluginContext, use: MiddlewareUse): void {
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
