<div align="center">
  <picture>
    <img src="https://pic1.imgdb.cn/item/68c7c093c5157e1a8804fb52.svg" alt="Zess Logo">
  </picture>
</div>

# @zess/plugin

[![NPM Version](https://img.shields.io/npm/v/@zess/plugin.svg?style=flat-square&color=lightblue)](https://www.npmjs.com/package/@zess/plugin) [![License](https://img.shields.io/npm/l/@zess/plugin.svg?style=flat-square&color=lightblue)](https://github.com/rpsffx/zess/blob/main/LICENSE)

Vite plugin for Zess 🧩 JSX file parser and transformer for building modern web applications.

## ✨ Features

- **⚡ Efficient JSX Compilation**: Automatically transforms JSX syntax into optimized JavaScript code
- **🎯 Zero-Configuration**: Ready to use out of the box with no complex setup
- **💡 Smart Dependency Optimization**: Automatically prebuilds core dependencies for improved performance
- **🔒 Full TypeScript Support**: Includes type definitions for type safety
- **🔄 Seamless Integration with Vite Ecosystem**: Works alongside other Vite plugins

## 📦 Installation

```bash
# Using npm
npm install -D @zess/plugin

# Using yarn
yarn add -D @zess/plugin

# Using pnpm
pnpm add -D @zess/plugin
```

## 🚀 Basic Usage

Add the Zess plugin to your Vite configuration file:

```javascript
import { defineConfig } from 'vite'
import zess from '@zess/plugin'

export default defineConfig({
  plugins: [zess()],
})
```

You can then use Zess features in your project:

```jsx
import { useSignal } from '@zess/core'

function Counter() {
  const [count, setCount] = useSignal(0)

  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
    </div>
  )
}
```

## ⚙️ Configuration Options

The Zess plugin supports the following configuration options:

```javascript
import { defineConfig } from 'vite'
import zess from '@zess/plugin'

export default defineConfig({
  plugins: [
    zess({
      // Specify file patterns to include
      include: ['**/*.{tsx,jsx}'],
      // Specify file patterns to exclude
      exclude: ['{build,dist,public}/**'],
      // Custom runtime module path
      modulePath: '@zess/core',
    }),
  ],
})
```

### Configuration Parameters

- `include`: File patterns to process, defaults to `['**/*.{tsx,jsx}']`
- `exclude`: File patterns to exclude, defaults to `['{build,dist,public}/**']`
- `modulePath`: Import path for runtime functions, defaults to `'@zess/core'`

## 🔄 Compatibility

The Zess plugin is compatible with:

- Vite ^3 || ^4 || ^5 || ^6 || ^7
- Node.js >=18.12.0
- Modern browsers (Chrome, Firefox, Safari, Edge)

## 📝 License

[MIT](https://github.com/rpsffx/zess/blob/main/LICENSE)
