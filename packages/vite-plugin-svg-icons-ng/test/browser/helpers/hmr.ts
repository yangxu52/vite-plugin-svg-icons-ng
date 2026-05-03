import type { Page } from 'playwright'
import { expect } from 'vitest'

export async function waitForSpriteDesc(page: Page, iconId: string, text: string): Promise<void> {
  await expect.poll(async () => await page.locator(`#__svg__icons__dom__ symbol#${iconId} desc`).textContent()).toBe(text)
}
