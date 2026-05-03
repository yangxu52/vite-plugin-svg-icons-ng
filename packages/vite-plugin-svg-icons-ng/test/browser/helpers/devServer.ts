import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AddressInfo } from 'node:net'
import { createServer, type ViteDevServer } from 'vite'
import { createSvgIconsPlugin } from '../../../src/index'
import type { ResolvedFixtureAppOptions } from './types'

const helperDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(helperDir, '../../..')
const bakerEntry = path.resolve(packageRoot, '../svg-icon-baker/src/index.ts')

export type RunningServer = {
  origin: string
  close: () => Promise<void>
}

export async function startViteDevServer(options: ResolvedFixtureAppOptions): Promise<RunningServer> {
  const server = await createServer({
    root: options.root,
    logLevel: 'silent',
    clearScreen: false,
    plugins: [
      createSvgIconsPlugin({
        iconDirs: [options.iconDir],
        symbolId: 'icon-[name]',
        htmlMode: options.htmlMode,
      }),
    ],
    resolve: {
      alias: {
        'svg-icon-baker': bakerEntry,
      },
    },
    server: {
      port: 0,
      strictPort: false,
      host: '127.0.0.1',
    },
  })

  await server.listen()
  const address = server.httpServer?.address()
  if (!address || typeof address === 'string') {
    await closeServer(server)
    throw new Error('Failed to resolve Vite dev server address')
  }

  return {
    origin: `http://127.0.0.1:${(address as AddressInfo).port}`,
    close: async () => {
      await closeServer(server)
    },
  }
}

async function closeServer(server: ViteDevServer): Promise<void> {
  await server.close()
}
