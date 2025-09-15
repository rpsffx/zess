<div align="center">
  <picture>
    <img src="https://pic1.imgdb.cn/item/68c79152c5157e1a8803d096.svg" alt="Zess Logo" width="300" style="height: auto;">
  </picture>
</div>

# @zess/compiler

[![NPM Version](https://img.shields.io/npm/v/@zess/compiler.svg?style=flat-square&color=lightblue)](https://www.npmjs.com/package/@zess/compiler) [![License](https://img.shields.io/npm/l/@zess/compiler.svg?style=flat-square&color=lightblue)](https://github.com/rpsffx/zess/blob/main/LICENSE)

Zess JSX compiler 💥 Delivers efficient code conversion for super - responsive web experiences.

## Features

- **Efficient Compilation**: Transforms JSX syntax into optimized JavaScript code
- **Complete JSX Support**:
  - HTML elements and text content
  - SVG and MathML namespaces
  - Custom components and component nesting
  - JSX member expressions (e.g., `<Module.Component />`)
  - Conditional JSX expressions
  - Dynamic children and spread operator
  - JSX Fragments
  - Boolean attributes and special attribute handling
  - Event listeners (native and delegated)
  - Dynamic class and style attributes
  - Ref handling
  - Support for special characters in attribute names
- **High Performance**: Uses [Meriyah](https://github.com/meriyah/meriyah) for parsing, ensuring extremely fast processing
- **Smart Code Optimization**: Static content optimization and runtime function importing on demand
- **Source Map Support**: For easy debugging of compiled code
- **Type Safety**: Complete TypeScript type definitions

## Installation

```bash
# Using npm
npm install @zess/compiler

# Using yarn
yarn add @zess/compiler

# Using pnpm
pnpm add @zess/compiler
```

## Basic Usage

```javascript
import { compile } from '@zess/compiler'

// Compile simple JSX code
const result = compile('<div>Hello World</div>')

console.log(result.code) // Compiled JavaScript code
console.log(result.map) // Generated source map
```

## Advanced Usage

### Custom Runtime Import Path

```javascript
import { compile } from '@zess/compiler'

// Configure custom runtime module path
const result = compile('<div>Custom Runtime</div>', {
  modulePath: 'custom-runtime',
})
```

### Source Map Configuration

```javascript
import { compile } from '@zess/compiler'

// Enable source maps with file information
const result = compile('<div>With Source Maps</div>', {
  file: 'component.jsx',
  sourceRoot: './src',
})

// Get the source map as a string
const sourceMapString = JSON.stringify(result.map)
```

## API Reference

### `compile(code: string, options?: CompilerOptions): CompilerResult`

**Parameters:**

- `code` (string): The JSX code to compile
- `options` (object, optional): Compilation options
  - `modulePath` (string): Module path for importing runtime functions (default: '@zess/core')
  - `file` (string): Filename for source map generation (default: 'output.js')
  - `sourceRoot` (string): Source root directory for source maps (default: '')
  - `sourcemap` (RawSourceMap): Existing source map to merge with the generated map

**Returns:**

An object with the following properties:

- `code` (string): The compiled JavaScript code
- `map` (RawSourceMap): The generated source map

## Feature Examples

### 1. Basic HTML Elements

**Input:**

```jsx
const element = <div class="container">Hello World</div>
```

**Output:**

```javascript
const element = (() => {
  const _el$ = _$createElement('div')
  _$setAttribute(_el$, 'class', 'container')
  _el$.append('Hello World')
  return _el$
})()
```

### 2. Custom Components

**Input:**

```jsx
const component = <MyComponent prop1="value1" prop2={dynamicValue} />
```

**Output:**

```javascript
const component = _$createComponent(MyComponent, {
  prop1: 'value1',
  prop2: dynamicValue,
})
```

### 3. Dynamic Content

**Input:**

```jsx
const dynamic = <div>Count: {count}</div>
```

**Output:**

```javascript
const dynamic = (() => {
  const _el$ = _$createElement('div')
  _el$.append('Count: ')
  _$insert(_el$, count)
  return _el$
})()
```

### 4. JSX Fragments

**Input:**

```jsx
const fragment = (
  <>
    <span>First item</span>
    <span>Second item</span>
  </>
)
```

**Output:**

```javascript
const fragment = [
  (() => {
    const _el$ = _$createElement('span')
    _el$.append('First item')
    return _el$
  })(),
  (() => {
    const _el$2 = _$createElement('span')
    _el$2.append('Second item')
    return _el$2
  })(),
]
```

### 5. Nested Components

**Input:**

```jsx
const nested = (
  <ParentComponent>
    <ChildComponent prop={value}>
      <GrandchildComponent />
    </ChildComponent>
  </ParentComponent>
)
```

**Output:**

```javascript
const nested = _$createComponent(ParentComponent, {
  get children() {
    return _$createComponent(ChildComponent, {
      prop: value,
      get children() {
        return _$createComponent(GrandchildComponent, {})
      },
    })
  },
})
```

### 6. SVG Elements

**Input:**

```jsx
const svg = (
  <svg width="100" height="100">
    <circle cx="50" cy="50" r="40" fill="red" />
  </svg>
)
```

**Output:**

```javascript
const svg = (() => {
  const _el$ = _$createElement('svg', 1)
  _$setAttribute(_el$, 'width', '100')
  _$setAttribute(_el$, 'height', '100')
  const _el$2 = _$createElement('circle', 1)
  _$setAttribute(_el$2, 'cx', '50')
  _$setAttribute(_el$2, 'cy', '50')
  _$setAttribute(_el$2, 'r', '40')
  _$setAttribute(_el$2, 'fill', 'red')
  _el$.append(_el$2)
  return _el$
})()
```

### 7. Conditional JSX

**Input:**

```jsx
const conditional = (
  <div>{isVisible ? <span>Visible</span> : <span>Hidden</span>}</div>
)
```

**Output:**

```javascript
const conditional = (() => {
  const _el$ = _$createElement('div')
  _$insert(
    _el$,
    isVisible
      ? (() => {
          const _el$2 = _$createElement('span')
          _el$2.append('Visible')
          return _el$2
        })()
      : (() => {
          const _el$3 = _$createElement('span')
          _el$3.append('Hidden')
          return _el$3
        })(),
  )
  return _el$
})()
```

### 8. Class Attribute

**Input:**

```jsx
const withClass = <div class={isActive ? 'active' : 'inactive'}>Status</div>
```

**Output:**

```javascript
const withClass = (() => {
  const _el$ = _$createElement('div')
  _$setAttribute(_el$, 'class', isActive ? 'active' : 'inactive')
  _el$.append('Status')
  return _el$
})()
```

### 9. Style Attribute

**Input:**

```jsx
const withStyle = (
  <div style={{ color: 'red', fontSize: '16px' }}>Styled Text</div>
)
```

**Output:**

```javascript
const withStyle = (() => {
  const _el$ = _$createElement('div')
  _$style(_el$, {
    color: 'red',
    fontSize: '16px',
  })
  _el$.append('Styled Text')
  return _el$
})()
```

### 10. Multiple Dynamic Attributes

**Input:**

```jsx
const dynamicAttrs = (
  <div class={classes()} style={styles()} data-id={id()}>
    Dynamic
  </div>
)
```

**Output:**

```javascript
const dynamicAttrs = (() => {
  const _el$ = _$createElement('div')
  _$effect(
    (_p$) => {
      const _v$ = classes(),
        _v$2 = styles(),
        _v$3 = id()
      _p$['class'] = _$className(_el$, _v$, _p$['class'])
      _p$.style = _$style(_el$, _v$2, _p$.style)
      _v$3 !== _p$['data-id'] &&
        _$setAttribute(_el$, 'data-id', (_p$['data-id'] = _v$3))
      return _p$
    },
    {
      ['class']: undefined,
      style: undefined,
      ['data-id']: undefined,
    },
  )
  _el$.append('Dynamic')
  return _el$
})()
```

### 11. Event Listeners

**Input:**

```jsx
const withEvents = (
  <button onclick={handleClick} onMouseEnter={handleMouseEnter}>
    Click Me
  </button>
)
```

**Output:**

```javascript
const withEvents = (() => {
  const _el$ = _$createElement('button')
  _el$.onclick = handleClick
  _el$.$$mouseenter = handleMouseEnter
  _el$.append('Click Me')
  return _el$
})()
```

### 12. Ref Handling

**Input:**

```jsx
const withRefs = (
  <>
    <input ref={(el) => (this.inputRef = el)} />
    <div ref={refObject}>Ref Object</div>
  </>
)
```

**Output:**

```javascript
const _self$ = this
const withRefs = [
  (() => {
    const _el$ = _$createElement('input')
    _$use((el) => (_self$.inputRef = el), _el$)
    return _el$
  })(),
  (() => {
    const _el$2 = _$createElement('div')
    const _ref$ = refObject
    typeof _ref$ === 'function' ? _$use(_ref$, _el$2) : (refObject = _el$2)
    _el$2.append('Ref Object')
    return _el$2
  })(),
]
```

## Compatibility

The Zess JSX compiler is compatible with:

- Node.js >=18.12.0
- Modern browsers (Chrome, Firefox, Safari, Edge)

## License

[MIT](https://github.com/rpsffx/zess/blob/main/LICENSE)
