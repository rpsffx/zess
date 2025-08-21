import type { Getter } from './signal'

type MergeResult<T> = T extends [infer U, ...infer Rest]
  ? (U extends Getter<infer V>
      ? V extends object
        ? V
        : {}
      : U extends object
        ? U
        : {}) &
      MergeResult<Rest>
  : {}
type SplitResult<T extends object, U extends (keyof any)[][]> = [
  ...{
    [K in keyof U]: U[K] extends (infer P)[]
      ? Pick<T, Extract<P, keyof T>>
      : never
  },
  Omit<T, Extract<U[number][number], keyof T>>,
]

export function mergeProps<T extends any[]>(...sources: T): MergeResult<T> {
  const target = {}
  for (let i = 0; i < sources.length; ++i) {
    let source = sources[i]
    if (typeof source === 'function') source = source()
    if (!source) continue
    const keys = Reflect.ownKeys(source)
    for (let j = 0; j < keys.length; ++j) {
      const key = keys[j]
      if (Reflect.has(target, key)) continue
      Reflect.defineProperty(target, key, {
        enumerable: true,
        get() {
          for (let i = sources.length - 1; i >= 0; --i) {
            let src = sources[i]
            if (typeof src === 'function') src = src()
            if (!src) continue
            const value = Reflect.get(src, key)
            if (value !== undefined) return value
          }
        },
      })
    }
  }
  return target as MergeResult<T>
}

export function splitProps<T extends object, const U extends (keyof any)[][]>(
  props: T,
  ...keys: U
): SplitResult<T, U> {
  const result = []
  const descriptors = Object.getOwnPropertyDescriptors(props)
  for (let i = 0; i < keys.length; ++i) {
    const currentKeys = keys[i]
    const clone = {}
    for (let j = 0; j < currentKeys.length; ++j) {
      const key = currentKeys[j] as keyof T
      if (descriptors[key]) {
        Reflect.defineProperty(clone, key, descriptors[key])
        delete descriptors[key]
      }
    }
    result.push(clone)
  }
  const lastClone = {}
  const remainingKeys = Reflect.ownKeys(descriptors) as (keyof T)[]
  for (let i = 0; i < remainingKeys.length; ++i) {
    const key = remainingKeys[i]
    Reflect.defineProperty(lastClone, key, descriptors[key])
  }
  result.push(lastClone)
  return result as SplitResult<T, U>
}
