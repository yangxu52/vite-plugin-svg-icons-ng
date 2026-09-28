export type HtmlModeFixture = 'inline' | 'script' | 'none'

export type FixtureAppOptions = {
  htmlMode: HtmlModeFixture
  registerRuntime: boolean
  iconsFixture: string
  spritePlaceholder?: boolean
  customDomClass?: string | false
  customDomStyle?: string | false
  externalSpriteCss?: boolean
  strictCsp?: boolean
}

export type ResolvedFixtureAppOptions = FixtureAppOptions & {
  root: string
  iconDir: string
}
