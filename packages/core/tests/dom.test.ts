import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { insert, render, setClassName, setStyle, spread } from '../src/dom'
import { mergeProps } from '../src/props'
import { useMemo, useSignal } from '../src/signal'

afterEach(() => {
  document.body.textContent &&= ''
})

describe('insert', () => {
  let parent: HTMLDivElement
  beforeEach(() => {
    parent = document.createElement('div')
    document.body.append(parent)
  })
  describe('basic insertion', () => {
    it('should handle null input by inserting nothing', () => {
      insert(parent, null)
      expect(parent.textContent).toBe('')
    })
    it('should handle undefined input by inserting nothing', () => {
      insert(parent, undefined)
      expect(parent.textContent).toBe('')
    })
    it('should handle false input by inserting nothing', () => {
      insert(parent, false)
      expect(parent.textContent).toBe('')
    })
    it('should handle true input by inserting nothing', () => {
      insert(parent, true)
      expect(parent.textContent).toBe('')
    })
    it('should insert string content correctly', () => {
      insert(parent, 'text')
      expect(parent.innerHTML).toBe('text')
    })
    it('should convert and insert number content correctly', () => {
      insert(parent, 123)
      expect(parent.innerHTML).toBe('123')
    })
    it('should insert DOM node correctly', () => {
      const node = document.createElement('span')
      node.textContent = 'content'
      insert(parent, node)
      expect(parent.innerHTML).toBe('<span>content</span>')
    })
  })
  describe('array handling', () => {
    it('should filter out falsy values when inserting array', () => {
      insert(parent, ['a', null, 'b', undefined, false, true])
      expect(parent.innerHTML).toBe('ab')
    })
    it('should concatenate string array elements', () => {
      insert(parent, ['foo', 'bar'])
      expect(parent.innerHTML).toBe('foobar')
    })
    it('should insert array of DOM nodes in order', () => {
      const nodes = [
        document.createElement('span'),
        document.createElement('div'),
      ]
      nodes[0].textContent = '1'
      nodes[1].textContent = '2'
      insert(parent, nodes)
      expect(parent.innerHTML).toBe('<span>1</span><div>2</div>')
    })
    it('should flatten and insert nested arrays correctly', () => {
      insert(parent, ['a', ['b', ['c']], 'd'])
      expect(parent.innerHTML).toBe('abcd')
    })
    it('should preserve existing nodes when inserting same array', () => {
      const nodes = [document.createTextNode('1'), document.createTextNode('2')]
      insert(parent, nodes)
      expect(parent.textContent).toBe('12')
      const sameNodes = [nodes[0], nodes[1]]
      insert(parent, sameNodes)
      expect(parent.textContent).toBe('12')
      expect(parent.firstChild).toBe(nodes[0])
      expect(parent.lastChild).toBe(nodes[1])
    })
  })
  describe('node movement', () => {
    it('should reactively move nodes between parent elements', () => {
      const [getNodes, setNodes] = useSignal(['node1', 'node2'])
      const nodes = [
        document.createElement('div'),
        document.createElement('div'),
      ]
      nodes[0].textContent = getNodes()[0]
      nodes[1].textContent = getNodes()[1]
      const getNodeList = useMemo(() => {
        const texts = getNodes()
        nodes[0].textContent = texts[0]
        nodes[1].textContent = texts[1]
        return nodes
      })
      const parent1 = document.createElement('div')
      const parent2 = document.createElement('div')
      document.body.append(parent1, parent2)
      insert(parent1, getNodeList)
      expect(parent1.innerHTML).toBe('<div>node1</div><div>node2</div>')
      insert(parent2, getNodeList)
      expect(parent1.textContent).toBe('')
      expect(parent2.innerHTML).toBe('<div>node1</div><div>node2</div>')
      setNodes([getNodes()[1], getNodes()[0]])
      expect(parent1.textContent).toBe('')
      expect(parent2.innerHTML).toBe('<div>node2</div><div>node1</div>')
    })
  })
  describe('placeholder handling', () => {
    it('should maintain placeholder for dynamic content updates', () => {
      const [getContent, setContent] = useSignal<string | null>('initial')
      const getMemoContent = useMemo(() => {
        const content = getContent()
        return content ? document.createTextNode(content) : null
      })
      insert(parent, getMemoContent)
      expect(parent.childNodes.length).toBe(1)
      expect(parent.textContent).toBe('initial')
      setContent('updated')
      expect(parent.textContent).toBe('updated')
      expect(parent.childNodes.length).toBe(1)
      setContent(null)
      expect(parent.childNodes.length).toBe(1)
      expect(parent.firstChild!.nodeType).toBe(Node.COMMENT_NODE)
    })
  })
  describe('consecutive array insertions', () => {
    it('should handle switching between different reactive arrays', () => {
      const [getArr1, setArr1] = useSignal(['1', 'a'])
      const [getArr2, setArr2] = useSignal(['b', '2'])
      const getMemoArr1 = useMemo(() => [
        document.createTextNode(getArr1()[0]),
        document.createTextNode(getArr1()[1]),
      ])
      const getMemoArr2 = useMemo(() => [
        document.createTextNode(getArr2()[0]),
        document.createTextNode(getArr2()[1]),
      ])
      insert(parent, getMemoArr1)
      expect(parent.innerHTML).toBe('1a')
      setArr1(['3', 'c'])
      expect(parent.innerHTML).toBe('3c')
      insert(parent, getMemoArr2)
      expect(parent.innerHTML).toBe('3cb2')
      setArr2(['d', '4'])
      expect(parent.innerHTML).toBe('3cd4')
      expect(parent.childNodes.length).toBe(4)
      expect(parent.childNodes[0].nodeType).toBe(Node.TEXT_NODE)
      expect(parent.childNodes[1].nodeType).toBe(Node.TEXT_NODE)
      expect(parent.childNodes[2].nodeType).toBe(Node.TEXT_NODE)
      expect(parent.childNodes[3].nodeType).toBe(Node.TEXT_NODE)
    })
    it('should reactively update array contents', () => {
      const [getArray, setArray] = useSignal(['node1', 'node2'])
      const getMemoArray = useMemo(() =>
        getArray().map((text, i) => {
          const node = document.createElement(i ? 'span' : 'div')
          node.textContent = text
          return node
        }),
      )
      insert(parent, getMemoArray)
      expect(parent.innerHTML).toBe('<div>node1</div><span>node2</span>')
      setArray(['updated1', 'updated2', 'newItem'])
      expect(parent.innerHTML).toBe(
        '<div>updated1</div><span>updated2</span><span>newItem</span>',
      )
      setArray([])
      expect(parent.textContent).toBe('')
      expect(parent.childNodes.length).toBe(1)
      expect(parent.firstChild!.nodeType).toBe(Node.COMMENT_NODE)
      setArray(['single'])
      expect(parent.innerHTML).toBe('<div>single</div>')
      setArray(['first', 'second', 'third'])
      expect(parent.innerHTML).toBe(
        '<div>first</div><span>second</span><span>third</span>',
      )
      setArray(['final1', 'final2'])
      expect(parent.innerHTML).toBe('<div>final1</div><span>final2</span>')
    })
  })
})
describe('render', () => {
  it('should render content and clean up on dispose', () => {
    const container = document.createElement('div')
    const dispose = render(() => 'content', container)
    expect(container.textContent).toBe('content')
    dispose()
    expect(container.textContent).toBe('')
  })
  it('should render component and return correct DOM structure', () => {
    const container = document.createElement('div')
    const Component = () => {
      const div = document.createElement('div')
      div.textContent = 'component'
      return div
    }
    render(Component, container)
    expect(container.innerHTML).toBe('<div>component</div>')
  })
})
describe('setClassName', () => {
  it('should set class names from string', () => {
    const el = document.createElement('div')
    setClassName(el, 'class1 class2', '')
    expect(el.className).toBe('class1 class2')
  })
  it('should update classList object', () => {
    const el = document.createElement('div')
    let prev = setClassName(el, { active: true }, '')
    prev = setClassName(el, { active: false, new: true }, prev)
    expect(el.classList.contains('active')).toBe(false)
    expect(el.classList.contains('new')).toBe(true)
    setClassName(el, { single: true }, prev)
    expect(el.classList.contains('single')).toBe(true)
    expect(el.classList.length).toBe(1)
  })
  it('should remove class when value is null', () => {
    const el = document.createElement('div')
    setClassName(el, 'class1', '')
    setClassName(el, null, 'class1')
    expect(el.className).toBe('')
  })
})
describe('setStyle', () => {
  it('should parse and apply style string', () => {
    const el = document.createElement('div')
    setStyle(el, 'color: red; font-size: 16px;', '')
    expect(el.style.cssText).toMatch(/color:\s*red/)
  })
  it('should update style object', () => {
    const el = document.createElement('div')
    let prev = setStyle(el, { color: 'red' }, '')
    prev = setStyle(el, { color: 'blue', fontSize: '14px' }, prev)
    expect(el.style.getPropertyValue('color')).toBe('blue')
    expect(el.style.getPropertyValue('font-size')).toBe('14px')
    setStyle(el, { backgroundColor: 'green' }, prev)
    expect(el.style.getPropertyValue('background-color')).toBe('green')
    expect(el.style.length).toBe(1)
  })
  it('should remove all styles when value is null', () => {
    const el = document.createElement('div')
    setStyle(el, { color: 'red' }, '')
    setStyle(el, null, { color: 'red' })
    expect(el.style.cssText).toBe('')
  })
})
describe('spread', () => {
  it('should set standard HTML attributes', () => {
    const el = document.createElement('div')
    spread(el, { id: 'test', 'data-attr': 'value' })
    expect(el.id).toBe('test')
    expect(el.dataset.attr).toBe('value')
  })
  it('should handle namespaced attributes in SVG', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    spread(svg, { 'xlink:href': '#test', 'xml:space': 'preserve' })
    expect(svg.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).toBe(
      '#test',
    )
    expect(
      svg.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'space'),
    ).toBe('preserve')
  })
  it('should update class list from object', () => {
    const el = document.createElement('div')
    spread(el, { className: { active: true } })
    expect(el.classList.contains('active')).toBe(true)
  })
  it('should apply style properties from object', () => {
    const el = document.createElement('div')
    spread(el, { style: { color: 'red' } })
    expect(el.style.getPropertyValue('color')).toBe('red')
  })
  it('should attach event listeners correctly', () => {
    const el = document.createElement('button')
    const handler = vi.fn()
    document.body.append(el)
    spread(el, { onClick: handler })
    el.click()
    expect(handler).toHaveBeenCalled()
  })
  it('should set boolean attributes properly', () => {
    const input = document.createElement('input')
    spread(input, { disabled: true })
    expect(input.disabled).toBe(true)
  })
  it('should set innerHTML content correctly', () => {
    const el = document.createElement('div')
    spread(el, { innerHTML: '<span>content</span>' })
    expect(el.innerHTML).toBe('<span>content</span>')
  })
  it('should handle dynamic properties from signals', () => {
    const el = document.createElement('div')
    const [getCount, setCount] = useSignal(1)
    const dynamicProps = mergeProps(() => ({
      'data-count': getCount(),
      class: { active: getCount() > 1 },
    }))
    spread(el, dynamicProps)
    expect(el.dataset.count).toBe('1')
    expect(el.classList.contains('active')).toBe(false)
    setCount(2)
    expect(el.dataset.count).toBe('2')
    expect(el.classList.contains('active')).toBe(true)
  })
})
