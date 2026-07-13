import type { Page } from 'playwright'
import { expect } from 'vitest'

const SPRITE_SELECTOR = '#__svg__icons__dom__'
const SPRITE_APPEND_COUNT_KEY = '__TEST_SPRITE_APPEND_COUNT__'

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

export async function expectSpriteRootTag(page: Page, tagName: string): Promise<void> {
  await expect.poll(async () => await page.locator(SPRITE_SELECTOR).evaluate((element) => element.tagName.toLowerCase())).toBe(tagName)
}

export async function trackSpriteChildAppends(page: Page): Promise<void> {
  await page.evaluate((selector) => {
    const state = globalThis as typeof globalThis & { __TEST_SPRITE_APPEND_COUNT__?: number }
    const originalAppendChild = Element.prototype.appendChild
    state.__TEST_SPRITE_APPEND_COUNT__ = 0
    Object.defineProperty(Element.prototype, 'appendChild', {
      configurable: true,
      value(this: Element, child: Node) {
        if (this.matches(selector)) {
          state.__TEST_SPRITE_APPEND_COUNT__ = (state.__TEST_SPRITE_APPEND_COUNT__ ?? 0) + 1
        }
        return Reflect.apply(originalAppendChild, this, [child])
      },
    })
  }, SPRITE_SELECTOR)
}

export async function expectSpriteChildAppendCount(page: Page, count: number): Promise<void> {
  await expect
    .poll(async () => {
      return await page.evaluate((key) => (globalThis as typeof globalThis & Record<string, number | undefined>)[key] ?? 0, SPRITE_APPEND_COUNT_KEY)
    })
    .toBe(count)
}

function escapeId(id: string): string {
  return id.replace(/([#.;:[\],=])/g, '\\$1')
}
