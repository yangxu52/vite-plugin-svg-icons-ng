export type HtmlModeFixture = 'inline' | 'script' | 'none'

export type FixtureAppOptions = {
  htmlMode: HtmlModeFixture
  registerRuntime: boolean
  iconsFixture: string
}

export type ResolvedFixtureAppOptions = FixtureAppOptions & {
  root: string
  iconDir: string
}
