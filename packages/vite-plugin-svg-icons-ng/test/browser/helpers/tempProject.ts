import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { FixtureAppOptions } from './types'

const browserRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageRoot = path.resolve(browserRoot, '../..')
const appTemplateHtml = path.resolve(browserRoot, 'fixtures/apps/index.html')

export type TempProject = {
  root: string
  iconDir: string
  cleanup: () => Promise<void>
  updateIcon(fileName: string, svg: string): Promise<void>
}

export async function createTempProject(options: FixtureAppOptions): Promise<TempProject> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'vite-plugin-svg-icons-ng-browser-'))
  const srcDir = path.join(root, 'src')
  const iconDir = path.join(srcDir, 'icons')
  const fixtureIconDir = path.resolve(browserRoot, 'fixtures/icons', options.iconsFixture)

  await mkdir(srcDir, { recursive: true })
  await mkdir(iconDir, { recursive: true })
  await cp(fixtureIconDir, iconDir, { recursive: true })
  await writeFixtureFiles(root, options)

  return {
    root,
    iconDir,
    cleanup: async () => {
      await rm(root, { recursive: true, force: true })
    },
    updateIcon: async (fileName, svg) => {
      await writeFile(path.join(iconDir, fileName), svg, 'utf8')
    },
  }
}

async function writeFixtureFiles(root: string, options: FixtureAppOptions): Promise<void> {
  const html = await readFile(appTemplateHtml, 'utf8')
  await writeFile(path.join(root, 'index.html'), html, 'utf8')
  await writeFile(path.join(root, 'src/main.ts'), renderMainSource(options), 'utf8')
  await writeFile(path.join(root, 'vite.config.ts'), renderViteConfig(options), 'utf8')
}

function renderMainSource(options: FixtureAppOptions): string {
  const registerImport = options.registerRuntime ? "import 'virtual:svg-icons/register'\n" : ''
  return `import ids from 'virtual:svg-icons/ids'
${registerImport}const root = document.querySelector('#app')

if (!root) {
  throw new Error('Missing #app root')
}

void fetch('/@id/__x00__virtual:svg-icons/sprite')
  .then((response) => response.text())
  .then(async (text) => {
    const module = await import(\`data:text/javascript;charset=utf-8,\${encodeURIComponent(text)}\`)
    window.__TEST_SPRITE__ = module.default
  })

root.innerHTML = ids
  .map((id) => \`
    <section data-icon-id="\${id}">
      <svg data-use-id="\${id}" viewBox="0 0 24 24" aria-hidden="true">
        <use href="#\${id}"></use>
      </svg>
      <span>\${id}</span>
    </section>
  \`)
  .join('')
`
}

function renderViteConfig(options: FixtureAppOptions): string {
  const packageRootLiteral = JSON.stringify(packageRoot)
  const htmlModeLiteral = JSON.stringify(options.htmlMode)
  const registerComment = options.registerRuntime ? '// register runtime enabled' : '// register runtime disabled'
  return `import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { createSvgIconsPlugin } from ${JSON.stringify(path.join(packageRoot, 'src/index.ts'))}

${registerComment}

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    createSvgIconsPlugin({
      iconDirs: [path.resolve(rootDir, 'src/icons')],
      symbolId: 'icon-[name]',
      htmlMode: ${htmlModeLiteral},
    }),
  ],
  resolve: {
    alias: {
      'svg-icon-baker': path.resolve(${packageRootLiteral}, '../svg-icon-baker/src/index.ts'),
    },
  },
})
`
}
