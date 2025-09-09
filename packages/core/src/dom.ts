import { delegateEvents } from './event'
import { createRoot, untrack, useRenderEffect, type Getter } from './signal'

export type Component<T extends Record<string, any> = {}> = (
  props: T,
) => JSX.Element
type ClassName = JSX.ClassList | string | null | undefined
type Style = StyleDeclaration | string | null | undefined
type Placeholder = Comment & { [PLACEHOLDER]?: true }
type StyleDeclaration = Partial<CSSStyleDeclaration>
type Namespace = 1 | 2 | 3 | 4

const SVG = 1
const MATH_ML = 2
const XLINK = 3
const XML = 4
const SEPARATOR_REGEX = /\s+/
const PLACEHOLDER = Symbol('placeholder')
const NAMESPACE_URI = {
  [SVG]: 'http://www.w3.org/2000/svg',
  [MATH_ML]: 'http://www.w3.org/1998/Math/MathML',
  [XLINK]: 'http://www.w3.org/1999/xlink',
  [XML]: 'http://www.w3.org/XML/1998/namespace',
}
const DOM_PROPERTIES = new Set([
  'innerHTML',
  'innerText',
  'textContent',
  'value',
])

export function createComponent<T extends Record<string, any>>(
  comp: Component<T>,
  props: T = {} as T,
): JSX.Element {
  return untrack(() => comp(props))
}

export function createElement(name: string, namespace?: Namespace): Element {
  if (namespace) return document.createElementNS(NAMESPACE_URI[namespace], name)
  return document.createElement(name)
}

export function insert<T>(parent: Element, value: Getter<T> | T): void {
  let placeholder: Placeholder
  const fallback = () => {
    if (!placeholder) {
      placeholder = document.createComment('')
      placeholder[PLACEHOLDER] = true
    }
    return placeholder
  }
  if (typeof value === 'function') {
    useRenderEffect((node) =>
      insertExpression(
        fallback,
        parent,
        (value as Getter<T>)(),
        node as Node | Node[],
      ),
    )
  } else {
    insertExpression(fallback, parent, value)
  }
}

export function render(
  code: Getter<JSX.Element>,
  el: Element | Document,
): () => void {
  let disposer: () => void
  createRoot((dispose) => {
    disposer = dispose
    el === document ? code() : insert(el as Element, code())
  })
  return () => {
    disposer()
    el.replaceChildren()
  }
}

export function setAttribute(el: Element, name: string, value: any): void {
  value == null ? el.removeAttribute(name) : el.setAttribute(name, value)
}

export function setAttributeNS(
  el: Element,
  namespace: Namespace,
  name: string,
  value: any,
): void {
  const namespaceURI = NAMESPACE_URI[namespace]
  if (value == null) {
    el.removeAttributeNS(namespaceURI, name)
  } else {
    el.setAttributeNS(namespaceURI, name, value)
  }
}

export function setClassName(
  el: Element,
  value: ClassName,
  prevValue: ClassName,
): ClassName {
  if (value == null || typeof value === 'string') {
    setAttribute(el, 'class', value)
    return value
  }
  if (typeof prevValue === 'string') {
    el.setAttribute('class', (prevValue = ''))
  } else if (prevValue) {
    const prevKeys = Object.keys(prevValue)
    for (let i = 0; i < prevKeys.length; ++i) {
      const key = prevKeys[i]
      if (!value[key]) {
        el.classList.remove(...key.trim().split(SEPARATOR_REGEX))
        delete prevValue[key]
      }
    }
  }
  prevValue ||= {}
  const keys = Object.keys(value)
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i]
    if (value[key] && !(prevValue as JSX.ClassList)[key]) {
      el.classList.add(...key.trim().split(SEPARATOR_REGEX))
      ;(prevValue as JSX.ClassList)[key] = true
    }
  }
  return prevValue
}

export function setStyle(el: Element, value: Style, prevValue: Style): Style {
  const { style } = el as unknown as ElementCSSInlineStyle
  if (value == null || typeof value === 'string') {
    if (value) {
      style.cssText = value
    } else {
      el.removeAttribute('style')
    }
    return value
  }
  if (typeof prevValue === 'string') {
    style.cssText = prevValue = ''
  } else if (prevValue) {
    const prevKeys = Object.keys(prevValue)
    for (let i = 0; i < prevKeys.length; ++i) {
      const key = prevKeys[i] as keyof StyleDeclaration
      if (value[key] == null) {
        style.removeProperty(camelToKebab(key as string))
        delete prevValue[key]
      }
    }
  }
  prevValue ||= {}
  const keys = Object.keys(value)
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i] as keyof StyleDeclaration
    const styleValue = value[key] as string
    if (styleValue !== (prevValue as StyleDeclaration)[key]) {
      style.setProperty(camelToKebab(key as string), styleValue)
      ;(prevValue as any)[key] = styleValue
    }
  }
  return prevValue
}

export function spread<T extends Record<string, any>>(
  el: Element,
  props: T = {} as T,
): void {
  useRenderEffect(() => {
    if (typeof props.ref === 'function') use(props.ref, el)
  })
  useRenderEffect((prevProps) => {
    const keys = Object.keys(props)
    const prevKeys = Object.keys(prevProps)
    for (let i = 0; i < prevKeys.length; ++i) {
      const prop = prevKeys[i]
      if (prop !== 'children' && prop !== 'ref' && !(prop in props)) {
        prevProps[prop as keyof T] = assignProperty(
          el,
          prop,
          null,
          prevProps[prop],
        )
      }
    }
    for (let i = 0; i < keys.length; ++i) {
      const prop = keys[i]
      if (prop !== 'children' && prop !== 'ref') {
        prevProps[prop as keyof T] = assignProperty(
          el,
          prop,
          props[prop],
          prevProps[prop],
        )
      }
    }
    return prevProps
  }, {} as T)
}

export function use<T>(fn: (el: T) => void, el: T): void {
  untrack(() => fn(el))
}

function insertExpression<T extends Node | Node[]>(
  fallback: Getter<Comment>,
  parent: Element,
  value: any,
  node?: T,
  unwrap?: boolean,
): T {
  while (typeof node === 'function') {
    node = (node as Getter<T>)()
  }
  if (node && node === value) return node
  const type = typeof value
  const isArray = Array.isArray(node)
  if (type === 'string' || type === 'number' || type === 'bigint') {
    if (isArray) node = cleanChildren(parent, node as Node[]) as T
    if ((node as Node)?.nodeType === Node.TEXT_NODE) {
      if ((node as Node).nodeValue != value) {
        ;(node as Node).nodeValue = value
      }
      return node!
    }
    return replaceChild(
      parent,
      document.createTextNode(value),
      node as Node,
    ) as unknown as T
  }
  if (type === 'boolean' || type === 'symbol' || value == null) {
    return removeChildren(fallback, parent, node, isArray)
  }
  if (type === 'function') {
    useRenderEffect(() => {
      let current = value()
      while (typeof current === 'function') current = current()
      node = insertExpression(fallback, parent, current, node)
    })
    return (() => node) as unknown as T
  }
  if (Array.isArray(value)) {
    const array: Node[] = []
    if (normalizeArray(array, value, node as Node[], unwrap)) {
      useRenderEffect(() => {
        node = insertExpression(fallback, parent, array, node, true)
      })
      return (() => node) as unknown as T
    }
    if (!array.length) {
      return removeChildren(fallback, parent, node, isArray)
    }
    if (isArray) {
      return reconcileArray(parent, array, node as Node[]) as T
    }
    if (!node) {
      for (let i = 0; i < array.length; ++i) {
        replaceChild(parent, array[i])
      }
    } else if ((node as Placeholder)[PLACEHOLDER]) {
      for (let i = array.length - 1; i >= 1; --i) {
        if (array[i].parentNode === parent) continue
        parent.insertBefore(array[i], node as Node)
      }
      replaceChild(parent, array[0], node as Node)
    }
    return array as T
  }
  if (value.nodeType) {
    if (isArray) node = cleanChildren(parent, node as Node[]) as T
    if (
      !(node as Placeholder)?.[PLACEHOLDER] &&
      (node as Node)?.nodeType === value.nodeType &&
      (node as Node).nodeValue != null
    ) {
      if ((node as Node).nodeValue !== value.nodeValue) {
        ;(node as Node).nodeValue = value.nodeValue
      }
      return node!
    }
    return replaceChild(parent, value, node as Node)
  }
  return node ?? (replaceChild(parent, fallback() as Node) as T)
}

function removeChildren<T extends Node | Node[]>(
  fallback: Getter<Comment>,
  parent: Element,
  node: T | undefined,
  isArray: boolean,
): T {
  if (isArray) {
    node = cleanChildren(parent, node as Node[]) as T
  } else if ((node as Placeholder)?.[PLACEHOLDER]) {
    return node!
  }
  return replaceChild(parent, fallback(), node as Node) as unknown as T
}

function cleanChildren<T extends Node>(parent: Element, children: T[]): T {
  const node = children[0]
  for (let i = children.length - 1; i >= 1; --i) {
    if (children[i] !== node) parent.removeChild(children[i])
  }
  return node
}

function replaceChild<T extends Node, U extends Node>(
  parent: Element,
  newNode: T,
  oldNode?: U,
): T {
  if (newNode.parentNode !== parent) {
    oldNode ? parent.replaceChild(newNode, oldNode) : parent.append(newNode)
  } else if (oldNode) {
    parent.removeChild(oldNode)
  }
  return newNode
}

function normalizeArray<T extends Node[]>(
  nodes: T,
  array: any[],
  node?: T,
  unwrap?: boolean,
): boolean {
  let dynamic = false
  for (let i = 0; i < array.length; ++i) {
    let value = array[i]
    const prevValue = node?.[nodes.length]
    if (value?.nodeType) {
      nodes.push(value)
    } else {
      const type = typeof value
      if (type === 'string' || type === 'number' || type === 'bigint') {
        if (
          prevValue?.nodeType === Node.TEXT_NODE &&
          prevValue.nodeValue == value
        ) {
          nodes.push(prevValue)
        } else {
          nodes.push(document.createTextNode(value))
        }
      } else if (typeof value === 'function') {
        if (unwrap) {
          do {
            value = value()
          } while (typeof value === 'function')
          dynamic ||= normalizeArray(
            nodes,
            Array.isArray(value) ? value : [value],
            (Array.isArray(prevValue)
              ? prevValue
              : [prevValue]) as unknown as T,
          )
        } else {
          dynamic = true
          nodes.push(value)
        }
      } else if (Array.isArray(value)) {
        dynamic ||= normalizeArray(nodes, value, prevValue as unknown as T)
      }
    }
  }
  return dynamic
}

// Ported from https://github.com/WebReflection/udomdiff/blob/main/index.js
function reconcileArray<T extends Node[]>(
  parent: Element,
  nodes: T,
  prevNodes: T,
): T {
  const newNodesLength = nodes.length
  let prevEnd = prevNodes.length
  let end = newNodesLength
  let prevStart = 0
  let start = 0
  let map: WeakMap<Node, number> | undefined
  while (prevStart < prevEnd || start < end) {
    if (prevEnd === prevStart) {
      const node =
        end < newNodesLength
          ? start
            ? nodes[start - 1].nextSibling
            : nodes[end]
          : null
      while (start < end) {
        parent.insertBefore(nodes[start++], node)
      }
    } else if (end === start) {
      while (prevStart < prevEnd) {
        if (!map || !map.has(prevNodes[prevStart])) {
          parent.removeChild(prevNodes[prevStart])
        }
        prevStart++
      }
    } else if (prevNodes[prevStart] === nodes[start]) {
      prevStart++
      start++
    } else if (prevNodes[prevEnd - 1] === nodes[end - 1]) {
      prevEnd--
      end--
    } else if (
      prevNodes[prevStart] === nodes[end - 1] &&
      nodes[start] === prevNodes[prevEnd - 1]
    ) {
      const node = prevNodes[--prevEnd].nextSibling
      parent.insertBefore(nodes[start++], prevNodes[prevStart++].nextSibling)
      parent.insertBefore(nodes[--end], node)
      prevNodes[prevEnd] = nodes[end]
    } else {
      if (!map) {
        let i = start
        map = new WeakMap()
        while (i < end) map.set(nodes[i], i++)
      }
      const index = map.get(prevNodes[prevStart])
      if (index != null) {
        if (start < index && index < end) {
          let i = prevStart
          let sequence = 1
          while (
            ++i < prevEnd &&
            i < end &&
            map.get(prevNodes[i]) === index + sequence
          ) {
            sequence++
          }
          if (sequence > index - start) {
            const node = prevNodes[prevStart]
            while (start < index) {
              parent.insertBefore(nodes[start++], node)
            }
          } else {
            parent.replaceChild(nodes[start++], prevNodes[prevStart++])
          }
        } else {
          prevStart++
        }
      } else {
        parent.removeChild(prevNodes[prevStart++])
      }
    }
  }
  return nodes
}

function camelToKebab(string: string): string {
  let result = ''
  for (let i = 0; i < string.length; ++i) {
    const char = string[i]
    if (char >= 'A' && char <= 'Z') {
      result += `-${char.toLowerCase()}`
    } else {
      result += char
    }
  }
  return result
}

function assignProperty<T>(
  el: Element,
  prop: string,
  value: T,
  prevValue: T,
): T {
  if (value === prevValue) return prevValue
  if (prop === 'style') {
    return setStyle(el, value as Style, prevValue as Style) as T
  }
  if (prop === 'class' || prop === 'className') {
    return setClassName(el, value as ClassName, prevValue as ClassName) as T
  }
  if (prop.startsWith('on')) {
    let eventName = prop.slice(2).toLowerCase()
    const shouldDelegate = !prop.endsWith(eventName)
    if (eventName === 'doubleclick') eventName = 'dblclick'
    ;(el as any)[shouldDelegate ? `$$${eventName}` : prop] = value
    if (shouldDelegate && value) delegateEvents([eventName])
  } else if (
    DOM_PROPERTIES.has(prop) ||
    typeof el[prop as keyof Element] === 'boolean'
  ) {
    ;(el as any)[prop] = value
  } else {
    const prefix = prop.split(':')[0]
    const namespace = prefix === 'xlink' ? XLINK : prefix === 'xml' ? XML : 0
    if (namespace) {
      setAttributeNS(el, namespace, prop, value)
    } else {
      setAttribute(el, prop, value)
    }
  }
  return value
}
