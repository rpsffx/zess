import { SourceMapGenerator } from 'source-map'
import { describe, expect, it } from 'vitest'
import { compile } from '../src/compiler'

const ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g
const SPACE_REGEX = /\s+/g

function match(
  value: unknown,
  pattern: string | RegExp,
  negative?: boolean,
): void {
  ;(negative ? expect(value).not : expect(value)).toMatch(
    typeof pattern === 'string'
      ? RegExp(
          pattern
            .replaceAll(ESCAPE_REGEX, String.raw`\$&`)
            .replaceAll(SPACE_REGEX, String.raw`\s*`),
        )
      : pattern,
  )
}

describe('compile', () => {
  it('should compile simple HTML element', () => {
    const result = compile('<div>Hello</div>')
    match(result.code, 'const _el$ = _$createElement("div")')
    match(result.code, '_el$.append("Hello")')
  })
  it('should handle SVG namespace', () => {
    const result = compile('<svg><circle /></svg>')
    match(result.code, '_$createElement("svg", 1)')
    match(result.code, '_$createElement("circle", 1)')
  })
  it('should handle MathML namespace', () => {
    const result = compile('<math><mi>5</mi></math>')
    match(result.code, '_$createElement("math", 2)')
    match(result.code, '_$createElement("mi", 2)')
  })
  it('should handle namespace tags', () => {
    const result = compile('<svg:circle>test</svg:circle>')
    match(result.code, '_$createElement("svg:circle")')
  })
  it('should handle invalid JSX element', () => {
    expect(() => compile('</div>')).toThrow()
  })
  it('should handle components', () => {
    const result = compile('<MyComponent />')
    match(result.code, '_$createComponent(MyComponent, {})')
  })
  it('should handle JSX member expressions', () => {
    const result = compile('<Module.Component />')
    match(result.code, '_$createComponent(Module.Component, {})')
  })
  it('should handle nested JSX components', () => {
    const result = compile('<Parent><Child><Grandchild /></Child></Parent>')
    match(
      result.code,
      `_$createComponent(Parent, {
        get children() {
          return _$createComponent(Child, {
            get children() {
              return _$createComponent(Grandchild, {});
            }
          });
        }
      });`,
    )
  })
  it('should handle conditional JSX expressions', () => {
    const result = compile('<div>{flag ? <A /> : <B />}</div>')
    match(
      result.code,
      'flag ? _$createComponent(A, {}) : _$createComponent(B, {})',
    )
  })
  it('should handle dynamic children with insert', () => {
    const result = compile('<div>{dynamicContent}</div>', {
      modulePath: 'custom-runtime',
    })
    match(result.code, '_$insert(_el$, dynamicContent)')
    match(
      result.code,
      `import {
        createElement as _$createElement,
        insert as _$insert
      } from "custom-runtime"`,
    )
  })
  it('should handle JSX spread children', () => {
    const result = compile('<div>{...items}</div>')
    match(result.code, '_$insert(_el$, items)')
  })
  it('should handle empty expression containers', () => {
    const result = compile('<div>{/* empty */}</div>')
    match(result.code, '_$createElement("div")')
  })
  it('should handle single expression fragments', () => {
    const result = compile('<>{userName}</>')
    match(result.code, 'userName')
  })
  it('should handle text interpolation in fragments', () => {
    const result = compile('<>Current count: {props.count}</>')
    match(result.code, '["Current count: ", _$memo(() => props.count)]')
  })
  it('should handle fragments with multiple elements', () => {
    const result = compile('<><span>1</span><span>2</span></>')
    match(result.code, /\[.+?, .+?\]/s)
  })
  it('should handle empty fragments', () => {
    const result = compile('<></>')
    match(result.code, '[]')
  })
  it('should handle fragments with mixed content', () => {
    const result = compile('<>Text {count} <span>1</span></>')
    match(result.code, /\["Text ", .+?, .+?\]/s)
  })
  it('should handle fragment with only whitespace', () => {
    const result = compile('<>\n  \n</>')
    match(result.code, '[]')
  })
  it('should handle fragment with mixed dynamic content', () => {
    const result = compile('<>Text {count} {flag ? <A /> : <B />}</>')
    match(result.code, /\["Text ", .+?, .+?\]/s)
  })
  it('should handle nested fragments correctly', () => {
    const result = compile('<>Outer<>{Inner}</></>')
    match(result.code, '["Outer", Inner]')
  })
  it('should handle boolean attributes', () => {
    const result = compile('<input disabled />')
    match(result.code, '_el$.disabled = true')
  })
  it('should handle innerHTML', () => {
    const result = compile('<div innerHTML={html} />')
    match(result.code, '_el$.innerHTML = html')
  })
  it('should handle native event listeners', () => {
    const result = compile('<button onclick={handleClick}>Click</button>')
    match(result.code, '_el$.onclick = handleClick')
  })
  it('should handle event listeners with delegation', () => {
    const result = compile('<button onClick={handleClick}>Click</button>')
    match(result.code, '_$delegateEvents(["click"])')
    match(result.code, '_el$.$$click = handleClick')
  })
  it('should handle dynamic class and style attributes', () => {
    const result = compile('<div class={className} style={styles}></div>')
    match(result.code, '_$className(_el$, className)')
    match(result.code, '_$style(_el$, styles)')
  })
  it('should handle function ref', () => {
    const result = compile('<div ref={el => this.ref = el}></div>')
    match(result.code, '_$use(el => _self$.ref = el, _el$)')
  })
  it('should handle object ref', () => {
    const result = compile('<div ref={refObject}></div>')
    match(result.code, 'const _ref$ = refObject')
    match(
      result.code,
      'typeof _ref$ === "function" ? _$use(_ref$, _el$) : refObject = _el$',
    )
  })
  it('should handle ref with conditional expression', () => {
    const result = compile('<div ref={condition ? ref1 : ref2}></div>')
    match(result.code, 'const _ref$ = condition ? ref1 : ref2')
    match(result.code, 'typeof _ref$ === "function" && _$use(_ref$, _el$)')
  })
  it('should handle attribute names with special characters', () => {
    const result = compile('<div data-custom-attr="value" />')
    match(result.code, '_$setAttribute(_el$, "data-custom-attr", "value")')
  })
  it('should handle namespaced attributes in SVG', () => {
    const result = compile('<svg xlink:href="#test" />')
    match(result.code, '_$setAttributeNS(_el$, 3, "xlink:href", "#test")')
  })
  it('should merge multiple spread attributes', () => {
    const result = compile('<div {...a} {...b} class="static" />')
    match(result.code, '_$mergeProps(a, b, { ["class"]: "static" })')
  })
  it('should handle multiple dynamic attributes', () => {
    const result = compile('<div class={cls} style={styles} title={title} />')
    match(result.code, '_$className(_el$, cls)')
    match(result.code, '_$style(_el$, styles)')
    match(result.code, '_$setAttribute(_el$, "title", title)')
  })
  it('should optimize static content', () => {
    const result = compile(
      '<div class="static" style={{ color: "red" }}>Text</div>',
    )
    match(result.code, '_$effect', true)
    match(result.code, '_$setAttribute(_el$, "class", "static")')
    match(result.code, '_$style(_el$, { color: "red" })')
  })
  it('should handle this expression in program context', () => {
    const result = compile('<div>{this.text}</div>')
    match(result.code, 'const _self$ = this')
    match(result.code, '_self$.text')
  })
  it('should handle this expression in function context', () => {
    const result = compile(`
      function Test() {
        return <div>{this.props.text}</div>
      }
    `)
    match(result.code, 'const _self$ = this')
    match(result.code, '_self$.props.text')
  })
  it('should handle this context in class components', () => {
    const result = compile(`
      class Component {
        render() {
          return <div>{this.state.text}</div>
        }
      }
    `)
    match(result.code, 'const _self$ = this')
    match(result.code, '_self$.state.text')
  })
  it('should handle this in arrow function with JSX assignment', () => {
    const result = compile(`
      class Test {
        handleClick = () => {
          const element = <div>{this.value}</div>
        }
      }
    `)
    match(result.code, 'const _self$ = this')
    match(result.code, '_self$.value')
  })
  it('should handle component methods in JSX', () => {
    const result = compile(`
      function Component() {
        return <button onClick={this.handleClick}>Click</button>
      }
    `)
    match(result.code, '_el$.$$click = _self$.handleClick')
  })
  it('should inject all runtime imports when spread is used', () => {
    const result = compile('<div {...props} />')
    match(result.code, 'import {')
    match(result.code, '_$spread')
  })
  it('should inject effect import when needed', () => {
    const result = compile(
      '<div class={props.className} style={getStyles()} />',
    )
    match(result.code, 'import {')
    match(result.code, '_$effect')
  })
  it('should inject all runtime imports when needed', () => {
    const result = compile(`
      <>
        <div ref={el => this.el = el} />
        <div onClick={handler} />
        <div class={cls} />
        <div style={styles} />
        <div {...props} id="test-id" />
      </>
    `)
    match(result.code, 'import {')
    match(result.code, '_$use')
    match(result.code, '_$delegateEvents')
    match(result.code, '_$className')
    match(result.code, '_$style')
    match(result.code, '_$spread')
    match(result.code, '_$mergeProps')
  })
  it('should generate valid source maps', () => {
    const map = new SourceMapGenerator({ file: 'base.js' })
    const result = compile('<div>Test</div>', {
      file: 'test.js',
      sourceRoot: '/src',
      sourcemap: map.toJSON(),
    })
    match(JSON.stringify(result.map), '"sources":["/src/test.js"]')
  })
})
