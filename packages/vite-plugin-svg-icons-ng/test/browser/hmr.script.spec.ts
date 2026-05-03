import { test } from 'vitest'
import { createBrowserHarness } from './helpers/harness'
import { expectSingleSpriteRoot, expectSpriteDesc, expectSpriteSymbols } from './helpers/domAssertions'
import { waitForSpriteDesc } from './helpers/hmr'

const UPDATED_AFTER_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <desc>after-v2</desc>
  <circle cx="12" cy="12" r="9" fill="#16A34A" />
</svg>
`

test('htmlMode script updates sprite DOM through HMR without duplicating the root node', async () => {
  const harness = await createBrowserHarness({
    htmlMode: 'script',
    registerRuntime: false,
    iconsFixture: 'mixed-foreign-object',
  })

  await harness.open()
  await expectSingleSpriteRoot(harness.page)
  await expectSpriteSymbols(harness.page, ['icon-01-foreign', 'icon-02-after'])
  await expectSpriteDesc(harness.page, 'icon-02-after', 'after-v1')

  await harness.project.updateIcon('02-after.svg', UPDATED_AFTER_ICON)

  await waitForSpriteDesc(harness.page, 'icon-02-after', 'after-v2')
  await expectSingleSpriteRoot(harness.page)
})
