import { createReadStream, existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import { createServer as createHttpServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd = process.argv.includes('--prod')
const port = Number(process.env.PORT || 5175)
const clientDist = path.resolve(__dirname, 'dist/client')

function getContentType(filePath) {
  const ext = path.extname(filePath)
  if (ext === '.js') return 'text/javascript'
  if (ext === '.css') return 'text/css'
  if (ext === '.json') return 'application/json'
  if (ext === '.svg') return 'image/svg+xml'
  if (ext === '.ico') return 'image/x-icon'
  if (ext === '.html') return 'text/html'
  return 'application/octet-stream'
}

async function tryServeStatic(reqPath, res) {
  const safePath = reqPath.split('?')[0]
  if (safePath === '/' || safePath === '/index.html') {
    return false
  }

  const filePath = path.resolve(clientDist, `.${safePath}`)
  if (!filePath.startsWith(clientDist) || !existsSync(filePath)) {
    return false
  }

  res.writeHead(200, { 'Content-Type': getContentType(filePath) })
  createReadStream(filePath).pipe(res)
  return true
}

async function loadProdRenderer() {
  const templatePath = path.resolve(clientDist, 'index.html')
  const entryPath = path.resolve(__dirname, 'dist/server/entry-server.js')
  const template = await fs.readFile(templatePath, 'utf-8')
  const { render } = await import(pathToFileURL(entryPath).href)
  return { template, render }
}

async function bootstrap() {
  let vite = null
  let prodRenderer = null

  if (!isProd) {
    vite = await createViteServer({
      root: __dirname,
      appType: 'custom',
      server: { middlewareMode: true },
    })
  } else {
    prodRenderer = await loadProdRenderer()
  }

  async function renderHtml(req, res) {
    const reqUrl = req.url || '/'
    const url = reqUrl.split('?')[0]

    if (isProd && (await tryServeStatic(url, res))) {
      return
    }

    let template
    let render

    if (vite) {
      template = await fs.readFile(path.resolve(__dirname, 'index.html'), 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      const mod = await vite.ssrLoadModule('/src/entry-server.ts')
      render = mod.render
    } else {
      template = prodRenderer.template
      render = prodRenderer.render
    }

    const html = await render(url, template)
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(html)
  }

  const server = createHttpServer((req, res) => {
    const execute = async () => {
      try {
        await renderHtml(req, res)
      } catch (error) {
        if (vite && error instanceof Error) {
          vite.ssrFixStacktrace(error)
        }
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        const message = error instanceof Error ? error.stack || error.message : String(error)
        res.end(message)
      }
    }

    if (!vite) {
      void execute()
      return
    }

    vite.middlewares(req, res, () => {
      void execute()
    })
  })

  server.listen(port, () => {
    const mode = isProd ? 'build-ssr preview' : 'dev-ssr'
    console.log(`[playground-ssr] ${mode} server is running at http://localhost:${port}`)
  })
}

void bootstrap()
