import path from 'node:path'
import { defineConfig, type UserConfig } from '@rspress/core'
import { pluginAlgolia } from '@rspress/plugin-algolia'
import { pluginSitemap } from '@rspress/plugin-sitemap'
import { pluginFontOpenSans } from 'rspress-plugin-font-open-sans'

const config: UserConfig = defineConfig({
  plugins: [
    pluginAlgolia(),
    pluginFontOpenSans(),
    pluginSitemap({
      siteUrl: 'https://rpsffx.github.io/zess',
    }),
  ],
  globalStyles: path.join(__dirname, 'theme', 'styles', 'index.css'),
  root: path.join(__dirname, 'docs'),
  base: '/zess/',
  lang: 'en',
  icon: 'https://cdn.jsdelivr.net/gh/rpsffx/images/20260321010120627.svg',
  logo: 'https://cdn.jsdelivr.net/gh/rpsffx/images/20260321010120627.svg',
  logoText: 'Zess',
  head: [
    '<meta name="algolia-site-verification"  content="36948B26089B1A5B" />',
  ],
  search: {
    codeBlocks: true,
  },
  languageParity: {
    enabled: true,
  },
  route: {
    cleanUrls: true,
  },
  themeConfig: {
    enableScrollToTop: true,
    enableContentAnimation: true,
    enableAppearanceAnimation: true,
    hideNavbar: 'auto',
    footer: {
      message: 'Copyright © 2025-present Columsys',
    },
    locales: [
      {
        lang: 'en',
        label: 'English',
        title: 'Zess - The compiler-driven JavaScript framework',
        description:
          'Zess is a compiler-driven JavaScript framework for building high-performance user interfaces',
        outlineTitle: 'On this page',
        prevPageText: 'Previous page',
        nextPageText: 'Next page',
        editLink: {
          text: '📝 Edit this page on GitHub',
          docRepoBaseUrl:
            'https://github.com/rpsffx/zess/tree/main/website/docs',
        },
        overview: {
          filterNameText: 'Filter',
          filterPlaceholderText: 'Enter keyword',
          filterNoResultText: 'No matching API found',
        },
      },
      {
        lang: 'zh',
        label: '简体中文',
        title: 'Zess - 编译器驱动的 JavaScript 框架',
        description:
          'Zess 是一个编译器驱动的 JavaScript 框架，用于构建高性能的用户界面',
        outlineTitle: '本页目录',
        prevPageText: '上一页',
        nextPageText: '下一页',
        editLink: {
          text: '📝 在 GitHub 上编辑此页',
          docRepoBaseUrl:
            'https://github.com/rpsffx/zess/tree/main/website/docs',
        },
        overview: {
          filterNameText: '过滤',
          filterPlaceholderText: '输入关键词',
          filterNoResultText: '未找到匹配的 API',
        },
      },
    ],
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/rpsffx/zess',
      },
      {
        icon: 'npm',
        mode: 'link',
        content: 'https://www.npmjs.com/package/@zessjs/core',
      },
    ],
  },
})

export default config
