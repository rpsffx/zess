import { describe, expect, it } from 'vitest'
import { mergeProps, splitProps } from '../src/props'

describe('mergeProps', () => {
  it('should merge basic properties from multiple sources', () => {
    const result = mergeProps({ a: 1, b: 2 }, { b: 3, c: 4 }, { d: 5 })
    expect(result).toEqual({ a: 1, b: 3, c: 4, d: 5 })
  })
  it('should handle function sources and dynamic value resolution', () => {
    const sourceFn = () => ({ color: 'red', size: 'large' })
    const result = mergeProps({ size: 'medium' }, sourceFn)
    expect(result.size).toBe('large')
  })
  it('should respect property precedence from right to left', () => {
    const result = mergeProps(
      { value: 'first' },
      { value: 'second' },
      { value: 'third' },
    )
    expect(result.value).toBe('third')
  })
  it('should handle Symbol properties correctly', () => {
    const sym = Symbol('test')
    const result = mergeProps({ [sym]: 'first' }, { [sym]: 'second' })
    expect(result[sym]).toBe('second')
  })
  it('should create getter-based properties that dynamically resolve values', () => {
    const dynamicSource = { count: 1 }
    const result = mergeProps({ count: 0 }, () => ({ count: 2 }), dynamicSource)
    expect(result.count).toBe(1)
    dynamicSource.count = 3
    expect(result.count).toBe(3)
  })
  it('should skip null/undefined sources', () => {
    const result = mergeProps(null, { a: 1 }, undefined, { b: 2 })
    expect(result).toEqual({ a: 1, b: 2 })
  })
  it('should handle non-enumerable properties', () => {
    const source = {}
    Object.defineProperty(source, 'hidden', {
      value: 'secret',
      enumerable: false,
    })
    const result = mergeProps(source)
    expect((result as any).hidden).toBe('secret')
  })
})
describe('splitProps', () => {
  it('should split properties into specified groups and remaining group', () => {
    const props = { a: 1, b: 2, c: 3, d: 4 }
    const [first, second, remaining] = splitProps(props, ['a'], ['b', 'c'])
    expect(first).toEqual({ a: 1 })
    expect(second).toEqual({ b: 2, c: 3 })
    expect(remaining).toEqual({ d: 4 })
  })
  it('should handle function sources in splitProps', () => {
    const props = () => ({ a: 1, b: 2 })
    const [group] = splitProps(props(), ['a'])
    expect(group).toEqual({ a: 1 })
  })
  it('should maintain property descriptors during splitting', () => {
    const props = {}
    Object.defineProperty(props, 'value', {
      get: () => 'test',
      enumerable: true,
    })
    const [group] = splitProps(props, ['value'])
    expect((group as any).value).toBe('test')
  })
  it('should handle Symbol keys in property groups', () => {
    const sym = Symbol('test')
    const props = { [sym]: 'value', a: 1 }
    const [group, remaining] = splitProps(props, [sym])
    expect(group).toEqual({ [sym]: 'value' })
    expect(remaining).toEqual({ a: 1 })
  })
  it('should return empty groups for non-existent keys', () => {
    const props = { a: 1, b: 2 }
    const [group1, group2] = splitProps(props, ['c'], ['d'])
    expect(group1).toEqual({})
    expect(group2).toEqual({})
  })
  it('should not modify original props object', () => {
    const props = { a: 1, b: 2 }
    splitProps(props, ['a'])
    expect(props).toEqual({ a: 1, b: 2 })
  })
  it('should handle empty key groups', () => {
    const props = { a: 1, b: 2 }
    const [empty1, empty2, remaining] = splitProps(props, [], [])
    expect(empty1).toEqual({})
    expect(empty2).toEqual({})
    expect(remaining).toEqual({ a: 1, b: 2 })
  })
})
