import { chromium, type Browser, type Page } from 'playwright'

export type BrowserSession = {
  page: Page
  close: () => Promise<void>
}

export async function openBrowserPage(): Promise<BrowserSession> {
  const browser: Browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  return {
    page,
    close: async () => {
      await context.close()
      await browser.close()
    },
  }
}
