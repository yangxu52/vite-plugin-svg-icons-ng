import type { AddressInfo } from 'node:net'
import { createServer, type ViteDevServer } from 'vite'

export type RunningServer = {
  origin: string
  close: () => Promise<void>
}

export async function startViteDevServer(root: string): Promise<RunningServer> {
  const server = await createServer({
    root,
    logLevel: 'silent',
    clearScreen: false,
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
