import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/vite-plugin-svg-icons-ng/',
  title: 'vite-plugin-svg-icons-ng',
  description: 'Vite plugin for easily creating an SVG sprite and injecting it for use.',
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
        nav: [{ text: 'Guide', link: '/guide' }],
        sidebar: [
          {
            text: 'Introduction',
            items: [
              { text: `What's this ?`, link: '/guide' },
              { text: 'Quick Start', link: '/guide/quick-start' },
              {
                text: 'Component',
                link: '/guide/component',
                items: [
                  { text: 'Vue3', link: '/guide/component/vue3' },
                  { text: 'React', link: '/guide/component/react' },
                ],
              },
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
        nav: [{ text: '指南', link: '/zh/guide' }],
        sidebar: [
          {
            text: '简介',
            items: [
              { text: `这是什么？`, link: '/zh/guide' },
              { text: '快速开始', link: '/zh/guide/quick-start' },
              {
                text: '组件使用',
                link: '/zh/guide/component',
                items: [
                  { text: 'Vue3', link: '/zh/guide/component/vue3' },
                  { text: 'React', link: '/zh/guide/component/react' },
                ],
              },
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
