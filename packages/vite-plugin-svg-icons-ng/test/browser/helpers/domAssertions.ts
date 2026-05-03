import type { Page } from 'playwright'
import { expect } from 'vitest'

const SPRITE_SELECTOR = '#__svg__icons__dom__'

export async function expectSingleSpriteRoot(page: Page): Promise<void> {
  await expect.poll(async () => await page.locator(SPRITE_SELECTOR).count()).toBe(1)
}

export async function expectSpriteSymbols(page: Page, ids: string[]): Promise<void> {
  for (const id of ids) {
    await expect.poll(async () => await page.locator(`${SPRITE_SELECTOR} symbol#${escapeId(id)}`).count()).toBe(1)
  }
}

export async function expectSpriteMarkupContains(page: Page, text: string): Promise<void> {
  await expect
    .poll(async () => {
      return await page.evaluate(() => (globalThis as { __TEST_SPRITE__?: string }).__TEST_SPRITE__ ?? '')
    })
    .toContain(text)
}

export async function expectSpriteDesc(page: Page, id: string, text: string): Promise<void> {
  await expect.poll(async () => await page.locator(`${SPRITE_SELECTOR} symbol#${escapeId(id)} desc`).textContent()).toBe(text)
}

export async function expectSpriteSelectorCount(page: Page, selector: string, count: number): Promise<void> {
  await expect.poll(async () => await page.locator(`${SPRITE_SELECTOR} ${selector}`).count()).toBe(count)
}

function escapeId(id: string): string {
  return id.replace(/([#.;:[\],=])/g, '\\$1')
}
