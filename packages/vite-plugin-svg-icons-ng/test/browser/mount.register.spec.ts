import { test } from 'vitest'
import { createBrowserHarness } from './helpers/harness'
import { expectSingleSpriteRoot, expectSpriteMarkupContains, expectSpriteSelectorCount, expectSpriteSymbols } from './helpers/domAssertions'

test('htmlMode none with register keeps later normal symbols after a foreignObject symbol in real browser DOM', async () => {
  const harness = await createBrowserHarness({
    htmlMode: 'none',
    registerRuntime: true,
    iconsFixture: 'mixed-foreign-object',
  })

  await harness.open()
  await expectSpriteMarkupContains(harness.page, 'data-foreign-marker="foreign-v1"')
  await expectSingleSpriteRoot(harness.page)
  await expectSpriteSymbols(harness.page, ['icon-01-foreign', 'icon-02-after'])
  await expectSpriteSelectorCount(harness.page, 'foreignObject', 1)
})
