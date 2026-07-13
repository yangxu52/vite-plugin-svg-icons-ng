import { test } from 'vitest'
import { createBrowserHarness } from './support/harness'
import { expectSingleSpriteRoot, expectSpriteMarkupContains, expectSpriteSelectorCount, expectSpriteSymbols } from './support/domAssertions'

const cases = [
  {
    title: 'htmlMode inline injects normal symbols into the browser DOM',
    options: { htmlMode: 'inline', registerRuntime: false, iconsFixture: 'normal' },
    marker: 'icon-01-alpha',
    ids: ['icon-01-alpha', 'icon-02-beta'],
    foreignObjectCount: undefined,
  },
  {
    title: 'htmlMode script preserves symbols after foreignObject',
    options: { htmlMode: 'script', registerRuntime: false, iconsFixture: 'mixed-foreign-object' },
    marker: 'data-foreign-marker="foreign-v1"',
    ids: ['icon-01-foreign', 'icon-02-after'],
    foreignObjectCount: 1,
  },
  {
    title: 'htmlMode none with register preserves symbols after foreignObject',
    options: { htmlMode: 'none', registerRuntime: true, iconsFixture: 'mixed-foreign-object' },
    marker: 'data-foreign-marker="foreign-v1"',
    ids: ['icon-01-foreign', 'icon-02-after'],
    foreignObjectCount: 1,
  },
] as const

test.each(cases)('$title', async ({ options, marker, ids, foreignObjectCount }) => {
  const harness = await createBrowserHarness(options)

  await harness.open()
  await expectSpriteMarkupContains(harness.page, marker)
  await expectSingleSpriteRoot(harness.page)
  await expectSpriteSymbols(harness.page, ids as unknown as string[])
  if (foreignObjectCount !== undefined) {
    await expectSpriteSelectorCount(harness.page, 'foreignObject', foreignObjectCount)
  }
})
