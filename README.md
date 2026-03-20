<div align="center">
  <img src="https://cdn.jsdelivr.net/gh/rpsffx/images/20260321010120627.svg" alt="Zess Logo">
  <h1>Zess</h1>

[![GitHub package.json version](https://img.shields.io/github/package-json/v/rpsffx/zess?style=for-the-badge)](./package.json) [![GitHub License](https://img.shields.io/github/license/rpsffx/zess?style=for-the-badge)](./LICENSE) [![Build Status](https://img.shields.io/github/actions/workflow/status/rpsffx/zess/unit-test.yml?branch=main&logo=github&style=for-the-badge)](./.github/workflows/unit-test.yml) [![Codecov](https://img.shields.io/codecov/c/github/rpsffx/zess?branch=main&logo=codecov&style=for-the-badge)](https://app.codecov.io/gh/rpsffx/zess) [![NPM Downloads](https://img.shields.io/npm/dm/%40zessjs%2Fcli?style=for-the-badge)
](https://www.npmjs.com/package/@zessjs/cli) [![NPM Last Update](https://img.shields.io/npm/last-update/%40zessjs%2Fcore?style=for-the-badge)
](https://github.com/rpsffx/zess/commits/main/)

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
npx -p @zessjs/cli init my-app
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
