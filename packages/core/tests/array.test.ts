import { describe, expect, it } from 'vitest'
import { indexArray, mapArray } from '../src/array'
import { createRoot, useMemo, useSignal } from '../src/signal'

describe('mapArray', () => {
  it('should map basic array', () => {
    createRoot(() => {
      const [source, setSource] = useSignal([1, 2, 3, 4])
      const mapped = useMemo(mapArray(source, (v) => v * 2))
      expect(mapped()).toEqual([2, 4, 6, 8])
      setSource([3, 4, 5])
      expect(mapped()).toEqual([6, 8, 10])
    })
  })
  it('should show fallback content when empty', () => {
    createRoot(() => {
      const [source, setSource] = useSignal([1, 2, 3, 4])
      const mapped = useMemo(
        mapArray(
          source,
          (v) => v * 2,
          () => 'Empty',
        ),
      )
      expect(mapped()).toEqual([2, 4, 6, 8])
      setSource([])
      expect(mapped()).toEqual(['Empty'])
      setSource([3, 4, 5])
      expect(mapped()).toEqual([6, 8, 10])
    })
  })
})
describe('indexArray', () => {
  it('should index basic array', () => {
    createRoot(() => {
      const [source] = useSignal([1, 2, 3, 4])
      const mapped = useMemo(indexArray(source, (v) => v() * 3))
      expect(mapped()).toEqual([3, 6, 9, 12])
    })
  })
  it('should show fallback content when no items', () => {
    createRoot(() => {
      const [source, setSource] = useSignal([1, 2, 3, 4])
      const mapped = useMemo(
        indexArray(
          source,
          (v) => v() * 3,
          () => 'No Items',
        ),
      )
      expect(mapped()).toEqual([3, 6, 9, 12])
      setSource([])
      expect(mapped()).toEqual(['No Items'])
      setSource([5, 6])
      expect(mapped()).toEqual([15, 18])
    })
  })
})
