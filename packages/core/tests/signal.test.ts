import { describe, expect, it, vi } from 'vitest'
import {
  batch,
  catchError,
  createRoot,
  getOwner,
  on,
  onCleanup,
  onError,
  onMount,
  runWithOwner,
  untrack,
  useComputed,
  useEffect,
  useMemo,
  useRenderEffect,
  useSignal,
  type Getter,
} from '../src/signal'

describe('reactivity system', () => {
  describe('core signals', () => {
    it('useSignal - should create and update signal', () => {
      const [get, set] = useSignal(0)
      expect(get()).toBe(0)
      set(5)
      expect(get()).toBe(5)
    })
    it('useSignal - should handle functional updates', () => {
      const [get, set] = useSignal(2)
      set((v) => v * 3)
      expect(get()).toBe(6)
    })
    it('useSignal - should respect custom equality', () => {
      const [get, set] = useSignal({ id: 1 }, (a, b) => a.id === b.id)
      const effect = vi.fn()
      useEffect(() => effect(get().id))
      expect(effect).toHaveBeenCalledTimes(1)
      set({ id: 1 })
      expect(effect).toHaveBeenCalledTimes(1)
      set({ id: 2 })
      expect(effect).toHaveBeenCalledTimes(2)
    })
  })
  describe('computed values', () => {
    it('useComputed - should update dependencies', () => {
      createRoot(() => {
        const [a, setA] = useSignal(2)
        const [b] = useSignal(3)
        const effect = vi.fn()
        useComputed(() => effect(a() + b()))
        expect(effect).toHaveBeenCalledWith(5)
        setA(3)
        expect(effect).toHaveBeenCalledWith(6)
      })
    })
    it('useComputed - should handle errors', () => {
      const error = new Error('Computed error')
      const handler = vi.fn()
      createRoot(() => {
        onError(handler)
        useComputed(() => {
          throw error
        })
        expect(handler).toHaveBeenCalledWith(error)
      })
    })
  })
  describe('memoization', () => {
    it('useMemo - should cache computed values', () => {
      createRoot(() => {
        const [a, setA] = useSignal(2)
        const compute = vi.fn(() => a() * 2)
        const memo = useMemo(compute)
        expect(memo()).toBe(4)
        expect(compute).toHaveBeenCalledTimes(1)
        setA(3)
        expect(memo()).toBe(6)
        expect(compute).toHaveBeenCalledTimes(2)
      })
    })
    it('useMemo - should respect custom equality', () => {
      createRoot(() => {
        const [obj, setObj] = useSignal({ id: 1 })
        const memo = useMemo(
          () => ({ ...obj() }),
          undefined,
          (a, b) => a.id === b.id,
        )
        const v1 = memo()
        setObj({ id: 1 })
        const v2 = memo()
        expect(v1).toBe(v2)
      })
    })
  })
  describe('effects', () => {
    it('useEffect - should track dependencies', () => {
      createRoot(() => {
        const [a, setA] = useSignal(1)
        const effect = vi.fn()
        useEffect(() => effect(a()))
        expect(effect).toHaveBeenCalledWith(1)
        setA(2)
        expect(effect).toHaveBeenCalledWith(2)
      })
    })
    it('useRenderEffect - should run synchronously', () => {
      createRoot(() => {
        const [val, setVal] = useSignal(0)
        const effect = vi.fn()
        useRenderEffect(() => effect(val()))
        expect(effect).toHaveBeenCalledWith(0)
        setVal(1)
        expect(effect).toHaveBeenCalledWith(1)
      })
    })
  })
  describe('lifecycle', () => {
    it('onMount - should trigger callback', () => {
      const fn = vi.fn()
      createRoot(() => {
        onMount(fn)
        expect(fn).toHaveBeenCalled()
      })
    })
    it('onCleanup - should run cleanup when disposed', () => {
      const cleanup = vi.fn()
      const dispose = createRoot((dispose) => {
        useEffect(() => onCleanup(cleanup))
        return dispose
      })
      expect(cleanup).not.toHaveBeenCalled()
      dispose()
      expect(cleanup).toHaveBeenCalled()
    })
    it('onError - should catch errors', () => {
      const error = new Error('test')
      const handler = vi.fn()
      createRoot(() => {
        onError(handler)
        useEffect(() => {
          throw error
        })
        expect(handler).toHaveBeenCalledWith(error)
      })
    })
    it('should propagate errors through nested owners', () => {
      const handler = vi.fn()
      createRoot(() => {
        onError(handler)
        createRoot(() => {
          useEffect(() => {
            throw new Error('inner error')
          })
        })
        expect(handler).toHaveBeenCalledWith(new Error('inner error'))
      })
    })
  })
  describe('utilities', () => {
    it('batch - should batch updates', () => {
      createRoot(() => {
        const [a, setA] = useSignal(0)
        const [b, setB] = useSignal(0)
        const effect = vi.fn()
        useEffect(() => effect(a() + b()))
        batch(() => {
          setA(1)
          setB(2)
        })
        expect(effect).toHaveBeenCalledWith(3)
      })
    })
    it('untrack - should ignore dependencies', () => {
      createRoot(() => {
        const [count] = useSignal(5)
        const effect = vi.fn()
        useEffect(() => untrack(() => effect(count())))
        expect(effect).toHaveBeenCalledWith(5)
      })
    })
    it('on - should track dependencies', () => {
      createRoot(() => {
        const [a, setA] = useSignal(1)
        const [b] = useSignal(2)
        const effect = vi.fn()
        useEffect(on([a, b], effect))
        expect(effect).toHaveBeenCalledWith([1, 2], [], undefined)
        setA(3)
        expect(effect).toHaveBeenCalledWith([3, 2], [1, 2], undefined)
      })
    })
  })
  describe('context management', () => {
    it('createRoot - should handle owner inheritance', () => {
      let innerOwner: ReturnType<typeof getOwner>
      const outerOwner = createRoot(() => {
        const owner = getOwner()
        createRoot((dispose) => {
          innerOwner = getOwner()
          return dispose
        }, owner)
        return owner
      })
      expect(innerOwner!.owner).toBe(outerOwner)
    })
    it('runWithOwner - should use specified owner', () => {
      let captured: ReturnType<typeof getOwner>
      const owner = createRoot(() => getOwner())
      runWithOwner(owner!, () => {
        captured = getOwner()
      })
      expect(captured).toBe(owner)
    })
    it('should maintain deep owner relationships', () => {
      const owners: ReturnType<typeof getOwner>[] = []
      createRoot(() => {
        const outerOwner = getOwner()
        owners.push(outerOwner)
        createRoot((outerDispose) => {
          const innerOwner = getOwner()
          owners.push(innerOwner)
          createRoot((innerDispose) => {
            owners.push(getOwner())
            return innerDispose
          }, innerOwner)
          return outerDispose
        }, outerOwner)
      })
      expect(owners[1]!.owner).toBe(owners[0])
      expect(owners[2]!.owner).toBe(owners[1])
    })
  })
  describe('advanced scenarios', () => {
    it('should handle deep nested computations', () => {
      createRoot(() => {
        let result = 0
        const [a, setA] = useSignal(1)
        const compute = () => useMemo(() => a() * 2)
        const layer1 = () => compute()
        const layer2 = () => layer1()()
        const layer3 = () => layer2() * 3
        useEffect(() => {
          result = layer3()
        })
        expect(result).toBe(6)
        setA(2)
        expect(result).toBe(12)
      })
    })
    it('should handle circular dependencies', () => {
      createRoot(() => {
        const [a, setA] = useSignal(1)
        const b = useMemo(() => a() * 2)
        const c = useMemo(() => b() + 1)
        useEffect(() => {
          if (c() === 3) setA(2)
        })
        expect(c()).toBe(3)
        expect(a()).toBe(2)
      })
    })
    it('should clean up nested effects', () => {
      const cleanups = vi.fn()
      const disposer = createRoot((outerDispose) => {
        const innerDispose = createRoot((dispose) => {
          useEffect(() => {
            onCleanup(() => cleanups())
          })
          return dispose
        })
        return { outerDispose, innerDispose }
      })
      expect(cleanups).not.toHaveBeenCalled()
      disposer.outerDispose()
      expect(cleanups).not.toHaveBeenCalled()
      disposer.innerDispose()
      expect(cleanups).toHaveBeenCalledTimes(1)
    })
    it('should handle async effects', async () => {
      const effect = vi.fn()
      await new Promise<void>((resolve) => {
        createRoot(() => {
          useEffect(async () => {
            await new Promise((r) => setTimeout(r, 50))
            effect()
            resolve()
          })
        })
      })
      expect(effect).toHaveBeenCalled()
    })
  })
  describe('edge cases', () => {
    it('should handle massive updates', () => {
      createRoot(() => {
        const [, set] = useSignal(0)
        expect(() => {
          batch(() => {
            for (let i = 0; i < 1e4; i++) set(i)
          })
        }).not.toThrow()
      })
    })
    it('should handle function values in signals', () => {
      const [get, set] = useSignal<Getter<number>>(() => 5)
      expect(get()()).toBe(5)
      set(() => () => 10)
      expect(get()()).toBe(10)
    })
    it('should handle undefined initial values', () => {
      const [get] = useSignal<number>()
      expect(get()).toBeUndefined()
    })
  })
  describe('catchError', () => {
    it('should call handler when error occurs', () => {
      const error = new Error('test error')
      const handler = vi.fn()
      const fn = () => {
        throw error
      }
      catchError(fn, handler)
      expect(handler).toHaveBeenCalledWith(error)
    })
    it('should return the result when no error occurs', () => {
      const handler = vi.fn()
      const fn = () => 'success'
      const result = catchError(fn, handler)
      expect(result).toBe('success')
      expect(handler).not.toHaveBeenCalled()
    })
    it('should restore owner after execution', () => {
      const handler = vi.fn()
      const fn = () => {
        throw new Error('test error')
      }
      createRoot(() => {
        const originalOwner = getOwner()
        catchError(fn, handler)
        expect(getOwner()).toBe(originalOwner)
      })
    })
    it('should handle errors thrown in handler', () => {
      const error1 = new Error('first error')
      const error2 = new Error('handler error')
      const handler = vi.fn().mockImplementation(() => {
        throw error2
      })
      const fn = () => {
        throw error1
      }
      expect(() => catchError(fn, handler)).toThrow(error2)
    })
  })
})
