// Derived from Solid.js by Ryan Carniato, https://github.com/solidjs/solid
/**
 * MIT License
 *
 * Copyright (c) 2016-2025 Ryan Carniato
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
export type Getter<T> = () => T
export type Setter<T> = (v: T | Callback<T>) => T
export type Callback<T> = (prevValue: T) => T
type OnEffectFunction<T, U> = T extends Getter<infer V>[]
  ? (input: V[], prevInput: V[], prevValue?: U) => U
  : T extends Getter<infer V>
    ? (input: V, prevInput: V, prevValue?: U) => U
    : never
type Equals<T> = (a: T, b: T) => boolean
type Memo<T> = Signal<T> & Computation<T>
type Computation<T> = Owner & {
  value: T
  state: State
  pure: boolean
  user?: boolean
  fn: Callback<T>
  updatedAt?: number
  sources?: Signal<any>[]
  sourceIndices?: number[]
}
type Signal<T> = {
  value: T
  comparator: Equals<T>
  observers?: Computation<any>[]
  observerIndices?: number[]
}
type Owner = {
  owner?: Owner
  owned?: Computation<any>[]
  cleanups?: (() => void)[]
  errors?: ((error: unknown) => void)[]
}
type State = 0 | 1 | 2

let currentOwner: Owner | undefined
let currentEffect: Computation<any> | undefined
let scheduledUpdates: Computation<any>[] | undefined
let scheduledEffects: Computation<any>[] | undefined
let runEffects = runQueue
let updateCount = 0
const STALE = 1
const PENDING = 2
const UNOWNED: Owner = {}
const is: Equals<any> = (a, b) => a === b

export function createRoot<T>(
  fn: (dispose: () => void) => T,
  detachedOwner: Owner = currentOwner!,
): T {
  const prevEffect = currentEffect
  const prevOwner = currentOwner
  const unowned = !fn.length
  const root: Owner = unowned
    ? UNOWNED
    : { owner: detachedOwner, errors: detachedOwner?.errors }
  const updateFn = unowned ? fn : () => fn(() => untrack(() => cleanNode(root)))
  currentEffect = undefined
  currentOwner = root
  try {
    return runUpdates(updateFn as Getter<T>, true)!
  } finally {
    currentOwner = prevOwner
    currentEffect = prevEffect
  }
}

export function useSignal<T>(
  value?: T,
  equals: Equals<T> = is,
): [Getter<T>, Setter<T>] {
  const signal: Signal<T> = {
    value: value!,
    comparator: equals,
  }
  return [
    () => readSignal(signal),
    (newValue) => {
      if (typeof newValue === 'function') {
        newValue = (newValue as Callback<T>)(signal.value)
      }
      return writeSignal(signal, newValue)
    },
  ]
}

export function useComputed<T>(fn: Callback<T>, value?: T): void {
  updateComputation(createComputation(fn, value!, true))
}

export function useRenderEffect<T>(fn: Callback<T>, value?: T): void {
  updateComputation(createComputation(fn, value!, false))
}

export function useEffect<T>(fn: Callback<T>, value?: T): void {
  const computation = createComputation(fn, value!, false)
  computation.user = true
  runEffects = runUserEffects
  if (scheduledEffects) {
    scheduledEffects.push(computation)
  } else {
    updateComputation(computation)
  }
}

export function useMemo<T>(
  fn: Callback<T>,
  value?: T,
  equals: Equals<T> = is,
): Getter<T> {
  const computation = createComputation(fn, value!, true, 0) as Memo<T>
  computation.observers = undefined
  computation.comparator = equals
  updateComputation(computation)
  return () => {
    if (computation.sources && computation.state) {
      if (computation.state === STALE) {
        updateComputation(computation)
      } else {
        const updates = scheduledUpdates
        scheduledUpdates = undefined
        runUpdates(() => lookUpstream(computation))
        scheduledUpdates = updates
      }
    }
    return readSignal(computation)
  }
}

export function batch<T>(fn: Getter<T>): T {
  return runUpdates(fn)!
}

export function untrack<T>(fn: Getter<T>): T {
  const prevEffect = currentEffect
  currentEffect = undefined
  try {
    return fn()
  } finally {
    currentEffect = prevEffect
  }
}

export function on<T extends Getter<any> | Getter<any>[], U>(
  deps: T,
  fn: OnEffectFunction<T, U>,
  defer?: boolean,
): Callback<U> {
  let prevInput: Parameters<typeof fn>[1]
  const isArray = Array.isArray(deps)
  return (prevValue) => {
    const currentInput: Parameters<typeof fn>[0] = isArray
      ? deps.map((dep) => dep())
      : deps()
    if (defer) {
      defer = false
      return prevValue
    }
    const result = untrack(() => fn(currentInput, prevInput, prevValue))
    prevInput = currentInput
    return result
  }
}

export function onMount(fn: () => void): void {
  useEffect(() => untrack(fn))
}

export function onCleanup(fn: () => void): void {
  if (!currentOwner) return
  if (currentOwner.cleanups) {
    currentOwner.cleanups.push(fn)
  } else {
    currentOwner.cleanups = [fn]
  }
}

export function onError(fn: (error: unknown) => void): void {
  if (!currentOwner) return
  if (currentOwner.errors) {
    currentOwner.errors.push(fn)
  } else {
    const errors = [fn]
    const stack = [currentOwner]
    do {
      const owner = stack.pop()!
      owner.errors ??= errors
      if (owner.owned) {
        stack.push(...owner.owned)
      }
    } while (stack.length)
  }
}

export function catchError<T>(
  fn: Getter<T>,
  handler: (error: unknown) => void,
): T {
  currentOwner = createComputation(undefined!, undefined, true)
  currentOwner.errors = [handler]
  try {
    return fn()
  } catch (error) {
    return handleError(error)!
  } finally {
    currentOwner = currentOwner.owner
  }
}

export function getOwner(): Owner | undefined {
  return currentOwner
}

export function runWithOwner<T>(owner: Owner, fn: Getter<T>): T {
  const prevEffect = currentEffect
  const prevOwner = currentOwner
  currentEffect = undefined
  currentOwner = owner
  try {
    return runUpdates(fn, true)!
  } catch (error) {
    return handleError(error)!
  } finally {
    currentOwner = prevOwner
    currentEffect = prevEffect
  }
}

function readSignal<T>(node: Signal<T> | Memo<T>): T {
  if (currentEffect) {
    const index = node.observers ? node.observers.length : 0
    if (currentEffect.sources) {
      currentEffect.sources.push(node)
      currentEffect.sourceIndices!.push(index)
    } else {
      currentEffect.sources = [node]
      currentEffect.sourceIndices = [index]
    }
    if (node.observers) {
      node.observers.push(currentEffect)
      node.observerIndices!.push(currentEffect.sources.length - 1)
    } else {
      node.observers = [currentEffect]
      node.observerIndices = [currentEffect.sources.length - 1]
    }
  }
  return node.value
}

function writeSignal<T>(node: Signal<T> | Memo<T>, value: T): T {
  if (node.comparator(node.value, value)) return value
  node.value = value
  if (node.observers?.length) {
    runUpdates(() => {
      for (let i = 0; i < node.observers!.length; ++i) {
        const observer = node.observers![i]
        if (!observer.state) {
          if (observer.pure) {
            scheduledUpdates!.push(observer)
          } else {
            scheduledEffects!.push(observer)
          }
          if ((observer as Memo<any>).observers) {
            markDownstream(observer as Memo<any>)
          }
        }
        observer.state = STALE
      }
      if (scheduledUpdates!.length > 10e5) {
        scheduledUpdates = []
        throw new Error('Maximum update depth exceeded')
      }
    })
  }
  return value
}

function updateComputation<T>(node: Computation<T>): void {
  if (!node.fn) return
  cleanNode(node)
  runComputation(node, node.value, updateCount)
}

function runComputation<T>(node: Computation<T>, value: T, time: number): void {
  let newValue
  const prevOwner = currentOwner
  const prevEffect = currentEffect
  currentEffect = currentOwner = node
  try {
    newValue = node.fn(value)
  } catch (error) {
    if (node.pure) {
      node.state = STALE
      if (node.owned) {
        for (let i = 0; i < node.owned.length; ++i) {
          cleanNode(node.owned[i])
        }
        node.owned = undefined
      }
    }
    node.updatedAt = time + 1
    return handleError(error)
  } finally {
    currentOwner = prevOwner
    currentEffect = prevEffect
  }
  if (!node.updatedAt || node.updatedAt <= time) {
    if (node.updatedAt != null && 'observers' in node) {
      writeSignal(node as Memo<T>, newValue)
    } else {
      node.value = newValue
    }
    node.updatedAt = time
  }
}

function createComputation<T>(
  fn: Callback<T>,
  init: T,
  pure: boolean,
  state: State = STALE,
): Computation<T> {
  const computation: Computation<T> = {
    fn,
    pure,
    state,
    value: init,
    owner: currentOwner,
    errors: currentOwner?.errors,
  }
  if (currentOwner && currentOwner !== UNOWNED) {
    if (currentOwner.owned) {
      currentOwner.owned.push(computation)
    } else {
      currentOwner.owned = [computation]
    }
  }
  return computation
}

function runTop<T>(node: Computation<T>): void {
  if (!node.state) return
  if (node.state === PENDING) return lookUpstream(node)
  const ancestors = [node]
  while (
    (node = node.owner as Computation<any>) &&
    (!node.updatedAt || node.updatedAt < updateCount)
  ) {
    if (node.state) ancestors.push(node)
  }
  let i = ancestors.length - 1
  do {
    node = ancestors[i]
    if (node.state === STALE) {
      updateComputation(node)
    } else if (node.state === PENDING) {
      const updates = scheduledUpdates
      scheduledUpdates = undefined
      runUpdates(() => lookUpstream(node, ancestors[0]))
      scheduledUpdates = updates
    }
  } while (--i >= 0)
}

function runUpdates<T>(fn: Getter<T>, init?: boolean): T | void {
  if (scheduledUpdates) return fn()
  let wait = false
  if (!init) scheduledUpdates = []
  if (scheduledEffects) {
    wait = true
  } else {
    scheduledEffects = []
  }
  updateCount++
  try {
    const result = fn()
    completeUpdates(wait)
    return result
  } catch (error) {
    if (!wait) scheduledEffects = undefined
    scheduledUpdates = undefined
    handleError(error)
  }
}

function completeUpdates(wait: boolean): void {
  if (scheduledUpdates) {
    runQueue(scheduledUpdates)
    scheduledUpdates = undefined
  }
  if (wait) return
  const effects = scheduledEffects!
  scheduledEffects = undefined
  if (effects.length) {
    runUpdates(() => runEffects(effects))
  }
}

function runQueue(queue: Computation<any>[]): void {
  for (let i = 0; i < queue.length; ++i) runTop(queue[i])
}

function runUserEffects(queue: Computation<any>[]): void {
  let userLength = 0
  for (let i = 0; i < queue.length; ++i) {
    const effect = queue[i]
    if (effect.user) {
      queue[userLength++] = effect
    } else {
      runTop(effect)
    }
  }
  for (let i = 0; i < userLength; ++i) runTop(queue[i])
}

function lookUpstream<T>(
  node: Computation<T>,
  ignore?: Computation<any>,
): void {
  node.state = 0
  for (let i = 0; i < node.sources!.length; ++i) {
    const source = node.sources![i] as Memo<any>
    if (!source.sources) continue
    if (source.state === STALE) {
      if (source === ignore) continue
      if (!source.updatedAt || source.updatedAt < updateCount) {
        runTop(source)
      }
    } else if (source.state === PENDING) {
      lookUpstream(source, ignore)
    }
  }
}

function markDownstream<T>(node: Memo<T>): void {
  for (let i = 0; i < node.observers!.length; ++i) {
    const observer = node.observers![i]
    if (!observer.state) {
      observer.state = PENDING
      if (observer.pure) {
        scheduledUpdates!.push(observer)
      } else {
        scheduledEffects!.push(observer)
      }
      if ((observer as Memo<any>).observers) {
        markDownstream(observer as Memo<any>)
      }
    }
  }
}

function cleanNode(node: Owner): void {
  if ((node as Computation<any>).sources) {
    while ((node as Computation<any>).sources!.length) {
      const source = (node as Computation<any>).sources!.pop()!
      const index = (node as Computation<any>).sourceIndices!.pop()!
      if (source.observers?.length) {
        const observer = source.observers.pop()!
        const i = source.observerIndices!.pop()!
        if (index < source.observers.length) {
          observer.sourceIndices![i] = index
          source.observers[index] = observer
          source.observerIndices![index] = i
        }
      }
    }
  }
  if (node.owned) {
    for (let i = 0; i < node.owned.length; ++i) {
      cleanNode(node.owned[i])
    }
    node.owned = undefined
  }
  if (node.cleanups) {
    for (let i = 0; i < node.cleanups.length; ++i) {
      node.cleanups[i]()
    }
    node.cleanups = undefined
  }
  ;(node as Computation<any>).state = 0
}

function handleError(error: unknown, owner = currentOwner): void {
  const errors = owner?.errors
  if (!errors) throw error
  if (scheduledEffects) {
    scheduledEffects.push({
      fn() {
        runErrors(error, errors, owner)
      },
      state: STALE,
    } as unknown as Computation<any>)
  } else {
    runErrors(error, errors, owner)
  }
}

function runErrors(
  error: unknown,
  errors: ((error: unknown) => void)[],
  owner: Owner,
): void {
  try {
    for (let i = 0; i < errors.length; ++i) {
      errors[i](error)
    }
  } catch (error) {
    handleError(error, owner.owner ?? null!)
  }
}
