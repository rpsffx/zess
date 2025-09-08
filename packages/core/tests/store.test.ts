import { describe, expect, it, vi } from 'vitest'
import {
  batch,
  createRoot,
  onCleanup,
  onError,
  useEffect,
  useRenderEffect,
} from '../src/signal'
import { useStore, type SetStoreFunction } from '../src/store'

describe('reactive system integration tests', () => {
  it('should track basic properties', () => {
    let executeCount = 0
    const [state, setState] = useStore({ count: 0 })
    createRoot(() => {
      useEffect(() => {
        executeCount++
        return state.count
      })
    })
    expect(executeCount).toBe(1)
    setState({ count: 1 })
    expect(executeCount).toBe(2)
  })
  it('should automatically collect dependencies', () => {
    const effectSpy = vi.fn()
    const [state, setState] = useStore({ a: 1, b: 2 })
    createRoot(() => {
      useEffect(() => {
        effectSpy(state.a)
      })
    })
    setState({ b: 3 })
    expect(effectSpy).toHaveBeenCalledTimes(1)
    setState({ a: 2 })
    expect(effectSpy).toHaveBeenCalledTimes(2)
  })
  it('should execute cleanup functions on update', () => {
    const cleanupSpy = vi.fn()
    const [state, setState] = useStore({ value: 0 })
    createRoot(() => {
      useEffect(() => {
        onCleanup(cleanupSpy)
        return state.value
      })
    })
    expect(cleanupSpy).not.toHaveBeenCalled()
    setState({ value: 1 })
    expect(cleanupSpy).toHaveBeenCalledTimes(1)
  })
  it('should track nested object changes', () => {
    const effectSpy = vi.fn()
    const [state, setState] = useStore({
      user: { name: 'John', details: { age: 30 } },
    })
    createRoot(() => {
      useRenderEffect(() => {
        effectSpy(state.user.details.age)
      })
    })
    setState({ user: { details: { age: 31 } } })
    expect(effectSpy).toHaveBeenCalledTimes(2)
    expect(effectSpy).toHaveBeenLastCalledWith(31)
  })
  it('should track array operations', () => {
    const effectSpy = vi.fn()
    const [list, setList] = useStore([1, 2, 3])
    createRoot(() => {
      useRenderEffect(() => {
        effectSpy(list[0], list[1], list[2])
      })
    })
    expect(effectSpy).toHaveBeenCalledWith(1, 2, 3)
    expect(effectSpy).toHaveBeenCalledTimes(1)
    setList([4, 2, 3])
    expect(effectSpy).toHaveBeenCalledTimes(2)
    setList([4, 5, 6, 7])
    expect(effectSpy).toHaveBeenCalledTimes(3)
    setList([4, 5, 6, 8])
    expect(effectSpy).toHaveBeenCalledTimes(3)
    setList([4, 5, 7])
    expect(effectSpy).toHaveBeenCalledTimes(4)
    setList([4, 5])
    expect(effectSpy).toHaveBeenCalledTimes(5)
    batch(() => {
      setList([9, 5, 7])
      setList([9, 10, 11])
    })
    expect(effectSpy).toHaveBeenCalledTimes(6)
    setList((prev) => {
      const newArr = [...prev!]
      newArr[1] = 100
      return newArr
    })
    expect(effectSpy).toHaveBeenCalledTimes(7)
  })
  it('should track computed properties', () => {
    const effectSpy = vi.fn()
    const [state, setState] = useStore({
      firstName: 'John',
      lastName: 'Doe',
      get fullName() {
        return `${this.firstName} ${this.lastName}`
      },
    })
    createRoot(() => {
      useEffect(() => {
        effectSpy(state.fullName)
      })
    })
    setState({ firstName: 'Jane' })
    expect(effectSpy).toHaveBeenCalledTimes(2)
  })
  it('should handle batch updates', () => {
    const effectSpy = vi.fn()
    const [state, setState] = useStore({ a: 1, b: 1 })
    createRoot(() => {
      useRenderEffect(() => {
        effectSpy(state.a + state.b)
      })
    })
    batch(() => {
      setState({ a: 2 })
      setState({ b: 2 })
    })
    expect(effectSpy).toHaveBeenCalledTimes(2)
    expect(effectSpy).toHaveBeenLastCalledWith(4)
  })
  it('should manage multi-level scopes', () => {
    const outerSpy = vi.fn()
    const innerSpy = vi.fn()
    let setStore: SetStoreFunction<{ value: number }>
    let disposer: () => void
    createRoot((dispose) => {
      const [state, setState] = useStore({ value: 1 })
      setStore = setState
      disposer = dispose
      useRenderEffect(() => {
        outerSpy(state.value)
      })
      createRoot(() => {
        const [innerState] = useStore({ value: 2 })
        useRenderEffect(() => {
          innerSpy(innerState.value)
        })
      })
    })
    setStore!({ value: 3 })
    expect(innerSpy).toHaveBeenCalledTimes(1)
    expect(outerSpy).toHaveBeenCalledTimes(2)
    disposer!()
    setStore!({ value: 4 })
    expect(outerSpy).toHaveBeenCalledTimes(2)
  })
  it('should handle errors in effects', () => {
    const errorSpy = vi.fn()
    const [state, setState] = useStore({ value: 0 })
    createRoot(() => {
      onError(errorSpy)
      useRenderEffect(() => {
        if (state.value) throw new Error('Test Error')
      })
    })
    setState({ value: 1 })
    expect(errorSpy).toHaveBeenCalledWith(new Error('Test Error'))
  })
  it('should track newly added properties when existing property changes', () => {
    const effectSpy = vi.fn()
    const [state, setState] = useStore<{ a: number; b?: number }>({ a: 1 })
    createRoot(() => {
      useRenderEffect(() => {
        effectSpy(state.a, state.b)
      })
    })
    expect(effectSpy).toHaveBeenCalledWith(1, undefined)
    expect(effectSpy).toHaveBeenCalledTimes(1)
    setState({ a: 2, b: 3 })
    expect(effectSpy).toHaveBeenCalledTimes(2)
    expect(effectSpy).toHaveBeenLastCalledWith(2, 3)
    setState({ b: 4 })
    expect(effectSpy).toHaveBeenCalledTimes(3)
    expect(effectSpy).toHaveBeenLastCalledWith(2, 4)
  })
  it('should handle property deletion by setting to undefined', () => {
    const effectSpy = vi.fn()
    const [state, setState] = useStore<{ value?: number }>({ value: 1 })
    createRoot(() => {
      useRenderEffect(() => {
        effectSpy(state.value)
      })
    })
    expect(effectSpy).toHaveBeenCalledWith(1)
    setState({ value: undefined })
    expect(effectSpy).toHaveBeenCalledTimes(2)
    expect(effectSpy).toHaveBeenLastCalledWith(undefined)
    expect('value' in state).toBe(false)
  })
  it('should not add properties with undefined values to an empty store', () => {
    const [state, setState] = useStore({})
    setState({ value: undefined })
    expect('value' in state).toBe(false)
  })
})
