<div align="center">
  <img src="https://pic1.imgdb.cn/item/68c7c093c5157e1a8804fb52.svg" alt="Zess Logo">
  <h1>Zess</h1>

[![GitHub package.json version](https://img.shields.io/github/package-json/v/rpsffx/zess?style=for-the-badge)](./package.json) [![GitHub License](https://img.shields.io/github/license/rpsffx/zess?style=for-the-badge)](./LICENSE) [![Build Status](https://img.shields.io/github/actions/workflow/status/rpsffx/zess/unit-test.yml?branch=main&logo=github&style=for-the-badge)](./.github/workflows/unit-test.yml) [![Codecov](https://img.shields.io/codecov/c/github/rpsffx/zess?branch=main&logo=codecov&style=for-the-badge)](https://app.codecov.io/gh/rpsffx/zess) [![npm package minimized gzipped size (scoped)](https://img.shields.io/bundlejs/size/%40zessjs/core?style=for-the-badge)](https://bundlejs.com/?q=@zessjs/core)

A compiler-driven JavaScript framework for building high-performance user interfaces.

**[📑 Documentation](https://rpsffx.github.io/zess/)**

</div>

## 🔍 What is Zess?

Zess (pronounced /zɛs/) is a compiler-based JavaScript framework for building user interfaces on top of standard HTML, CSS, and JavaScript. Unlike traditional runtime-focused frameworks, Zess shifts the majority of its work to the compile stage. Through static analysis and compile-time optimizations, it transforms declarative components into lean, efficient imperative code. This results in reduced runtime overhead, faster initial page loads, and a user experience that approaches native-level performance.

## ✨ Features

- **⚡ High Performance**: Deeply optimized compiler output, combined with an efficient reactive system using Signals, delivers native-like smoothness.
- **🔒 Full Type Safety**: Built-in TypeScript support ensures end-to-end type checking across development and build, improving code reliability.
- **🛠️ Fast Development**: Powered by Vite for millisecond-level hot updates and efficient bundling, boosting development productivity.
- **📚 Easy to Learn**: Familiar API design inspired by mainstream frameworks lowers the learning curve and speeds up proficiency.

## 🎯 Getting Started

### Create Project

Create a new Zess project via CLI where `my-app` is your project directory:

```bash
npx create-zess my-app
```

### Start Development Server

Navigate to the project directory and start the development server:

```bash
cd my-app
npm run dev
```

### Build for Production

Build the project for production:

```bash
npm run build
```

### Preview Build Locally

Start a local server to preview the built project:

```bash
npm run preview
```

## 🔗 More

Check out our official documentation to learn more about Zess:

- [Introduction](https://rpsffx.github.io/zess/guide/start/introduction) - Learn about Zess features, performance benefits, and framework comparisons
- [Quick Start](https://rpsffx.github.io/zess/guide/start/getting-started) - Get started with Zess in minutes
- [API Overview](https://rpsffx.github.io/zess/api/) - Explore all Zess APIs including Core and Router modules

## 📝 License

[MIT](./LICENSE)
