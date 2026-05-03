import { test } from 'vitest'
import { createBrowserHarness } from './helpers/harness'
import { expectSingleSpriteRoot, expectSpriteMarkupContains, expectSpriteSymbols } from './helpers/domAssertions'

test('htmlMode inline injects normal symbols into real browser DOM', async () => {
  const harness = await createBrowserHarness({
    htmlMode: 'inline',
    registerRuntime: false,
    iconsFixture: 'normal',
  })

  await harness.open()
  await expectSingleSpriteRoot(harness.page)
  await expectSpriteMarkupContains(harness.page, 'icon-01-alpha')
  await expectSpriteSymbols(harness.page, ['icon-01-alpha', 'icon-02-beta'])
})
