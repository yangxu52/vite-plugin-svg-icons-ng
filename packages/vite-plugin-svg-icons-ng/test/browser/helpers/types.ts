export type HtmlModeFixture = 'inline' | 'script' | 'none'

export type FixtureAppOptions = {
  htmlMode: HtmlModeFixture
  registerRuntime: boolean
  iconsFixture: string
}
