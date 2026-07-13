import { test } from 'vitest'
import { createBrowserHarness } from './support/harness'
import {
  expectSingleSpriteRoot,
  expectSpriteChildAppendCount,
  expectSpriteDesc,
  expectSpriteRootTag,
  expectSpriteSymbols,
  trackSpriteChildAppends,
} from './support/domAssertions'
import { waitForSpriteDesc } from './support/hmr'

const UPDATED_AFTER_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <desc>after-v2</desc>
  <circle cx="12" cy="12" r="9" fill="#16A34A" />
</svg>
`

const cases = [
  {
    title: 'htmlMode script updates the mounted sprite once',
    options: { htmlMode: 'script', registerRuntime: false, iconsFixture: 'mixed-foreign-object' },
  },
  {
    title: 'htmlMode none with register updates the mounted sprite once',
    options: { htmlMode: 'none', registerRuntime: true, iconsFixture: 'mixed-foreign-object' },
  },
  {
    title: 'htmlMode script with register shares one HMR subscription',
    options: { htmlMode: 'script', registerRuntime: true, iconsFixture: 'mixed-foreign-object' },
  },
] as const

test.each(cases)('$title', async ({ options }) => {
  const harness = await createBrowserHarness(options)

  await harness.open()
  await expectSingleSpriteRoot(harness.page)
  await expectSpriteSymbols(harness.page, ['icon-01-foreign', 'icon-02-after'])
  await expectSpriteDesc(harness.page, 'icon-02-after', 'after-v1')
  await trackSpriteChildAppends(harness.page)

  await harness.project.updateIcon('02-after.svg', UPDATED_AFTER_ICON)

  await waitForSpriteDesc(harness.page, 'icon-02-after', 'after-v2')
  await expectSingleSpriteRoot(harness.page)
  await expectSpriteChildAppendCount(harness.page, 2)
})

test('htmlMode script replaces a non-svg placeholder and keeps HMR updates working', async () => {
  const harness = await createBrowserHarness({
    htmlMode: 'script',
    registerRuntime: false,
    iconsFixture: 'mixed-foreign-object',
    spritePlaceholder: true,
  })

  await harness.open()
  await expectSingleSpriteRoot(harness.page)
  await expectSpriteRootTag(harness.page, 'svg')
  await expectSpriteDesc(harness.page, 'icon-02-after', 'after-v1')

  await harness.project.updateIcon('02-after.svg', UPDATED_AFTER_ICON)

  await waitForSpriteDesc(harness.page, 'icon-02-after', 'after-v2')
  await expectSingleSpriteRoot(harness.page)
})
