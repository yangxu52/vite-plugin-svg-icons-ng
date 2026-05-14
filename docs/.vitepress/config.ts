import { defineConfig } from 'vitepress'
import { version } from '../../packages/vite-plugin-svg-icons-ng/package.json'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/vite-plugin-svg-icons-ng/',
  title: 'vite-plugin-svg-icons-ng',
  description: 'A high-performance SVG icon plugin for Vite, automatically generates SVG sprites from files and injects them at runtime',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yangxu52/vite-plugin-svg-icons-ng' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/vite-plugin-svg-icons-ng' },
    ],
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/' },
          { text: 'Options', link: '/guide/options' },
          {
            text: `v${version}`,
            items: [
              {
                text: 'Changelog',
                link: `https://github.com/yangxu52/vite-plugin-svg-icons-ng/blob/v${version}/packages/vite-plugin-svg-icons-ng/CHANGELOG.md`,
              },
            ],
          },
        ],
        sidebar: [
          {
            text: 'Introduction',
            items: [
              { text: `Getting Started`, link: '/guide/' },
              { text: 'Why This Plugin', link: '/guide/why' },
            ],
          },
          {
            text: 'Guide',
            items: [
              { text: 'Usage', link: '/guide/usage' },
              {
                text: 'Component',
                link: '/guide/component/',
                items: [
                  { text: 'Vue3', link: '/guide/component/vue3' },
                  { text: 'React', link: '/guide/component/react' },
                ],
              },
              { text: 'Virtual Module', link: '/guide/virtual-module' },
              { text: 'Server-Side Rendering', link: '/guide/ssr' },
              { text: 'Migration from Old Plugin', link: '/guide/migration' },
            ],
          },
          {
            text: 'Configuration',
            items: [
              { text: 'Options', link: '/guide/options' },
              { text: 'TypeScript', link: '/guide/typescript' },
            ],
          },
        ],
      },
    },
    zh: {
      label: '中文',
      lang: 'zh',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/' },
          { text: '配置', link: '/zh/guide/options' },
          { text: `v${version}`, items: [{ text: '更新日志', link: 'https://github.com/yangxu52/vite-plugin-svg-icons-ng/blob/main/CHANGELOG.md' }] },
        ],
        sidebar: [
          {
            text: '介绍',
            items: [
              { text: '开始', link: '/zh/guide/' },
              { text: '为什么选择它', link: '/zh/guide/why' },
            ],
          },
          {
            text: '指引',
            items: [
              { text: '使用指南', link: '/zh/guide/usage' },
              {
                text: '组件使用',
                link: '/zh/guide/component/',
                items: [
                  { text: 'Vue3', link: '/zh/guide/component/vue3' },
                  { text: 'React', link: '/zh/guide/component/react' },
                ],
              },
              { text: '虚拟模块', link: '/zh/guide/virtual-module' },
              { text: '服务端渲染（SSR）', link: '/zh/guide/ssr' },
              { text: '从旧插件迁移', link: '/zh/guide/migration' },
            ],
          },
          {
            text: '配置',
            items: [
              { text: '插件选项', link: '/zh/guide/options' },
              { text: 'TypeScript', link: '/zh/guide/typescript' },
            ],
          },
        ],
      },
    },
  },
})
