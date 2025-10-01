import path from 'node:path'
import { pluginShiki } from '@rspress/plugin-shiki'
import { defineConfig, type UserConfig } from 'rspress/config'

const config: UserConfig = defineConfig({
  plugins: [pluginShiki()],
  globalStyles: path.join(__dirname, 'docs/styles/index.css'),
  root: 'docs',
  base: '/zess/',
  lang: 'en',
  icon: 'https://pic1.imgdb.cn/item/68c7c093c5157e1a8804fb52.svg',
  logo: 'https://pic1.imgdb.cn/item/68c7c093c5157e1a8804fb52.svg',
  logoText: 'Zess',
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
        searchPlaceholderText: 'Search',
        searchNoResultsText: 'No results found',
        searchSuggestedQueryText: 'Suggested query',
        editLink: {
          text: '📝 Edit this page on GitHub',
          docRepoBaseUrl: 'https://github.com/rpsffx/zess/tree/main/docs',
        },
        overview: {
          filterNameText: 'Filter',
          filterPlaceholderText: 'Enter keyword',
          filterNoResultText: 'No matching API found',
        },
        nav: [
          {
            text: 'Guide',
            link: '/guide/start/introduction',
            activeMatch: '^/guide/',
            position: 'right',
          },
          {
            text: 'API',
            link: '/api/',
            activeMatch: '^/api/',
            position: 'right',
          },
        ],
        sidebar: {
          'guide/': [
            {
              text: 'Getting Started',
              items: [
                {
                  text: 'Introduction',
                  link: 'guide/start/introduction',
                },
                {
                  text: 'Quick Start',
                  link: 'guide/start/getting-started',
                },
              ],
            },
            {
              text: 'Core',
              items: [
                {
                  text: 'Basic Reactivity',
                  link: 'guide/core/basic-reactivity',
                },
                {
                  text: 'Lifecycle',
                  link: 'guide/core/lifecycle',
                },
                {
                  text: 'Components',
                  link: 'guide/core/components',
                },
                {
                  text: 'Reactive Utilities',
                  link: 'guide/core/reactive-utilities',
                },
                {
                  text: 'Store Utilities',
                  link: 'guide/core/store-utilities',
                },
                {
                  text: 'Secondary Primitives',
                  link: 'guide/core/secondary-primitives',
                },
                {
                  text: 'Rendering',
                  link: 'guide/core/rendering',
                },
                {
                  text: 'JSX Attributes',
                  link: 'guide/core/jsx-attributes',
                },
              ],
            },
            {
              text: 'Router',
              items: [
                {
                  text: 'Components',
                  link: 'guide/router/components',
                },
                {
                  text: 'Primitives',
                  link: 'guide/router/primitives',
                },
              ],
            },
          ],
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
        searchPlaceholderText: '搜索',
        searchNoResultsText: '没有找到结果',
        searchSuggestedQueryText: '建议查询',
        editLink: {
          text: '📝 在 GitHub 上编辑此页',
          docRepoBaseUrl: 'https://github.com/rpsffx/zess/tree/main/docs',
        },
        overview: {
          filterNameText: '过滤',
          filterPlaceholderText: '输入关键词',
          filterNoResultText: '未找到匹配的 API',
        },
        nav: [
          {
            text: '指南',
            link: '/guide/start/introduction',
            activeMatch: '^/zh/guide/',
            position: 'right',
          },
          {
            text: 'API',
            link: '/api/',
            activeMatch: '^/zh/api/',
            position: 'right',
          },
        ],
        sidebar: {
          'zh/guide/': [
            {
              text: '开始',
              items: [
                {
                  text: '介绍',
                  link: 'zh/guide/start/introduction',
                },
                {
                  text: '快速开始',
                  link: 'zh/guide/start/getting-started',
                },
              ],
            },
            {
              text: '核心功能',
              items: [
                {
                  text: '响应性基础',
                  link: 'zh/guide/core/basic-reactivity',
                },
                {
                  text: '生命周期',
                  link: 'zh/guide/core/lifecycle',
                },
                {
                  text: '内置组件',
                  link: 'zh/guide/core/components',
                },
                {
                  text: '响应性工具类',
                  link: 'zh/guide/core/reactive-utilities',
                },
                {
                  text: 'Store 工具类',
                  link: 'zh/guide/core/store-utilities',
                },
                {
                  text: '次要 API',
                  link: 'zh/guide/core/secondary-primitives',
                },
                {
                  text: '渲染',
                  link: 'zh/guide/core/rendering',
                },
                {
                  text: '特殊 JSX 属性',
                  link: 'zh/guide/core/jsx-attributes',
                },
              ],
            },
            {
              text: '路由系统',
              items: [
                {
                  text: '内置组件',
                  link: 'zh/guide/router/components',
                },
                {
                  text: '基础 API',
                  link: 'zh/guide/router/primitives',
                },
              ],
            },
          ],
        },
      },
    ],
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/rpsffx/zess',
      },
    ],
  },
  search: {
    codeBlocks: true,
  },
  languageParity: {
    enabled: true,
  },
})

export default config
