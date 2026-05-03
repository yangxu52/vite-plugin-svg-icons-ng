import { afterEach } from 'vitest'
import type { Page } from 'playwright'
import { openBrowserPage } from './browser'
import { startViteDevServer } from './devServer'
import { createTempProject, type TempProject } from './tempProject'
import type { FixtureAppOptions } from './types'

export type BrowserHarness = {
  page: Page
  project: TempProject
  open(): Promise<void>
}

type ActiveHarness = {
  close: () => Promise<void>
}

const activeHarnesses = new Set<ActiveHarness>()

afterEach(async () => {
  for (const harness of Array.from(activeHarnesses).reverse()) {
    activeHarnesses.delete(harness)
    await harness.close()
  }
})

export async function createBrowserHarness(options: FixtureAppOptions): Promise<BrowserHarness> {
  const project = await createTempProject(options)
  const server = await startViteDevServer(project.root)
  const browser = await openBrowserPage()

  const active: ActiveHarness = {
    close: async () => {
      await browser.close()
      await server.close()
      await project.cleanup()
    },
  }
  activeHarnesses.add(active)

  return {
    page: browser.page,
    project,
    open: async () => {
      await browser.page.goto(server.origin, { waitUntil: 'networkidle' })
    },
  }
}
